import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    
    try {
      if (authService.isAuthenticated()) {
        const adminInfo = await authService.getCurrentAdmin();
        setAdmin(adminInfo);
      }
    } catch (error) {
      console.warn('Failed to get admin info:', error);
      // 인증 실패 시 토큰 정리
      authService.logout();
      setAdmin(null);
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
    setIsLoading(true);
    
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setAdmin(null);
      setIsLoading(false);
      
      // 관리자 페이지에서 로그아웃한 경우 로그인 페이지로 리다이렉트
      const currentHost = window.location.hostname;
      if (currentHost.startsWith('admin.')) {
        window.location.href = '/admin/login';
      }
    }
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
      throw error;
    }
  };

  const isAuthenticated = admin !== null;

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