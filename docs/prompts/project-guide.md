# Football Club Project Guide

## 📋 프로젝트 개요

Football Club은 축구 동호회를 위한 **멀티테넌트 SaaS 플랫폼**입니다. 각 축구팀이 고유한 서브도메인을 통해 독립적인 웹사이트를 운영할 수 있으며, 중앙 관리자 시스템을 통해 전체 테넌트를 관리할 수 있습니다.

### 핵심 아키텍처
- **Backend**: Kotlin + Spring Boot (멀티테넌트 아키텍처)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: MySQL (테넌트별 데이터 격리)
- **Deployment**: Docker + Cafe24 호스팅

## 🏗️ 전체 프로젝트 구조

```
Football_Club/
├── be/                           # 백엔드 (Kotlin + Spring Boot)
│   ├── src/main/kotlin/io/be/
│   │   ├── controller/           # REST API 컨트롤러
│   │   ├── service/             # 비즈니스 로직
│   │   ├── repository/          # 데이터 접근 계층
│   │   ├── entity/              # JPA 엔티티
│   │   ├── dto/                 # 데이터 전송 객체
│   │   ├── security/            # 보안 및 테넌트 관리
│   │   └── config/              # 설정 파일
│   └── docker/                  # Docker 설정
├── fe/                          # 프론트엔드 (React + TypeScript)
│   ├── src/
│   │   ├── components/          # React 컴포넌트
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── services/            # API 서비스
│   │   ├── hooks/               # 커스텀 훅
│   │   ├── contexts/            # React Context
│   │   ├── types/               # TypeScript 타입 정의
│   │   └── utils/               # 유틸리티 함수
│   └── public/                  # 정적 파일
├── docs/                        # 프로젝트 문서
│   └── prompts/                 # 개발 가이드
├── scripts/                     # 배포 및 유틸리티 스크립트
└── docker-compose.yml           # Docker Compose 설정
```

## 🔑 멀티테넌트 아키텍처

### 테넌트 식별 방식
- **서브도메인 기반**: `kim.localhost:3000`, `lee.localhost:3000`
- **관리자 접근**: `admin.localhost:3000`
- **Host 헤더**를 통한 테넌트 자동 감지

### 데이터 격리 전략
```kotlin
// 모든 엔티티는 Team과 연관관계를 가짐
@Entity
class Player {
    @ManyToOne
    @JoinColumn(name = "team_id")
    val team: Team
}

// Repository에서 테넌트별 필터링
interface PlayerRepository {
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId")
    fun findByTeamId(@Param("teamId") teamId: Long): List<Player>
}
```

## 🚀 현재 구현 상태

### ✅ 완료된 기능
1. **기본 CRUD 시스템**
   - 팀, 선수, 구장 관리
   - RESTful API 설계
   - 페이지네이션 및 검색

2. **멀티테넌트 기반**
   - 서브도메인 기반 테넌트 감지
   - 테넌트별 데이터 분리
   - 관리자 통합 대시보드

3. **프론트엔드 기본 구조**
   - React + TypeScript 환경
   - Tailwind CSS 스타일링
   - 반응형 디자인

4. **관리자 시스템**
   - SaaS 통합 대시보드
   - 테넌트 관리 인터페이스
   - 통계 및 모니터링

### ✅ 최근 완료된 기능
1. **이미지 업로드 시스템**
   - ImageController 구현
   - 프론트엔드 ImageUpload 컴포넌트
   - 파일 업로드 및 서빙 설정
   - 배포 스크립트 볼륨 마운트 수정

2. **관리자 인증 시스템**
   - AdminPermissionInterceptor 구현
   - 관리자 API 보안 강화
   - 히어로 슬라이드 관리 완료

### ❌ 미완성 기능
1. **경기 관리 시스템**
   - Match 엔티티 구현
   - 경기 일정/결과 관리
   - 경기 통계 시스템

## 🎯 다음 개발 우선순위

### 즉시 필요
1. **경기 관리 시스템 완성**
   - Match 엔티티 구현
   - 경기 일정/결과 관리 API
   - 프론트엔드 경기 컴포넌트

