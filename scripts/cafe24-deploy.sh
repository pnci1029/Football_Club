#!/bin/bash

set -e

# 변수 설정
APP_DIR="/opt/football-club"
REPO_URL="https://github.com/pnci1029/Football_Club.git"
BUILD_DIR="/tmp/football-club-build"

# 사용법 출력
usage() {
    echo "Usage: $0 [all|backend|frontend|db]"
    echo "  all      - Deploy all services (default)"
    echo "  backend  - Deploy backend only"
    echo "  frontend - Deploy frontend only"
    echo "  db       - Setup database only"
    exit 1
}

# DB 설정 함수
setup_database() {
    echo "🗄️ Setting up database..."
    
    # 필수 디렉토리 생성
    mkdir -p "$APP_DIR/mysql-data"
    mkdir -p "$APP_DIR/mysql-init"
    
    # DB가 실행 중인지 확인
    if docker compose --profile with-db ps -q db | grep -q .; then
        echo "📊 Database is already running"
    else
        echo "📊 Starting database..."
        docker compose --profile with-db up -d db
        sleep 5
    fi
}

# 백엔드 배포 함수
deploy_backend() {
    echo "🔄 Fetching latest code for backend..."
    
    rm -rf "$BUILD_DIR"
    git clone "$REPO_URL" "$BUILD_DIR"
    cd "$BUILD_DIR"
    git checkout main
    
    echo "🔨 Building backend Docker image..."
    cd "$BUILD_DIR/be"
    
    # application-prod.yml이 존재하는지 확인하고 없으면 환경변수에서 생성
    if [ ! -f "src/main/resources/application-prod.yml" ] && [ -n "$APPLICATION_PROD_YML" ]; then
        echo "Creating application-prod.yml from environment variable..."
        echo "$APPLICATION_PROD_YML" > src/main/resources/application-prod.yml
    fi
    
    docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t football-club-backend:latest .
    
    cd "$APP_DIR"
    cp "$BUILD_DIR/docker-compose.yml" "$APP_DIR/"
    
    # 백엔드 포트 정리
    if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:8082 | xargs kill -9 || true
        sleep 1
    fi
    
    # 백엔드 컨테이너만 재시작
    docker compose stop backend 2>/dev/null || true
    docker compose rm -f backend 2>/dev/null || true
    docker compose up -d backend
    
    rm -rf "$BUILD_DIR"
    echo "✅ Backend deployment completed!"
}

# 프론트엔드 배포 함수
deploy_frontend() {
    echo "🔄 Fetching latest code for frontend..."
    
    rm -rf "$BUILD_DIR"
    git clone "$REPO_URL" "$BUILD_DIR"
    cd "$BUILD_DIR"
    git checkout main
    
    if [ -d "$BUILD_DIR/fe" ]; then
        echo "🔨 Building frontend Docker image..."
        cd "$BUILD_DIR/fe"
        docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t football-club-frontend:latest .
    else
        echo "❌ Frontend directory not found!"
        exit 1
    fi
    
    cd "$APP_DIR"
    cp "$BUILD_DIR/docker-compose.yml" "$APP_DIR/"
    
    # 프론트엔드 포트 정리
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:3000 | xargs kill -9 || true
        sleep 1
    fi
    
    # 프론트엔드 컨테이너만 재시작
    docker compose stop frontend 2>/dev/null || true
    docker compose rm -f frontend 2>/dev/null || true
    docker compose up -d frontend
    
    rm -rf "$BUILD_DIR"
    echo "✅ Frontend deployment completed!"
}

# 전체 배포 함수
deploy_all() {
    echo "🔄 Fetching latest code from GitHub..."
    
    rm -rf "$BUILD_DIR"
    git clone "$REPO_URL" "$BUILD_DIR"
    cd "$BUILD_DIR"
    git checkout main
    
    echo "🔨 Building Docker images with cache..."
    
    # 백엔드 이미지 빌드
    cd "$BUILD_DIR/be"
    
    # application-prod.yml이 존재하는지 확인하고 없으면 환경변수에서 생성
    if [ ! -f "src/main/resources/application-prod.yml" ] && [ -n "$APPLICATION_PROD_YML" ]; then
        echo "Creating application-prod.yml from environment variable..."
        echo "$APPLICATION_PROD_YML" > src/main/resources/application-prod.yml
    fi
    
    docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t football-club-backend:latest . &
    
    # 프론트엔드 이미지 빌드
    if [ -d "$BUILD_DIR/fe" ]; then
        cd "$BUILD_DIR/fe"
        docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t football-club-frontend:latest . &
    fi
    
    wait
    
    cd "$APP_DIR"
    
    # 필수 디렉토리 생성
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    
    cp "$BUILD_DIR/docker-compose.yml" "$APP_DIR/"
    
    # 포트 정리
    for port in 3000 8082; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            lsof -ti:$port | xargs kill -9 || true
            sleep 1
        fi
    done
    
    # 기존 컨테이너 정리
    docker compose --profile with-db down --remove-orphans 2>/dev/null || true
    docker network rm football-club_football-club-network 2>/dev/null || true
    
    # 서비스들 시작
    docker compose up -d backend
    sleep 3
    docker compose up -d frontend
    
    docker compose --profile with-db ps
    
    rm -rf "$BUILD_DIR"
    echo "✅ All services deployment completed!"
}

# 메인 로직
DEPLOY_TARGET="${1:-all}"

echo "🚀 Starting Football Club deployment..."

case "$DEPLOY_TARGET" in
    "db")
        setup_database
        ;;
    "backend")
        setup_database
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all")
        setup_database
        deploy_all
        ;;
    *)
        usage
        ;;
esac
