Console Error
Server


Error fetching posts: "{\"error\":\"Failed to fetch data from Supabase\"}"

src\app\(app)\layout.tsx (10:13) @ getWorkInfo


   8 |   const response = await fetch(`${BASE_URL}/api/admin/website-info`, { next: { tags: ["public", "workInfo"], revalidate: 28800 } });
   9 |   if (!response.ok) {
> 10 |     console.error('Error fetching posts:', await response.text());
     |             ^
  11 |     return {};
  12 |   }
  13 |   return response.json();
Call Stack
13

Show 9 ignore-listed frame(s)
getWorkInfo
src\app\(app)\layout.tsx (10:13)
Function.all
<anonymous>
NotFound
src\app\not-found.tsx (9:5)
NotFound
<anonymous>
----------
Runtime Error
Server


GET /api/supabase/build failed (400): {"ok":false,"error":{"code":"42501","details":null,"hint":null,"message":"permission denied for schema public"}}

src\app\apis\build.ts (74:11) @ BuildFindAllAdmin


  72 |   if (!res.ok) {
  73 |     const text = await res.text().catch(() => "");
> 74 |     throw new Error(`GET /api/supabase/build failed (${res.status}): ${text}`);
     |           ^
  75 |   }
  76 |   return res.json();
  77 | }
Call Stack
7

Show 5 ignore-listed frame(s)
BuildFindAllAdmin
src\app\apis\build.ts (74:11)
Listings
src\app\(admin)\admin\listings\(menu)\listings\page.tsx (5:24)