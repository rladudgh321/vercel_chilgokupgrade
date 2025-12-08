# 주요 목적
1. 상업용으로 팔 것
2. 기술적 요소를 추가로 공부하지 말것
3. 부동산 앱을 만들어서 비즈니스가 필요한 사람에게 판매를 저렴하게 팔 것

# 큰계획

1. app 그룹에는 static 렌더링 ISR로 tag로는 admin의 수정사항 있을시 작업

2. admin 그룹에는 웬만하면 SSR로 작업



## 개선사항 및 작업사항

1. utility에 Crop.tsx를 리팩토링할 필요가 있음
리팩토링할때 서버와 상호작용하면서 해야함

2. reacthookform에서 FormProvider를 chihdlren으로 감싸서 가능할지? 최적화 기대

## 주의사항
1. CreateClient에 수많은 속성을 저장해두었는데
select Element에는 기본값설정을 컴포넌트 인자로 설정해두었다
만일 select값을 바꿀 일이 있으면 기본값 설정 확인을 잊지말 것

2. KST기준으로 DB가 저장됨. 만일 다른나라를 만들경우 UTC 기준으로 만들어서 배포할것

3. utils폴더에 metadata.ts파일에 있는 부분을 수정해야한다.

## sentry & slack
npx @sentry/wizard@latest -i nextjs --saas --org chilgok --project javascript-nextjs
npm i @slack/webhook

## 사용자 일러주기
1. 매물관리/옵션등록 사항에 순서 바꾸는 것 교육시키기 꽤 어려울 수 있음

### 기술스택
1. node v22.14.0

### 제마나이 계정변경
rm -f ~/.gemini/settings.json

const DatePicker = React.lazy(() => import('react-datepicker'));

<Suspense>
  <DatePicker />
</Suspense>
##api/inquiries/orders/route.ts에서는 post 요청이 prisma 방식으로 api작성됨 rls할때 참고.

------
데이터가 안흐른다고 생각할 때는 양쪽의 데이터를 설명한다
예를들면 클라이언트의 데이터console.log와 백엔드의 데이터 console.log를 확인해본다

----------------------
### 마지막 확인해야할 작업
1. `/landSearch`, `/card`페이지의 `최신순, 인기순, 금액순, 면적순`에 대한 카테고리 api작업을 해야한다
2. SnsIcon 컴포넌트에서 Image 로고 src 기본값을 변경해야할 것

3. 전용면적을 추가할 것
---------
나는 nextjs15 app router를 사용하고 있고 `/api`를 사용하여 route handler를 사용하고 있어 api 폴더 아래에 모든 route.ts에 대해 test코드를 작성해줘 jest로 해줘
--------
아직 route.ts에 대한 test코드가 없는 경우 찾아서 test코드를 작성해줘

-----------
RLS

C    (auth.uid() = 'f312fbfc-cf58-405e-86ef-e9047966fa52'::uuid)
R
U     (auth.uid() = 'f312fbfc-cf58-405e-86ef-e9047966fa52'::uuid)
D    (auth.uid() = 'f312fbfc-cf58-405e-86ef-e9047966fa52'::uuid)


-------
부동산 중개인 홈페이지의 본질 - 나의 매물들을 계약시키기
노출도 중요하지만, 다양한 관점의 업그레이드 필요
1. 모바일중심 - 전화플로팅버튼, 빠른 문의폼

내가 부동산 중개인이고 매물들을 보여주는데 나의 문제해결 계약성사
사람들 보기만하고 계약까지 가기가 힘듦

원하는 매물들을 미리 보고 시작할 수 있다면

어부바 신협 - 평생 너를 업어줄게
부동산 중개업 - `우린 매물을 팔지 않는다. 방향을 제시한다`
어떤 방향을 제시? > 고객의 삶, 상황, 목표에 맞는 ‘결정의 기준’을 제시
집이 필요한 사람이라면 집에 어떤 집인지
투자가 필요한 사람이라면 어떤 투자의 매물이 좋은지

“저는 집을 ‘파는 사람’이 아니라, 고객이 어떤 선택을 해야 후회하지 않을지 ‘방향’을 함께 고민하는 사람입니다.
돈의 방향, 삶의 방향, 그리고 마음의 방향까지요.”

“제가 제시하는 방향은 고객의 상황에 맞는 ‘현명한 선택의 기준’이에요.
누군가에겐 실거주가 우선이고, 누군가에겐 투자 수익이 중요하죠.
저는 그분의 인생 방향과 재정 상황을 함께 보고,
**‘지금은 사야 할 때인지, 기다려야 할 때인지’**부터 이야기합니다.
매물을 권하기 전에, ‘어떤 결정이 옳은가’를 먼저 제시하죠.”

“방향이 없으면 어떤 집도 정답이 아닙니다.
우리는 고객이 삶의 중심을 지킬 수 있는 방향을 함께 찾습니다.”

“우린 단순히 집을 보여주지 않습니다.
고객의 인생 단계, 재정 여건, 그리고 꿈을 함께 듣고,
그에 맞는 방향을 제시합니다.
매물보다 중요한 건, 고객의 ‘다음 발걸음’이니까요.”


-----------
아래 사항을 복붙하여 supabase Editor에 넣기
이것은 초기데이터 삽입에 좋다
---****------
-- ===========================================
-- 1️⃣ Build 테이블 RLS 비활성화 및 기존 정책 제거
-- ===========================================

-- RLS 완전히 비활성화
ALTER TABLE public."Build" DISABLE ROW LEVEL SECURITY;

-- Build 테이블에 설정된 모든 RLS 정책 조회
SELECT policyname
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'Build';

-- 예시: 기존 정책 삭제
-- DROP POLICY IF EXISTS policy_email_check ON public."Build";

-- ===========================================
-- 2️⃣ 스키마 접근 권한
-- ===========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 필요 시 테이블 생성 권한 (로그인 사용자)
GRANT CREATE ON SCHEMA public TO authenticated;

-- ===========================================
-- 3️⃣ Build 테이블 및 모든 테이블 권한 설정
-- ===========================================

-- 로그인한 사용자(authenticated) → 모든 권한
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 로그인하지 않은 사용자(anon) → 읽기 + 쓰기만
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO anon;

-- ===========================================
-- 4️⃣ 앞으로 생성되는 테이블 기본 권한
-- ===========================================

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT ON TABLES TO anon;

-- ===========================================
-- 5️⃣ 권한 확인 (선택)
-- ===========================================

-- 스키마 접근 권한 확인
SELECT nspname, rolname,
       has_schema_privilege(rolname, nspname, 'USAGE') AS usage
FROM pg_namespace
CROSS JOIN pg_roles
WHERE nspname = 'public';

-- 테이블 권한 확인
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY grantee, table_name;

---***----