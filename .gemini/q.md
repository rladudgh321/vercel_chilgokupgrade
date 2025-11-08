Runtime Error
Server


Failed to fetch data

src\app\(app)\orders\page.tsx (13:15) @ getOrderData


  11 |     if (!res.ok) {
  12 |         // This will activate the closest `error.js` Error Boundary
> 13 |         throw new Error('Failed to fetch data');
     |               ^
  14 |     }
  15 |
  16 |     return res.json();
Call Stack
7

Hide 5 ignore-listed frame(s)
getOrderData
src\app\(app)\orders\page.tsx (13:15)
OrdersPage
src\app\(app)\orders\page.tsx (20:39)
resolveErrorDev
node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js (2326:46)
processFullStringRow
node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js (2812:23)
processFullBinaryRow
node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js (2755:7)
processBinaryChunk
node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js (2958:15)
progress
node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js (3222:13)

----
page.tsx:13  Server  Failed to fetch order data: 
{message: 'Error fetching data', error: {…}}
error
: 
{code: 'PGRST205', details: null, hint: "Perhaps you meant the table 'public.BuyType'", message: "Could not find the table 'public.property_types' in the schema cache"}
message
: 
"Error fetching data"
[[Prototype]]
: 
Object