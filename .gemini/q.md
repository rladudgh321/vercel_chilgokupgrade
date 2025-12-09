bok@DESKTOP-R2LOA8R MINGW64 /c/proj/vercel_chilgokupgrade (main)
$ npm run build

> chilgok@0.1.0 build
> next build

 ⚠ Invalid next.config.ts options detected: 
 ⚠     Unrecognized key(s) in object: 'proxyClientMaxBodySize' at "experimental"
 ⚠     Unrecognized key(s) in object: 'reactCompiler'
 ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
   ▲ Next.js 15.5.6
   - Environments: .env
   - Experiments (use with caution):
     · clientTraceMetadata
     · proxyClientMaxBodySize: "50mb"

   Creating an optimized production build ...
 ✓ Compiled successfully in 111s
   Skipping validation of types
   Linting  ..
   We detected TypeScript in your project and reconfigured your tsconfig.json file for you.
   The following mandatory changes were made to your tsconfig.json:

        - jsx was set to preserve (next.js implements its own optimized jsx transform)


./src/app/(admin)/admin/inquiries/contact-requests/ContactRequestList.tsx
40:9  Warning: The 'requests' function makes the dependencies of useEffect Hook (at line 56) change on every render. To fix this, wrap the definition of 'requests' in its own useCallback() Hook.  react-hooks/exhaustive-deps

./src/app/(admin)/admin/inquiries/orders/OrderList.tsx
48:9  Warning: The 'orders' function makes the dependencies of useEffect Hook (at line 68) change on every render. To fix this, wrap the definition of 'orders' in its own useCallback() Hook.  react-hooks/exhaustive-deps

./src/app/(admin)/admin/listings/(menu)/listings/[id]/edit/EditClient.tsx
230:9  Warning: The 'allLoaded' function makes the dependencies of useEffect Hook (at line 239) change on every render. To fix this, wrap the definition of 'allLoaded' in its own useCallback() Hook.  react-hooks/exhaustive-deps

./src/app/(app)/landSearch/MapView.tsx
129:9  Warning: The 'initMap' function makes the dependencies of useEffect Hook (at line 184) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'initMap' in its own useCallback() Hook.  react-hooks/exhaustive-deps

./src/app/components/shared/_Pagination.tsx
12:9  Warning: The 'updatePageLimit' function makes the dependencies of useEffect Hook (at line 30) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'updatePageLimit' in its own useCallback() Hook.  react-hooks/exhaustive-deps

./src/app/layout/admin/Header/ManagementAPI.tsx
56:9  Warning: The 'fetchUsage' function makes the dependencies of useEffect Hook (at line 80) change on every render. To fix this, wrap the definition of 'fetchUsage' in its own useCallback() Hook.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
 ✓ Linting
   Collecting page data  ..[Error: Failed to collect configuration for /card] {
  [cause]: Error: supabaseKey is required.
      at new b5 (C:\proj\vercel_chilgokupgrade\.next\server\chunks\953.js:34:41447)
      at b6 (C:\proj\vercel_chilgokupgrade\.next\server\chunks\953.js:34:45420)
      at 65525 (C:\proj\vercel_chilgokupgrade\.next\server\chunks\2394.js:1:3142)
      at c (C:\proj\vercel_chilgokupgrade\.next\server\webpack-runtime.js:1:526)
      at 61691 (C:\proj\vercel_chilgokupgrade\.next\server\app\(app)\card\page.js:2:8384)
      at Function.c (C:\proj\vercel_chilgokupgrade\.next\server\webpack-runtime.js:1:526)
}

> Build error occurred
[Error: Failed to collect page data for /card] { type: 'Error' }