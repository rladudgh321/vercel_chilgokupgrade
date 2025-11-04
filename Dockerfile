# 베이스 이미지로 node:22.14 사용
FROM node:22.14 AS build

# 작업 디렉터리 설정
WORKDIR /app

# 의존성 파일을 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install --production

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# Production 환경용 실행 이미지
FROM node:22.14 AS production

# 작업 디렉터리 설정
WORKDIR /app

# 빌드된 파일을 복사
COPY --from=build /app ./

# 환경 변수 설정 (필요에 따라 수정)
ENV NODE_ENV=production

# 포트 노출
EXPOSE 3000

# Next.js 실행
CMD ["npm", "start"]
