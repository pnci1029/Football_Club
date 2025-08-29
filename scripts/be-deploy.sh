#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료

echo "Starting Backend deployment..."

# Docker 이미지 로드
echo "Loading Docker image..."
if ! docker load < football-club-backend.tar.gz; then
    echo "ERROR: Failed to load Docker image"
    exit 1
fi

# 기존 컨테이너 정지 및 제거
echo "Stopping existing containers..."
docker-compose -f docker/be-compose.yml down

# 포트 8082 사용 중인 프로세스 종료
echo "Checking for processes using port 8082..."
if lsof -i :8082; then
    echo "Killing processes using port 8082..."
    lsof -ti :8082 | xargs kill -9 || true
    sleep 2
fi

# 새 컨테이너 시작
echo "Starting new containers..."
if ! docker-compose -f docker/be-compose.yml up -d; then
    echo "ERROR: Failed to start containers"
    echo "Container logs:"
    docker-compose -f docker/be-compose.yml logs
    exit 1
fi

# 컨테이너 시작 확인 (10초 대기)
echo "Waiting for container to be ready..."
for i in {1..10}; do
    if docker ps | grep football-club-backend | grep -q "Up"; then
        echo "Container is running successfully"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "ERROR: Container failed to start properly"
        echo "Container status:"
        docker ps -a | grep football-club-backend
        echo "Container logs:"
        docker-compose -f docker/be-compose.yml logs
        exit 1
    fi
    sleep 1
done

# 불필요한 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

echo "Backend deployment completed successfully!"