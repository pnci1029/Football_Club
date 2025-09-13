# API Migration Guide

## 완료된 작업

### ✅ 1단계: API 분석 및 분류
- 전체 64개 API 메서드 분석 완료
- 카테고리별 분류: Admin APIs (32개), Public APIs (15개), Other Services (17개)

### ✅ 2단계: 통합 API 클라이언트 구축
- `api/client.ts` - 통합 HTTP 클라이언트 (axios 기반)
- `api/endpoints.ts` - 중앙화된 엔드포인트 관리
- `api/types.ts` - 완전한 타입 정의

### ✅ 3단계: 관심사별 API 모듈 생성
- `api/modules/admin.ts` - 관리자 API (대시보드, 문의, 테넌트)
- `api/modules/teams.ts` - 팀 관련 API
- `api/modules/players.ts` - 선수 관련 API
- `api/modules/stadiums.ts` - 구장 관련 API
- `api/modules/matches.ts` - 경기 관련 API
- `api/modules/inquiries.ts` - 문의 관련 API
- `api/modules/hero-slides.ts` - 메인 슬라이드 API
- `api/modules/auth.ts` - 인증 관련 API
- `api/modules/images.ts` - 이미지 관련 API
- `api/index.ts` - 통합 내보내기

### ✅ 4단계: 자동 테스트 시스템 구축
- `__tests__/api-comprehensive.test.ts` - 전체 API 테스트
- `__tests__/api-coverage-report.test.ts` - 상세 커버리지 리포트
- 64개 API 메서드 전체 테스트 시스템 완성

## 🔄 5단계: 기존 서비스 레이어 마이그레이션

기존 서비스 파일들을 새로운 API 구조로 점진적으로 마이그레이션합니다.

### 마이그레이션 대상 파일들:
1. `services/adminService.ts`
2. `services/authService.ts`  
3. `services/dashboardService.ts`
4. `services/heroSlideService.ts`
5. `services/imageService.ts`
6. `services/inquiryService.ts`
7. `services/matchService.ts`
8. `services/playerService.ts`
9. `services/stadiumService.ts`
10. `services/teamService.ts`

### 마이그레이션 전략:

#### Phase 1: 새 API 임포트 추가
```typescript
// 기존
import axios from 'axios';

// 새로운 방식
import { Teams, Players, Matches } from '../api';
```

#### Phase 2: 메서드별 점진적 교체
```typescript
// 기존
const getTeams = async () => {
  const response = await axios.get('/api/teams');
  return response.data;
};

// 새로운 방식  
const getTeams = async () => {
  return await Teams.public.getAll();
};
```

#### Phase 3: 에러 처리 통합
새로운 API 클라이언트는 이미 표준화된 에러 처리를 제공하므로 개별 에러 처리 코드 제거 가능

#### Phase 4: 타입 안정성 개선
새로운 API 모듈의 완전한 타입 정의 활용

### 장점:
- ✅ 중복 코드 제거
- ✅ 일관된 API 호출 패턴
- ✅ 향상된 타입 안정성
- ✅ 중앙화된 에러 처리
- ✅ 자동 테스트 커버리지
- ✅ 더 나은 개발자 경험

## 테스트 명령어

```bash
# 기본 API 통합 테스트
yarn test:api

# 전체 API 포괄 테스트  
yarn test:comprehensive

# API 커버리지 리포트
yarn test:coverage
```

## 사용법

### 새로운 API 사용 방법:

```typescript
import { Teams, Players, Matches, Admin } from '../api';

// Public API 사용
const teams = await Teams.public.getAll();
const team = await Teams.public.getById(1);

// Admin API 사용 (인증 필요)
const adminTeams = await Teams.admin.getAll();
const newTeam = await Teams.admin.create(teamData);

// 편의 메서드 사용
const searchResults = await Teams.search('keyword');
const teamExists = await Teams.exists('team-code');

// 통계 및 분석
const matchStats = await Matches.getMatchStats(teamId);
const systemOverview = await Admin.getSystemOverview();
```

### 에러 처리:

```typescript
try {
  const team = await Teams.public.getById(id);
} catch (error) {
  // 자동으로 HTTP 상태 코드별 에러 처리
  if (error.response?.status === 404) {
    // 팀을 찾을 수 없음
  } else if (error.response?.status === 401) {
    // 인증 필요
  }
}
```