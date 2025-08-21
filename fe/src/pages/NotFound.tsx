import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/common';

const NotFound: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 아이콘 */}
        <div className="mb-8">
          <div className="text-8xl mb-4">⚽</div>
          <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
        </div>

        {/* 메시지 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-2">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            경로: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-4">
          {isAdminPage ? (
            <div className="space-y-3">
              <Link to="/admin" className="block">
                <Button className="w-full bg-gray-800 hover:bg-gray-900">
                  <span className="mr-2">📊</span>
                  관리자 대시보드로 이동
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link to="/admin/players" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    선수 관리
                  </Button>
                </Link>
                <Link to="/admin/teams" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                  >
                    팀 관리
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  <span className="mr-2">🏠</span>
                  홈으로 이동
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link to="/players" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    선수단
                  </Button>
                </Link>
                <Link to="/matches" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50"
                  >
                    경기 일정
                  </Button>
                </Link>
              </div>
              <Link to="/stadiums" className="block">
                <Button 
                  variant="outline" 
                  className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <span className="mr-2">🏟️</span>
                  구장 정보
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 추가 도움말 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            문제가 지속되면 다음을 시도해보세요:
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div>• 주소 표시줄의 URL을 확인해주세요</div>
            <div>• 브라우저를 새로고침해주세요</div>
            <div>• 메인 페이지에서 다시 시작해주세요</div>
          </div>
        </div>

        {/* 브랜드 */}
        <div className="mt-8">
          <div className="text-xs text-gray-400">
            Football Club Management System
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;