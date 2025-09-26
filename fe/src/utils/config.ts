/**
 * 환경별 설정 관리 유틸리티
 */

// 기본값 설정
const DEFAULT_CONFIG = {
  API_URL: 'http://localhost:8082',
  PRODUCTION_DOMAIN: 'football-club.kr'
} as const;

/**
 * API 베이스 URL 반환
 */
export const getApiBaseUrl = (): string => {
  // 환경변수가 있으면 우선 사용
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  const hostname = window.location.hostname;

  // 로컬 개발 환경
  if (hostname.includes('localhost')) {
    return DEFAULT_CONFIG.API_URL;
  }

  // 배포 환경
  return process.env.REACT_APP_PRODUCTION_DOMAIN || `https://${DEFAULT_CONFIG.PRODUCTION_DOMAIN}`;
};

/**
 * 프로덕션 도메인 반환 (프로토콜 제외)
 */
export const getProductionDomain = (): string => {
  return process.env.REACT_APP_PRODUCTION_DOMAIN?.replace('https://', '') || DEFAULT_CONFIG.PRODUCTION_DOMAIN;
};

/**
 * 팀 도메인 URL 생성
 */
export const getTeamUrl = (teamCode: string): string => {
  const hostname = window.location.hostname;
  
  // 로컬 개발 환경
  if (hostname.includes('localhost')) {
    return `http://localhost:3000`; // 로컬에서는 메인 도메인으로
  }
  
  // 배포 환경
  const domain = getProductionDomain();
  return `https://${teamCode}.${domain}`;
};

/**
 * 메인 도메인 체크
 */
export const isMainDomain = (hostname: string): boolean => {
  const domain = getProductionDomain();
  return hostname === 'localhost' ||
         hostname === 'football-club' ||
         hostname === domain;
};

/**
 * 메인 도메인 URL 반환
 */
export const getMainDomainUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname.includes('localhost')) {
    return `${protocol}//localhost:3000`;
  } else {
    const domain = getProductionDomain();
    return `${protocol}//${domain}`;
  }
};
