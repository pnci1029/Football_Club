/**
 * 모든 API 엔드포인트 중앙 관리
 */

import { ApiEndpoint } from './types';

// API 엔드포인트 정의
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: { method: 'POST', path: '/api/admin/auth/login', requiresAuth: false } as ApiEndpoint,
    LOGOUT: { method: 'POST', path: '/api/admin/auth/logout', requiresAuth: true } as ApiEndpoint,
    REFRESH: { method: 'POST', path: '/api/admin/auth/refresh', requiresAuth: true } as ApiEndpoint,
    ME: { method: 'GET', path: '/api/admin/auth/me', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    VALIDATE: { method: 'GET', path: '/api/admin/auth/validate', requiresAuth: true } as ApiEndpoint,
  },

  // Admin - Dashboard
  ADMIN: {
    DASHBOARD: { method: 'GET', path: '/api/v1/admin/dashboard', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    TEAM_STATS: { method: 'GET', path: '/api/v1/admin/teams/{id}/stats', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Admin - Teams
  ADMIN_TEAMS: {
    LIST: { method: 'GET', path: '/api/v1/admin/teams', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/teams/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET_BY_CODE: { method: 'GET', path: '/api/v1/admin/teams/code/{code}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/admin/teams', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE: { method: 'PUT', path: '/api/v1/admin/teams/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/admin/teams/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Admin - Players
  ADMIN_PLAYERS: {
    LIST: { method: 'GET', path: '/api/v1/admin/players', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/players/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/admin/players', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE: { method: 'PUT', path: '/api/v1/admin/players/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/admin/players/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Admin - Stadiums
  ADMIN_STADIUMS: {
    LIST: { method: 'GET', path: '/api/v1/admin/stadiums', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/stadiums/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/admin/stadiums', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE: { method: 'PUT', path: '/api/v1/admin/stadiums/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/admin/stadiums/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Admin - Matches
  ADMIN_MATCHES: {
    LIST: { method: 'GET', path: '/api/v1/admin/matches', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/matches/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    BY_TEAM: { method: 'GET', path: '/api/v1/admin/matches/team/{teamId}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/admin/matches', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE: { method: 'PUT', path: '/api/v1/admin/matches/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/admin/matches/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Admin - Inquiries
  ADMIN_INQUIRIES: {
    LIST: { method: 'GET', path: '/api/v1/admin/inquiries', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/inquiries/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    BY_STATUS: { method: 'GET', path: '/api/v1/admin/inquiries/status/{status}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    STATS: { method: 'GET', path: '/api/v1/admin/inquiries/stats', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    RECENT: { method: 'GET', path: '/api/v1/admin/inquiries/recent', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE_STATUS: { method: 'PUT', path: '/api/v1/admin/inquiries/{id}/status', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Public - Teams
  TEAMS: {
    LIST: { method: 'GET', path: '/api/v1/teams', requiresAuth: false } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/teams/{id}', requiresAuth: false } as ApiEndpoint,
    GET_BY_CODE: { method: 'GET', path: '/api/v1/teams/code/{code}', requiresAuth: false } as ApiEndpoint,
  },

  // Public - Players
  PLAYERS: {
    LIST: { method: 'GET', path: '/api/v1/players', requiresAuth: false } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/players/{id}', requiresAuth: false } as ApiEndpoint,
    ACTIVE: { method: 'GET', path: '/api/v1/players/active', requiresAuth: false } as ApiEndpoint,
  },

  // Public - Stadiums
  STADIUMS: {
    LIST: { method: 'GET', path: '/api/v1/stadiums', requiresAuth: false } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/stadiums/{id}', requiresAuth: false } as ApiEndpoint,
  },

  // Public - Matches
  MATCHES: {
    LIST: { method: 'GET', path: '/api/v1/matches', requiresAuth: false } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/matches/{id}', requiresAuth: false } as ApiEndpoint,
    BY_TEAM: { method: 'GET', path: '/api/v1/matches/team/{teamId}', requiresAuth: false } as ApiEndpoint,
    UPCOMING: { method: 'GET', path: '/api/v1/matches/team/{teamId}/upcoming', requiresAuth: false } as ApiEndpoint,
  },

  // Public - Inquiries
  INQUIRIES: {
    CREATE: { method: 'POST', path: '/api/v1/inquiries', requiresAuth: false } as ApiEndpoint,
    BY_EMAIL: { method: 'GET', path: '/api/v1/inquiries/email/{email}', requiresAuth: false } as ApiEndpoint,
  },

  // Hero Slides
  HERO_SLIDES: {
    ACTIVE: { method: 'GET', path: '/api/v1/hero-slides/team/{teamId}/active', requiresAuth: false } as ApiEndpoint,
    LIST: { method: 'GET', path: '/api/v1/hero-slides/team/{teamId}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/hero-slides/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/hero-slides/team/{teamId}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE: { method: 'PUT', path: '/api/v1/hero-slides/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/hero-slides/{id}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE_SORT: { method: 'PUT', path: '/api/v1/hero-slides/sort', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },

  // Images
  IMAGES: {
    UPLOAD: { method: 'POST', path: '/api/v1/images/upload', requiresAuth: true } as ApiEndpoint,
    DELETE: { method: 'DELETE', path: '/api/v1/images/{filename}', requiresAuth: true } as ApiEndpoint,
  },

  // Tenants (Multi-tenant)
  TENANTS: {
    LIST: { method: 'GET', path: '/api/v1/admin/tenants', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    GET: { method: 'GET', path: '/api/v1/admin/tenants/{code}', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    DASHBOARD: { method: 'GET', path: '/api/v1/admin/tenants/{code}/dashboard', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    PLAYERS: { method: 'GET', path: '/api/v1/admin/tenants/{code}/players', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    STADIUMS: { method: 'GET', path: '/api/v1/admin/tenants/{code}/stadiums', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    UPDATE_SETTINGS: { method: 'PUT', path: '/api/v1/admin/tenants/{code}/settings', requiresAuth: true, isAdmin: true } as ApiEndpoint,
    CREATE: { method: 'POST', path: '/api/v1/admin/tenants', requiresAuth: true, isAdmin: true } as ApiEndpoint,
  },
} as const;

// URL 파라미터 치환 유틸리티
export function buildUrl(template: string, params: Record<string, string | number>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, String(value));
  }
  return url;
}

// 모든 엔드포인트 플래튼 (테스트용)
export function getAllEndpoints(): Array<{ name: string; endpoint: ApiEndpoint }> {
  const result: Array<{ name: string; endpoint: ApiEndpoint }> = [];
  
  function flatten(obj: any, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const name = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && 'method' in value) {
        result.push({ name, endpoint: value as ApiEndpoint });
      } else if (typeof value === 'object') {
        flatten(value, name);
      }
    }
  }
  
  flatten(API_ENDPOINTS);
  return result;
}