import { LoginResponse, AdminInfo, TokenValidationResponse } from '../types/auth';
import { AdminRole } from '../types/enums';
import { Logger } from '../utils/logger';
import { ERROR_MESSAGES } from '../constants/messages';
import { Auth } from '../api';
import { LoginUserResponse } from '../types/interfaces/auth';
import { LoginRequest } from '../api/types';
import { TokenManager } from '../utils/tokenManager';

class AuthService {

  /**
   * 문자열 role을 AdminRole enum으로 변환
   */
  private mapStringToAdminRole(role: string): AdminRole {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return AdminRole.SUPER_ADMIN;
      case 'MASTER':
        return AdminRole.MASTER;
      case 'ADMIN':
      default:
        return AdminRole.ADMIN;
    }
  }

  /**
   * 관리자 로그인
   */
  async login(username: string, password: string, teamCode?: string): Promise<LoginResponse> {
    try {
      const credentials: LoginRequest & { teamCode?: string } = { username, password, teamCode };
      const loginData: LoginUserResponse = await Auth.loginAdmin(credentials);


      // loginData.admin이 undefined인 경우 처리
      if (!loginData.admin) {
        console.error('Admin data is missing from login response');
        throw new Error('Admin information not found in login response');
      }


      const admin: AdminInfo = {
        id: typeof loginData.admin.id === 'string' ? parseInt(loginData.admin.id) || 0 : loginData.admin.id,
        username: loginData.admin.email,
        role: this.mapStringToAdminRole(loginData.admin.role),
        adminLevel: loginData.admin.adminLevel,
        teamSubdomain: loginData.admin.teamSubdomain,
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
      await Auth.logoutAdmin();
    } catch (error) {
      Logger.warn('Logout API call failed:', error);
    }
  }

  // 토큰 갱신은 API 클라이언트에서 자동으로 처리

  /**
   * 현재 관리자 정보 조회
   */
  async getCurrentAdmin(): Promise<AdminInfo> {
    try {
      const admin = await Auth.verifyAdmin();
      if (!admin) {
        throw new Error('No admin found');
      }
      
      // 타입 변환: interfaces/auth.AdminInfo -> auth.AdminInfo
      return {
        id: typeof admin.id === 'string' ? parseInt(admin.id) || 0 : admin.id,
        username: admin.email, // email을 username으로 사용
        role: this.mapStringToAdminRole(admin.role),
        adminLevel: admin.adminLevel,
        teamSubdomain: admin.teamSubdomain,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
        lastLoginAt: admin.updatedAt
      };
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
      // 토큰 유효성 확인
      if (TokenManager.isLoggedIn()) {
        const adminData = await Auth.verifyAdmin();
        if (adminData) {
          // 타입 변환: interfaces/auth.AdminInfo -> auth.AdminInfo
          const admin: AdminInfo = {
            id: typeof adminData.id === 'string' ? parseInt(adminData.id) || 0 : adminData.id,
            username: adminData.email, // email을 username으로 사용
            role: this.mapStringToAdminRole(adminData.role),
            adminLevel: adminData.adminLevel,
            teamSubdomain: adminData.teamSubdomain,
            email: adminData.email,
            name: adminData.name,
            createdAt: adminData.createdAt,
            lastLoginAt: adminData.updatedAt
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
    const token = TokenManager.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 로그인 상태 확인 (TokenManager 기준)
   */
  isAuthenticated(): boolean {
    return TokenManager.isLoggedIn();
  }

  /**
   * 토큰 관리 (TokenManager로 위임)
   */
  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  getRefreshToken(): string | null {
    return TokenManager.getRefreshToken();
  }

  clearTokens(): void {
    TokenManager.clearTokens();
  }

}

export const authService = new AuthService();
