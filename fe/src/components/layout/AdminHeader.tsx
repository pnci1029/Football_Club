import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // AuthContext의 logout 사용 (로그아웃 후 자동으로 리다이렉트됨)
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - 모바일 최적화 */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 touch-manipulation"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">관리자 대시보드</h2>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">멀티테넌트 축구 동호회 관리 시스템</p>
          </div>
        </div>

        {/* Right Section - 모바일 최적화 */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-600">{currentTime}</p>
            <p className="text-xs text-gray-500">시스템 관리자</p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>

          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-semibold">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
