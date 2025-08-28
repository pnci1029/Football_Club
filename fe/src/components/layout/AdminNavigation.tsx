import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigationItems = [
    { path: '/admin', label: '대시보드', icon: '📊' },
    { path: '/admin/players', label: '선수 관리', icon: '👤' },
    { path: '/admin/teams', label: '팀 관리', icon: '🏆' },
    { path: '/admin/stadiums', label: '구장 관리', icon: '🏟️' },
    { path: '/admin/matches', label: '경기 관리', icon: '⚽' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex-shrink-0">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚽</span>
                <span className="font-bold text-xl">FC 관리자</span>
              </div>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <div className="text-gray-300 text-sm">
                <span className="font-medium">{admin?.username || '관리자'}</span>님 환영합니다
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          
          {/* Mobile 사용자 정보 및 로그아웃 */}
          <div className="border-t border-gray-700 mt-3 pt-3">
            <div className="px-3 py-2 text-gray-300 text-sm">
              <span className="font-medium">{admin?.username || '관리자'}</span>님
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left justify-start text-gray-300 hover:text-white hover:bg-gray-700 px-3"
            >
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;