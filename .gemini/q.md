ManagementAPI컴포넌트를 수정해줘
지금 데이터베이스 크기는 잘 나타내고 있는데 스토리지 크기는 0.08GB이지만 계속 0으로 표현돼.
이 부분을 수정해줘.
`/api/supabase-usage/route.ts`파일을 supabase의 스토리지가 나타낼수 있도록 수정해줘.