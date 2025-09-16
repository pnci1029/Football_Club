/**
 * 스토리지 관련 유틸리티 함수
 */

import { STORAGE_KEYS } from '../constants/storage';

/**
 * LocalStorage 유틸리티
 */
export class LocalStorageUtil {
  /**
   * 값 저장
   */
  static setItem(key: string, value: unknown): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
    }
  }

  /**
   * 값 조회
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }

      // JSON 파싱 시도
      try {
        return JSON.parse(item);
      } catch {
        // 문자열인 경우 그대로 반환
        return item as unknown as T;
      }
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return defaultValue || null;
    }
  }

  /**
   * 값 삭제
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
    }
  }

  /**
   * 모든 키 삭제
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }

  /**
   * 키 존재 여부 확인
   */
  static hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('LocalStorage hasItem error:', error);
      return false;
    }
  }
}

/**
 * SessionStorage 유틸리티
 */
export class SessionStorageUtil {
  /**
   * 값 저장
   */
  static setItem(key: string, value: unknown): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('SessionStorage setItem error:', error);
    }
  }

  /**
   * 값 조회
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }

      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error('SessionStorage getItem error:', error);
      return defaultValue || null;
    }
  }

  /**
   * 값 삭제
   */
  static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('SessionStorage removeItem error:', error);
    }
  }

  /**
   * 모든 키 삭제
   */
  static clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('SessionStorage clear error:', error);
    }
  }

  /**
   * 키 존재 여부 확인
   */
  static hasItem(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error('SessionStorage hasItem error:', error);
      return false;
    }
  }
}

/**
 * 토큰 관리 유틸리티
 */
export class TokenStorage {
  /**
   * Access Token 저장
   */
  static setAccessToken(token: string): void {
    LocalStorageUtil.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Access Token 조회
   */
  static getAccessToken(): string | null {
    return LocalStorageUtil.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Refresh Token 저장
   */
  static setRefreshToken(token: string): void {
    LocalStorageUtil.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Refresh Token 조회
   */
  static getRefreshToken(): string | null {
    return LocalStorageUtil.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * 모든 토큰 삭제
   */
  static clearTokens(): void {
    LocalStorageUtil.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    LocalStorageUtil.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * 토큰 존재 여부 확인
   */
  static hasValidToken(): boolean {
    return Boolean(TokenStorage.getAccessToken());
  }
}