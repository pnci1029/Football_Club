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

## 개발 원칙
1. **TypeScript 엄격 모드 사용**: 타입 안정성 보장
2. **함수형 컴포넌트 + 훅**: 최신 React 패턴 사용
3. **Tailwind CSS**: 유틸리티 기반 스타일링
4. **모바일 우선**: 반응형 디자인 기본
5. **컴포넌트 재사용**: DRY 원칙 준수