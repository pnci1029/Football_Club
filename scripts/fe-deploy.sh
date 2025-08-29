#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료

echo "Starting Frontend deployment..."

# Docker 이미지 로드
echo "Loading Docker image..."
if ! docker load < football-club-frontend.tar.gz; then
    echo "ERROR: Failed to load Docker image"
    exit 1
fi

# 이미지 확인
echo "Checking loaded images..."
docker images | grep football-club-frontend

# 기존 컨테이너 정지 및 제거
echo "Stopping existing containers..."
docker-compose -f docker/fe-compose.yml down

# 포트 3000 사용 중인 프로세스 종료
echo "Checking for processes using port 3000..."
if lsof -i :3000; then
    echo "Killing processes using port 3000..."
    lsof -ti :3000 | xargs kill -9 || true
    sleep 2
fi

# 새 컨테이너 시작
echo "Starting new containers..."
if ! docker-compose -f docker/fe-compose.yml up -d; then
    echo "ERROR: Failed to start containers"
    echo "Container logs:"
    docker-compose -f docker/fe-compose.yml logs
    exit 1
fi

# 컨테이너 시작 확인 (10초 대기)
echo "Waiting for container to be ready..."
for i in {1..10}; do
    if docker ps | grep football-club-frontend | grep -q "Up"; then
        echo "Container is running successfully"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "ERROR: Container failed to start properly"
        echo "Container status:"
        docker ps -a | grep football-club-frontend
        echo "Container logs:"
        docker-compose -f docker/fe-compose.yml logs
        exit 1
    fi
    sleep 1
done

# 불필요한 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

echo "Frontend deployment completed successfully!"