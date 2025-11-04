
import { GET } from './route';
import { NextRequest } from 'next/server';
import { BuildFindAll } from "@/app/apis/build";

// BuildFindAll 함수 모의(mock) 설정
jest.mock('@/app/apis/build', () => ({
  BuildFindAll: jest.fn(),
}));

describe('/api/listings API 라우트', () => {

  beforeEach(() => {
    (BuildFindAll as jest.Mock).mockClear();
  });

  describe('GET 핸들러', () => {
    test('기본 파라미터로 매물 목록을 성공적으로 가져와야 합니다.', async () => {
      const mockResponse = { data: [{ id: 1, title: '테스트 매물' }], totalPages: 1 };
      (BuildFindAll as jest.Mock).mockResolvedValue(mockResponse);

      const req = new NextRequest('http://localhost/api/listings');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.listings).toEqual(mockResponse.data);
      expect(body.totalPages).toBe(1);
      expect(body.currentPage).toBe(1);
      expect(BuildFindAll).toHaveBeenCalledWith(1, 10, undefined, { theme: undefined, propertyType: undefined, buyType: undefined }, 'latest');
    });

    test('모든 검색 및 필터 파라미터를 BuildFindAll에 정확히 전달해야 합니다.', async () => {
        (BuildFindAll as jest.Mock).mockResolvedValue({ data: [], totalPages: 0 });
        const url = 'http://localhost/api/listings?page=2&limit=20&keyword=서울&theme=신축&propertyType=아파트&buyType=매매&sortBy=price';
        const req = new NextRequest(url);
        await GET(req);
  
        expect(BuildFindAll).toHaveBeenCalledWith(
          2, 
          20, 
          '서울', 
          { theme: '신축', propertyType: '아파트', buyType: '매매' }, 
          'price'
        );
      });

    test('BuildFindAll에서 에러가 발생하면 500 상태 코드를 반환해야 합니다.', async () => {
        const errorMessage = 'Internal Server Error';
        (BuildFindAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

        const req = new NextRequest('http://localhost/api/listings');
        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe('Failed to fetch listings');
    });
  });
});
