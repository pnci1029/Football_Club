import { LoginRequest, LoginResponse, AdminInfo, TokenValidationResponse } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'football_admin_access_token';
  private readonly REFRESH_TOKEN_KEY = 'football_admin_refresh_token';

  /**
   * 관리자 로그인
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Login failed');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    const loginResponse = data.data;
    
    // 토큰 저장
    this.setAccessToken(loginResponse.accessToken);
    this.setRefreshToken(loginResponse.refreshToken);
    
    return loginResponse;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    const admin = await this.getCurrentAdmin().catch(() => null);
    
    try {
      if (admin) {
        await fetch(`${API_BASE_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ username: admin.username }),
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // 로컬 토큰 삭제
      this.clearTokens();
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    if (!data.success) {
      this.clearTokens();
      throw new Error(data.error?.message || 'Token refresh failed');
    }

    const newAccessToken = data.data.accessToken;
    this.setAccessToken(newAccessToken);
    
    return newAccessToken;
  }

  /**
   * 현재 관리자 정보 조회
   */
  async getCurrentAdmin(): Promise<AdminInfo> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 토큰이 만료된 경우 갱신 시도
        try {
          const newToken = await this.refreshToken();
          // 새 토큰으로 다시 시도
          const retryResponse = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });

          if (!retryResponse.ok) {
            throw new Error('Failed to get admin info');
          }

          const retryData = await retryResponse.json();
          if (!retryData.success) {
            throw new Error(retryData.error?.message || 'Failed to get admin info');
          }

          return retryData.data;
        } catch (refreshError) {
          this.clearTokens();
          throw new Error('Authentication failed');
        }
      }

      throw new Error('Failed to get admin info');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get admin info');
    }

    return data.data;
  }

  /**
   * 토큰 검증
   */
  async validateToken(token?: string): Promise<TokenValidationResponse> {
    const tokenToValidate = token || this.getAccessToken();
    if (!tokenToValidate) {
      return { valid: false, admin: null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.warn('Token validation failed:', error);
      return { valid: false, admin: null };
    }
  }

  /**
   * 인증된 API 요청을 위한 헤더 반환
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Private methods
  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

export const authService = new AuthService();