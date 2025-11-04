import { GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('GET /api/admin/access-logs', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn(() => supabase),
      select: jest.fn(() => supabase),
      order: jest.fn(() => supabase),
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 if there is a database error', async () => {
    const errorMessage = 'Database error';
    supabase.order.mockResolvedValue({ error: { message: errorMessage } });

    const req = new NextRequest('http://localhost/api/admin/access-logs');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(errorMessage);
  });

  it('should return 200 and a list of access logs on success', async () => {
    const mockLogs = [
      { id: 1, ip: '127.0.0.1', createdAt: new Date().toISOString() },
      { id: 2, ip: '127.0.0.2', createdAt: new Date().toISOString() },
    ];
    supabase.order.mockResolvedValue({ data: mockLogs, error: null });

    const req = new NextRequest('http://localhost/api/admin/access-logs');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockLogs);
    expect(supabase.from).toHaveBeenCalledWith('access_logs');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(supabase.order).toHaveBeenCalledWith('createdAt', { ascending: false });
  });
});
