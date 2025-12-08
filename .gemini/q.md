`/landSearch`페이지에서 페이지는 정적(shell) 으로 만들고 데이터는 Client fetch → 캐시된 API route에서 가져오기

핵심: 페이지 HTML은 정적으로 서빙(빌드 시 생성) → 브라우저에서 JS가 API 호출. API(앱의 route handler)는 엣지/서버에서 fetch(..., { next: { tags } })) 하며 revalidateTag로 무효화 전략을 원해.

나는 saearchBar.tsx의 옵션에 따라 데이터 구조가 바뀌어 UI가 동적으로 변하길바라며 page.tsx에서 searchParams를 사용하지 않았으면 좋겠어
