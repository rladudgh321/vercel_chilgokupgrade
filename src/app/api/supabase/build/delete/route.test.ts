
import { GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/supabase/build/delete API 라우트', () => {
  let fromMock: any, selectMock: any, rangeMock: any, orderMock: any, notMock: any, eqMock: any, ilikeMock: any;

  beforeEach(() => {
    rangeMock = jest.fn();
    eqMock = jest.fn(() => ({ range: rangeMock }));
    ilikeMock = jest.fn(() => ({ range: rangeMock }));
    orderMock = jest.fn(() => ({ order: jest.fn(() => ({ range: rangeMock, eq: eqMock, ilike: ilikeMock })) }));
    notMock = jest.fn(() => ({ order: orderMock }));
    selectMock = jest.fn(() => ({ not: notMock }));
    fromMock = jest.fn(() => ({ select: selectMock }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  describe('GET 핸들러', () => {
    test('삭제된 매물 목록을 성공적으로 가져와야 합니다.', async () => {
      const mockData = { data: [{ id: 1, title: '삭제된 매물', deletedAt: new Date() }], count: 1, error: null };
      rangeMock.mockResolvedValue(mockData);

      const req = new NextRequest('http://localhost/api/supabase/build/delete?page=1&limit=10');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data[0].title).toBe('삭제된 매물');
      expect(body.totalItems).toBe(1);
      expect(fromMock).toHaveBeenCalledWith('Build');
      expect(notMock).toHaveBeenCalledWith('deletedAt', 'is', null);
      expect(rangeMock).toHaveBeenCalledWith(0, 9);
    });

    test('숫자 keyword로 id 검색을 수행해야 합니다.', async () => {
        rangeMock.mockResolvedValue({ data: [], count: 0, error: null });
        const req = new NextRequest('http://localhost/api/supabase/build/delete?keyword=123');
        await GET(req);
        expect(eqMock).toHaveBeenCalledWith('id', 123);
    });

    test('문자 keyword로 address 검색을 수행해야 합니다.', async () => {
        rangeMock.mockResolvedValue({ data: [], count: 0, error: null });
        const req = new NextRequest('http://localhost/api/supabase/build/delete?keyword=서울');
        await GET(req);
        expect(ilikeMock).toHaveBeenCalledWith('address', '%서울%');
    });

    test('DB 에러 발생 시 400 상태 코드를 반환해야 합니다.', async () => {
        rangeMock.mockResolvedValue({ data: null, count: 0, error: { message: 'DB Error' } });
        const req = new NextRequest('http://localhost/api/supabase/build/delete');
        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.ok).toBe(false);
    });
  });
});
