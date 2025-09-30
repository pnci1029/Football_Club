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

### ⚠️ 진행 중인 작업
1. **보안 강화**
   - JWT 인증 시스템 구현 중
   - Host 헤더 검증 강화
   - Cross-tenant 접근 방지

2. **TypeScript 타입 안전성**
   - `any` 타입 제거 (대부분 완료)
   - 인터페이스 정의 개선

### ❌ 미완성 기능
1. **경기 관리 시스템**
   - Match 엔티티 구현
   - 경기 일정/결과 관리
   - 경기 통계 시스템

2. **파일 업로드 시스템**
   - 선수 프로필 이미지
   - 팀 로고 업로드
   - 이미지 최적화

3. **예외 처리 시스템**
   - 전역 예외 핸들러
   - 사용자 친화적 에러 메시지
   - 에러 바운더리

## 🎯 우선순위별 개발 계획

### Phase 1: Critical 보안 이슈 (즉시)
```bash
# 1. 보안 강화
claude "백엔드 보안을 강화해주세요: Host 헤더 검증, TenantContext, Repository 보안 필터링"

# 2. JWT 인증 시스템
claude "JWT 토큰 기반 인증 시스템을 구현해주세요"
```

### Phase 2: 핵심 기능 완성 (2-3주)
```bash
# 3. 경기 관리 시스템
claude "경기 관리 시스템을 완성해주세요: Match 엔티티, AdminMatchController, 프론트엔드 경기 컴포넌트"

# 4. 파일 업로드 시스템
claude "파일 업로드 시스템을 구현해주세요: 백엔드 FileUploadController, 프론트엔드 업로드 UI"

# 5. 예외 처리 시스템
claude "전역 예외 처리 시스템을 구현해주세요: GlobalExceptionHandler, 커스텀 예외, ErrorBoundary"
```

### Phase 3: 사용자 경험 개선 (2-3주)
```bash
# 6. 성능 최적화
claude "성능을 최적화해주세요: JPA N+1 해결, React 메모이제이션, 이미지 최적화"

# 7. 테스트 코드 확장
claude "종합적인 테스트 코드를 작성해주세요: 유닛 테스트, 통합 테스트, E2E 테스트"
```

### Phase 4: 운영 안정성 (3-4주)
```bash
# 8. 모니터링 시스템
claude "모니터링 및 로깅 시스템을 구축해주세요"

# 9. 배포 자동화
claude "배포 자동화 파이프라인을 구축해주세요"
```

## 📊 전체 분석 결과

### 백엔드 완성도: 75%
- ✅ **완료**: 기본 CRUD, 서브도메인 처리, 관리자 API
- ⚠️ **진행중**: 보안 강화, 테넌트 격리
- ❌ **미완성**: 경기 관리, 파일 업로드, 예외 처리, JWT 인증

### 프론트엔드 완성도: 70%
- ✅ **완료**: 레이아웃, 선수/구장 관리, 관리자 대시보드
- ⚠️ **진행중**: TypeScript 타입 안전성
- ❌ **미완성**: 경기 컴포넌트, 에러 처리, 파일 업로드 UI

### 인프라 완성도: 60%
- ✅ **완료**: Docker 컨테이너화, 기본 배포 구조
- ❌ **미완성**: 자동화 배포, 모니터링, 로깅, 보안 강화

## 🔒 보안 체크리스트

### 배포 전 필수 확인사항
- [ ] Host 헤더 검증 구현
- [ ] Cross-tenant 데이터 접근 방지
- [ ] JWT 토큰 검증 구현
- [ ] CORS 정책 적용
- [ ] 보안 헤더 설정
- [ ] 환경 변수 암호화
- [ ] 민감한 정보 로그 제거
- [ ] Rate Limiting 적용
- [ ] 입력값 검증 및 XSS 방지
- [ ] HTTPS 강제 설정

## 🛠️ 발견된 주요 이슈들

### Critical 보안 이슈
```kotlin
// ❌ 현재 문제점: Host 헤더만으로 검증 - 조작 가능
fun getTeamBySubdomain(host: String): TeamDto? {
    val teamCode = subdomainResolver.extractTeamFromHost(host)
    return teamCode?.let { teamRepository.findByCode(it)?.let { TeamDto.from(it) } }
}

// ❌ 현재 위험: Cross-tenant 접근 가능
interface PlayerRepository : JpaRepository<Player, Long> {
    fun findById(id: Long): Player? // 다른 팀 선수 접근 가능
}
```

### 미완성 TODO 항목들
```bash
# 발견된 TODO 항목들:
be/src/main/kotlin/io/be/security/TenantSecurityInterceptor.kt:122: // TODO: JWT 토큰 검증 추가
be/src/main/kotlin/io/be/service/TeamService.kt:127: "totalMatches" to 0, // TODO: Match 엔티티 구현
be/src/main/kotlin/io/be/controller/TeamController.kt:38: // TODO: PlayerService에서 팀별 선수 조회
be/src/main/kotlin/io/be/controller/admin/TenantController.kt:120: // TODO: 테넌트 설정 업데이트
```

### 프론트엔드 품질 이슈
```typescript
// ❌ 문제: 비어있는 디렉토리
fe/src/components/match/     // 완전히 비어있음

// ❌ 문제: 개발용 코드가 운영에 포함될 위험
console.log('🚀 API Health Check 시작...');  // 총 15개의 console.log 발견
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
// 구현 필요
- React.lazy()를 활용한 코드 스플리팅
- 이미지 최적화 (WebP, lazy loading)
- 번들 사이즈 분석 및 최적화
- 메모이제이션 (React.memo, useMemo, useCallback)
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

각 문서에는 기술 스택별 상세한 구현 가이드, 베스트 프랙티스, 안티패턴 방지 방법 등이 포함되어 있습니다.

이 가이드를 통해 안전하고 확장 가능한 멀티테넌트 SaaS 플랫폼을 완성해보세요! 🚀