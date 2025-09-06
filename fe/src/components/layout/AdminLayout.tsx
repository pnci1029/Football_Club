import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 - 모바일 최적화 */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* 메인 콘텐츠 영역 - 모바일 최적화 */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* 헤더 */}
        <AdminHeader onToggleSidebar={toggleSidebar} />
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;