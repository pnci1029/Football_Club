#!/bin/bash

set -e

# 변수 설정
APP_DIR="/opt/football-club"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 현재 디렉토리를 프로젝트 루트로 변경
cd "$PROJECT_DIR"

# 필수 디렉토리 생성
sudo mkdir -p "$APP_DIR/logs"
sudo mkdir -p "$APP_DIR/uploads"
sudo mkdir -p "$APP_DIR/mysql-data"
sudo mkdir -p "$APP_DIR/mysql-init"
sudo chown -R $USER:$USER "$APP_DIR"

# Docker 이미지 빌드 및 로드
echo "🔨 Building backend image..."
cd be
docker build -t football-club-backend:latest .
cd ..

echo "🔨 Building frontend image..."
cd fe
docker build -t football-club-frontend:latest .
cd ..

# 기존 tar.gz 파일이 있으면 로드 (fallback)
if [ -f "football-club-backend.tar.gz" ] && ! docker images | grep -q football-club-backend; then
    gunzip -c football-club-backend.tar.gz | docker load
fi

if [ -f "football-club-frontend.tar.gz" ] && ! docker images | grep -q football-club-frontend; then
    gunzip -c football-club-frontend.tar.gz | docker load
fi

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