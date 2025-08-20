import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeam } from '../../contexts/TeamContext';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTeam, isLoading } = useTeam();
  const location = useLocation();

  const menuItems = [
    { name: '홈', href: '/', icon: '🏠' },
    { name: '선수단', href: '/players', icon: '⚽' },
    { name: '구장정보', href: '/stadiums', icon: '🏟️' },
    { name: '경기일정', href: '/matches', icon: '📅' },
  ];

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 팀명 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              {currentTeam?.logoUrl ? (
                <img 
                  className="h-10 w-10 rounded-full object-cover" 
                  src={currentTeam.logoUrl} 
                  alt={`${currentTeam.name} 로고`}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚽</span>
                </div>
              )}
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {currentTeam?.name || 'Football Club'}
                </h1>
                {currentTeam?.description && (
                  <p className="text-xs text-gray-500">{currentTeam.description}</p>
                )}
              </div>
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.href 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">메뉴 열기</span>
              {!isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.href 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;