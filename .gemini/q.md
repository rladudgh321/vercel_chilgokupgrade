`Header`컴포넌트에서 `데이터 최신화`를 누르면 `/api/revalidate`를 통해서 revalidate가 되도록 작성했어. 나는 ListingSection컴포넌트의 `RecommendLand`컴포넌트와 `QuickSale`컴포넌트와 `RecentlyLand`컴포넌트가 데이터 최신화가 안되더라고 `npm run build`를 하면 해당 컴포넌트는 루트페이지에 있는데 static 으로 빌드되어 있어.
나는 루트페이지가 revalidate 효과를 누르면서 Header컴포넌트에서 데이터 최신화를 누르면 데이터 또한 변하길 바래.

---
나는 vercel의 홈페이지에서 루트페이지에서 에러를 발견하고 다음과 같은 로그를 발견했어.
나는 루트페이지는 ISR로 되었으면 좋겠어.
---
[Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.] {
  digest: 'DYNAMIC_SERVER_USAGE'
}