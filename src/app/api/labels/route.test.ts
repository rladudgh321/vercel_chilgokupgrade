
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/labels API 라우트', () => {
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
    test('모든 Label을 성공적으로 가져와야 합니다.', async () => {
      const mockData = [{ id: 1, name: '추천' }, { id: 2, name: '인기' }];
      orderMock.mockResolvedValue({ data: mockData, error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(fromMock).toHaveBeenCalledWith('Label');
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 Label을 성공적으로 추가해야 합니다.', async () => {
      const newLabel = '신규';
      selectMock.mockResolvedValue({ data: [{ id: 3, name: newLabel }], error: null });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ label: newLabel }) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('라벨이 추가되었습니다.');
      expect(body.data.name).toBe(newLabel);
    });

    test('label이 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({}) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('라벨은 필수입니다.');
    });
  });

  // PUT
  describe('PUT 핸들러', () => {
    test('Label을 성공적으로 수정해야 합니다.', async () => {
      const oldLabel = '신규';
      const newLabel = '최신';
      eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 3, name: newLabel }], error: null }) }));
      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ oldLabel, newLabel }) });

      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('라벨이 수정되었습니다.');
      expect(updateMock).toHaveBeenCalledWith({ name: newLabel });
      expect(eqMock).toHaveBeenCalledWith('name', oldLabel);
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('Label을 성공적으로 삭제해야 합니다.', async () => {
      const labelToDelete = '최신';
      eqMock.mockResolvedValue({ error: null });
      const req = new NextRequest(`http://localhost?label=${labelToDelete}`, { method: 'DELETE' });

      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('라벨이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('name', labelToDelete);
    });
  });
});
