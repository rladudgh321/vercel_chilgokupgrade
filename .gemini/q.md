`/landSearch`페이지를 수정하고자해.
나는 그중에서도 모바일 반응형 경우에는 `/landSearch`페이지에서 `지도` 부분에 숫자로 되든 마커를 클릭하든 클릭이 되면 매물들이 `목록` 부분에 돌아와서 보여주길 바래

-----
 GET /landSearch 200 in 3284ms
 GET /favicon.ico?favicon.0b3bf435.ico 200 in 677ms
 GET /api/listings?page=1 200 in 618ms
 GET /api/listings/map? 200 in 743ms
 GET /api/listings?page=2 200 in 412ms
 GET /api/listings?page=3 200 in 425ms
 GET /api/listings?page=4 200 in 418ms
 GET /api/listings?page=5 200 in 413ms
 GET /api/listings?page=6 200 in 422ms
 GET /api/listings?page=7 200 in 414ms
 GET /api/listings?page=8 200 in 417ms
 GET /api/listings?page=9 200 in 421ms
 GET /api/listings?page=10 200 in 405ms

 ----
 마커 이든 숫자를 클릭하면 이렇게 get방식의 데이터를 가지고 오게 되는데, 이렇게 많은 데이터 통신을 하게 되면 비용이 클것 같아. 최우선은 마커든 지도상 숫자를 클릭했으면 매물들이 정확하게 나오는게 중요하겠지만, 많은 데이터 통신은 낭비라는 생각이 들어서 이 문제를 해결해주겠니?

 ---------
 처음 동일 위치에서 숫자를 클릭하면 동일한 문제가 발생되지만 두번째로 동일한 위치에서 숫자를 클릭하면 데이터 통신이 발생되지 않더라고. 처음에는 어쩔 수 없이 전체 데이터를 조회해야하기 때문에 위와 같이 데이터를 가지고 와야겠지?

 ------
 너의 답변을 