# Simple Dockerfile using serve (no nginx)

FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (--legacy-peer-deps 플래그 추가)
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# serve 설치
RUN npm install -g serve

# 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["serve", "-s", "build", "-l", "3000"]
