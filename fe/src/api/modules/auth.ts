/**
 * Auth API 모듈 - 인증 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ApiResponse,
} from '../types';

export const authApi = {
  // 로그인
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, undefined, data),

  // 회원가입
  register: (data: RegisterRequest): Promise<ApiResponse<User>> =>
    api.callEndpoint<ApiResponse<User>>(API_ENDPOINTS.AUTH.REGISTER, undefined, data),

  // 로그아웃
  logout: (): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.AUTH.LOGOUT),

  // 내 정보 조회
  getMe: (): Promise<User> =>
    api.callEndpoint<User>(API_ENDPOINTS.AUTH.ME),

  // 토큰 새로고침
  refresh: (): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH),
};

export const Auth = {
  // Auth API
  api: authApi,

  // 편의 메서드들
  async loginUser(credentials: LoginRequest): Promise<{
    accessToken: string;
    refreshToken?: string;
    admin: any;
  }> {
    const response = await authApi.login(credentials) as any;
    
    // 토큰을 localStorage에 저장
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      admin: response.data.admin,
    };
  },

  async registerUser(userData: RegisterRequest): Promise<User> {
    const response = await authApi.register(userData);
    return response.data;
  },

  async logoutUser(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      // 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await authApi.getMe();
    } catch (error: any) {
      // 401 인증 실패 시에만 토큰 제거 (네트워크 오류 등은 제외)
      if (error.response?.status === 401) {
        console.warn('Authentication failed, clearing tokens');
        this.clearTokens();
      } else {
        console.error('Failed to get current user:', error);
      }
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token available');
        this.clearTokens();
        return null;
      }

      const response = await authApi.refresh();
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        console.log('Token refreshed successfully');
        return response.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // 리프레시 실패 시에만 토큰 클리어
      this.clearTokens();
      return null;
    }
  },

  // 토큰 관리
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // 자동 토큰 새로고침
  async ensureValidToken(): Promise<string | null> {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    // JWT 토큰 만료 시간 체크 (간단한 구현)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        // 잘못된 JWT 형식이면 새로고침 시도
        console.warn('Invalid JWT format, refreshing token');
        return await this.refreshToken();
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      // 토큰이 5분 이내에 만료되면 새로고침
      if (payload.exp && payload.exp - currentTime < 300) {
        console.log('Token expiring soon, refreshing');
        return await this.refreshToken();
      }
      
      return token;
    } catch (error) {
      // 토큰 파싱 실패 시 새로고침 시도
      console.warn('Token parsing failed, refreshing token:', error);
      return await this.refreshToken();
    }
  },
};

export default Auth;