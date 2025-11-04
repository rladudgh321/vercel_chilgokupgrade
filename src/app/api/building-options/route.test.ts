
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/building-options API 라우트', () => {
  let fromMock: any;
  let selectMock: any;
  let orderMock: any;
  let insertMock: any;
  let updateMock: any;
  let deleteMock: any;
  let eqMock: any;

  beforeEach(() => {
    // 모든 모의 함수 초기화
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
    test('모든 BuildingOption을 성공적으로 가져와야 합니다.', async () => {
      const mockData = [{ id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' }];
      orderMock.mockResolvedValue({ data: mockData, error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(fromMock).toHaveBeenCalledWith('BuildingOption');
    });

    test('DB 에러 발생 시 400 상태 코드를 반환해야 합니다.', async () => {
      orderMock.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 BuildingOption을 성공적으로 추가해야 합니다.', async () => {
      const newLabel = 'New Option';
      selectMock.mockResolvedValue({ data: [{ id: 3, name: newLabel }], error: null });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ label: newLabel }) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('옵션이 추가되었습니다.');
      expect(body.data.name).toBe(newLabel);
      expect(insertMock).toHaveBeenCalledWith([{ name: newLabel }]);
    });

    test('label이 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({}) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('옵션은 필수입니다.');
    });

    test('이미 존재하는 옵션이면 400 에러를 반환해야 합니다.', async () => {
        selectMock.mockResolvedValue({ data: null, error: { code: '23505' } });
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ label: 'Existing' }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이미 존재하는 옵션입니다.');
    });
  });

  // PUT
  describe('PUT 핸들러', () => {
    test('BuildingOption을 성공적으로 수정해야 합니다.', async () => {
      const oldLabel = 'Old Option';
      const newLabel = 'Updated Option';
      eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 1, name: newLabel }], error: null }) }));
      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ oldLabel, newLabel }) });

      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('옵션이 수정되었습니다.');
      expect(body.data.name).toBe(newLabel);
      expect(updateMock).toHaveBeenCalledWith({ name: newLabel });
      expect(eqMock).toHaveBeenCalledWith('name', oldLabel);
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('BuildingOption을 성공적으로 삭제해야 합니다.', async () => {
      const labelToDelete = 'Obsolete Option';
      eqMock.mockResolvedValue({ error: null }); // Simulate successful deletion
      const req = new NextRequest(`http://localhost?label=${labelToDelete}`, { method: 'DELETE' });

      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('옵션이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('name', labelToDelete);
    });

    test('label 쿼리 파라미터가 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'DELETE' });
        const response = await DELETE(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('삭제할 옵션이 필요합니다.');
    });
  });
});
