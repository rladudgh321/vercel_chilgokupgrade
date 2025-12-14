`/landSearch`페이지와 `/card`페이지에서 공통으로 사용하는 SearchBar컴포넌트에서 select를 선택하면 option에 소괄호 안에 매물갯수가 정상적으로 잘 나오는데, option을 클릭하면 그 option에 소괄호와 그 안에 매물갯수가 나오고 있어. 나는 option을 클릭하면 소괄호와 매물갯수가 없게 해줘
---
Runtime ReferenceError


setPricePresets is not defined
src\app\(app)\landSearch\page.tsx (5:5) @ Page


  3 | export default async function Page() {
  4 |   return (
> 5 |     <LandSearchClient />
    |     ^
  6 |   );
  7 | }
Call Stack
52

Hide 49 ignore-listed frame(s)
SearchBar.useEffect
file:///C:/project/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (197:17)
Object.react_stack_bottom_frame
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (28101:20)
runWithFiberInDEV
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (984:30)
commitHookEffectListMount
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (13690:29)
commitHookPassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (13777:11)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17122:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17175:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17175:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17114:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17114:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17175:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17175:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17114:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17175:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17114:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
reconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17114:11)
recursivelyTraverseReconnectPassiveEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17074:9)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16946:19)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16896:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16751:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17008:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17008:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16723:11)
recursivelyTraversePassiveMountEffects
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:13)
commitPassiveMountOnFiber
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17008:11)
LandSearchClient
file:///C:/project/vercel_chilgokupgrade/.next/dev/static/chunks/src_app_6e8bdd91._.js (4156:225)
Page
src\app\(app)\landSearch\page.tsx (5:5)