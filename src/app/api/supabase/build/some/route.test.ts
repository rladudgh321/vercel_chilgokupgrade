
import { DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/supabase/build/some API 라우트', () => {
  let fromMock: any, selectMock: any, updateMock: any, inMock: any, isMock: any;

  beforeEach(() => {
    isMock = jest.fn();
    inMock = jest.fn();
    selectMock = jest.fn(() => ({ in: inMock }));
    updateMock = jest.fn(() => ({ in: jest.fn(() => ({ is: isMock })) }));
    fromMock = jest.fn(() => ({ select: selectMock, update: updateMock }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  describe('DELETE 핸들러', () => {
    test('여러 매물을 성공적으로 소프트 삭제해야 합니다.', async () => {
      const idsToDelete = [1, 2];
      // 1. 조회: 삭제되지 않은 항목들만 반환
      inMock.mockResolvedValueOnce({ data: [{ id: 1, deletedAt: null }, { id: 2, deletedAt: null }], error: null });
      // 2. 업데이트: 성공적으로 2개 항목 업데이트
      isMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }], error: null }) }));

      const req = new NextRequest('http://localhost', { method: 'DELETE', body: JSON.stringify({ ids: idsToDelete }) });
      const response = await DELETE(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('소프트 삭제 완료');
      expect(body.deletedCount).toBe(2);
      expect(body.deletedIds).toEqual(idsToDelete);
      expect(fromMock).toHaveBeenCalledWith('Build');
    });

    test('ids가 유효하지 않으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest('http://localhost', { method: 'DELETE', body: JSON.stringify({ ids: [] }) }); // min(1)
        const response = await DELETE(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe('잘못된 요청');
    });

    test('이미 삭제된 매물이 포함되어 있으면 400 에러를 반환해야 합니다.', async () => {
        const idsToDelete = [1, 2];
        // 1. 조회: 하나는 이미 삭제된 것으로 반환
        inMock.mockResolvedValueOnce({ data: [{ id: 1, deletedAt: new Date() }, { id: 2, deletedAt: null }], error: null });

        const req = new NextRequest('http://localhost', { method: 'DELETE', body: JSON.stringify({ ids: idsToDelete }) });
        const response = await DELETE(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toContain('이미 삭제된 매물: 1');
    });

    test('업데이트 중 DB 에러가 발생하면 500 에러를 반환해야 합니다.', async () => {
        const idsToDelete = [1, 2];
        // 1. 조회: 성공
        inMock.mockResolvedValueOnce({ data: [{ id: 1, deletedAt: null }, { id: 2, deletedAt: null }], error: null });
        // 2. 업데이트: 실패
        isMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }) }));

        const req = new NextRequest('http://localhost', { method: 'DELETE', body: JSON.stringify({ ids: idsToDelete }) });
        const response = await DELETE(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe('삭제 처리 중 오류');
    });
  });
});
