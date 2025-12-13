`/landSearch`페이지나 `/card`페이지의 SearchBar컴포넌트를 수정하고자해. 
`/admin/listings/category-settings`페이지에서 true된 것들에 대해서 select바를 선택하면 나열된 item들에 대하여 매물들 갯수가 오른쪽에 보이도록 해줘.
예를들면, `매물 종류`에 대한 select를 클릭을 하면, `/admin/listings/listing-types`페이지에 따른 `과수원, 나대지` 같은 항목과 ListingsList나 CardList에서 Build테이블과 관련된 ListingType테이블의 name부분이 일치된 항목인 `과수원, 나대지`같은 항목에 대한 숫자를 SearchBar컴포넌트 옆에 `과수원(3)`, `나대지(5)` 이렇게 소괄호로 매물갯수를 표현해줘.
---
Console Error


Encountered two children with the same key, `기본 테마`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
src\app\(app)\landSearch\page.tsx (5:5) @ Page


  3 | export default async function Page() {
  4 |   return (
> 5 |     <LandSearchClient />
    |     ^
  6 |   );
  7 | }
Call Stack
26

Show 20 ignore-listed frame(s)
option
<anonymous>
<unknown>
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (1960:259)
Array.map
<anonymous>
SearchBar
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (1960:44)
LandSearchClient
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (3982:225)
Page
src\app\(app)\landSearch\page.tsx (5:5)