`src/lib/data.ts` 파일의 getMapListings함수에 대해서 `/api/listings/map/route.ts`파일에 옮겼으면 좋겠어.
나는 src/lib/data.ts파일을 지우려고해.
그리고 `src/lib/data.ts`파일의 캐시된 데이터가 필요 한게 아니야. 왜냐하면 그 api를 사용하고 있는 fetch에서 따로 cache:'force-cache'를 할 것이기 때문에 `/api/listings/map/route.ts`파일에 또 캐시를 적용할 필요는 없어