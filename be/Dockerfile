# 멀티스테이지 빌드로 캐시 최적화
FROM amazoncorretto:17-alpine AS dependencies

WORKDIR /app

# JVM 힙 메모리 설정 최적화
ENV GRADLE_OPTS="-Xmx3g -Xms2g -XX:MaxMetaspaceSize=1g -XX:+UseG1GC -XX:+UseStringDeduplication"

# 필수 패키지 설치 및 캐시
RUN apk add --no-cache curl && \
    mkdir -p /app/.gradle && \
    chmod 755 /app/.gradle

# Gradle 래퍼와 설정 파일 복사 (캐시 레이어)
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew

# 의존성만 다운로드 (최대 캐시 활용)
RUN ./gradlew dependencies --no-daemon --warning-mode=none --parallel \
    --gradle-user-home=/app/.gradle \
    --build-cache \
    --configuration-cache \
    -Dorg.gradle.internal.http.connectionTimeout=60000 \
    -Dorg.gradle.internal.http.socketTimeout=60000 \
    --max-workers=$(nproc)

# 빌드 스테이지
FROM dependencies AS builder

# 소스 코드 복사
COPY src/ src/

# 빌드 실행 (캐시된 의존성 활용)
RUN ./gradlew build -x test --no-daemon --warning-mode=none --parallel \
    --gradle-user-home=/app/.gradle \
    --build-cache \
    --configuration-cache \
    -Dorg.gradle.internal.http.connectionTimeout=60000 \
    -Dorg.gradle.internal.http.socketTimeout=60000 \
    --max-workers=$(nproc) \
    -Dkotlin.compiler.execution.strategy=in-process

# 런타임 스테이지 (최소 이미지)
FROM amazoncorretto:17-alpine AS runtime

WORKDIR /app

# 런타임 최적화 설정
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"

# 빌드된 JAR만 복사
COPY --from=builder /app/build/libs/*[!plain].jar app.jar

# 포트 노출
EXPOSE 8082

# 실행 (JVM 옵션 최적화)
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
