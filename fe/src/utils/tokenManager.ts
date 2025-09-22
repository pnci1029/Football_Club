/**
 * 토큰 관리 유틸리티 - 모든 토큰 관련 로직을 중앙화
 */

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  
  // 토큰 저장
  static setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // 액세스 토큰 가져오기
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // 리프레시 토큰 가져오기
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 토큰 삭제
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // 로그인 상태 확인 (리프레시 토큰 기준)
  static isLoggedIn(): boolean {
    return !!this.getRefreshToken();
  }

  // 액세스 토큰 유효성 확인
  static isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      // 토큰이 만료되지 않았으면 유효
      return payload.exp && payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // 토큰 갱신 필요 여부 확인
  static needsRefresh(): boolean {
    const isLoggedIn = this.isLoggedIn();
    const isAccessValid = this.isAccessTokenValid();
    const result = isLoggedIn && !isAccessValid;
    
    console.log('🔍 TokenManager.needsRefresh:', {
      isLoggedIn,
      isAccessValid,
      result,
      accessToken: this.getAccessToken()?.substring(0, 20) + '...',
      refreshToken: this.getRefreshToken()?.substring(0, 20) + '...'
    });
    
    return result;
  }
}