# Frontend Development Guide (React + TypeScript)

## 🚨 중요: 개발 전 필독 사항
**모든 개발 작업을 시작하기 전에 반드시 `@docs/prompts/` 디렉토리의 관련 파일들을 읽고 진행해야 합니다.**

### 패키지 관리 규칙
- **반드시 yarn 사용**: 모든 외부 라이브러리 설치 시 `yarn add` 명령어만 사용
- **npm 사용 금지**: `npm install` 대신 항상 `yarn install` 또는 `yarn add` 사용
- **이유**: yarn.lock과 package-lock.json 간의 충돌을 방지하고 의존성 일관성 유지

```bash
# ✅ 올바른 방법
yarn add @tailwindcss/forms
yarn add @tailwindcss/aspect-ratio
yarn install

# ❌ 잘못된 방법  
npm install @tailwindcss/forms
npm install
```

## 기술 스택
- **언어**: TypeScript 5.x
- **프레임워크**: React 18+
- **빌드 도구**: Create React App / Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Context API / Redux Toolkit
- **HTTP 클라이언트**: Axios
- **테스트**: Jest + React Testing Library

## 프로젝트 구조

```
src/
├── components/                   # 재사용 가능한 컴포넌트
│   ├── common/                  # 공통 컴포넌트
│   ├── layout/                  # 레이아웃 컴포넌트
│   ├── player/                  # 선수 관련 컴포넌트
│   ├── stadium/                 # 구장 관련 컴포넌트
│   └── match/                   # 경기 관련 컴포넌트
├── pages/                       # 페이지 컴포넌트
├── hooks/                       # 커스텀 훅
├── services/                    # API 서비스
├── types/                       # 타입 정의
├── utils/                       # 유틸리티 함수
├── styles/                      # 전역 스타일
├── constants/                   # 상수
└── contexts/                    # Context 관리
```

## TypeScript 베스트 프랙티스

### 1. any 타입 사용 금지

#### ❌ 잘못된 예시
```typescript
// any 타입 사용 금지
function processError(error: any): string {
  return error.message;
}

// 임시 타입 어노테이션
const response: any = await api.get('/endpoint');
```

#### ✅ 올바른 예시
```typescript
// 명확한 인터페이스 정의
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

function processError(error: ApiError): string {
  return error.message;
}

// 제네릭 타입 사용
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const response: ApiResponse<User[]> = await api.get<ApiResponse<User[]>>('/users');
```

### 2. 인터페이스 정의 가이드라인

#### 2.1 네이밍 컨벤션
- 인터페이스명은 PascalCase 사용
- Props 인터페이스는 `ComponentNameProps` 형식
- API 응답 타입은 `EntityApiResponse` 형식
- 요청 타입은 `CreateEntityRequest`, `UpdateEntityRequest` 형식

```typescript
// ✅ 올바른 네이밍
interface UserProfileProps {
  user: User;
  onEdit: (user: User) => void;
}

interface TeamApiResponse {
  success: boolean;
  data: Team[];
}

interface CreatePlayerRequest {
  name: string;
  position: string;
  teamId: number;
}
```

#### 2.2 기본 인터페이스 구조
```typescript
// ✅ 기본 엔티티 정의
interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Team extends BaseEntity {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

// ✅ 유니온 타입 활용
type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
```

### 3. 에러 처리 타입 정의

```typescript
interface NetworkError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
      message?: string;
    };
  };
  stack?: string;
}

// ✅ 타입 안전한 에러 처리
export function getErrorMessage(error: NetworkError): string {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  return error?.message || '알 수 없는 오류가 발생했습니다';
}
```

### 4. API 응답 타입

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: ApiError | null;
  timestamp: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

## 안티패턴 방지 가이드

### 1. any 타입 사용 안티패턴

#### 문제점
- 타입 안전성 상실
- IDE 자동완성 기능 비활성화
- 런타임 에러 발생 가능성 증가
- 코드 가독성 및 유지보수성 저하

#### 발견된 안티패턴 사례

```typescript
// ❌ 안티패턴
export function getErrorMessage(error: any): string {
  return error?.response?.data?.message || '오류가 발생했습니다';
}

// ✅ 개선된 코드
interface NetworkError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
      message?: string;
    };
  };
}

export function getErrorMessage(error: NetworkError): string {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  return error?.message || '오류가 발생했습니다';
}
```

### 2. 타입 어설션 안티패턴

```typescript
// ❌ 안티패턴
const response: any = await Teams.public.getByCode(code);
const team = response.data || response;

// ✅ 개선된 코드
interface TeamApiResponse {
  data?: Team;
  success?: boolean;
}

const response: TeamApiResponse | Team = await Teams.public.getByCode(code);
const team = 'data' in response && response.data ? response.data : response as Team;
```

### 3. 타입 가드 부재

