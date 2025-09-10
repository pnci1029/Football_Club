# 의존성 캐싱 스테이지
FROM amazoncorretto:17-alpine AS deps

WORKDIR /app

# Gradle 래퍼와 설정 파일 복사
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew

# 의존성만 다운로드 (캐시 레이어)
RUN ./gradlew dependencies --no-daemon

# Backend 빌드 스테이지
FROM deps AS builder

# 소스 코드 복사 및 빌드
COPY src/ src/
RUN ./gradlew build -x test --no-daemon

# 런타임 이미지
FROM amazoncorretto:17-alpine

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8082

# 실행
CMD ["java", "-jar", "app.jar"]
