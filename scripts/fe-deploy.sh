#!/bin/bash

# Frontend 배포 스크립트 - 비활성화됨
# set -e  # 오류 발생 시 스크립트 종료

echo "⚠️ Frontend deployment script is disabled - EC2/AWS services disconnected"
exit 1

# echo "Starting Frontend deployment..."

# Docker 이미지 파일 존재 확인
if [ ! -f "football-club-frontend.tar.gz" ]; then
    echo "ERROR: football-club-frontend.tar.gz not found"
    exit 1
fi

# Docker 이미지 로드
echo "Loading Docker image..."
if ! docker load < football-club-frontend.tar.gz; then
    echo "ERROR: Failed to load Docker image"
    exit 1
fi

# 이미지 확인
echo "Checking loaded images..."
if ! docker images | grep -q football-club-frontend; then
    echo "ERROR: football-club-frontend image not found after loading"
    exit 1
fi
docker images | grep football-club-frontend

# 기존 프론트엔드 컨테이너만 정지 및 제거
echo "Stopping existing frontend containers..."
docker-compose -f docker/fe-compose.yml down

# 실행 중인 football-club-frontend 컨테이너 강제 종료
echo "Force stopping football-club-frontend containers..."
docker ps -q --filter "name=football-club-frontend" | xargs -r docker stop
docker ps -aq --filter "name=football-club-frontend" | xargs -r docker rm -f

# 포트 3000 사용 중인 프로세스 종료
echo "Checking for processes using port 3000..."
if lsof -i :3000 2>/dev/null; then
    echo "Killing processes using port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Frontend 전용 네트워크 확인 및 생성
echo "Ensuring frontend network exists..."
if ! docker network ls | grep -q frontend-network; then
    docker network create frontend-network
    echo "Created frontend network: frontend-network"
else
    echo "Frontend network already exists"
fi

# 새 컨테이너 시작
echo "Starting new containers..."
if ! docker-compose -f docker/fe-compose.yml up -d; then
    echo "ERROR: Failed to start containers"
    echo "Container logs:"
    docker-compose -f docker/fe-compose.yml logs
    exit 1
fi

# 컨테이너 시작 확인 (30초 대기)
echo "Waiting for container to be ready..."
for i in {1..30}; do
    if docker ps | grep football-club-frontend | grep -q "Up"; then
        echo "Container is running successfully"
        
        # 헬스체크 - 포트가 실제로 응답하는지 확인
        echo "Checking container health..."
        sleep 3  # 컨테이너 완전 시작 대기
        if docker exec football-club-frontend curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo "Container health check passed"
            break
        else
            echo "Container is running but not responding on port 3000"
            if [ $i -eq 30 ]; then
                echo "ERROR: Container health check failed"
                echo "Container logs:"
                docker logs football-club-frontend
                exit 1
            fi
        fi
    else
        if [ $i -eq 30 ]; then
            echo "ERROR: Container failed to start properly"
            echo "Container status:"
            docker ps -a | grep football-club-frontend
            echo "Container logs:"
            docker logs football-club-frontend
            exit 1
        fi
    fi
    sleep 1
done

# 불필요한 이미지 정리
echo "Cleaning up old images..."
docker image prune -f

echo "Frontend deployment completed successfully!"