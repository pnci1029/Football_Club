FROM openjdk:17-jdk-slim

WORKDIR /app

# build/libs 밑에 있는 jar 복사
COPY build/libs/BE-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
