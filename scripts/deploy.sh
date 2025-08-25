#!/bin/bash

# 배포 스크립트
set -e

echo "🚀 Starting deployment..."

# 변수 설정
APP_DIR="/opt/football-club"
SERVICE_NAME="football-club"
NGINX_SITES="/etc/nginx/sites-available"
BACKUP_DIR="/opt/football-club/backups/$(date +%Y%m%d_%H%M%S)"

# 백업 디렉토리 생성
sudo mkdir -p "$BACKUP_DIR"

# 기존 애플리케이션 정지
echo "📦 Stopping existing application..."
sudo systemctl stop $SERVICE_NAME || echo "Service not running"

# 기존 파일 백업
if [ -f "$APP_DIR/app.jar" ]; then
    echo "💾 Backing up existing application..."
    sudo cp "$APP_DIR/app.jar" "$BACKUP_DIR/"
fi

if [ -d "$APP_DIR/frontend" ]; then
    echo "💾 Backing up existing frontend..."
    sudo cp -r "$APP_DIR/frontend" "$BACKUP_DIR/"
fi

# 애플리케이션 디렉토리 생성
sudo mkdir -p "$APP_DIR"
sudo mkdir -p "/var/log/football-club"

# 새 파일 복사
echo "📁 Copying new application files..."
sudo cp app.jar "$APP_DIR/"
sudo cp -r frontend "$APP_DIR/"

# 권한 설정
sudo chown -R $USER:$USER "$APP_DIR"
sudo chmod +x "$APP_DIR/app.jar"

# systemd 서비스 파일 생성/업데이트
echo "⚙️ Setting up systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Football Club Application
After=syslog.target network.target

[Service]
User=$USER
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod $APP_DIR/app.jar
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
EOF

# Nginx 설정 (프론트엔드용)
echo "🌐 Setting up Nginx configuration..."
sudo tee $NGINX_SITES/football-club > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com *.your-domain.com;
    
    # 프론트엔드 (정적 파일)
    location / {
        root $APP_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # 캐시 설정
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # 백엔드 API
    location /api/ {
        proxy_pass http://localhost:8082;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS 헤더
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# Nginx 설정 활성화
if [ ! -L "/etc/nginx/sites-enabled/football-club" ]; then
    sudo ln -s $NGINX_SITES/football-club /etc/nginx/sites-enabled/
fi

# Nginx 설정 테스트 및 재시작
echo "🔧 Testing and restarting Nginx..."
sudo nginx -t
sudo systemctl reload nginx

# systemd 데몬 리로드 및 서비스 시작
echo "🔄 Starting application service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# 서비스 상태 확인
sleep 5
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Application started successfully!"
    echo "📊 Service status:"
    sudo systemctl status $SERVICE_NAME --no-pager -l
else
    echo "❌ Application failed to start!"
    echo "📋 Service logs:"
    sudo journalctl -u $SERVICE_NAME --no-pager -l
    exit 1
fi

# 헬스체크
echo "🏥 Running health check..."
for i in {1..30}; do
    if curl -f http://localhost:8082/api/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Health check failed!"
        exit 1
    fi
    echo "⏳ Waiting for application to be ready... ($i/30)"
    sleep 2
done

echo "🎉 Deployment completed successfully!"
echo "🌐 Frontend: http://your-domain.com"
echo "🔗 Backend API: http://your-domain.com/api"