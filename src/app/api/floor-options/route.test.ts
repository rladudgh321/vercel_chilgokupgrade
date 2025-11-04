import { GET, POST, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/floor-options API 라우트', () => {
  let fromMock: any;
  let selectMock: any;
  let orderMock: any;
  let insertMock: any;
  let deleteMock: any;
  let eqMock: any;

  beforeEach(() => {
    // Reset mocks before each test
    eqMock = jest.fn().mockResolvedValue({ error: null }); // Default success for delete
    selectMock = jest.fn();
    orderMock = jest.fn();
    insertMock = jest.fn(() => ({ select: selectMock }));
    deleteMock = jest.fn(() => ({ eq: eqMock }));

    fromMock = jest.fn(() => ({
      select: jest.fn(() => ({ order: orderMock })),
      insert: insertMock,
      delete: deleteMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // GET
  describe('GET 핸들러', () => {
    test('모든 FloorOption을 성공적으로 가져와야 합니다.', async () => {
      const mockData = [{ id: 1, name: '1층' }, { id: 2, name: '2층' }];
      orderMock.mockResolvedValue({ data: mockData, error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(fromMock).toHaveBeenCalledWith('FloorOption');
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 FloorOption을 성공적으로 추가해야 합니다.', async () => {
      const newName = '3층';
      selectMock.mockResolvedValue({ data: [{ id: 3, name: newName }], error: null });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ name: newName }) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('옵션이 추가되었습니다.');
      expect(body.data.name).toBe(newName);
      expect(insertMock).toHaveBeenCalledWith([{ name: newName }]);
    });

    test('name이 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({}) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이름은 필수입니다.');
    });

    test('이미 존재하는 이름이면 400 에러를 반환해야 합니다.', async () => {
        selectMock.mockResolvedValue({ data: null, error: { code: '23505' } });
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ name: '1층' }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이미 존재하는 이름입니다.');
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('FloorOption을 성공적으로 삭제해야 합니다.', async () => {
      const idToDelete = '1';
      const req = new NextRequest(`http://localhost?id=${idToDelete}`, { method: 'DELETE' });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('옵션이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', idToDelete);
    });

    test('id가 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'DELETE' });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('삭제할 ID가 필요합니다.');
    });
  });
});