
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/inquiries/orders/[id] API 라우트', () => {
  let fromMock: any;
  let updateMock: any;
  let deleteMock: any;
  let eqMock: any;
  let selectMock: any;

  beforeEach(() => {
    selectMock = jest.fn();
    eqMock = jest.fn(() => ({ select: selectMock }));
    updateMock = jest.fn(() => ({ eq: eqMock }));
    deleteMock = jest.fn(() => ({ eq: eqMock }));

    fromMock = jest.fn(() => ({
      update: updateMock,
      delete: deleteMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // PUT
  describe('PUT 핸들러', () => {
    const orderId = '123';

    test('주문 문의를 성공적으로 수정해야 합니다.', async () => {
      const updateData = { confirm: true, note: '처리 완료' };
      selectMock.mockResolvedValue({ data: [{ id: orderId, ...updateData }], error: null });

      const req = new NextRequest(`http://localhost/api/inquiries/orders/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(req, { params: { id: orderId } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body[0].confirm).toBe(true);
      expect(body[0].note).toBe('처리 완료');
      expect(fromMock).toHaveBeenCalledWith('Order');
      expect(updateMock).toHaveBeenCalledWith(updateData);
      expect(eqMock).toHaveBeenCalledWith('id', parseInt(orderId, 10));
    });

    test('수정할 필드가 없으면 400 에러를 반환해야 합니다.', async () => {
        const req = new NextRequest(`http://localhost/api/inquiries/orders/${orderId}`,
          {
            method: 'PUT',
            body: JSON.stringify({ invalidField: 'some-value' }),
          }
        );
  
        const response = await PUT(req, { params: { id: orderId } });
        const body = await response.json();
  
        expect(response.status).toBe(400);
        expect(body.error).toBe('No fields to update');
      });

    test('DB 업데이트 중 에러가 발생하면 500 에러를 반환해야 합니다.', async () => {
      selectMock.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      const req = new NextRequest(`http://localhost/api/inquiries/orders/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ confirm: true }),
        }
      );

      const response = await PUT(req, { params: { id: orderId } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Error updating order');
    });
  });

  // DELETE
  describe('DELETE 핸들러', () => {
    const orderId = '123';

    test('주문 문의를 성공적으로 삭제해야 합니다.', async () => {
      eqMock.mockResolvedValue({ error: null });

      const req = new NextRequest(`http://localhost/api/inquiries/orders/${orderId}`, { method: 'DELETE' });
      const response = await DELETE(req, { params: { id: orderId } });

      expect(response.status).toBe(204);
      expect(fromMock).toHaveBeenCalledWith('Order');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', parseInt(orderId, 10));
    });

    test('DB 삭제 중 에러가 발생하면 500 에러를 반환해야 합니다.', async () => {
      eqMock.mockResolvedValue({ error: { message: 'DB Error' } });

      const req = new NextRequest(`http://localhost/api/inquiries/orders/${orderId}`, { method: 'DELETE' });
      const response = await DELETE(req, { params: { id: orderId } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Error deleting order');
    });
  });
});
