import React, { useState, useEffect } from 'react';
import { adminService, TeamStats } from '../../services/adminService';

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TeamStats | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setTenants(data.teams);
      } catch (error) {
        console.error('테넌트 목록 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleTenantClick = (tenant: TeamStats) => {
    setSelectedTenant(tenant);
  };

  const getTenantUrl = (code: string) => {
    return `${code}.localhost:3000`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">서브도메인 관리</h1>
        <p className="text-gray-600">등록된 모든 서브도메인(테넌트)을 관리하고 각 테넌트별 상세 정보를 확인할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 테넌트 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">서브도메인 목록</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      서브도메인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      팀명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      선수 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      구장 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr 
                      key={tenant.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTenant?.id === tenant.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleTenantClick(tenant)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-600">
                            {getTenantUrl(tenant.code)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tenant.playerCount}명
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {tenant.stadiumCount}개
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">관리</button>
                        <button className="text-gray-600 hover:text-gray-900">설정</button>
                        <a 
                          href={`http://${getTenantUrl(tenant.code)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          방문
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 선택된 테넌트 상세 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">테넌트 상세 정보</h3>
            
            {selectedTenant ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">팀명</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTenant.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">서브도메인 코드</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedTenant.code}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <p className="mt-1 text-sm text-blue-600 break-all">
                    {getTenantUrl(selectedTenant.code)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">선수 수</label>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{selectedTenant.playerCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">구장 수</label>
                    <p className="mt-1 text-2xl font-bold text-green-600">{selectedTenant.stadiumCount}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">빠른 관리</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open(`/players?teamId=${selectedTenant.id}`, '_blank')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      👤 선수 관리
                    </button>
                    <button 
                      onClick={() => window.open(`/stadiums?teamId=${selectedTenant.id}`, '_blank')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      🏟️ 구장 관리
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                      ⚙️ 테넌트 설정
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🏢</div>
                <p className="text-sm text-gray-500">테넌트를 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 새 테넌트 생성 버튼 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">새 서브도메인 생성</h3>
          <p className="text-sm text-gray-600 mb-4">새로운 축구 동호회를 위한 서브도메인을 생성합니다.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            + 새 서브도메인 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;