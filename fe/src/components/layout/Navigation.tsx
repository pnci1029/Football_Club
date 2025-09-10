import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeam } from '../../contexts/TeamContext';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTeam, isLoading } = useTeam();
  const location = useLocation();

  const menuItems = [
    { name: '홈', href: '/' },
    { name: '선수', href: '/players' },
    { name: '구장', href: '/stadiums' },
    { name: '경기', href: '/matches' },
  ];

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="w-24 h-6 sm:w-32 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* 로고 및 팀명 - 모바일 최적화 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity touch-manipulation">
              {currentTeam?.logoUrl ? (
                <img 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
                  src={currentTeam.logoUrl} 
                  alt={`${currentTeam.name} 로고`}
                />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">FC</span>
                </div>
              )}
              <div className="ml-2 sm:ml-3">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {currentTeam?.name || 'Football Club'}
                </h1>
                {currentTeam?.description && (
                  <p className="text-xs text-gray-500 truncate hidden sm:block">{currentTeam.description}</p>
                )}
              </div>
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium touch-manipulation ${
                  location.pathname === item.href 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* 모바일 메뉴 버튼 - 터치 최적화 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 touch-manipulation"
              aria-expanded={isOpen ? "true" : "false"}
              aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              <span className="sr-only">{isOpen ? "메뉴 닫기" : "메뉴 열기"}</span>
              {!isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 - 터치 최적화 */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-3 pt-3 pb-4 space-y-2 bg-white border-t border-gray-100 shadow-sm">
          {menuItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation ${
                location.pathname === item.href 
                  ? 'text-primary-700 bg-primary-50 border border-primary-100 shadow-sm' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 active:bg-primary-50'
              }`}
              onClick={() => setIsOpen(false)}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
              }}
            >
              <span className="flex-1">{item.name}</span>
              {location.pathname === item.href && (
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;