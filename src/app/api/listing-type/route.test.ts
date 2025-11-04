
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/listing-type API 라우트', () => {
  let fromMock: any;
  let selectMock: any;
  let orderMock: any;
  let insertMock: any;
  let updateMock: any;
  let deleteMock: any;
  let eqMock: any;

  beforeEach(() => {
    eqMock = jest.fn();
    selectMock = jest.fn();
    orderMock = jest.fn();
    insertMock = jest.fn(() => ({ select: selectMock }));
    updateMock = jest.fn(() => ({ eq: eqMock }));
    deleteMock = jest.fn(() => ({ eq: eqMock }));

    fromMock = jest.fn(() => ({
      select: jest.fn(() => ({ order: orderMock })),
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // GET
  describe('GET 핸들러', () => {
    test('모든 ListingType을 성공적으로 가져와야 합니다.', async () => {
      const mockData = [{ id: 1, name: '아파트' }, { id: 2, name: '빌라' }];
      orderMock.mockResolvedValue({ data: mockData, error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(mockData);
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 ListingType을 성공적으로 추가해야 합니다.', async () => {
      const newType = { label: '오피스텔', imageUrl: 'url', imageName: 'name' };
      selectMock.mockResolvedValue({ data: [{ id: 3, ...newType }], error: null });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(newType) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('매물 유형이 추가되었습니다.');
      expect(insertMock).toHaveBeenCalledWith([expect.objectContaining({ name: newType.label })]);
    });
  });

  // PUT
  describe('PUT 핸들러', () => {
    test('이름(label)을 성공적으로 수정해야 합니다.', async () => {
      const updatePayload = { oldLabel: '오피스텔', newLabel: '사무실' };
      eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 3, name: '사무실' }], error: null }) }));
      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify(updatePayload) });

      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.name).toBe('사무실');
      expect(updateMock).toHaveBeenCalledWith({ name: updatePayload.newLabel });
      expect(eqMock).toHaveBeenCalledWith('name', updatePayload.oldLabel);
    });

    test('이미지(imageUrl)를 성공적으로 수정해야 합니다.', async () => {
        const updatePayload = { id: '3', imageUrl: 'new-url' };
        eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 3, imageUrl: 'new-url' }], error: null }) }));
        const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify(updatePayload) });
  
        const response = await PUT(req);
        const body = await response.json();
  
        expect(response.status).toBe(200);
        expect(body.data.imageUrl).toBe('new-url');
        expect(updateMock).toHaveBeenCalledWith({ imageUrl: updatePayload.imageUrl, imageName: undefined });
        expect(eqMock).toHaveBeenCalledWith('id', 3);
      });

    test('잘못된 요청 body이면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ foo: 'bar' }) });
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('Invalid request');
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('ListingType을 성공적으로 삭제해야 합니다.', async () => {
      const labelToDelete = '사무실';
      eqMock.mockResolvedValue({ error: null });
      const req = new NextRequest(`http://localhost?label=${labelToDelete}`, { method: 'DELETE' });

      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('매물 유형이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('name', labelToDelete);
    });
  });
});
