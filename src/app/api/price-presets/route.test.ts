import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Mock Supabase client
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/price-presets API Route', () => {
  let fromMock: any;
  let selectMock: any;
  let orderMock: any;
  let insertMock: any;
  let eqMock: any;

  beforeEach(() => {
    eqMock = jest.fn();
    selectMock = jest.fn(() => ({ eq: eqMock }));
    orderMock = jest.fn(() => ({ data: [], error: null }));
    eqMock.mockReturnValue({ order: orderMock });
    insertMock = jest.fn(() => ({ select: jest.fn().mockResolvedValue({ data: [{}], error: null }) }));

    fromMock = jest.fn(() => ({
      select: selectMock,
      insert: insertMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // GET
  describe('GET handler', () => {
    test('should fetch presets for a given buyTypeId', async () => {
      const mockData = [{ id: 1, name: '1000/50', buyTypeId: 1 }];
      orderMock.mockResolvedValue({ data: mockData, error: null });
      const req = new NextRequest('http://localhost?buyTypeId=1');

      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(fromMock).toHaveBeenCalledWith('PricePreset');
      expect(eqMock).toHaveBeenCalledWith('buyTypeId', '1');
    });

    test('should return 400 if buyTypeId is missing', async () => {
      const req = new NextRequest('http://localhost');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.message).toBe('buyTypeId가 필요합니다.');
    });
  });

  // POST
  describe('POST handler', () => {
    test('should add a new preset successfully', async () => {
      const newPreset = { name: '2000/100', buyTypeId: 1 };
      insertMock.mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [{ id: 2, ...newPreset }], error: null }) });
      const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify(newPreset) });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('금액이 추가되었습니다.');
      expect(body.data.name).toBe(newPreset.name);
      expect(insertMock).toHaveBeenCalledWith([newPreset]);
    });

    test('should return 400 if name is missing', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ buyTypeId: 1 }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이름은 필수입니다.');
    });

    test('should return 400 if buyTypeId is missing', async () => {
        const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ name: 'test' }) });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('buyTypeId가 필요합니다.');
    });
  });
});
