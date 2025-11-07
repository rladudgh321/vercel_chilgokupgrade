Console Error


`value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.

src/app/(admin)/admin/listings/(menu)/listings/shared/BuildBasic.tsx (370:15) @ BuildBasic


  368 |             ))}
  369 |             <label className="cursor-pointer">
> 370 |               <input
      |               ^
  371 |                 type="radio"
  372 |                 {...register("roomOptionId")}
  373 |                 value={null}
Call Stack
21

Hide 16 ignore-listed frame(s)
createConsoleError
node_modules/next/src/next-devtools/shared/console-error.ts (16:35)
handleConsoleError
node_modules/next/src/next-devtools/userspace/app/errors/use-error-handler.ts (35:31)
console.error
node_modules/next/src/next-devtools/userspace/app/errors/intercept-console-error.ts (33:27)
validatePropertiesInDevelopment
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (17712:21)
setInitialProperties
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (18345:7)
completeWork
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (11743:18)
runWithFiberInDEV
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (871:30)
completeUnitOfWork
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (15862:19)
performUnitOfWork
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (15743:11)
workLoopSync
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (15546:41)
renderRootSync
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (15526:11)
performWorkOnRoot
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (14990:13)
performSyncWorkOnRoot
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16830:7)
flushSyncWorkAcrossRoots_impl
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16676:21)
processRootScheduleInMicrotask
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16714:9)
<unknown>
node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js (16849:13)
input
<anonymous>
BuildBasic
src/app/(admin)/admin/listings/(menu)/listings/shared/BuildBasic.tsx (370:15)
BuildForm
src/app/(admin)/admin/listings/(menu)/listings/shared/BuildForm.tsx (251:11)
EditClient
src/app/(admin)/admin/listings/(menu)/listings/[id]/edit/EditClient.tsx (367:5)
Page
src\app\(admin)\admin\listings\(menu)\listings\[id]\edit\page.tsx (15:10)