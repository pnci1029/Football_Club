# Frontend 개발 가이드 (React + TypeScript)

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

## 축구 동호회 특화 프로젝트 구조

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

## 축구 동호회 특화 컴포넌트 (Tailwind CSS 기반)

#### 주요 구현 파일들
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

#### Tailwind 테마 설정
- **설정 파일**: `fe/tailwind.config.js`
- **색상 시스템**: 흰색과 하늘색 테마
  - Primary: 하늘색 계열 (`#0ea5e9`)
  - Secondary: 회색 계열
  - Position Colors: 포지션별 구분 색상

#### 주요 기능
1. **서브도메인 기반 팀 감지**: URL을 통한 자동 팀 식별
2. **반응형 디자인**: 모바일 우선 접근법
3. **선수 카드**: 포지션별 색상 구분, 통계 표시
4. **네비게이션**: 팀 로고, 햄버거 메뉴, 반응형 설계

#### 개발 환경 설정
**패키지 매니저**: Yarn 사용 (npm 대신)

```bash
# Tailwind CSS 설치
yarn add -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/aspect-ratio

# 타입스크립트 및 React 의존성
yarn add axios react-router-dom
yarn add -D @types/react @types/react-dom

# 개발 서버 실행
yarn start

# 빌드
yarn build
```

## 프론트엔드 개발 워크플로우 (작업순서)

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

3. **기본 프로젝트 구조 생성**
   ```
   src/
   ├── components/
   │   ├── common/
   │   ├── layout/
   │   ├── player/
   │   ├── stadium/
   │   └── match/
   ├── pages/
   ├── hooks/
   ├── services/
   ├── types/
   ├── utils/
   ├── styles/
   ├── constants/
   └── contexts/
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

### 4단계: 상태 관리 및 Context 설정
1. **팀 정보 Context**
   - `contexts/TeamContext.tsx` 구현
   - 서브도메인 기반 팀 정보 관리
   - 전역 팀 상태 제공

2. **커스텀 훅 구현**
   - `hooks/useSubdomain.ts` - 서브도메인 감지
   - 기타 비즈니스 로직 훅들

### 5단계: API 서비스 구현
1. **API 클라이언트 설정**
   - `services/api.ts` - Axios 인스턴스 설정
   - 서브도메인 헤더 자동 추가
   - 에러 핸들링 및 인터셉터

2. **도메인별 서비스**
   - `services/teamService.ts` - 팀 관련 API
   - `services/playerService.ts` - 선수 관련 API
   - `services/stadiumService.ts` - 구장 관련 API

### 6단계: 타입 정의 및 인터페이스
1. **TypeScript 타입 정의**
   - `types/team.ts` - 팀 관련 타입
   - `types/player.ts` - 선수 관련 타입
   - `types/stadium.ts` - 구장 관련 타입

### 7단계: 페이지 컴포넌트 구현 (우선순위별)
1. **최우선: 선수 관리 페이지**
   - `pages/Players.tsx` - 선수 목록 및 상세 페이지
   - `components/player/PlayerCard.tsx` - 선수 카드 컴포넌트
   - 더미 데이터로 시작, 나중에 API 연결

2. **중우선: 메인 홈페이지**
   - `pages/Home.tsx` - 팀 소개 및 메인 페이지
   - 팀 모토, 소개글, 통계 정보 표시

3. **저우선: 구장/경기 페이지**
   - `pages/Stadiums.tsx` - 구장 정보
   - `pages/Matches.tsx` - 경기 일정

### 8단계: 컴포넌트 세분화 및 재사용성
1. **공통 컴포넌트**
   - `components/common/` 하위 재사용 컴포넌트
   - 버튼, 카드, 모달 등 기본 UI 컴포넌트

2. **도메인별 컴포넌트**
   - 각 도메인(선수, 구장, 경기)별 특화 컴포넌트
   - 재사용 가능한 구조로 설계

### 9단계: 반응형 디자인 및 모바일 최적화
1. **Tailwind CSS 반응형 적용**
   - `sm:`, `md:`, `lg:`, `xl:` 브레이크포인트 활용
   - 모바일 우선 접근법 적용

2. **터치 인터페이스 최적화**
   - 터치 영역 최소 44px 보장
   - 스와이프 제스처 지원 (필요시)

### 10단계: 성능 최적화 및 사용자 경험
1. **이미지 최적화**
   - 레이지 로딩 구현
   - WebP 포맷 지원
   - 적절한 이미지 크기 설정

2. **로딩 상태 및 에러 처리**
   - 로딩 스피너 구현
   - 에러 바운더리 설정
   - 사용자 친화적 에러 메시지

### 11단계: 테스트 및 검증
1. **컴포넌트 테스트**
   - React Testing Library 활용
   - 주요 컴포넌트 단위 테스트

2. **E2E 테스트 (선택사항)**
   - 주요 사용자 플로우 테스트

### 12단계: 빌드 최적화 및 배포 준비
1. **번들 최적화**
   - 코드 스플리팅 적용
   - 불필요한 의존성 제거

2. **환경별 설정**
   - 개발/프로덕션 환경 분리
   - 환경 변수 설정

## 개발 원칙
1. **TypeScript 엄격 모드 사용**: 타입 안정성 보장
2. **함수형 컴포넌트 + 훅**: 최신 React 패턴 사용
3. **Tailwind CSS**: 유틸리티 기반 스타일링
4. **모바일 우선**: 반응형 디자인 기본
5. **컴포넌트 재사용**: DRY 원칙 준수

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