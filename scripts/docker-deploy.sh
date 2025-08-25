#!/bin/bash

set -e

echo "🐳 Starting Docker deployment..."

# 변수 설정
IMAGE_NAME="football-club"
CONTAINER_NAME="football-club-app"
BACKUP_DIR="/opt/football-club/backups/$(date +%Y%m%d_%H%M%S)"

# 백업 디렉토리 생성
sudo mkdir -p "$BACKUP_DIR"
sudo mkdir -p /opt/football-club/logs
sudo mkdir -p /opt/football-club/uploads

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 기존 컨테이너 정지 및 백업
echo "⏹️ Stopping existing containers..."
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
    echo "💾 Creating backup of existing container..."
    docker commit $CONTAINER_NAME $IMAGE_NAME:backup-$(date +%Y%m%d_%H%M%S) || true
    docker-compose down || true
fi

# 기존 이미지 백업 (선택사항)
if docker images -q $IMAGE_NAME:latest | grep -q .; then
    echo "💾 Backing up existing image..."
    docker tag $IMAGE_NAME:latest $IMAGE_NAME:backup-$(date +%Y%m%d_%H%M%S) || true
fi

# 새 Docker 이미지 로드
echo "📥 Loading new Docker image..."
if [ -f "football-club.tar.gz" ]; then
    gunzip -c football-club.tar.gz | docker load
    echo "✅ Docker image loaded successfully"
else
    echo "❌ Docker image file not found!"
    exit 1
fi

# 이미지 확인
echo "🔍 Verifying Docker image..."
docker images $IMAGE_NAME:latest

# Docker Compose로 서비스 시작
echo "🚀 Starting services with Docker Compose..."
docker-compose up -d

# 컨테이너 상태 확인
echo "📊 Checking container status..."
sleep 10
docker-compose ps

# 헬스체크
echo "🏥 Running health check..."
for i in {1..30}; do
    if curl -f http://localhost:80/health > /dev/null 2>&1 || curl -f http://localhost:8082/api/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Health check failed!"
        echo "📋 Container logs:"
        docker-compose logs --tail=50
        exit 1
    fi
    echo "⏳ Waiting for application to be ready... ($i/30)"
    sleep 2
done

# 로그 확인
echo "📋 Recent logs:"
docker-compose logs --tail=20

# 정리: 오래된 이미지 제거 (7일 이상된 백업만)
echo "🧹 Cleaning up old backup images..."
docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep "$IMAGE_NAME:backup" | while read line; do
    image_tag=$(echo $line | awk '{print $1}')
    created_date=$(echo $line | awk '{print $2}')
    
    # 7일 이상된 이미지만 제거 (간단한 체크)
    if [[ $created_date < $(date -d '7 days ago' '+%Y-%m-%d') ]]; then
        echo "🗑️ Removing old backup: $image_tag"
        docker rmi $image_tag || true
    fi
done

# 사용하지 않는 Docker 리소스 정리
docker system prune -f

echo "🎉 Docker deployment completed successfully!"
echo "🌐 Frontend: http://$(curl -s ifconfig.me)"
echo "🔗 Backend API: http://$(curl -s ifconfig.me)/api"
echo "📊 Container status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"