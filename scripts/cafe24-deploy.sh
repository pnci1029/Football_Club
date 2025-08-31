#!/bin/bash

set -e

echo "🍰 Starting deployment to Cafe24 server..."

# 변수 설정
APP_DIR="/opt/football-club"
BACKUP_DIR="/opt/football-club/backups/$(date +%Y%m%d_%H%M%S)"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/uploads"
mkdir -p "$APP_DIR/mysql-data"
mkdir -p "$APP_DIR/mysql-init"

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 기존 서비스 정리
echo "⏹️ Cleaning up existing services..."

# 기존 앱 컨테이너만 정지 (MySQL 제외)
echo "💾 Stopping existing app containers..."
if docker ps -q -f name=frontend | grep -q .; then
    docker stop frontend
    docker rm frontend
fi
if docker ps -q -f name=backend | grep -q .; then
    docker stop backend  
    docker rm backend
fi

# MySQL 컨테이너가 없으면 시작
if ! docker ps -q -f name=db | grep -q .; then
    echo "🗄️ Starting MySQL container..."
    docker compose --profile with-db up -d db
    sleep 5
fi

# 포트 사용 중인 프로세스 정리
echo "🔍 Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port 3000 is in use, killing processes..."
    lsof -ti:3000 | xargs kill -9 || true
    sleep 2
fi

if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port 8082 is in use, killing processes..."
    lsof -ti:8082 | xargs kill -9 || true
    sleep 2
fi

# Docker 이미지 로드
echo "📥 Loading Docker images..."
if [ -f "football-club-backend.tar.gz" ]; then
    gunzip -c football-club-backend.tar.gz | docker load
    echo "✅ Backend image loaded successfully"
else
    echo "❌ Backend image file not found!"
    exit 1
fi

if [ -f "football-club-frontend.tar.gz" ]; then
    gunzip -c football-club-frontend.tar.gz | docker load
    echo "✅ Frontend image loaded successfully"
else
    echo "❌ Frontend image file not found!"
    exit 1
fi

# 앱 컨테이너만 시작
echo "🚀 Starting app containers..."
docker compose up -d frontend backend

# nginx 설정 리로드
echo "🔄 Reloading nginx configuration..."
if systemctl is-active --quiet nginx; then
    nginx -t && systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "⚠️ Nginx is not running, skipping reload"
fi

# 컨테이너 상태 확인
echo "📊 Checking container status..."
sleep 10
docker compose --profile with-db ps

# 서비스 시작 후 잠시 대기
echo "⏳ Waiting for services to initialize..."
sleep 10

# 로그 확인
echo "📋 Recent logs:"
docker compose --profile with-db logs --tail=20

# 정리: 오래된 이미지 제거
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"
echo "📊 Container status: docker compose --profile with-db ps"
echo "📋 View logs: docker compose --profile with-db logs -f"