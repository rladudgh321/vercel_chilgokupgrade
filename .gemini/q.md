`/landSearch`페이지와 `/card`페이지에서 빌드할 때 static랜더링으로 되어서 ISR로 하길 원해. 나는 revalidate를 시간이 아닌 tag로 public으로 하길 원하는데, 잘 작동되도록 해줘.
---
USER@DESKTOP-IKU5VE6 MINGW64 /c/project/vercel_chilgokupgrade (main)
$ npm run build

> chilgok@0.1.0 build
> next build

   ▲ Next.js 16.0.7 (Turbopack)
   - Environments: .env
   - Experiments (use with caution):
     · clientTraceMetadata
     · proxyClientMaxBodySize: "50mb"

   Creating an optimized production build ...
 ✓ Compiled successfully in 24.1s
 ✓ Completed runAfterProductionCompile in 2039ms
   Skipping validation of types
 ✓ Collecting page data using 11 workers in 7.0s
 ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-r
eference/functions/generate-metadata#metadatabase
 ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-r
eference/functions/generate-metadata#metadatabase
Error occurred prerendering page "/card". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot convert a Symbol value to a string
    at Symbol.toWellFormed (<anonymous>)
    at f (C:\project\vercel_chilgokupgrade\.next\server\chunks\ssr\src_app_(app)_card_1a980464._.js:2:1256)
    at g (C:\project\vercel_chilgokupgrade\.next\server\chunks\ssr\src_app_(app)_card_1a980464._.js:2:1748)
    at stringify (<anonymous>) {
  digest: '3743282235'
}
Export encountered an error on /(app)/card/page: /card, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null