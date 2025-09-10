# Frontend 빌드
FROM node:20-alpine AS frontend-deps
WORKDIR /app/frontend
COPY fe/package.json fe/yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY fe/ ./
RUN CI=false yarn build

# Backend 의존성 캐싱
FROM eclipse-temurin:17-jdk-alpine AS backend-deps
WORKDIR /app/backend
RUN apk add --no-cache curl && \
    mkdir -p /root/.gradle/caches && \
    chmod 755 /root/.gradle
COPY be/gradle/ gradle/
COPY be/gradlew be/build.gradle.kts be/settings.gradle.kts ./
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon --console=plain \
    --build-cache \
    --parallel \
    --max-workers=4

# Backend 빌드
FROM backend-deps AS backend-build
COPY be/src/ src/
RUN ./gradlew clean build -x test --no-daemon --console=plain \
    --build-cache \
    --parallel \
    --max-workers=4

# 최종 실행 이미지
FROM eclipse-temurin:17-jre-alpine

# 필요한 패키지를 별도 레이어로 설치 (캐싱 최적화)
RUN apk add --no-cache nginx curl && \
    addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

# 앱 디렉토리 생성
WORKDIR /app

# 설정 파일들을 먼저 복사 (변경 빈도가 낮음)
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Frontend 빌드 결과물 복사 (변경 빈도 보통)
COPY --from=frontend-build /app/frontend/build /var/www/html

# Backend JAR 파일 복사 (변경 빈도 높음 - 마지막에)
COPY --from=backend-build /app/backend/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 80 8082

# 실행
CMD ["/app/start.sh"]