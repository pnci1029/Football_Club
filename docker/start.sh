#!/bin/sh

echo "🚀 Starting Football Club Application..."

# Nginx 시작 (백그라운드)
echo "🌐 Starting Nginx..."
nginx -g "daemon off;" &

# 백엔드 애플리케이션 시작
echo "☕ Starting Spring Boot Application..."
exec java -jar -Dspring.profiles.active=prod /app/app.jar