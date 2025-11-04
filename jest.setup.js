
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@/app/utils/supabase/server');
