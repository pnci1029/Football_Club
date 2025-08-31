/**
 * API 관련 상수 정의
 */

/**
 * API Base URL 결정 함수
 */
export const getApiBaseUrl = (): string => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 로컬 개발 환경
  if (window.location.hostname.includes('localhost')) {
    return 'http://localhost:8082';
  }
  
  // 배포 환경 - nginx 프록시를 통해 같은 호스트로 요청
  return `http://${window.location.hostname}`;
};

/**
 * API 엔드포인트 경로 상수
 */
export const API_ENDPOINTS = {
  // 관리자 인증
  ADMIN_LOGIN: '/api/admin/auth/login',
  ADMIN_LOGOUT: '/api/admin/auth/logout',
  ADMIN_REFRESH: '/api/admin/auth/refresh',
  ADMIN_ME: '/api/admin/auth/me',
  ADMIN_VALIDATE: '/api/admin/auth/validate',

  // 관리자 리소스
  ADMIN_TEAMS: '/api/v1/admin/teams',
  ADMIN_PLAYERS: '/api/v1/admin/players',
  ADMIN_STADIUMS: '/api/v1/admin/stadiums',
  ADMIN_MATCHES: '/api/v1/admin/matches',

  // 공용 리소스  
  TEAMS: '/api/v1/teams',
  PLAYERS: '/api/v1/players',
  STADIUMS: '/api/v1/stadiums',
  MATCHES: '/api/v1/matches',
} as const;

/**
 * HTTP 메서드 상수
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

/**
 * 컨텐츠 타입 상수
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  MULTIPART: 'multipart/form-data',
  FORM_ENCODED: 'application/x-www-form-urlencoded',
} as const;