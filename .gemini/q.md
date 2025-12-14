`/admin/webView/logo-settings`페이지에서 `현재 로고` 위 부분에 input의 radio 3개를 만들어서, `/src/app/layout/app/Footer/index.tsx`파일에 input에 대한 상태에 따라 변하게 하고 싶어.
첫번째 input은 `로고 + 브랜드명`이며, `/src/app/layout/app/Footer/index.tsx` 파일에 선택시 `headerData.data.companyName`가 없게 하고 싶고
두번째 input은 `로고`이며, `/src/app/layout/app/Footer/index.tsx` 파일에 선택시 `headerData.data.companyName`와 `{headerData.data.logoUrl && <Image 
              src={String(headerData.data.logoUrl)} 
              alt="logo" 
              width={120} 
              height={60}
              className="w-auto h-auto" 
            />}`가 나란히 옆에 있게 되도록 하고 싶어. 왼쪽과 오른쪽 이렇게 나란히 말이지
세번째 input은 `브랜드명`을 선택시 `/src/app/layout/app/Footer/index.tsx` 파일에 선택시 `headerData.data.companyName`가 없게 하고 싶어

---
나는 prisma 스키마를 변경없이 코드를 수정하고 싶어 이미 기존에 있는 코드를 활용해줘

---
좋아 올바르게 수정되었고 내가 원하는대로 코드가 수정되었어. 하지만 schema.prisma가 수정되었는데 npx prisma migrate dev를 하라고 너가 지시했는데 내가 취소했어. 나는 너가 수정해준 schema.prisma로 npx prisma migrate dev를 하기 싫어 차후에 npx prisma migrate dev가 필요할시 데이터 구조가 바뀔까봐 걱정돼.
