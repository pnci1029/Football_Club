import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminAccountDto, CreateAdminRequest, AdminPageResponse, TenantInfo } from '../../types/interfaces/admin';
import { Button, Card } from '../../components/common';
import { useToast } from '../../components/Toast';
import { AdminLevel } from '../../types/enums';
import { UnknownError, getErrorMessage } from '../../types/error';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableSubdomains: string[];
  tenants: TenantInfo[];
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ isOpen, onClose, onSuccess, availableSubdomains, tenants }) => {
  const [formData, setFormData] = useState<CreateAdminRequest>({
    username: '',
    password: '',
    email: '',
    name: '',
    role: 'admin',
    adminLevel: AdminLevel.SUBDOMAIN,
    teamSubdomain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = { ...formData };
      if (submitData.adminLevel === AdminLevel.MASTER) {
        delete submitData.teamSubdomain;
      }

      // Find teamId from tenants data
      const teamId = tenants.find(tenant => tenant.code === submitData.teamSubdomain)?.id || 0;
      const requestData = {
        ...submitData,
        teamId
      };

      await adminService.createAdmin(requestData);
      showToast('관리자 계정이 성공적으로 생성되었습니다.', 'success');
      onSuccess();
      onClose();
      setFormData({
        username: '',
        password: '',
        email: '',
        name: '',
        role: 'admin',
        adminLevel: AdminLevel.SUBDOMAIN,
        teamSubdomain: ''
      });
    } catch (err: UnknownError) {
      console.error('관리자 생성 실패:', err);
      const errorMessage = getErrorMessage(err, '관리자 계정 생성에 실패했습니다.');
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">새 관리자 계정 생성</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사용자명 *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="admin_username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="최소 8자 이상"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="관리자 이름"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관리자 레벨 *</label>
            <select
              value={formData.adminLevel}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                adminLevel: e.target.value as AdminLevel,
                teamSubdomain: e.target.value === AdminLevel.MASTER ? '' : prev.teamSubdomain
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={AdminLevel.SUBDOMAIN}>서브도메인 관리자</option>
              <option value={AdminLevel.MASTER}>마스터 관리자</option>
            </select>
          </div>

          {formData.adminLevel === AdminLevel.SUBDOMAIN && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">담당 서브도메인 *</label>
              <select
                required
                value={formData.teamSubdomain || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSubdomain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">서브도메인 선택</option>
                {availableSubdomains.map(subdomain => (
                  <option key={subdomain} value={subdomain}>{subdomain}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminAccountManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminPageResponse<AdminAccountDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<AdminAccountDto | null>(null);
  const [availableSubdomains, setAvailableSubdomains] = useState<string[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const { showToast, ToastContainer } = useToast();

  const fetchAdmins = async () => {
    try {
      const data = await adminService.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('관리자 목록 로딩 실패:', error);
      showToast('관리자 목록을 불러올 수 없습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSubdomains = async () => {
    try {
      const tenantsData = await adminService.getAllTenants();
      setTenants(tenantsData);
      setAvailableSubdomains(tenantsData.map(tenant => tenant.code));
    } catch (error) {
      console.error('서브도메인 목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchAvailableSubdomains();
  }, []);

  const handleToggleActive = async (admin: AdminAccountDto) => {
    try {
      if (admin.isActive) {
        await adminService.deactivateAdmin(admin.id);
        showToast(`${admin.name} 관리자를 비활성화했습니다.`, 'success');
      } else {
        await adminService.activateAdmin(admin.id);
        showToast(`${admin.name} 관리자를 활성화했습니다.`, 'success');
      }
      fetchAdmins();
    } catch (err: UnknownError) {
      console.error('관리자 상태 변경 실패:', err);
      const errorMessage = getErrorMessage(err, '관리자 상태 변경에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteAdmin = async (admin: AdminAccountDto) => {
    if (!window.confirm(`정말로 ${admin.name} 관리자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await adminService.deleteAdmin(admin.id);
      showToast(`${admin.name} 관리자가 삭제되었습니다.`, 'success');
      fetchAdmins();
    } catch (err: UnknownError) {
      console.error('관리자 삭제 실패:', err);
      const errorMessage = getErrorMessage(err, '관리자 삭제에 실패했습니다.');
      showToast(errorMessage, 'error');
    }
  };

  const handleChangePassword = (admin: AdminAccountDto) => {
    setChangingPasswordAdmin(admin);
  };

  const handlePasswordChanged = () => {
    setChangingPasswordAdmin(null);
    showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
          <p className="text-gray-600 mt-1">마스터 및 서브도메인 관리자 계정을 관리합니다</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          새 관리자 추가
        </Button>
      </div>

      {/* 통계 */}
      {admins && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <p className="text-sm text-gray-500">전체 관리자</p>
                <p className="text-2xl font-bold">{admins.totalElements}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔧</div>
              <div>
                <p className="text-sm text-gray-500">마스터 관리자</p>
                <p className="text-2xl font-bold">
                  {admins.content.filter(admin => admin.adminLevel === AdminLevel.MASTER).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏢</div>
              <div>
                <p className="text-sm text-gray-500">서브도메인 관리자</p>
                <p className="text-2xl font-bold">
                  {admins.content.filter(admin => admin.adminLevel === AdminLevel.SUBDOMAIN).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 관리자 목록 */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">관리자 목록</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리자 정보</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">레벨</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당 도메인</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">최근 로그인</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins?.content.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                      <div className="text-xs text-gray-400">@{admin.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.adminLevel === AdminLevel.MASTER 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.adminLevel === AdminLevel.MASTER ? '마스터' : '서브도메인'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {admin.teamSubdomain || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleDateString()
                      : '로그인 기록 없음'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangePassword(admin)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        비밀번호 변경
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(admin)}
                      >
                        {admin.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins?.content.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 관리자가 없습니다.
          </div>
        )}
      </Card>

      {/* 생성 모달 */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAdmins}
        availableSubdomains={availableSubdomains}
        tenants={tenants}
      />

      {/* 비밀번호 변경 모달 */}
      {changingPasswordAdmin && (
        <ChangePasswordModal
          isOpen={!!changingPasswordAdmin}
          onClose={() => setChangingPasswordAdmin(null)}
          onSuccess={handlePasswordChanged}
          adminId={changingPasswordAdmin.id}
          adminName={changingPasswordAdmin.name}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminAccountManagement;
