`/admin/listings/listings/create`페이이지의 색깔을 수정하고 싶어.
밝은 테마에서도 어두운 테마에서도 어울리는 색깔을 해줘 나는 tailwindcss 버전4를 사용하고 있어.
next lint는 nextj16버전이후부터는 없어졌어. `npm run lint` 명령어를 실행하지마
git 명령어는 사용하지마
---
BuildInfo컴포넌트에서 클릭을 하면 클릭에 대한 active css가 안되어 있어.
그래서 클릭이 된것인지 안된것인지도 모르겠어.
아마 css문제가 아니라 버튼이 안눌리는 문제가 있을 수 있을것 같아 확인해줘
---
DatePicker에서 Suspense 래퍼를 씌워서 lazy loading을 원해.
나는 DatePicker컴포넌트에서만 lazy loading을 원하지 BuildingInfo컴포넌트를 lazy로딩을 원하지 않아
---
Runtime ReferenceError


watchedDirectionBase is not defined
src\app\(admin)\admin\listings\(menu)\listings\create\page.tsx (7:7) @ CreateListings


   5 |     
   6 |     <div>
>  7 |       <CreateClient />
     |       ^
   8 |     </div>
   9 |   )
  10 | }
Call Stack
17

Show 11 ignore-listed frame(s)
<unknown>
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_9aa32b18._.js (4206:46)
Array.map
<anonymous>
BuildingInfo
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_9aa32b18._.js (4198:35)
BuildForm
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_9aa32b18._.js (6295:225)
CreateClient
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_9aa32b18._.js (6735:217)
CreateListings
src\app\(admin)\admin\listings\(menu)\listings\create\page.tsx (7:7)