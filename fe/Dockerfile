FROM node:20-alpine AS build

WORKDIR /app

# package.json과 yarn.lock 먼저 복사 (캐싱 최적화)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 소스 코드 복사 및 빌드
COPY . ./
RUN CI=false yarn build

# Nginx를 사용한 프로덕션 서빙
FROM nginx:alpine

# 빌드된 파일을 nginx 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]