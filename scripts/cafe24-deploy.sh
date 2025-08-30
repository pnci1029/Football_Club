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

# 기존 컨테이너 정지
if docker ps -q --filter "name=football-club" | grep -q .; then
    echo "💾 Creating backup of existing containers..."
    docker-compose down || true
    sleep 2
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

# Docker Compose로 서비스 시작
echo "🚀 Starting services with Docker Compose..."
docker-compose up -d

# 컨테이너 상태 확인
echo "📊 Checking container status..."
sleep 10
docker-compose ps

# 헬스체크
echo "🏥 Running health check..."
for i in {1..30}; do
    if curl -f http://localhost:8082/api/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed!"
        echo "📋 Backend logs:"
        docker logs football-club-app
        exit 1
    fi
    echo "⏳ Waiting for backend to be ready... ($i/30)"
    sleep 2
done

# Frontend 헬스체크
for i in {1..15}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend health check passed!"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Frontend health check failed!"
        echo "📋 Frontend logs:"
        docker logs football-club-app
    fi
    echo "⏳ Waiting for frontend to be ready... ($i/15)"
    sleep 2
done

# 로그 확인
echo "📋 Recent logs:"
docker-compose logs --tail=20

# 정리: 오래된 이미지 제거
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment completed successfully!"
echo "📊 Container status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"