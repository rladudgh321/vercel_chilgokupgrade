
import { GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Supabase 클라이언트 모의(mock) 설정
jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/listings/map API 라우트 핸들러', () => {
  let fromMock: any;
  let selectMock: any;
  let isMock: any;
  let orderMock: any;
  let eqMock: any;
  let ilikeMock: any;
  let containsMock: any;

  beforeEach(() => {
    // 각 테스트 실행 전에 모의 함수들을 초기화합니다.
    eqMock = jest.fn().mockReturnThis();
    ilikeMock = jest.fn().mockReturnThis();
    containsMock = jest.fn().mockReturnThis();
    orderMock = jest.fn().mockReturnThis();
    isMock = jest.fn().mockReturnThis();
    selectMock = jest.fn().mockReturnThis();
    fromMock = jest.fn(() => ({
      select: selectMock,
    }));

    // createClient가 모의 Supabase 클라이언트를 반환하도록 설정합니다.
    (createClient as jest.Mock).mockReturnValue({
      from: fromMock,
    });

    // select가 is, order 등을 체이닝할 수 있도록 설정합니다.
    selectMock.mockImplementation(() => ({
      is: isMock,
      order: orderMock,
    }));

    // order가 다른 필터 함수들을 체이닝할 수 있도록 설정합니다.
    orderMock.mockImplementation(() => ({
      eq: eqMock,
      ilike: ilikeMock,
      contains: containsMock,
      // 최종적으로 await될 때 모의 데이터를 반환하도록 설정합니다.
      then: (resolve: any) => resolve({ data: [{ id: 1, title: '테스트 매물' }], error: null }),
    }));
  });

  test('필터 없이 GET 요청을 보내면 모든 매물 데이터를 반환해야 합니다.', async () => {
    const req = new NextRequest('http://localhost/api/listings/map');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('Build');
    expect(selectMock).toHaveBeenCalledWith('id, title, address, mapLocation');
    expect(isMock).toHaveBeenCalledWith('deletedAt', null);
    expect(orderMock).toHaveBeenCalledWith('createdAt', { ascending: false });
  });

  test('keyword 파라미터로 숫자 ID를 보내면 eq 필터가 적용되어야 합니다.', async () => {
    const req = new NextRequest('http://localhost/api/listings/map?keyword=123');
    await GET(req);

    expect(eqMock).toHaveBeenCalledWith('id', 123);
  });

  test('keyword 파라미터로 문자열을 보내면 ilike 필터가 적용되어야 합니다.', async () => {
    const req = new NextRequest('http://localhost/api/listings/map?keyword=test address');
    await GET(req);

    expect(ilikeMock).toHaveBeenCalledWith('address', '%test address%');
  });

  test('theme 파라미터를 보내면 contains 필터가 적용되어야 합니다.', async () => {
    const req = new NextRequest('http://localhost/api/listings/map?theme=new');
    await GET(req);

    expect(containsMock).toHaveBeenCalledWith('themes', ['new']);
  });

  test('데이터베이스에서 에러가 발생하면 400 상태 코드와 에러 메시지를 반환해야 합니다.', async () => {
    // 에러 상황을 시뮬레이션하기 위해 모의 함수를 재설정합니다.
    orderMock.mockImplementation(() => ({
        then: (resolve: any) => resolve({ data: null, error: { message: 'DB Error' } }),
    }));

    const req = new NextRequest('http://localhost/api/listings/map');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toEqual({ message: 'DB Error' });
  });
});
