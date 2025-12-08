Console Error


Functions are not valid as a React child. This may happen if you return PostView[displayDate] instead of <PostView[displayDate] /> from render. Or maybe you meant to call this function rather than return it.
  <span>{PostView[displayDate]}</span>
src\app\(app)\notice\[id]\page.tsx (55:10) @ NoticeDetailPage


  53 |   const post = await getPost(id);
  54 |
> 55 |   return <PostView post={post} />;
     |          ^
  56 | }
  57 |
Call Stack
21

Show 18 ignore-listed frame(s)
span
<anonymous>
PostView
file:///C:/project/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_(app)_notice_%5Bid%5D_PostView_tsx_78b889d0._.js (65:225)
NoticeDetailPage
src\app\(app)\notice\[id]\page.tsx (55:10)