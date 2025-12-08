`/landSearch`페이지와 `/card`페이지에서 빌드할 때 static랜더링으로 되어서 ISR로 하길 원해. 나는 revalidate를 시간이 아닌 tag로 public으로 하길 원하는데, 잘 작동되도록 해줘.
---
Error occurred prerendering page "/card". Read more: https://nextjs.org/docs/messages/prerender-error
Error: Failed to fetch https://vercelchilgokupgrade-mtwbojpqq-rladudgh321s-projects.vercel.app/api/floor-options
    at e (.next/server/chunks/ssr/src_app_(app)_card_1a980464._.js:2:1229)
    at async g (.next/server/chunks/ssr/src_app_(app)_card_1a980464._.js:2:1683) {
  digest: '2642196556'
}
Export encountered an error on /(app)/card/page: /card, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1
---
로컬에서는 npm run build가 잘 작동되는데 vercel에서는 배포가 위와 같은 오류가 생기네