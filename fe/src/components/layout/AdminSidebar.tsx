import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarMenuItem {
  path: string;
  label: string;
  icon: string;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems: SidebarMenuItem[] = [
    { path: '/', label: '대시보드', icon: '📊' },
    { path: '/tenants', label: '서브도메인 관리', icon: '🏢' },
    { path: '/teams', label: '팀 관리', icon: '👥' },
    { path: '/players', label: '선수 관리', icon: '👤' },
    { path: '/stadiums', label: '구장 관리', icon: '🏟️' },
    { path: '/matches', label: '경기 관리', icon: '⚽' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">⚽ 관리자 시스템</h1>
        <p className="text-gray-400 text-sm mt-1">SaaS 멀티테넌트 관리</p>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p>Football Club Manager</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;