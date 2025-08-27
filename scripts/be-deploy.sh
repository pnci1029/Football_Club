#!/bin/bash

echo "Starting Backend deployment..."

# Docker 이미지 로드
echo "Loading Docker image..."
docker load < football-club-backend.tar.gz

# 기존 컨테이너 정지 및 제거
echo "Stopping existing containers..."
docker-compose -f docker/be-compose.yml down

# 새 컨테이너 시작
echo "Starting new containers..."
docker-compose -f docker/be-compose.yml up -d

# 불필요한 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

echo "Backend deployment completed!"