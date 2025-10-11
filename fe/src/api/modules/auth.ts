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
import { AdminInfo, LoginUserResponse, AuthError } from '../../types/interfaces/auth';
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

  // 새로운 관리자 로그인 (서브도메인 제한 포함)
  adminLogin: (data: LoginRequest): Promise<LoginResponse> =>
    api.callEndpoint<LoginResponse>(API_ENDPOINTS.ADMIN.AUTH.LOGIN, undefined, data as LoginRequest & Record<string, unknown>),

  // 관리자 토큰 검증
  adminVerify: (): Promise<ApiResponse<AdminInfo>> =>
    api.callEndpoint<ApiResponse<AdminInfo>>(API_ENDPOINTS.ADMIN.AUTH.VERIFY),

  // 관리자 로그아웃
  adminLogout: (): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN.AUTH.LOGOUT),
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

  // 새로운 관리자 로그인 메서드 (서브도메인 제한 포함)
  async loginAdmin(credentials: LoginRequest): Promise<LoginUserResponse> {
    const response = await authApi.adminLogin(credentials);

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

    // 토큰을 TokenManager로 저장 (관리자용 키 사용)
    localStorage.setItem('adminAccessToken', loginData.accessToken);
    if (loginData.refreshToken) {
      localStorage.setItem('adminRefreshToken', loginData.refreshToken);
    }

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
    try {
      await authApi.adminLogout();
    } finally {
      // 관리자 토큰 제거
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminInfo');
    }
  },

  async verifyAdmin(): Promise<AdminInfo | null> {
    try {
      const response = await authApi.adminVerify();
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to verify admin:', error);
      return null;
    }
  },

  // 관리자 인증 상태 확인
  isAdminAuthenticated(): boolean {
    return !!localStorage.getItem('adminAccessToken');
  },

  getAdminToken(): string | null {
    return localStorage.getItem('adminAccessToken');
  },
};

export default Auth;
