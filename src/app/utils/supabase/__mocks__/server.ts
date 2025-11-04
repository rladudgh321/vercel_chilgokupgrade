import { jest } from '@jest/globals';

const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
  order: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
};

export const createClient = jest.fn(() => mockSupabaseClient);
