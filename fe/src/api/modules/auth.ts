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
import { AdminInfo, LoginUserResponse } from '../../types/interfaces/auth';
import { TokenManager } from '../../utils/tokenManager';

export const authApi = {
  // 로그인
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, undefined, data as LoginRequest & Record<string, unknown>),

  // 회원가입
  register: (data: RegisterRequest): Promise<ApiResponse<User>> =>
    api.callEndpoint<ApiResponse<User>>(API_ENDPOINTS.AUTH.REGISTER, undefined, data as RegisterRequest & Record<string, unknown>),

  // 로그아웃
  logout: (): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.AUTH.LOGOUT),

  // 내 정보 조회
  getMe: (): Promise<User> =>
    api.callEndpoint<User>(API_ENDPOINTS.AUTH.ME),

  // 토큰 새로고침
  refresh: (): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH),

  // 관리자 토큰 검증 (기본 AUTH.ME와 동일)
  adminVerify: (): Promise<ApiResponse<AdminInfo>> =>
    api.callEndpoint<ApiResponse<AdminInfo>>(API_ENDPOINTS.AUTH.ME),

  // 관리자 로그인 (서브도메인 지원)
  adminLogin: (data: LoginRequest & { teamCode?: string }): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, undefined, data as LoginRequest & { teamCode?: string } & Record<string, unknown>),
};

export const Auth = {
  // Auth API
  api: authApi,

  // 편의 메서드들
  async loginUser(credentials: LoginRequest): Promise<LoginUserResponse> {
    const response = await authApi.login(credentials);


    // API 응답이 ApiResponse<data> 형태인 경우 처리
    interface ApiResponseWrapper {
      success: boolean;
      data: {
        accessToken: string;
        refreshToken?: string;
        admin: AdminInfo;
      };
      message: string | null;
      error: unknown;
      timestamp: string;
    }

    let loginData: { accessToken: string; refreshToken?: string; admin: AdminInfo };
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiResponseWrapper;
      loginData = wrappedResponse.data;
    } else {
      loginData = response as unknown as { accessToken: string; refreshToken?: string; admin: AdminInfo };
    }

    // 토큰을 TokenManager로 저장
    TokenManager.setTokens(loginData.accessToken, loginData.refreshToken);

    // admin 정보 확인
    if (!loginData.admin) {
      throw new Error('Admin information not found in login response');
    }

    return {
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      admin: loginData.admin,
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
      TokenManager.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await authApi.getMe();
    } catch (error: unknown) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // 토큰 관리 (TokenManager로 위임)
  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  },

  getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  },

  clearTokens(): void {
    TokenManager.clearTokens();
  },

  isAuthenticated(): boolean {
    return TokenManager.isLoggedIn();
  },

  // 관리자 로그인 (서브도메인 지원)
  async loginAdmin(credentials: LoginRequest & { teamCode?: string }): Promise<LoginUserResponse> {
    const response = await authApi.adminLogin(credentials);

    // API 응답이 ApiResponse<data> 형태인 경우 처리
    interface AdminApiResponseWrapper {
      success: boolean;
      data: {
        accessToken: string;
        refreshToken?: string;
        admin: AdminInfo;
      };
      message: string | null;
      error: unknown;
      timestamp: string;
    }

    let loginData: { accessToken: string; refreshToken?: string; admin: AdminInfo };
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as AdminApiResponseWrapper;
      loginData = wrappedResponse.data;
    } else {
      loginData = response as unknown as { accessToken: string; refreshToken?: string; admin: AdminInfo };
    }

    // 토큰을 TokenManager로 저장
    TokenManager.setTokens(loginData.accessToken, loginData.refreshToken);

    // admin 정보 확인
    if (!loginData.admin) {
      throw new Error('Admin information not found in login response');
    }

    return {
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      admin: loginData.admin,
    };
  },

  async logoutAdmin(): Promise<void> {
    return this.logoutUser();
  },

  async verifyAdmin(): Promise<AdminInfo | null> {
    try {
      const response = await authApi.adminVerify();
      console.log('Admin verify response:', response);
      
      // ApiResponse 구조인 경우 data 필드 접근
      if (response && typeof response === 'object' && 'data' in response) {
        const apiResponse = response as ApiResponse<AdminInfo>;
        return apiResponse.data;
      }
      
      // 직접 AdminInfo 객체인 경우
      return response as AdminInfo;
    } catch (error: unknown) {
      console.error('Failed to verify admin:', error);
      return null;
    }
  },

  // 관리자 인증 상태 확인
  isAdminAuthenticated(): boolean {
    return TokenManager.isLoggedIn();
  },

  getAdminToken(): string | null {
    return TokenManager.getAccessToken();
  },
};

export default Auth;
