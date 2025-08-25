# 멀티스테이지 빌드
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY fe/package.json fe/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY fe/ ./
RUN CI=false yarn build

# Backend 빌드
FROM openjdk:17-jdk-alpine AS backend-build

WORKDIR /app/backend
COPY be/gradle/ gradle/
COPY be/gradlew be/build.gradle.kts be/settings.gradle.kts ./
RUN chmod +x ./gradlew

# 의존성 캐싱을 위해 먼저 다운로드
RUN ./gradlew dependencies --no-daemon

COPY be/src/ src/
RUN ./gradlew clean build -x test --no-daemon

# 최종 실행 이미지
FROM openjdk:17-jdk-alpine

# 필요한 패키지 설치
RUN apk add --no-cache nginx curl

# 앱 디렉토리 생성
WORKDIR /app

# Backend JAR 파일 복사
COPY --from=backend-build /app/backend/build/libs/*.jar app.jar

# Frontend 빌드 결과물 복사
COPY --from=frontend-build /app/frontend/build /var/www/html

# Nginx 설정
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 스크립트 복사
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 포트 노출
EXPOSE 80 8082


# 실행
CMD ["/app/start.sh"]