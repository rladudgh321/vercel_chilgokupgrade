나는 QuickSale컴포넌트와 RecommendLand컴포넌트를 수정하고자해.
`Build`테이블의 `popularity`에서 `인기`와 `급매`를 선택한 것 중에 나타났으면 좋겠어
------
각매물들이 `popularity`에서 인기와 급매를 선택함에 따라 `인기`이면 RecommendLand컴포넌트에 의해 카드들에 데이터가 흘러가게 해주고
`급매`이면 QuickSale컴포넌트에 의해 카드들에 데이터가 흘러가게 해주고 싶어

만일 `popularity` 가 비어 있으면 인기와 급매에 해당되지 않도록 해줘

---
async function getPopular(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?popularity=인기&limit=10`, { next: { tags: ['public', 'popular'], revalidate: 28800 } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}
----
위의 코드는 app/page.tsx 루트페이지의 코드인데 나는 popularity가 인기임에 따라 인기인 매물들을 실제로 잘 가지고 오는지 잘 모르겠어 실제 데이터 보니까 popularity가 비어있는 항목도 불러와지는 것 것더라고