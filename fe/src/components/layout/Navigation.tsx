import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeam } from '../../contexts/TeamContext';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const { currentTeam, isLoading } = useTeam();
  const location = useLocation();

  const menuItems = [
    { name: '선수', href: '/players' },
    { name: '구장', href: '/stadiums' },
    { name: '경기', href: '/matches', submenu: [
      { name: '경기 일정', href: '/matches' },
      { name: '커뮤니티', href: '/community' },
      { name: '공지사항', href: '/notices' }
    ]},
  ];

  // 로딩 중이어도 기본 네비게이션을 표시하되, 팀 정보만 스켈레톤으로 처리

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* 로고 및 팀명 - 모바일 최적화 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity touch-manipulation">
              {isLoading ? (
                // 로딩 중 스켈레톤
                <>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="ml-2 sm:ml-3">
                    <div className="h-5 w-24 sm:w-32 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-16 sm:w-20 bg-gray-200 animate-pulse rounded mt-1 hidden sm:block"></div>
                  </div>
                </>
              ) : (
                // 정상 상태
                <>
                  {currentTeam?.logoUrl ? (
                    <img 
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
                      src={currentTeam.logoUrl} 
                      alt={`${currentTeam.name} 로고`}
                    />
                  ) : (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center">
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
                </>
              )}
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {menuItems.map((item) => (
              <div key={item.name} className="relative">
                {item.submenu ? (
                  // 드롭다운 메뉴가 있는 경우
                  <div
                    className="relative group"
                    onMouseEnter={() => {
                      if (dropdownTimeout) {
                        clearTimeout(dropdownTimeout);
                        setDropdownTimeout(null);
                      }
                      setActiveDropdown(item.name);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setActiveDropdown(null);
                      }, 300);
                      setDropdownTimeout(timeout);
                    }}
                  >
                    <button
                      className={`transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium touch-manipulation flex items-center ${
                        location.pathname === item.href || (item.submenu && item.submenu.some(sub => location.pathname === sub.href))
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 호버 브릿지 */}
                    {activeDropdown === item.name && (
                      <div className="absolute top-full left-0 w-48 h-2 z-40"></div>
                    )}

                    {/* 드롭다운 메뉴 */}
                    {activeDropdown === item.name && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                        onMouseEnter={() => {
                          if (dropdownTimeout) {
                            clearTimeout(dropdownTimeout);
                            setDropdownTimeout(null);
                          }
                        }}
                        onMouseLeave={() => {
                          const timeout = setTimeout(() => {
                            setActiveDropdown(null);
                          }, 300);
                          setDropdownTimeout(timeout);
                        }}
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                              location.pathname === subItem.href
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // 일반 메뉴
                  <Link
                    to={item.href}
                    className={`transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium touch-manipulation ${
                      location.pathname === item.href 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* 모바일 메뉴 버튼 - 터치 최적화 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 touch-manipulation"
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
            <div key={item.name} className="space-y-2">
              {item.submenu ? (
                // 서브메뉴가 있는 경우
                <>
                  <div
                    className={`flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation ${
                      location.pathname === item.href || (item.submenu && item.submenu.some(sub => location.pathname === sub.href))
                        ? 'text-blue-700 bg-blue-50 border border-blue-100 shadow-sm' 
                        : 'text-gray-700'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
                    }}
                  >
                    <span className="flex-1">{item.name}</span>
                  </div>
                  {item.submenu.map((subItem, subIndex) => (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className={`flex items-center pl-8 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation ${
                        location.pathname === subItem.href
                          ? 'text-blue-700 bg-blue-50 border border-blue-100 shadow-sm' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                      style={{
                        animationDelay: `${(index * 50) + (subIndex + 1) * 25}ms`,
                        animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
                      }}
                    >
                      <span className="flex-1">{subItem.name}</span>
                      {location.pathname === subItem.href && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </>
              ) : (
                // 일반 메뉴
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation ${
                    location.pathname === item.href 
                      ? 'text-blue-700 bg-blue-50 border border-blue-100 shadow-sm' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
                  }}
                >
                  <span className="flex-1">{item.name}</span>
                  {location.pathname === item.href && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;