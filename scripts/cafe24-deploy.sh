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

# Docker 이미지 로드
if [ -f "football-club-backend.tar.gz" ]; then
    gunzip -c football-club-backend.tar.gz | docker load
fi

if [ -f "football-club-frontend.tar.gz" ]; then
    gunzip -c football-club-frontend.tar.gz | docker load
fi

# 포트 정리
for port in 3000 8082; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        sudo lsof -ti:$port | xargs sudo kill -9 || true
        sleep 1
    fi
done

# DB 상태 확인 및 필요시 시작
if ! docker ps --format "table {{.Names}}" | grep -q "^db$"; then
    docker compose --profile with-db up -d db
    sleep 5
fi

# 네트워크 정리
docker network rm football-club_football-club-network 2>/dev/null || true

# 기존 앱 컨테이너 정리 후 시작
docker stop frontend backend 2>/dev/null || true
docker rm frontend backend 2>/dev/null || true

docker compose up -d backend
sleep 3
docker compose up -d frontend

docker compose --profile with-db ps