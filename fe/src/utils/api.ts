/**
 * API 관련 유틸리티 함수
 */

import { getApiBaseUrl, CONTENT_TYPES } from '../constants/api';

/**
 * API 요청을 위한 전체 URL 생성
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

/**
 * Authorization 헤더 생성
 */
export const createAuthHeader = (token: string): Record<string, string> => {
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * 기본 API 헤더 생성
 */
export const createApiHeaders = (contentType: string = CONTENT_TYPES.JSON, token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * API 응답 에러 처리
 */
export const handleApiError = (error: any, defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'): string => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * 페이지네이션 쿼리 파라미터 생성
 */
export const buildPaginationParams = (page: number = 0, size: number = 10): string => {
  return `?page=${page}&size=${size}`;
};

/**
 * 검색 쿼리 파라미터 생성
 */
export const buildSearchParams = (params: Record<string, string | number>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const paramString = searchParams.toString();
  return paramString ? `?${paramString}` : '';
};

/**
 * API 응답 성공 여부 확인
 */
export const isApiSuccess = (response: any): boolean => {
  return response && response.success === true;
};

/**
 * API 응답에서 데이터 추출
 */
export const extractApiData = <T>(response: any): T => {
  return response.data;
};