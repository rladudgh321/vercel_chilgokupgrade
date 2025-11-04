
import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/listing-type/reorder API 라우트', () => {
  let fromMock: any;
  let updateMock: any;
  let eqMock: any;

  beforeEach(() => {
    eqMock = jest.fn().mockResolvedValue({ error: null });
    updateMock = jest.fn(() => ({ eq: eqMock }));
    fromMock = jest.fn(() => ({ update: updateMock }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  describe('POST 핸들러', () => {
    test('유효한 ID 배열로 순서를 성공적으로 업데이트해야 합니다.', async () => {
      const orderedIds = [3, 1, 2];
      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: JSON.stringify({ orderedIds }) 
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(fromMock).toHaveBeenCalledWith('ListingType');
      expect(updateMock).toHaveBeenCalledTimes(orderedIds.length);
    });

    test('orderedIds가 배열이 아니면 400 에러를 반환해야 합니다.', async () => {
      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: JSON.stringify({ orderedIds: 'invalid' }) 
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.message).toBe('orderedIds must be an array.');
    });
  });
});
