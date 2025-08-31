#!/bin/bash

set -e

# 변수 설정
APP_DIR="/opt/football-club"
REPO_URL="https://github.com/pnci1029/Football_Club.git"
BUILD_DIR="/tmp/football-club-build"

echo "🔄 Fetching latest code from GitHub..."

# 기존 빌드 디렉토리 제거 및 최신 코드 클론
rm -rf "$BUILD_DIR"
git clone "$REPO_URL" "$BUILD_DIR"
cd "$BUILD_DIR"
git checkout develop

echo "🔨 Building Docker images..."

# 백엔드 이미지 빌드
cd "$BUILD_DIR/be"
docker build -t football-club-backend:latest .

# 프론트엔드 이미지 빌드 (fe 폴더가 있으면)
if [ -d "$BUILD_DIR/fe" ]; then
    cd "$BUILD_DIR/fe"
    docker build -t football-club-frontend:latest .
fi

# 작업 디렉토리 변경
cd "$APP_DIR"

# 필수 디렉토리 생성
sudo mkdir -p "$APP_DIR/logs"
sudo mkdir -p "$APP_DIR/uploads"
sudo mkdir -p "$APP_DIR/mysql-data"
sudo mkdir -p "$APP_DIR/mysql-init"
sudo chown -R $USER:$USER "$APP_DIR"

# docker-compose.yml 복사
cp "$BUILD_DIR/docker-compose.yml" "$APP_DIR/"

# 포트 정리
for port in 3000 8082; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        sudo lsof -ti:$port | xargs sudo kill -9 || true
        sleep 1
    fi
done

# 기존 컨테이너와 네트워크 완전 정리
docker compose --profile with-db down --remove-orphans 2>/dev/null || true
docker network rm football-club_football-club-network 2>/dev/null || true

# DB 먼저 시작
docker compose --profile with-db up -d db
sleep 5

# 앱 서비스들 시작
docker compose up -d backend
sleep 3
docker compose up -d frontend

docker compose --profile with-db ps

# 빌드 디렉토리 정리
rm -rf "$BUILD_DIR"

echo "✅ Deployment completed successfully!"