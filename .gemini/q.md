`/admin/listings/listings/[id]/edit`페이지에서
BuildBasic컴포넌트에서 라벨선택을 하여 수정하여 submit했지만 데이터가 바뀌지 않더라고
supabase의 DB에서 직접 조회한 결과 수정한 것은 제대로 수정되는데, 데이터를 가지고 오는 과정에서 언제나 `선택없음`으로 데이터를 가지고 오게 되는 문제를 수정해줘
`/api/labels/route.ts`에서 가지고 오는 데이터들은 select를 할 수 있는 목록들이고 나는 supabase에서 `/api/labels/route.ts`에서 가지고 온 것들 중에서 선택한 데이터를 가지고 올 수 있도록 해줘. 이미 suapbase에 Build테이블에 labelId에 있으니까 그 labelId토대로 `/admin/listings/listings/[id]/edit`페이지에서 불러올 수 있도록 해줘