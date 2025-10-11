import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLevel, AdminRole } from '../../types/enums';

interface SidebarMenuItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean; // MASTER 관리자 전용 메뉴
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { admin } = useAuth();

  const menuItems: SidebarMenuItem[] = [
    { path: '/', label: '대시보드', icon: '📊' },
    { path: '/admin-accounts', label: '관리자 계정 관리', icon: '👨‍💼', adminOnly: true },
    { path: '/tenants', label: '서브도메인 관리', icon: '🏢', adminOnly: true },
    { path: '/teams', label: '팀 관리', icon: '👥' },
    { path: '/players', label: '선수 관리', icon: '👤' },
    { path: '/matches', label: '경기 관리', icon: '⚽' },
    { path: '/inquiries', label: '문의 관리', icon: '📝' },
  ];

  // 현재 관리자가 MASTER인지 확인 (adminLevel 우선, role로 fallback)
  const isMasterAdmin = admin?.adminLevel === AdminLevel.MASTER || 
                       admin?.role === AdminRole.SUPER_ADMIN || 
                       admin?.role === AdminRole.MASTER;

  // 메뉴 필터링: MASTER 관리자가 아니면 adminOnly 메뉴 제외
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || isMasterAdmin
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    // 모바일에서 메뉴 클릭 시 사이드바 닫기
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 min-h-screen flex flex-col fixed lg:static top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* 헤더 - 모바일 최적화 */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">⚽ 관리자 시스템</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">SaaS 멀티테넌트 관리</p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 메뉴 - 모바일 최적화 */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 p-3 sm:p-3 rounded-lg transition-colors touch-manipulation ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-sm sm:text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 정보 - 모바일 최적화 */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>Football Club Manager</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;