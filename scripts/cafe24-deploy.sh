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
    
    local BACKEND_BUILD_DIR="/tmp/football-club-backend-$(date +%s)"
    rm -rf "$BACKEND_BUILD_DIR"
    
    # SSH keep-alive 설정으로 연결 유지
    export GIT_SSH_COMMAND="ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=10 -o ConnectTimeout=30"
    
    echo "⏳ Cloning repository (this may take a few minutes)..."
    timeout 300 git clone --depth 1 "$REPO_URL" "$BACKEND_BUILD_DIR" || {
        echo "❌ Git clone failed or timed out after 5 minutes"
        exit 1
    }
    cd "$BACKEND_BUILD_DIR"
    
    echo "🔨 Building backend Docker image..."
    cd "$BACKEND_BUILD_DIR/be"
    
    # application-prod.yml이 존재하는지 확인하고 없으면 환경변수에서 생성
    if [ ! -f "src/main/resources/application-prod.yml" ] && [ -n "$APPLICATION_PROD_YML" ]; then
        echo "Creating application-prod.yml from environment variable..."
        echo "$APPLICATION_PROD_YML" > src/main/resources/application-prod.yml
    fi
    
    echo "⏳ Building Docker image (this may take 5-10 minutes)..."
    docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
      --progress=plain \
      --network=host \
      -t football-club-backend:latest . &
    
    BUILD_PID=$!
    while kill -0 $BUILD_PID 2>/dev/null; do
        echo "📦 Still building... $(date +'%H:%M:%S')"
        sleep 30
    done
    wait $BUILD_PID
    
    if [ $? -ne 0 ]; then
        echo "❌ Docker build failed!"
        exit 1
    fi
    echo "✅ Docker image built successfully!"
    
    cd "$APP_DIR"
    cp "$BACKEND_BUILD_DIR/docker-compose.yml" "$APP_DIR/"
    
    # 필수 디렉토리 생성
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/images"
    
    # 네트워크 생성
    echo "📡 Creating backend network..."
    docker network create backend-network 2>/dev/null || echo "Backend network already exists"
    
    # 백엔드 포트 정리
    if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:8082 | xargs kill -9 || true
        sleep 1
    fi
    
    # 백엔드 컨테이너만 재시작
    docker compose stop backend 2>/dev/null || true
    docker compose rm -f backend 2>/dev/null || true
    docker compose up -d backend
    
    rm -rf "$BACKEND_BUILD_DIR"
    echo "✅ Backend deployment completed!"
}

# 프론트엔드 배포 함수
deploy_frontend() {
    echo "🔄 Fetching latest code for frontend..."
    
    # SSH keep-alive 설정으로 연결 유지
    export GIT_SSH_COMMAND="ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=10 -o ConnectTimeout=30"
    
    local FRONTEND_BUILD_DIR="/tmp/football-club-frontend-$(date +%s)"
    rm -rf "$FRONTEND_BUILD_DIR"
    
    echo "⏳ Cloning repository (this may take a few minutes)..."
    timeout 300 git clone --depth 1 "$REPO_URL" "$FRONTEND_BUILD_DIR" || {
        echo "❌ Git clone failed or timed out after 5 minutes"
        exit 1
    }
    cd "$FRONTEND_BUILD_DIR"
    
    if [ -d "$FRONTEND_BUILD_DIR/fe" ]; then
        echo "🔨 Building frontend Docker image..."
        cd "$FRONTEND_BUILD_DIR/fe"
        
        echo "⏳ Building Docker image (this may take a few minutes)..."
        docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
          --progress=plain \
          --network=host \
          -t football-club-frontend:latest . &
        
        BUILD_PID=$!
        while kill -0 $BUILD_PID 2>/dev/null; do
            echo "📦 Still building... $(date +'%H:%M:%S')"
            sleep 30
        done
        wait $BUILD_PID
        
        if [ $? -ne 0 ]; then
            echo "❌ Docker build failed!"
            exit 1
        fi
        echo "✅ Docker image built successfully!"
    else
        echo "❌ Frontend directory not found!"
        exit 1
    fi
    
    cd "$APP_DIR"
    cp "$FRONTEND_BUILD_DIR/docker-compose.yml" "$APP_DIR/"
    
    # 프론트엔드 포트 정리
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:3000 | xargs kill -9 || true
        sleep 1
    fi
    
    # 프론트엔드 컨테이너만 재시작
    docker compose stop frontend 2>/dev/null || true
    docker compose rm -f frontend 2>/dev/null || true
    docker compose up -d frontend
    
    rm -rf "$FRONTEND_BUILD_DIR"
    echo "✅ Frontend deployment completed!"
}

# 전체 배포 함수
deploy_all() {
    echo "🔄 Fetching latest code from GitHub..."
    
    # SSH keep-alive 설정으로 연결 유지
    export GIT_SSH_COMMAND="ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=10 -o ConnectTimeout=30"
    
    rm -rf "$BUILD_DIR"
    echo "⏳ Cloning repository (this may take a few minutes)..."
    timeout 300 git clone "$REPO_URL" "$BUILD_DIR" || {
        echo "❌ Git clone failed or timed out after 5 minutes"
        exit 1
    }
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
    
    echo "⏳ Building backend image (this may take 5-10 minutes)..."
    docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
      --progress=plain \
      --network=host \
      -t football-club-backend:latest . &
    BACKEND_PID=$!
    
    # 프론트엔드 이미지 빌드
    if [ -d "$BUILD_DIR/fe" ]; then
        cd "$BUILD_DIR/fe"
        echo "⏳ Building frontend image..."
        docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
          --progress=plain \
          --network=host \
          -t football-club-frontend:latest . &
        FRONTEND_PID=$!
    fi
    
    # 빌드 진행 상황 모니터링
    while kill -0 $BACKEND_PID 2>/dev/null || ([ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null); do
        echo "📦 Building images... $(date +'%H:%M:%S')"
        sleep 30
    done
    
    wait
    echo "✅ All Docker images built successfully!"
    
    cd "$APP_DIR"
    
    # 필수 디렉토리 생성
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/images"
    
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
    
    # 네트워크 생성
    echo "📡 Creating networks..."
    docker network create backend-network 2>/dev/null || echo "Backend network already exists"
    docker network create frontend-network 2>/dev/null || echo "Frontend network already exists"
    
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