```typescript
// ❌ 안티패턴
function handlePostcodeData(data: any) {
  const address = {
    roadAddress: data.roadAddress,
    zonecode: data.zonecode
  };
}

// ✅ 개선된 코드
interface PostcodeData {
  roadAddress?: string;
  zonecode: string;
  sido: string;
  sigungu: string;
}

function isValidPostcodeData(data: unknown): data is PostcodeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'zonecode' in data &&
    typeof (data as any).zonecode === 'string'
  );
}

function handlePostcodeData(data: unknown) {
  if (isValidPostcodeData(data)) {
    const address = {
      roadAddress: data.roadAddress || '',
      zonecode: data.zonecode
    };
  }
}
```

## 인터페이스 템플릿

### 1. API 관련 인터페이스

```typescript
// 기본 API 응답 구조
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: null;
  timestamp: string;
}

// 에러 응답
interface ApiErrorResponse {
  success: false;
  data: null;
  message: string | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// 페이징 응답 구조
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// CRUD 요청 템플릿
interface CreateEntityRequest<T> {
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

interface UpdateEntityRequest<T> {
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
}
```

### 2. React 컴포넌트 인터페이스

```typescript
// 기본 컴포넌트 Props
interface BaseComponentProps {
  className?: string;
  id?: string;
  testId?: string;
  children?: React.ReactNode;
}

// 폼 컴포넌트 Props
interface FormFieldProps<T = string> extends BaseComponentProps {
  name: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
}

// 모달 컴포넌트 Props
interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
}
```

### 3. Context 타입

```typescript
// 인증 Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 팀 Context
interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  loading: boolean;
  error: string | null;
  setCurrentTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (data: CreateTeamRequest) => Promise<Team>;
  updateTeam: (id: number, data: UpdateTeamRequest) => Promise<Team>;
  deleteTeam: (id: number) => Promise<void>;
}
```

## 외부 라이브러리 타입 정의

### Kakao Maps API 타입

```typescript
interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  relayout(): void;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  setPosition(position: KakaoLatLng): void;
  setImage(image: KakaoMarkerImage): void;
}

interface KakaoSDK {
  maps: {
    Map: new (container: HTMLElement, options: {
      center: KakaoLatLng;
      level: number;
    }) => KakaoMap;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Marker: new (options: MarkerOptions) => KakaoMarker;
    MarkerImage: new (src: string, size: KakaoSize) => KakaoMarkerImage;
    Size: new (width: number, height: number) => KakaoSize;
    event: {
      addListener: (target: any, type: string, handler: Function) => void;
    };
    load: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    kakao: KakaoSDK;
  }
}
```

### 주소 검색 API 타입

```typescript
interface PostcodeData {
  roadAddress?: string;
  autoRoadAddress?: string;
  jibunAddress?: string;
  autoJibunAddress?: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  bname: string;
}

interface AddressSearchProps {
  onSelect: (address: Address) => void;
  onComplete: (data: PostcodeData) => void;
}
```

## 축구 동호회 특화 컴포넌트 (Tailwind CSS 기반)

### 주요 구현 파일들
- **컴포넌트**: `fe/src/components/`
  - `player/PlayerCard.tsx` - 선수 카드 컴포넌트 (Tailwind 스타일)
  - `layout/Navigation.tsx` - 네비게이션 컴포넌트

- **훅**: `fe/src/hooks/`
  - `useSubdomain.ts` - 서브도메인 감지 및 팀 정보 로드

- **컨텍스트**: `fe/src/contexts/`
  - `TeamContext.tsx` - 팀 정보 전역 상태 관리

- **서비스**: `fe/src/services/`
  - `api.ts` - API 클라이언트 (서브도메인 헤더 자동 추가)
  - `teamService.ts` - 팀 관련 API 호출

- **타입**: `fe/src/types/`
  - `player.ts` - 선수 관련 타입 정의
  - `team.ts` - 팀 관련 타입 정의

### Tailwind 테마 설정
- **설정 파일**: `fe/tailwind.config.js`
- **색상 시스템**: 흰색과 하늘색 테마
  - Primary: 하늘색 계열 (`#0ea5e9`)
  - Secondary: 회색 계열
  - Position Colors: 포지션별 구분 색상

### 주요 기능
1. **서브도메인 기반 팀 감지**: URL을 통한 자동 팀 식별
2. **반응형 디자인**: 모바일 우선 접근법
3. **선수 카드**: 포지션별 색상 구분, 통계 표시
4. **네비게이션**: 팀 로고, 햄버거 메뉴, 반응형 설계

## SaaS 멀티테넌트 관리자 시스템

**주요 구현 파일들**:
- `fe/src/components/layout/AdminSidebar.tsx` - 관리자 사이드바 네비게이션
- `fe/src/components/layout/AdminHeader.tsx` - 관리자 헤더
- `fe/src/components/layout/AdminLayout.tsx` - 관리자 전용 레이아웃
- `fe/src/pages/admin/AdminDashboard.tsx` - SaaS 통합 대시보드
- `fe/src/pages/admin/TenantManagement.tsx` - 서브도메인(테넌트) 관리
- `fe/src/pages/admin/AdminPlayers.tsx` - 구단별 선수 관리
- `fe/src/pages/admin/AdminStadiums.tsx` - 구단별 구장 관리
- `fe/src/services/adminService.ts` - 관리자 및 테넌트 API 서비스

