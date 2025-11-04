
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/app/utils/supabase/server';

// Prisma와 Supabase 클라이언트 모의(mock) 설정
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      create: jest.fn(),
    },
  },
}));
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/inquiries/orders API 라우트', () => {

  beforeEach(() => {
    (prisma.order.create as jest.Mock).mockClear();
    (createClient as jest.Mock).mockClear();
  });

  // POST
  describe('POST 핸들러', () => {
    test('새로운 주문 문의를 성공적으로 생성해야 합니다.', async () => {
      const newOrderData = {
        category: '매물',
        transactionType: '매매',
        author: '테스트',
        propertyType: '아파트',
        estimatedAmount: '1억',
        contact: '010-1234-5678',
        region: '서울',
        title: '테스트 문의',
        description: '테스트 설명',
      };
      const createdOrder = { id: 1, ...newOrderData, ipAddress: '127.0.0.1' };

      (prisma.order.create as jest.Mock).mockResolvedValue(createdOrder);

      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: JSON.stringify(newOrderData),
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual(createdOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining(newOrderData),
      });
    });

    test('DB 생성 중 에러가 발생하면 500 에러를 반환해야 합니다.', async () => {
        (prisma.order.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const req = new NextRequest('http://localhost', { 
            method: 'POST', 
            body: JSON.stringify({ title: 'test' }) 
        });

        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Error creating order');
    });
  });

  // GET
  describe('GET 핸들러', () => {
    let fromMock: any, rangeMock: any;

    beforeEach(() => {
        rangeMock = jest.fn();
        fromMock = jest.fn(() => ({
            select: jest.fn(() => ({
                order: jest.fn(() => ({ range: rangeMock }))
            }))
        }));
        (createClient as jest.Mock).mockReturnValue({ from: fromMock });
    });

    test('주문 문의 목록을 성공적으로 가져와야 합니다.', async () => {
      const mockOrders = [{ id: 1, title: '첫번째 문의' }];
      rangeMock.mockResolvedValue({ data: mockOrders, error: null, count: 1 });

      const req = new NextRequest('http://localhost/api/inquiries/orders?page=1&limit=5');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(mockOrders);
      expect(body.count).toBe(1);
      expect(fromMock).toHaveBeenCalledWith('Order');
      expect(rangeMock).toHaveBeenCalledWith(0, 4);
    });

    test('DB 조회 중 에러가 발생하면 500 에러를 반환해야 합니다.', async () => {
        rangeMock.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        const req = new NextRequest('http://localhost/api/inquiries/orders');
        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Error fetching orders');
    });
  });
});
