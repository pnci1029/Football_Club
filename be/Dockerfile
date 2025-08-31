FROM amazoncorretto:17-alpine

WORKDIR /app

# 의존성 캐싱을 위해 gradle 관련 파일들 먼저 복사
COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew

# 의존성 다운로드
RUN ./gradlew dependencies --no-daemon --warning-mode=none

# 소스 코드 복사 및 빌드
COPY src/ src/
RUN ./gradlew clean build -x test --no-daemon --warning-mode=none

# JAR 파일을 app.jar로 복사 (plain jar 제외)
RUN find build/libs -name "*.jar" -not -name "*-plain.jar" -exec cp {} app.jar \;

# 포트 노출
EXPOSE 8082

# 실행
CMD ["java", "-jar", "app.jar"]
