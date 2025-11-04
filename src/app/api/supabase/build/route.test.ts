import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [{ id: 1, title: '매물1', buildingOptions: [], label: {name: 'test'}, listingType: {name: 'test'}, buyType: {name: 'test'} }], count: 1, error: null }),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1, title: '매물1' }, error: null }),
    })),
  })),
}));

jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [{ id: 1, title: '매물1', buildingOptions: [], label: {name: 'test'}, listingType: {name: 'test'}, buyType: {name: 'test'} }], count: 1, error: null }),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1, title: '매물1' }, error: null }),
    })),
  })),
}));

describe('/api/supabase/build API 라우트', () => {
  // GET
  describe('GET 핸들러', () => {
    test('페이지네이션과 함께 매물 목록을 성공적으로 가져와야 합니다.', async () => {
      const req = new NextRequest('http://localhost/api/supabase/build?page=1&limit=10');
      const response = await GET(req);
      expect(response.status).toBe(200);
    });
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 Build 레코드를 성공적으로 생성해야 합니다.', async () => {
      const newBuildData = { title: '새 매물', address: '새 주소' };
      const singleMock = jest.fn().mockResolvedValue({ data: { id: 1, ...newBuildData }, error: null });
      const insertMock = jest.fn(() => ({ select: jest.fn(() => ({ single: singleMock })) }));
      const fromMock = jest.fn(() => ({ insert: insertMock }));

      (createClient as jest.Mock).mockReturnValue({ from: fromMock });

      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(newBuildData) });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.ok).toBe(true);
      expect(body.data[0].title).toBe('새 매물');
    });
  });
});
