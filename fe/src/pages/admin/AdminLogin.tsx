import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/common';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인한 경우 관리자 대시보드로 리다이렉트 (토큰도 확인)
  useEffect(() => {
    const hasToken = localStorage.getItem('accessToken');
    if (isAuthenticated && hasToken && !isLoading) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(formData.username, formData.password);

      // 로그인 성공 시 navigate는 useEffect에서 처리됨
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 입력 시 에러 메시지 초기화
    if (error) setError('');
  };

  // 로딩 중이거나 이미 인증된 경우 로딩 화면 표시
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">⚽</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Football Club 관리자 시스템에 로그인하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <Card padding="lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* 사용자명 입력 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="관리자 사용자명을 입력하세요"
                disabled={isSubmitting}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="비밀번호를 입력하세요"
                disabled={isSubmitting}
              />
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

        </Card>

        {/* 푸터 */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Football Club Management System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            관리자만 접근할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
