FROM amazoncorretto:17-alpine

WORKDIR /app

# JVM 힙 메모리 설정을 위한 환경변수
ENV GRADLE_OPTS="-Xmx2g -Xms1g -XX:MaxMetaspaceSize=1g"

# Gradle 캐시 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/.gradle && chmod 755 /app/.gradle

# 의존성 캐싱을 위해 gradle 관련 파일들 먼저 복사
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew

# Gradle wrapper 다운로드를 위한 네트워크 타임아웃 설정
# 의존성 다운로드 (병렬 처리, 타임아웃 설정)
RUN ./gradlew dependencies --no-daemon --warning-mode=none --parallel \
    --gradle-user-home=/app/.gradle \
    -Dorg.gradle.internal.http.connectionTimeout=120000 \
    -Dorg.gradle.internal.http.socketTimeout=120000

# 소스 코드 복사 및 빌드 (병렬 처리, 타임아웃 설정)
COPY src/ src/
RUN ./gradlew clean build -x test --no-daemon --warning-mode=none --parallel \
    --gradle-user-home=/app/.gradle \
    -Dorg.gradle.internal.http.connectionTimeout=120000 \
    -Dorg.gradle.internal.http.socketTimeout=120000 \
    --max-workers=4

# JAR 파일을 app.jar로 복사 (plain jar 제외)
RUN find build/libs -name "*.jar" -not -name "*-plain.jar" -exec cp {} app.jar \;

# 포트 노출
EXPOSE 8082

# 실행
CMD ["java", "-jar", "app.jar"]
