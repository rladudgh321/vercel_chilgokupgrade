import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Mock Supabase client
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/price-presets/reorder API Route', () => {
  let fromMock: any;
  let updateMock: any;
  let eqMock: any;

  beforeEach(() => {
    eqMock = jest.fn().mockResolvedValue({ error: null });
    updateMock = jest.fn(() => ({ eq: eqMock }));

    fromMock = jest.fn(() => ({
      update: updateMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // POST
  describe('POST handler', () => {
    test('should reorder presets successfully', async () => {
      const items = [{ id: 1, order: 1 }, { id: 2, order: 0 }];
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(items) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('순서가 변경되었습니다.');
      expect(updateMock).toHaveBeenCalledTimes(2);
      expect(updateMock).toHaveBeenCalledWith({ order: 1 });
      expect(eqMock).toHaveBeenCalledWith('id', 1);
      expect(updateMock).toHaveBeenCalledWith({ order: 0 });
      expect(eqMock).toHaveBeenCalledWith('id', 2);
    });

    test('should return 400 if items are missing', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(null) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('잘못된 요청입니다.');
    });
  });
});
