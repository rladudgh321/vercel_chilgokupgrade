import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('POST /api/admin/logout', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: {
        signOut: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 if Supabase signout fails', async () => {
    const errorMessage = 'Signout failed';
    supabase.auth.signOut.mockResolvedValue({ error: { message: errorMessage } });

    const req = new NextRequest('http://localhost/api/admin/logout', { method: 'POST' });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(errorMessage);
  });

  it('should return 200 on successful logout', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const req = new NextRequest('http://localhost/api/admin/logout', { method: 'POST' });
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
