
import { GET, POST, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));

describe('/api/property-types API 라우트', () => {
  let fromMock: any;
  let selectMock: any;
  let updateMock: any;
  let insertMock: any;
  let deleteMock: any;
  let eqMock: any;
  let notMock: any;
  let isMock: any;
  let limitMock: any;

  beforeEach(() => {
    // 모든 모의 함수 초기화
    eqMock = jest.fn();
    notMock = jest.fn();
    isMock = jest.fn();
    limitMock = jest.fn();
    selectMock = jest.fn();
    updateMock = jest.fn(() => ({ eq: eqMock }));
    insertMock = jest.fn(() => ({ select: selectMock }));
    deleteMock = jest.fn(() => ({ eq: eqMock }));

    // 체이닝을 위한 설정
    eqMock.mockImplementation(() => ({ limit: limitMock, select: selectMock }));
    notMock.mockImplementation(() => ({ not: notMock }));
    isMock.mockImplementation(() => ({ limit: limitMock }));
    selectMock.mockImplementation(() => ({ not: notMock, eq: eqMock, is: isMock }));

    fromMock = jest.fn(() => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // GET
  describe('GET 핸들러', () => {
    test('모든 PropertyType을 성공적으로 가져와야 합니다.', async () => {
      const fromMock = jest.fn().mockImplementation((tableName: string) => {
        if (tableName === 'Build') {
          return {
            select: jest.fn().mockReturnThis(),
            not: jest.fn().mockResolvedValue({ data: [{ propertyType: '아파트' }, { propertyType: '빌라' }], error: null })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          is: jest.fn().mockResolvedValue({ data: [{ id: 1, label: '아파트', imageUrl: 'url', imageName: 'property-types/apt.jpg' }], error: null })
        }
      });
      (createClient as jest.Mock).mockReturnValue({ from: fromMock });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.length).toBe(2);
      expect(body.data[0].name).toBe('아파트');
      expect(body.data[0].imageUrl).toBe('url'); // 이미지가 매칭됨
      expect(body.data[1].name).toBe('빌라');
      expect(body.data[1].imageUrl).toBeUndefined(); // 매칭되는 이미지 없음
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 PropertyType을 성공적으로 추가해야 합니다.', async () => {
      const newType = { label: '오피스텔', imageUrl: 'url', imageName: 'name' };
      // Check existing: return empty
      limitMock.mockResolvedValueOnce({ data: [], error: null });
      // Insert dummy build: success
      fromMock.mockResolvedValueOnce({ error: null });
      // Upsert ThemeImage: success
      selectMock.mockResolvedValue({ data: [{ id: 1, ...newType }], error: null });

      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(newType) });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('매물 종류가 추가되었습니다.');
      expect(insertMock).toHaveBeenCalled(); // Build 또는 ThemeImage에 insert가 호출됨
    });

    test('이미 존재하는 타입이면 400 에러를 반환해야 합니다.', async () => {
        limitMock.mockResolvedValueOnce({ data: [{ propertyType: '아파트' }], error: null });
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ label: '아파트' }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이미 존재하는 매물 종류입니다.');
    });
  });

  // PUT
  describe('PUT 핸들러', () => {
    test('이름 변경을 성공적으로 처리해야 합니다.', async () => {
      const payload = { oldLabel: '빌라', newLabel: '다세대' };
      // Build.update mock
      eqMock.mockResolvedValueOnce({ error: null });
      // ThemeImage.update mock
      eqMock.mockResolvedValueOnce({ error: null });

      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify(payload) });
      const response = await PUT(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('매물 종류가 수정되었습니다.');
      expect(updateMock).toHaveBeenCalledWith({ propertyType: payload.newLabel });
      expect(updateMock).toHaveBeenCalledWith({ label: payload.newLabel });
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    test('PropertyType을 성공적으로 null로 변경해야 합니다.', async () => {
      const labelToDelete = '다세대';
      eqMock.mockResolvedValue({ error: null });
      const req = new NextRequest(`http://localhost?label=${labelToDelete}`, { method: 'DELETE' });

      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('매물 종류가 삭제되었습니다.');
      expect(updateMock).toHaveBeenCalledWith({ propertyType: null });
      expect(eqMock).toHaveBeenCalledWith('propertyType', labelToDelete);
    });
  });
});
