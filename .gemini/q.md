`/landSearch`페이지에 있다가 `/card`페이지에 있다가 다시 `/landSearch`페이지에 가면 아래와 같은 오류가 있어
하지만 `/card`페이지를 거치지 않고 다른 페이지에 왔다갔다하다가 다시 `/landSearch`페이지에 가도 오류가 나지 않아.`/landSearch`페이지와 `/card`페이지 간에 밀접한 연관성 때문에 오류가 있나봐

---
Runtime TypeError


Cannot read properties of undefined (reading 'length')
src\app\(app)\landSearch\page.tsx (5:5) @ Page


  3 | export default async function Page() {
  4 |   return (
> 5 |     <LandSearchClient />
    |     ^
  6 |   );
  7 | }
Call Stack
28

Show 26 ignore-listed frame(s)
LandSearchClient
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (4013:334)
Page
src\app\(app)\landSearch\page.tsx (5:5)