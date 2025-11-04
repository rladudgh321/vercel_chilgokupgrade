
import { GET, POST, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모킹
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

// next/headers 모킹
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

describe('/api/theme-images API', () => {
  let supabaseClient: any;

  beforeEach(() => {
    // 각 테스트 전에 모의 클라이언트 재설정
    supabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockReturnValue(supabaseClient);
  });

  describe('GET /api/theme-images', () => {
    it('성공: 모든 테마 이미지를 조회하고, "theme-images"로 시작하는 이미지만 필터링하여 반환해야 합니다.', async () => {
      // given
      const mockData = [
        { id: 1, imageName: 'theme-images/image1.jpg', order: 1, deletedAt: null },
        { id: 2, imageName: 'other/image2.jpg', order: 2, deletedAt: null },
        { id: 3, imageName: 'theme-images/image3.jpg', order: 3, deletedAt: null },
      ];
      supabaseClient.order.mockResolvedValue({ data: mockData, error: null });

      // when
      const response = await GET();
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.ok).toBe(true);
      expect(responseBody.data).toHaveLength(2);
      expect(responseBody.data[0].imageName).toBe('theme-images/image1.jpg');
      expect(responseBody.data[1].imageName).toBe('theme-images/image3.jpg');
      expect(supabaseClient.from).toHaveBeenCalledWith('ThemeImage');
      expect(supabaseClient.select).toHaveBeenCalledWith('*');
      expect(supabaseClient.is).toHaveBeenCalledWith('deletedAt', null);
      expect(supabaseClient.order).toHaveBeenCalledWith('order', { ascending: true, nullsFirst: false });
    });

    it('실패: 데이터베이스 조회 중 오류가 발생하면 400 상태 코드와 에러를 반환해야 합니다.', async () => {
      // given
      const dbError = { message: 'DB error' };
      supabaseClient.order.mockResolvedValue({ data: null, error: dbError });

      // when
      const response = await GET();
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.ok).toBe(false);
      expect(responseBody.error).toEqual(dbError);
    });
  });

  describe('POST /api/theme-images', () => {
    it('성공: 새 테마 이미지를 추가하고 201 상태 코드와 추가된 데이터를 반환해야 합니다.', async () => {
      // given
      const newImageData = { label: '새 이미지', imageUrl: 'http://example.com/new.jpg', imageName: 'theme-images/new.jpg' };
      const createdData = { id: 4, ...newImageData, isActive: true };
      supabaseClient.select.mockResolvedValue({ data: [createdData], error: null });

      const request = new NextRequest('http://localhost/api/theme-images', {
        method: 'POST',
        body: JSON.stringify(newImageData),
      });

      // when
      const response = await POST(request);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(201);
      expect(responseBody.ok).toBe(true);
      expect(responseBody.message).toBe('테마 이미지가 추가되었습니다.');
      expect(responseBody.data).toEqual(createdData);
      expect(supabaseClient.from).toHaveBeenCalledWith('ThemeImage');
      expect(supabaseClient.insert).toHaveBeenCalledWith([expect.objectContaining({
        label: newImageData.label,
        imageUrl: newImageData.imageUrl,
      })]);
    });

    it('실패: 필수 필드(label, imageUrl)가 누락되면 400 상태 코드와 에러 메시지를 반환해야 합니다.', async () => {
        // given
        const incompleteData = { label: '새 이미지' }; // imageUrl 누락
        const request = new NextRequest('http://localhost/api/theme-images', {
          method: 'POST',
          body: JSON.stringify(incompleteData),
        });
  
        // when
        const response = await POST(request);
        const responseBody = await response.json();
  
        // then
        expect(response.status).toBe(400);
        expect(responseBody.ok).toBe(false);
        expect(responseBody.error.message).toBe('라벨과 이미지 URL은 필수입니다.');
      });
  });

  describe('PUT /api/theme-images', () => {
    it('성공: 테마 이미지를 수정하고 200 상태 코드와 수정된 데이터를 반환해야 합니다.', async () => {
      // given
      const updateData = { id: 1, label: '수정된 이미지' };
      const updatedData = { id: 1, label: '수정된 이미지', imageUrl: 'http://example.com/image1.jpg' };
      supabaseClient.select.mockResolvedValue({ data: [updatedData], error: null });

      const request = new NextRequest('http://localhost/api/theme-images', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // when
      const response = await PUT(request);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.ok).toBe(true);
      expect(responseBody.message).toBe('테마 이미지가 수정되었습니다.');
      expect(responseBody.data).toEqual(updatedData);
      expect(supabaseClient.from).toHaveBeenCalledWith('ThemeImage');
      expect(supabaseClient.update).toHaveBeenCalledWith({ label: updateData.label.trim() });
      expect(supabaseClient.eq).toHaveBeenCalledWith('id', updateData.id);
    });

    it('실패: ID가 누락되면 400 상태 코드와 에러 메시지를 반환해야 합니다.', async () => {
        // given
        const invalidData = { label: '수정' }; // id 누락
        const request = new NextRequest('http://localhost/api/theme-images', {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        });
  
        // when
        const response = await PUT(request);
        const responseBody = await response.json();
  
        // then
        expect(response.status).toBe(400);
        expect(responseBody.ok).toBe(false);
        expect(responseBody.error.message).toBe('ID는 필수입니다.');
      });
  });

  describe('DELETE /api/theme-images', () => {
    it('성공: 테마 이미지를 논리적으로 삭제하고 200 상태 코드와 성공 메시지를 반환해야 합니다.', async () => {
      // given
      const imageId = '1';
      supabaseClient.eq.mockResolvedValue({ error: null });

      const request = new NextRequest(`http://localhost/api/theme-images?id=${imageId}`, {
        method: 'DELETE',
      });

      // when
      const response = await DELETE(request);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.ok).toBe(true);
      expect(responseBody.message).toBe('테마 이미지가 삭제되었습니다.');
      expect(supabaseClient.from).toHaveBeenCalledWith('ThemeImage');
      expect(supabaseClient.update).toHaveBeenCalledWith({ deletedAt: expect.any(String) });
      expect(supabaseClient.eq).toHaveBeenCalledWith('id', parseInt(imageId));
    });

    it('실패: ID가 누락되면 400 상태 코드와 에러 메시지를 반환해야 합니다.', async () => {
        // given
        const request = new NextRequest('http://localhost/api/theme-images', {
          method: 'DELETE',
        });
  
        // when
        const response = await DELETE(request);
        const responseBody = await response.json();
  
        // then
        expect(response.status).toBe(400);
        expect(responseBody.ok).toBe(false);
        expect(responseBody.error.message).toBe('ID는 필수입니다.');
      });
  });
});
