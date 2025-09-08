import { LoginResponse, AdminInfo, TokenValidationResponse } from '../types/auth';
import { buildApiUrl, handleApiError, createApiHeaders } from '../utils/api';
import { TokenStorage } from '../utils/storage';
import { Logger } from '../utils/logger';
import { API_ENDPOINTS, CONTENT_TYPES } from '../constants/api';
import { ERROR_MESSAGES } from '../constants/messages';

class AuthService {

  /**
   * 관리자 로그인
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_LOGIN), {
      method: 'POST',
      headers: createApiHeaders(CONTENT_TYPES.JSON),
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(handleApiError(errorData, ERROR_MESSAGES.LOGIN_FAILED));
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(handleApiError(data, ERROR_MESSAGES.LOGIN_FAILED));
    }

    const loginResponse = data.data;

    // 토큰 저장
    TokenStorage.setAccessToken(loginResponse.accessToken);
    TokenStorage.setRefreshToken(loginResponse.refreshToken);

    return loginResponse;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    const admin = await this.getCurrentAdmin().catch(() => null);

    try {
      if (admin) {
        await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_LOGOUT), {
          method: 'POST',
          headers: createApiHeaders(CONTENT_TYPES.JSON, TokenStorage.getAccessToken() || undefined),
          body: JSON.stringify({ username: admin.username }),
        });
      }
    } catch (error) {
      Logger.warn('Logout API call failed:', error);
    } finally {
      // 로컬 토큰 삭제
      TokenStorage.clearTokens();
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_REFRESH), {
      method: 'POST',
      headers: createApiHeaders(CONTENT_TYPES.JSON),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      TokenStorage.clearTokens();
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    const data = await response.json();
    if (!data.success) {
      TokenStorage.clearTokens();
      throw new Error(handleApiError(data, ERROR_MESSAGES.TOKEN_EXPIRED));
    }

    const newAccessToken = data.data.accessToken;
    TokenStorage.setAccessToken(newAccessToken);

    return newAccessToken;
  }

  /**
   * 현재 관리자 정보 조회
   */
  async getCurrentAdmin(): Promise<AdminInfo> {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token');
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_ME), {
      method: 'GET',
      headers: createApiHeaders(CONTENT_TYPES.JSON, accessToken),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 토큰이 만료된 경우 갱신 시도
        try {
          const newToken = await this.refreshToken();
          // 새 토큰으로 다시 시도
          const retryResponse = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_ME), {
            method: 'GET',
            headers: createApiHeaders(CONTENT_TYPES.JSON, newToken),
          });

          if (!retryResponse.ok) {
            throw new Error('Failed to get admin info');
          }

          const retryData = await retryResponse.json();
          if (!retryData.success) {
            throw new Error(handleApiError(retryData, ERROR_MESSAGES.LOAD_FAILED));
          }

          return retryData.data;
        } catch (refreshError) {
          TokenStorage.clearTokens();
          throw new Error('Authentication failed');
        }
      }

      throw new Error('Failed to get admin info');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(handleApiError(data, ERROR_MESSAGES.LOAD_FAILED));
    }

    return data.data;
  }

  /**
   * 토큰 검증
   */
  async validateToken(token?: string): Promise<TokenValidationResponse> {
    const tokenToValidate = token || TokenStorage.getAccessToken();
    if (!tokenToValidate) {
      return { valid: false, admin: null };
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_VALIDATE), {
        method: 'POST',
        headers: createApiHeaders(CONTENT_TYPES.JSON),
        body: JSON.stringify({ token: tokenToValidate }),
      });

      if (!response.ok) {
        return { valid: false, admin: null };
      }

      const data = await response.json();
      if (!data.success) {
        return { valid: false, admin: null };
      }

      return data.data;
    } catch (error) {
      Logger.warn('Token validation failed:', error);
      return { valid: false, admin: null };
    }
  }

  /**
   * 인증된 API 요청을 위한 헤더 반환
   */
  getAuthHeaders(): HeadersInit {
    const token = TokenStorage.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return TokenStorage.hasValidToken();
  }

}

export const authService = new AuthService();
