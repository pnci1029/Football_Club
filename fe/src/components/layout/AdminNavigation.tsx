import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // 현재 페이지가 서브메뉴에 있으면 자동으로 확장
  React.useEffect(() => {
    if (location.pathname === '/admin/hero-slides' && !expandedItems.includes('/admin/teams')) {
      setExpandedItems(prev => [...prev, '/admin/teams']);
    }
  }, [location.pathname, expandedItems]);

  const navigationItems = [
    { path: '/admin', label: '대시보드', icon: '📊' },
    { path: '/admin/players', label: '선수 관리', icon: '👤' },
    { 
      path: '/admin/teams', 
      label: '팀 관리', 
      icon: '🏆',
      subItems: [
        { path: '/admin/teams', label: '팀 목록', icon: '🏆' },
        { path: '/admin/hero-slides', label: '메인 슬라이드', icon: '🎬' },
      ]
    },
    { path: '/admin/stadiums', label: '구장 관리', icon: '🏟️' },
    { path: '/admin/matches', label: '경기 관리', icon: '⚽' },
  ];

  const isActive = (path: string, subItems?: any[]) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    if (subItems) {
      return subItems.some(subItem => location.pathname === subItem.path || location.pathname.startsWith(subItem.path));
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex-shrink-0 touch-manipulation">
              <div className="flex items-center">
                <span className="text-lg sm:text-2xl mr-2">⚽</span>
                <span className="font-bold text-base sm:text-xl">FC 관리자</span>
              </div>
            </Link>
            {/* 데스크톱 메뉴 */}
            <div className="hidden lg:block">
              <div className="ml-8 lg:ml-10 flex items-baseline space-x-3 lg:space-x-4">
                {navigationItems.map((item: any) => (
                  <div key={item.path} className="relative">
                    {item.subItems ? (
                      <div className="group relative">
                        <button
                          className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation flex items-center ${
                            isActive(item.path, item.subItems)
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                          }`}
                        >
                          <span className="mr-1 lg:mr-2">{item.icon}</span>
                          {item.label}
                          <span className="ml-1">▼</span>
                        </button>
                        
                        {/* 드롭다운 메뉴 */}
                        <div className="absolute left-0 top-full mt-1 w-48 bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                          <div className="py-1">
                            {item.subItems.map((subItem: any) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                  location.pathname === subItem.path
                                    ? 'bg-gray-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                }`}
                              >
                                <span className="mr-2">{subItem.icon}</span>
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                          isActive(item.path)
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                        }`}
                      >
                        <span className="mr-1 lg:mr-2">{item.icon}</span>
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 데스크톱 사용자 영역 */}
          <div className="hidden lg:block">
            <div className="ml-4 flex items-center lg:ml-6 space-x-3 lg:space-x-4">
              <div className="text-gray-300 text-xs lg:text-sm hidden xl:block">
                <span className="font-medium">{admin?.username || '관리자'}</span>님 환영합니다
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-300 hover:text-white hover:bg-gray-700 active:bg-gray-600 touch-manipulation text-xs lg:text-sm px-2 lg:px-3"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일/태블릿 메뉴 - 최적화 */}
      <div className="lg:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item: any) => (
            <div key={item.path}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-3 sm:py-2 rounded-md text-base sm:text-sm font-medium transition-colors duration-200 touch-manipulation ${
                      isActive(item.path, item.subItems)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-lg sm:text-base">{item.icon}</span>
                      {item.label}
                    </div>
                    <span className={`transform transition-transform ${expandedItems.includes(item.path) ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {expandedItems.includes(item.path) && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.subItems.map((subItem: any) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                            location.pathname === subItem.path
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                          }`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`block px-3 py-3 sm:py-2 rounded-md text-base sm:text-sm font-medium transition-colors duration-200 touch-manipulation ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                  }`}
                >
                  <span className="mr-2 text-lg sm:text-base">{item.icon}</span>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          
          {/* 모바일/태블릿 사용자 영역 - 최적화 */}
          <div className="border-t border-gray-700 mt-3 pt-3">
            <div className="px-3 py-2 text-gray-300 text-sm">
              <span className="font-medium">{admin?.username || '관리자'}</span>님
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left justify-start text-gray-300 hover:text-white hover:bg-gray-700 active:bg-gray-600 px-3 py-3 sm:py-2 text-base sm:text-sm touch-manipulation"
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