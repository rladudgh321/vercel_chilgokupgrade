import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Mock Supabase client
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/price-presets/[id] API Route', () => {
  let fromMock: any;
  let updateMock: any;
  let deleteMock: any;
  let eqMock: any;

  beforeEach(() => {
    eqMock = jest.fn();
    updateMock = jest.fn(() => ({ eq: eqMock }));
    deleteMock = jest.fn(() => ({ eq: eqMock }));

    fromMock = jest.fn(() => ({
      update: updateMock,
      delete: deleteMock,
    }));

    (createClient as jest.Mock).mockReturnValue({ from: fromMock });
  });

  // PUT
  describe('PUT handler', () => {
    test('should update a preset successfully', async () => {
      const updatedName = '3000/150';
      eqMock.mockImplementation(() => ({ select: jest.fn().mockResolvedValue({ data: [{ id: 1, name: updatedName }], error: null }) }));
      const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({ name: updatedName }) });

      const response = await PUT(req, { params: { id: '1' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('금액이 수정되었습니다.');
      expect(body.data.name).toBe(updatedName);
      expect(updateMock).toHaveBeenCalledWith({ name: updatedName });
      expect(eqMock).toHaveBeenCalledWith('id', '1');
    });

    test('should return 400 if name is missing', async () => {
        const req = new NextRequest('http://localhost', { method: 'PUT', body: JSON.stringify({}) });
        const response = await PUT(req, { params: { id: '1' } });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error.message).toBe('이름은 필수입니다.');
    });
  });

  // DELETE
  describe('DELETE handler', () => {
    test('should delete a preset successfully', async () => {
      eqMock.mockResolvedValue({ error: null });
      const req = new NextRequest('http://localhost', { method: 'DELETE' });

      const response = await DELETE(req, { params: { id: '1' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('금액이 삭제되었습니다.');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', '1');
    });
  });
});
