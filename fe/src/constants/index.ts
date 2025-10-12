/**
 * 모든 상수들을 재내보내는 인덱스 파일
 */

// 기존 상수들
export const POSITION_OPTIONS = [
  { value: 'GK', label: '골키퍼 (GK)' },
  { value: 'DF', label: '수비수 (DF)' },
  { value: 'MF', label: '미드필더 (MF)' },
  { value: 'FW', label: '공격수 (FW)' },
] as const;

// API 관련
export * from './api';

// 스토리지 관련 - 삭제됨 (TokenManager 사용)

// 메시지 관련
export * from './messages';

// 스타일 관련
export * from './styles';

// 도메인 상수
export const DOMAIN_CONFIG = {
  MAIN_DOMAINS: ['localhost', 'football-club.local', 'football-club.kr'],
  ADMIN_PREFIXES: ['admin.localhost', 'admin.'],
} as const;

// 파일 업로드 제한
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif'],
} as const;

// 페이지네이션 기본값
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// 검증 규칙
export const VALIDATION_RULES = {
  PLAYER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  TEAM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  STADIUM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  BACK_NUMBER: {
    MIN: 1,
    MAX: 99,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
} as const;

// 타임아웃 설정
export const TIMEOUT_CONFIG = {
  API_REQUEST: 10000, // 10초
  FILE_UPLOAD: 30000, // 30초
  LOADING_DELAY: 200, // 로딩 스피너 표시 지연
} as const;