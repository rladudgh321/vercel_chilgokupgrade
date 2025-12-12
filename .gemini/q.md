`/landSearch`페이지에서 Searchbar컴포넌트에서 `면적`을 참고하여 `층수`도 FloorOption테이블에서 name부분과 Build테이블의 currentFloor와 해당되면 매물들이 나오도록해줘.
예를들어, SearchBar컴포넌트에서 `층수`를 1층으로 하면,
FloorOption테이블에서 name컬럼이 `1층`이고 매물리스트들의 Build테이블의 currentFloor이 `1`에 해당하는 매물들이 볼 수 있도록 해주고
SearchBar컴포넌트에서 `층수`를 `2층~5층`으로 하면 Build테이블의 currentFloor이 2,3,4,5에 해당하는 매물들이 볼 수 있도록 해주고
SearchBar컴포넌트에서 `층수`를 `6층 이상`으로 하면 Build테이블의 currentFloor이 6이상에 해당하는 매물들이 볼 수 있도록 해주고
SearchBar컴포넌트에서 `층수`를 `10층 이하`으로 하면 Build테이블의 currentFloor이 10이하에 해당하는 매물들이 볼 수 있도록 해줘

---
`next lint`는 nextjs16으로 업데이트되면서 없어졌어. 그냥 lint 작업 하지마
위의 `1층`과 `2층~5층`과 `6층 이상`과 `10층 이하`는 예시일 뿐이야.
FloorOption테이블에서 name부분이 데이터가 위의 예시처럼 될 경우에 그렇게 해달라는 거였어
만약에 FloorOption테이블에서 2층으로 할 수 있고 3층으로 할수 있고 10층으로도 할 수 있어
또한 `2층~4층`이라고도 할 수 있고 `7층 이상`이라고도 할 수 있고 `11층 이하`라고도 할 수 있어.
그것은 오로지 FloorOption테이블의 name컬럼을 보고 확인을 하는거야. 다만 약속을 하자면, `층`과 `이상`, `이하`와 `~`로 나눈 것은 약속어니까 이 기준에 대해서 작성해줘
더 자세히 예를 들면, `2층~4층` 이것은 `~`기호를 기준으로 왼쪽과 오른쪽을 나눠서 2와 3과 4가 매물이 해당되는 것을 전부 나열해달라는 의미야.
---

[FLOOR_FILTER] Received floor parameter: "1층"
[FLOOR_FILTER] Cleaned floor string: "1"
[FLOOR_FILTER] Applying filters: [ 'currentFloor.eq.1' ]
 GET /api/listings?floor=1%EC%B8%B5&limit=12 500 in 532ms (compile: 16ms, proxy.ts: 83ms, render: 433ms)

 위 대로 콘솔이 나오고 있지만 매물들이 나오지 않고 있어.