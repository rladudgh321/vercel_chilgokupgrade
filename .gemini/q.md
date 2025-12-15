`/admin/other/banned-ips` 페이지에 페이지네이션 작업을 하고 싶어
Pagination 컴포넌트를 재활용하여 item갯수가 10개 마다 쪽번호를 매겨줘
---
Runtime TypeError


Cannot read properties of undefined (reading 'length')
src\app\(admin)\admin\other\banned-ips\page.tsx (20:10) @ BannedIpsPage


  18 |   const { data:bannedIps, totalPages } = await getBannedIps(page, limit);
  19 |
> 20 |   return <BannedIpList initialBannedIps={bannedIps} totalPages={totalPages} currentPage={page} />;
     |          ^
  21 | };
  22 |
  23 | export default BannedIpsPage;
Call Stack
13

Show 11 ignore-listed frame(s)
BannedIpList
file:///C:/proj/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_4c597f48._.js (181:48)
BannedIpsPage
src\app\(admin)\admin\other\banned-ips\page.tsx (20:10)