2. **갤러리 시스템 최적화**
   - 이미지 리사이징 및 최적화
   - 무한 스크롤 구현
   - 이미지 캐싱 전략

## 📊 현재 완성도

### 백엔드 완성도: 85%
- ✅ **완료**: 기본 CRUD, 서브도메인 처리, 관리자 API, 이미지 업로드, 인증 시스템
- ❌ **미완성**: 경기 관리

### 프론트엔드 완성도: 80%
- ✅ **완료**: 레이아웃, 선수/구장 관리, 관리자 대시보드, 이미지 업로드 UI
- ❌ **미완성**: 경기 컴포넌트

### 인프라 완성도: 85%
- ✅ **완료**: Docker 컨테이너화, Blue-Green 배포, 이미지 파일 서빙
- ❌ **미완성**: 모니터링, 로깅 시스템

## 🔒 보안 상태

### ✅ 완료된 보안 설정
- [x] 관리자 인증 시스템
- [x] Cross-tenant 데이터 접근 방지
- [x] 파일 업로드 검증 (크기, 타입 제한)
- [x] CORS 정책 적용
- [x] 환경 변수 분리

### ⚠️ 추가 보안 강화 필요
- [ ] Rate Limiting 적용
- [ ] HTTPS 강제 설정
- [ ] 로그 보안 강화

## 🛠️ 해결된 주요 이슈들

### ✅ 해결된 문제들
1. **이미지 업로드 파일 저장 이슈**
   - Blue-Green 배포 스크립트에 볼륨 마운트 추가
   - 이미지 파일이 호스트에 정상 저장됨

2. **관리자 인증 문제**
   - AdminPermissionInterceptor 수정
   - @RequestAttribute 누락 해결
   - 히어로 슬라이드 API 보안 강화

3. **테넌트 컨텍스트 의존성 문제**
   - 관리자 API에서 TenantContext 선택적 사용 구현

### ⚠️ 남은 TODO 항목들
```bash
# 주요 미완성 기능:
be/src/main/kotlin/io/be/service/TeamService.kt:127: "totalMatches" to 0, // TODO: Match 엔티티 구현
fe/src/components/match/     // 경기 관리 컴포넌트 구현 필요
```

## 📈 성능 최적화 포인트

### 백엔드 최적화
```kotlin
// N+1 문제 해결 필요
@Query("SELECT p FROM Player p JOIN FETCH p.team WHERE p.team.id = :teamId")
fun findPlayersWithTeam(@Param("teamId") teamId: Long): List<Player>

// 추가 필요한 인덱스
CREATE INDEX idx_player_team_position ON players(team_id, position);
CREATE INDEX idx_match_date_teams ON matches(match_date, home_team_id, away_team_id);
```

### 프론트엔드 최적화
```typescript
// 구현 필요한 최적화 항목들:
// - React.lazy()를 활용한 코드 스플리팅
// - 이미지 최적화 (WebP, lazy loading)
// - 번들 사이즈 분석 및 최적화
// - 메모이제이션 (React.memo, useMemo, useCallback)
```

## 📋 개발 완료 후 검증사항

### 보안 테스트
- [ ] Cross-tenant 데이터 접근 차단 테스트
- [ ] Host 헤더 조작 시도 차단 테스트  
- [ ] JWT 토큰 만료/위조 검증 테스트
- [ ] 파일 업로드 보안 테스트 (크기, 타입 제한)
- [ ] 모든 API 엔드포인트 인증/인가 테스트

### 성능 테스트
- [ ] 동시 사용자 부하 테스트
- [ ] API 응답 시간 측정
- [ ] 데이터베이스 쿼리 성능 분석
- [ ] 프론트엔드 번들 사이즈 최적화

### 사용자 경험 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 모바일 반응형 테스트
- [ ] 접근성(a11y) 검증
- [ ] 사용자 플로우 테스트

## 📚 관련 문서

이 프로젝트의 상세한 개발 가이드는 다음 문서들을 참고하세요:

