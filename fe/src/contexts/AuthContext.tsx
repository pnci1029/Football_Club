import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminInfo, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);

    try {
      // 토큰 존재 여부를 직접 체크
      const hasToken = localStorage.getItem('accessToken');

      if (hasToken && authService.isAuthenticated()) {
        console.log('AuthContext: Token exists, getting admin info');
        const adminInfo = await authService.getCurrentAdmin();
        setAdmin(adminInfo);
        console.log('AuthContext: Admin info loaded:', adminInfo);
      } else {
        console.log('AuthContext: No token found or authentication failed');
        authService.clearTokens();
        setAdmin(null);
      }
    } catch (error) {
      console.warn('AuthContext: Failed to get admin info:', error);
      // 인증 실패 시 토큰 정리
      authService.logout();
      setAdmin(null);

      // useEffect에서 리다이렉트를 처리하므로 여기서는 제거
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Loading finished, admin:', admin !== null);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const loginResponse = await authService.login(username, password);
      setAdmin(loginResponse.admin);
    } catch (error) {
      setAdmin(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('AuthContext: logout() called');

    // 먼저 상태를 즉시 초기화
    setAdmin(null);
    setIsLoading(false);

    try {
      await authService.logout();
      console.log('AuthContext: authService.logout() completed');
    } catch (error) {
      console.warn('Logout error:', error);
    }

    // 강제로 토큰 정리 (혹시 남아있을 수 있는 경우)
    authService.clearTokens();
    console.log('AuthContext: tokens cleared, admin set to null');

    // useEffect에서 리다이렉트를 처리하므로 여기서는 제거
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      // 토큰 갱신 후 관리자 정보 다시 불러오기
      const adminInfo = await authService.getCurrentAdmin();
      setAdmin(adminInfo);
    } catch (error) {
      console.warn('Token refresh failed:', error);
      setAdmin(null);
      authService.logout();

      // useEffect에서 리다이렉트를 처리하므로 여기서는 제거

      throw error;
    }
  };

  const isAuthenticated = admin !== null;

  // admin 상태 변화를 모니터링하고 토큰 없을 때 상태 동기화
  useEffect(() => {
    const hasToken = localStorage.getItem('accessToken');

    // 토큰이 없는데 admin이 있다면 상태 불일치 → 수정
    if (!hasToken && admin) {
      console.log('AuthContext: Token missing but admin exists, clearing admin state');
      setAdmin(null);
      return; // 상태 업데이트 후 리렌더링을 위해 early return
    }

    // 인증되지 않았고 로딩중이 아닐 때만 리다이렉트
    if (!isAuthenticated && !isLoading) {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [admin, isAuthenticated, isLoading, location.pathname, navigate]);

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
