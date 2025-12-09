`/notice/[id]`페이지에서 generateStaticParams를 사용하여 SSG를 만들 수 있도록 해줘

---
bok@DESKTOP-R2LOA8R MINGW64 /c/proj/vercel_chilgokupgrade (main)
$ npm run build

> chilgok@0.1.0 build
> next build

   ▲ Next.js 16.0.8 (Turbopack)
   - Environments: .env
   - Experiments (use with caution):
     · clientTraceMetadata

   Creating an optimized production build ...
 ✓ Compiled successfully in 11.7s
 ✓ Completed runAfterProductionCompile in 14231ms
   Skipping validation of types
 ✓ Collecting page data using 15 workers in 3.5s
 ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
 ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
Error occurred prerendering page "/notice/1". Read more: https://nextjs.org/docs/messages/prerender-error
Error: Supabase environment variables are not set.
    at g (C:\proj\vercel_chilgokupgrade\.next\server\chunks\ssr\[root-of-the-server]__97922b9f._.js:2:11284)
    at h (C:\proj\vercel_chilgokupgrade\.next\server\chunks\ssr\[root-of-the-server]__97922b9f._.js:2:11760)
    at stringify (<anonymous>) {
  digest: '1746375811'
}
Export encountered an error on /(app)/notice/[id]/page: /notice/1, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null