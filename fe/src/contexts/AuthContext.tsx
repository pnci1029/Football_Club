import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminInfo, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { TokenManager } from '../utils/tokenManager';

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
      // 로그인 상태인지 확인 (리프레시 토큰 기준)
      if (TokenManager.isLoggedIn()) {
        try {
          const adminInfo = await authService.getCurrentAdmin();
          setAdmin(adminInfo);
        } catch (error) {
          console.error('getCurrentAdmin 실패:', error);
          // API 실패 시 토큰 정리하고 재로그인 유도
          TokenManager.clearTokens();
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('checkAuthStatus 에러:', error);
    } finally {
      setIsLoading(false);
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
    // 먼저 상태를 즉시 초기화
    setAdmin(null);
    setIsLoading(false);

    try {
      await authService.logout();
    } catch (error) {
      // Logout error ignored
    }

    // 강제로 토큰 정리 (혹시 남아있을 수 있는 경우)
    authService.clearTokens();

    // useEffect에서 리다이렉트를 처리하므로 여기서는 제거
  };

  // 토큰 갱신은 API 클라이언트에서 자동으로 처리

  const isAuthenticated = TokenManager.isLoggedIn();

  // admin 상태 변화를 모니터링하고 리다이렉트 처리
  useEffect(() => {
    // 인증되지 않았고 로딩중이 아닐 때만 리다이렉트
    if (!isAuthenticated && !isLoading) {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
