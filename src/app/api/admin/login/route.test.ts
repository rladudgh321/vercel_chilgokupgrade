import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock the createAccessLog function if it's in a separate module
// For this example, we assume it's in the same file and don't mock it, 
// but we will mock the functions it calls.

describe('POST /api/admin/login', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = {
      auth: {
        signInWithPassword: jest.fn(),
      },
      from: jest.fn(() => supabase), // for chaining
      insert: jest.fn(() => supabase),
      select: jest.fn(() => supabase),
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email or password are not provided', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // Missing password
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('이메일과 비밀번호를 입력하세요.');
  });

  it('should return 401 for invalid credentials', async () => {
    const errorMessage = 'Invalid login credentials';
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: errorMessage, status: 401 } });

    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe(errorMessage);
  });

  it('should return 200 and user data on successful login', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser } });
    // Mock the access log insert
    supabase.insert.mockResolvedValue({ error: null, data: [{ id: 1 }] });

    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'user-agent': 'jest-test' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });

    // Mock fetch for geolocation
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: 'success', country: 'Testland' }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toEqual(mockUser);
    expect(supabase.from).toHaveBeenCalledWith('access_logs');
    expect(supabase.insert).toHaveBeenCalled();
  });
});
