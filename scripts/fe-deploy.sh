#!/bin/bash

echo "Starting Frontend deployment..."

# Docker 이미지 로드
echo "Loading Docker image..."
docker load < football-club-frontend.tar.gz

# 이미지 확인
echo "Checking loaded images..."
docker images | grep football-club-frontend

# 기존 컨테이너 정지 및 제거
echo "Stopping existing containers..."
docker-compose -f docker/fe-compose.yml down

# 새 컨테이너 시작
echo "Starting new containers..."
docker-compose -f docker/fe-compose.yml up -d

# 컨테이너 상태 확인
echo "Checking container status..."
docker ps -a | grep football-club-frontend

# 로그 확인
echo "Checking logs..."
docker-compose -f docker/fe-compose.yml logs

# 불필요한 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

echo "Frontend deployment completed!"