import { LoginResponse, AdminInfo, TokenValidationResponse } from '../types/auth';
import { Logger } from '../utils/logger';
import { ERROR_MESSAGES } from '../constants/messages';
import { Auth } from '../api';
import { LoginUserResponse } from '../types/interfaces/auth';
import { LoginRequest } from '../api/types';

class AuthService {

  /**
   * 관리자 로그인
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const credentials: LoginRequest = { username, password };
      const loginData: LoginUserResponse = await Auth.loginUser(credentials);


      // loginData.admin이 undefined인 경우 처리
      if (!loginData.admin) {
        console.error('Admin data is missing from login response');
        throw new Error('Admin information not found in login response');
      }

      const admin: AdminInfo = {
        id: typeof loginData.admin.id === 'string' ? parseInt(loginData.admin.id) || 0 : loginData.admin.id,
        username: loginData.admin.email,
        role: loginData.admin.role,
        email: loginData.admin.email,
        name: loginData.admin.name,
        createdAt: loginData.admin.createdAt,
        lastLoginAt: loginData.admin.updatedAt
      };

      return {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken || '',
        admin
      };
    } catch (error) {
      console.error('로그인 실패:', error);
      console.error('에러 상세:', error);
      throw new Error(ERROR_MESSAGES.LOGIN_FAILED);
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await Auth.logoutUser();
    } catch (error) {
      Logger.warn('Logout API call failed:', error);
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string> {
    try {
      const newToken = await Auth.refreshToken();
      if (!newToken) {
        throw new Error('Token refresh failed');
      }
      return newToken;
    } catch (error) {
      Auth.clearTokens();
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
  }

  /**
   * 현재 관리자 정보 조회
   */
  async getCurrentAdmin(): Promise<AdminInfo> {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) {
        throw new Error('No user found');
      }

      const admin: AdminInfo = {
        id: typeof user.id === 'string' ? parseInt(user.id) || 0 : user.id,
        username: user.email, // email을 username으로 사용
        role: user.role || 'admin',
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.updatedAt
      };

      return admin;
    } catch (error) {
      console.error('현재 관리자 정보 조회 실패:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * 토큰 검증
   */
  async validateToken(token?: string): Promise<TokenValidationResponse> {
    try {
      // 토큰 유효성 자동 확인
      const validToken = await Auth.ensureValidToken();
      if (validToken) {
        const user = await Auth.getCurrentUser();
        if (user) {
          const admin: AdminInfo = {
            id: typeof user.id === 'string' ? parseInt(user.id) || 0 : user.id,
            username: user.email,
            role: user.role || 'admin',
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            lastLoginAt: user.updatedAt
          };
          return { valid: true, admin };
        }
      }
      return { valid: false, admin: null };
    } catch (error) {
      Logger.warn('Token validation failed:', error);
      return { valid: false, admin: null };
    }
  }

  /**
   * 인증된 API 요청을 위한 헤더 반환
   */
  getAuthHeaders(): HeadersInit {
    const token = Auth.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return Auth.isAuthenticated();
  }

  /**
   * 토큰 관리 (새로운 편의 메서드들)
   */
  getAccessToken(): string | null {
    return Auth.getAccessToken();
  }

  getRefreshToken(): string | null {
    return Auth.getRefreshToken();
  }

  clearTokens(): void {
    Auth.clearTokens();
  }

}

export const authService = new AuthService();
