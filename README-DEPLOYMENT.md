# 🚀 배포 가이드

## GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 추가하세요:

### 필수 시크릿
- `EC2_HOST`: EC2 인스턴스의 공개 IP 주소
- `EC2_USERNAME`: EC2 사용자명 (보통 `ubuntu` 또는 `ec2-user`)
- `EC2_PRIVATE_KEY`: EC2 접근용 SSH 개인키 (전체 내용)
- `APPLICATION_SECRET_YML`: `application-secret.yml` 파일의 전체 내용

## EC2 서버 사전 준비

### 1. 필수 패키지 설치
```bash
# Java 17 설치
sudo apt update
sudo apt install -y openjdk-17-jdk

# Nginx 설치
sudo apt install -y nginx

# 필요한 디렉토리 생성
sudo mkdir -p /opt/football-club
sudo mkdir -p /var/log/football-club
```

### 2. 보안 그룹 설정
EC2 보안 그룹에서 다음 포트를 열어주세요:
- 80 (HTTP)
- 443 (HTTPS) - SSL 인증서 사용 시
- 8082 (Spring Boot) - 내부 통신용

## 배포 과정

### 자동 배포 (GitHub Actions)
1. `main` 브랜치에 코드 푸시
2. GitHub Actions가 자동으로 빌드 및 배포 실행

### 수동 배포
GitHub Actions 탭에서 "Deploy to EC2" 워크플로우를 수동으로 실행

## 배포 후 확인사항

### 서비스 상태 확인
```bash
# 애플리케이션 상태 확인
sudo systemctl status football-club

# 로그 확인
sudo journalctl -u football-club -f

# Nginx 상태 확인
sudo systemctl status nginx
```

### 접속 테스트
- 프론트엔드: `http://your-domain.com`
- 백엔드 API: `http://your-domain.com/api`
- 헬스체크: `http://your-domain.com/api/health`

## 트러블슈팅

### 애플리케이션이 시작되지 않는 경우
```bash
# 로그 확인
sudo journalctl -u football-club --no-pager -l

# 애플리케이션 수동 실행 (디버깅용)
cd /opt/football-club
java -jar -Dspring.profiles.active=prod app.jar
```

### 데이터베이스 연결 실패
- RDS 보안 그룹에서 EC2 접근 허용 확인
- `application-secret.yml`의 DB 연결 정보 확인

### 프론트엔드 접근 불가
```bash
# Nginx 설정 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## SSL 인증서 설정 (선택사항)

Let's Encrypt 사용 시:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 롤백 방법

배포 실패 시 이전 버전으로 롤백:
```bash
# 백업된 파일로 복원
sudo cp /opt/football-club/backups/YYYYMMDD_HHMMSS/app.jar /opt/football-club/
sudo systemctl restart football-club
```