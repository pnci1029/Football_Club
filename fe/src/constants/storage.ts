/**
 * 스토리지 관련 상수 정의
 */

/**
 * LocalStorage 키 상수
 */
export const STORAGE_KEYS = {
  // 인증 토큰
  ACCESS_TOKEN: 'football_admin_access_token',
  REFRESH_TOKEN: 'football_admin_refresh_token',
  
  // 사용자 정보
  USER_INFO: 'football_user_info',
  ADMIN_INFO: 'football_admin_info',
  
  // 설정
  THEME: 'football_theme',
  LANGUAGE: 'football_language',
  
  // 임시 데이터
  FORM_DRAFT: 'football_form_draft',
  SELECTED_TEAM: 'football_selected_team',
} as const;

/**
 * SessionStorage 키 상수
 */
export const SESSION_KEYS = {
  CURRENT_PAGE: 'football_current_page',
  SEARCH_FILTERS: 'football_search_filters',
  TEMP_DATA: 'football_temp_data',
} as const;