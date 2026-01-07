import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { apiClient } from '../../services/api';

interface Admin {
  id: number;
  username: string;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
  teamSubdomain?: string;
  adminLevel: string;
  createdAt: string;
  updatedAt?: string;
}

const AdminUserManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 모달 상태
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    loadAdmins(true);
  }, []);

  const loadAdmins = async (reset: boolean = false) => {
    setIsLoading(true);
    try {
      const page = reset ? 0 : currentPage;
      const data = await apiClient.get<{ success: boolean; data: { content: Admin[]; number: number; totalPages: number; last: boolean } }>(`/api/v1/admin/management/admins?page=${page}&size=20`);
      
      if (data.success) {
        if (reset) {
          setAdmins(data.data.content);
        } else {
          setAdmins(prev => [...prev, ...data.data.content]);
        }
        setCurrentPage(data.data.number);
        setTotalPages(data.data.totalPages);
        setHasMore(!data.data.last);
      }
    } catch (error) {
      console.error('관리자 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
      loadAdmins(false);
    }
  };

  const handleChangePassword = (admin: Admin) => {
    setChangingPasswordAdmin(admin);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setDeletingAdmin(admin);
  };

  const handlePasswordChanged = () => {
    setChangingPasswordAdmin(null);
    loadAdmins(true);
  };

  const handleAdminDeleted = async () => {
    if (!deletingAdmin) return;
    
    try {
      const data = await apiClient.delete<{ success: boolean }>(`/api/v1/admin/management/admins/${deletingAdmin.id}`);
      
      if (data.success) {
        setDeletingAdmin(null);
        loadAdmins(true);
      }
    } catch (error) {
      console.error('관리자 삭제 실패:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAdminLevelBadge = (level: string) => {
    const classes: Record<string, string> = {
      'MASTER': 'bg-red-100 text-red-800',
      'SUBDOMAIN': 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      'MASTER': '마스터',
      'SUBDOMAIN': '서브도메인',
    };
    return { class: classes[level] || 'bg-gray-100 text-gray-800', label: labels[level] || level };
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
          <p className="text-gray-600">시스템 관리자 계정을 관리합니다</p>
        </div>
      </div>

      {/* 관리자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => {
                const levelBadge = getAdminLevelBadge(admin.adminLevel);
                return (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                        <div className="text-sm text-gray-500">{admin.name}</div>
                        {admin.email && (
                          <div className="text-sm text-gray-400">{admin.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${levelBadge.class}`}>
                        {levelBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.teamSubdomain || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleChangePassword(admin)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          비밀번호 변경
                        </button>
                        {admin.adminLevel !== 'MASTER' && (
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            비활성화
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 더보기 버튼 */}
        {hasMore && admins.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '더보기'}
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && admins.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">관리자가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">관리자 계정이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 모달들 */}
      {changingPasswordAdmin && (
        <ChangePasswordModal
          isOpen={!!changingPasswordAdmin}
          onClose={() => setChangingPasswordAdmin(null)}
          onSuccess={handlePasswordChanged}
          adminId={changingPasswordAdmin.id}
          adminName={changingPasswordAdmin.name}
        />
      )}

      {deletingAdmin && (
        <ConfirmDeleteModal
          title="관리자 비활성화"
          itemName={deletingAdmin.name}
          itemType="관리자"
          isOpen={!!deletingAdmin}
          onClose={() => setDeletingAdmin(null)}
          onConfirm={handleAdminDeleted}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;