**라우팅 및 접근 방식**:
- **관리자 접근**: `admin.localhost:3000`으로 서브도메인 기반 접근
- **App.tsx**에서 호스트명 감지하여 관리자 레이아웃 자동 적용

## 프론트엔드 개발 워크플로우

### 1단계: 프로젝트 초기 설정
1. **React + TypeScript 프로젝트 생성**
   ```bash
   npx create-react-app fe --template typescript
   cd fe
   ```

2. **필수 패키지 설치 (yarn 사용 필수)**
   ```bash
   # 🚨 반드시 yarn 사용
   yarn add react-router-dom axios
   yarn add @types/react-router-dom
   
   # Tailwind CSS 설정
   yarn add -D tailwindcss postcss autoprefixer
   yarn add @tailwindcss/forms @tailwindcss/aspect-ratio
   
   # Tailwind 초기화
   npx tailwindcss init -p
   ```

### 2단계: 기본 설정 및 라우팅
1. **Tailwind CSS 설정**
   - `tailwind.config.js` 축구 동호회 테마 적용
   - `src/index.css`에 Tailwind 디렉티브 추가
   - 색상 시스템: 흰색 + 하늘색 테마

2. **React Router 설정**
   - `App.tsx`에 BrowserRouter 설정
   - 기본 라우트 구조 생성 (/, /players, /stadiums, /matches)

### 3단계: 레이아웃 및 네비게이션 구현
1. **네비게이션 컴포넌트**
   - `components/layout/Navigation.tsx` 구현
   - 반응형 네비게이션 (모바일/데스크톱)
   - 팀 로고 및 메뉴 구성

2. **레이아웃 시스템**
   - 헤더, 네비게이션, 메인 콘텐츠 영역
   - 모바일 우선 반응형 디자인

## 🚀 우선순위별 개발 계획

### 1순위 - 즉시 개발 필요
1. **경기 컴포넌트 구현** ⚠️ **높은 우선순위**
   - `fe/src/components/match/` 디렉토리가 완전히 비어있음
   - `MatchCard.tsx` - 경기 카드 컴포넌트
   - `MatchDetail.tsx` - 경기 상세 컴포넌트  
   - `MatchResult.tsx` - 경기 결과 컴포넌트

2. **관리자 경기 관리** ⚠️ **높은 우선순위**
   - `AdminMatches.tsx` - 관리자 경기 관리 페이지
   - `MatchCreateModal.tsx` - 경기 생성 모달
   - `MatchEditModal.tsx` - 경기 편집 모달
   - `ScoreUpdateModal.tsx` - 점수 업데이트 모달

### 2순위 - 단기 개발
1. **파일 업로드 UI**
   - 이미지 업로드 컴포넌트
   - 드래그앤드롭 기능
   - 이미지 미리보기
   
2. **모바일 반응형 개선**
   - 터치 인터페이스 최적화
   - 모바일 네비게이션 UX 개선

3. **로딩 및 에러 처리**
   - 로딩 스피너 컴포넌트
   - 에러 바운더리 구현
   - 사용자 친화적 에러 메시지

### 3순위 - 중장기 개발
1. **경기 통계 대시보드**
   - 선수별 통계 차트
   - 팀 성과 시각화
   
2. **알림 시스템 UI**
   - 경기 알림 설정 페이지
   - 푸시 알림 컴포넌트

## 개발 원칙
1. **TypeScript 엄격 모드 사용**: 타입 안정성 보장
2. **함수형 컴포넌트 + 훅**: 최신 React 패턴 사용
3. **Tailwind CSS**: 유틸리티 기반 스타일링
4. **모바일 우선**: 반응형 디자인 기본
5. **컴포넌트 재사용**: DRY 원칙 준수

## 개선 체크리스트

### 코드 리뷰 시 확인사항
- [ ] `any` 타입 사용 여부
- [ ] 타입 어설션(`as`) 남용 여부  
- [ ] 인터페이스 완성도 (모든 필요 프로퍼티 정의)
- [ ] 타입 가드 함수 필요 여부
- [ ] 제네릭 타입 활용 가능 여부
- [ ] 네이밍 컨벤션 준수 여부

### 자동화 도구 활용
```json
// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

### TypeScript 컴파일러 옵션
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true
  }
}
```

## 핵심 개발 명령어
```bash
# 개발 서버 실행
yarn start

# 빌드
yarn build

# 테스트
yarn test

# 패키지 설치 (🚨 yarn만 사용)
yarn add 패키지명
yarn add -D 개발의존성패키지명
```

## 마이그레이션 전략

### 점진적 개선
1. 가장 critical한 `any` 타입부터 수정
2. 에러 처리 관련 타입 우선 정의
3. API 관련 타입 정의
4. 컴포넌트 Props 타입 정의
5. 유틸리티 함수 타입 정의

### 우선순위
1. **High**: 에러 처리, API 클라이언트, 외부 라이브러리
2. **Medium**: 컴포넌트 Props, 상태 관리
3. **Low**: 테스트 코드, 유틸리티 함수

이 가이드를 참고하여 타입 안전성을 보장하고 유지보수성을 높이세요.