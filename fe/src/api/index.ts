/**
 * API 통합 인덱스 - 모든 API 모듈 중앙 관리
 */

// Core API infrastructure
export { api } from './client';
export { API_ENDPOINTS, buildUrl } from './endpoints';
export * from './types';

// API Modules
export { default as Admin } from './modules/admin';
export { default as Teams } from './modules/teams';
export { default as Players } from './modules/players';
export { default as Stadiums } from './modules/stadiums';
export { default as Matches } from './modules/matches';
export { default as Inquiries } from './modules/inquiries';
export { default as HeroSlides } from './modules/hero-slides';
export { default as Auth } from './modules/auth';
export { default as Images } from './modules/images';

// Individual API exports for specific use cases
export {
  adminDashboardApi,
  adminInquiriesApi,
  adminTenantsApi,
} from './modules/admin';

export {
  teamsApi,
  adminTeamsApi,
} from './modules/teams';

export {
  playersApi,
  adminPlayersApi,
} from './modules/players';

export {
  stadiumsApi,
  adminStadiumsApi,
} from './modules/stadiums';

export {
  matchesApi,
  adminMatchesApi,
} from './modules/matches';

export {
  inquiriesApi,
} from './modules/inquiries';

export {
  heroSlidesApi,
  adminHeroSlidesApi,
} from './modules/hero-slides';

export {
  authApi,
} from './modules/auth';

export {
  imagesApi,
} from './modules/images';

// Unified API object for easy access
export const API = {
  // Core
  client: () => import('./client').then(m => m.api),
  endpoints: () => import('./endpoints').then(m => m.API_ENDPOINTS),

  // Modules
  Admin: () => import('./modules/admin').then(m => m.default),
  Teams: () => import('./modules/teams').then(m => m.default),
  Players: () => import('./modules/players').then(m => m.default),
  Stadiums: () => import('./modules/stadiums').then(m => m.default),
  Matches: () => import('./modules/matches').then(m => m.default),
  Inquiries: () => import('./modules/inquiries').then(m => m.default),
  HeroSlides: () => import('./modules/hero-slides').then(m => m.default),
  Auth: () => import('./modules/auth').then(m => m.default),
  Images: () => import('./modules/images').then(m => m.default),
};