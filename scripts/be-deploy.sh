#!/bin/bash

# Backend 배포 스크립트
set -e

echo "Starting Backend deployment..."

# Docker 이미지 로드 (있는 경우)
[ -f football-club-backend.tar.gz ] && docker load < football-club-backend.tar.gz

# 백엔드 컨테이너만 정리 (Redis는 유지)
docker ps -q --filter "name=football-club-backend" | xargs -r docker stop 2>/dev/null || true
docker ps -aq --filter "name=football-club-backend" | xargs -r docker rm -f 2>/dev/null || true
lsof -ti :8082 | xargs kill -9 2>/dev/null || true

# 네트워크 확인
docker network ls | grep -q backend-network || docker network create backend-network

# 컨테이너 시작 (Redis 있으면 재사용, 없으면 새로 생성)
docker-compose -f docker/be-compose.yml up -d

# 시작 확인
for i in {1..10}; do
    docker ps | grep football-club-backend | grep -q "Up" && break
    [ $i -eq 10 ] && echo "Container failed to start" && exit 1
    sleep 1
done

echo "Backend deployment completed!"