- **백엔드 개발**: `@docs/prompts/backend-guide.md`
- **프론트엔드 개발**: `@docs/prompts/frontend-guide.md`
- **배포 설정**: `@.github/workflows/cafe24-deploy-backend.yml` - Blue-Green 배포 파이프라인

각 문서에는 기술 스택별 상세한 구현 가이드, 베스트 프랙티스, 안티패턴 방지 방법 등이 포함되어 있습니다.

# 배포 프로세스 상세 가이드

## Blue-Green 배포 플로우

### 1. 배포 트리거
```bash
git push origin main  # be/ 경로 수정 시 자동 배포
# 또는
GitHub Actions > Deploy Backend to Cafe24 > Run workflow  # 수동 배포
```

### 2. 배포 파일 경로 및 처리 순서

#### 📁 GitHub Actions 워크플로우
```
.github/workflows/cafe24-deploy-backend.yml
├── Docker 이미지 빌드 (be/ 디렉토리)
├── Docker Hub 푸시
└── 서버 배포 실행
```

#### 📁 서버 파일 전송
```
1. docker-compose.yml → /opt/football-club/ (scp 전송)
2. .env 파일 생성 → /opt/football-club/.env
3. Docker 이미지 Pull → 서버에서 다운로드
```

#### 📁 Nginx 설정 처리
**❗ 중요**: nginx.conf는 **수동 적용 필요**
```bash
# 서버에서 수동 실행 필요:
sudo cp docker/nginx.conf /etc/nginx/sites-enabled/nginx.conf
sudo nginx -t  # 설정 검증
sudo systemctl reload nginx  # 적용
```

#### 📁 Blue-Green 컨테이너 교체
```
1. backend-blue (8082 포트) 또는 backend-green (8083 포트) 결정
2. 새 컨테이너 시작:
   docker run -d --name backend-blue \
     -p 8082:8082 \
     -v /opt/football-club/images:/opt/football-club/images \
     -v /opt/football-club/logs:/var/log/football-club \
     football-club-backend:latest
3. 헬스체크: http://localhost:8082/api/test/health
4. Nginx 트래픽 전환 (포트 변경)
5. 이전 컨테이너 종료
```

### 3. 배포 후 확인사항

#### ✅ 컨테이너 상태
```bash
docker ps --filter "name=backend"  # 실행 중인 백엔드 컨테이너 확인
docker logs backend-blue  # 로그 확인
```

#### ✅ 이미지 파일 서빙 테스트
```bash
# 히어로 슬라이드 이미지
curl -I https://image.football-club.kr/images/test.jpg

# 갤러리 이미지  
curl -I https://image.football-club.kr/gallery/default/2024/12/test.jpg
```

#### ✅ API 엔드포인트 테스트
```bash
curl https://football-club.kr/api/test/health
curl https://football-club.kr/api/v1/gallery
```

## 주요 배포 이슈 및 해결책

### ✅ 해결된 이슈들

#### 1. 볼륨 마운트 누락 문제
```bash
# 문제: 이미지 파일이 컨테이너 내부에만 저장됨
# 해결: docker run에 볼륨 마운트 추가
-v /opt/football-club/images:/opt/football-club/images
-v /opt/football-club/logs:/var/log/football-club
```

#### 2. 갤러리 이미지 경로 문제
```bash
# 문제: 중복 경로로 인한 404 에러
# 기존: /opt/football-club/images/images/gallery/...
# 수정: /opt/football-club/images/gallery/...

# Nginx 설정 추가:
location /gallery/ {
    alias /opt/football-club/images/gallery/;
}
```

### ⚠️ 수동 처리 필요한 항목들

#### 1. Nginx 설정 업데이트
```bash
# docker/nginx.conf 수정 후 수동 적용 필요
sudo cp docker/nginx.conf /etc/nginx/sites-enabled/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

#### 2. 디렉토리 권한 설정
```bash
# 서버 초기 설정 시 1회 실행
sudo chown -R root:root /opt/football-club/
sudo chmod -R 755 /opt/football-club/
```

이 가이드를 통해 안전하고 확장 가능한 멀티테넌트 SaaS 플랫폼을 완성해보세요! 🚀