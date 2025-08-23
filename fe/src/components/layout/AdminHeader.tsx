import React from 'react';

const AdminHeader: React.FC = () => {
  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">관리자 대시보드</h2>
          <p className="text-sm text-gray-600">멀티테넌트 축구 동호회 관리 시스템</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">{currentTime}</p>
            <p className="text-xs text-gray-500">시스템 관리자</p>
          </div>
          
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-semibold">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;