
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/buy-types API 라우트', () => {
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
    test('모든 BuyType을 성공적으로 가져와야 합니다.', async () => {
      const mockData = [{ id: 1, name: '매매' }, { id: 2, name: '전세' }];
      orderMock.mockResolvedValue({ data: mockData, error: null });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(fromMock).toHaveBeenCalledWith('BuyType');
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 BuyType을 성공적으로 추가해야 합니다.', async () => {
      const newName = '월세';
      selectMock.mockResolvedValue({ data: [{ id: 3, name: newName }], error: null });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ name: newName }) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('거래유형이 추가되었습니다.');
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
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ name: '매매' }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이미 존재하는 이름입니다.');
    });
  });

  // PUT
  describe('PUT 핸들러', () => {
    test('BuyType을 성공적으로 수정해야 합니다.', async () => {
      const oldName = '월세';
      const newName = '반전세';
      eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 3, name: newName }], error: null }) }));
      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ oldName, newName }) });

      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('거래유형이 수정되었습니다.');
      expect(body.data.name).toBe(newName);
      expect(updateMock).toHaveBeenCalledWith({ name: newName });
      expect(eqMock).toHaveBeenCalledWith('name', oldName);
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('BuyType을 성공적으로 삭제해야 합니다.', async () => {
      const nameToDelete = '반전세';
      eqMock.mockResolvedValue({ error: null });
      const req = new NextRequest(`http://localhost?name=${nameToDelete}`, { method: 'DELETE' });

      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('거래유형이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('name', nameToDelete);
    });
  });
});
