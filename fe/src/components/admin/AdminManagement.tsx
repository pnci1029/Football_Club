import React, { useState, useEffect } from 'react';
import { adminManagementService } from '../../services/adminManagementService';
import { AdminBasicInfo, CreateAdminRequest } from '../../types/api';
import { Button, Card } from '../common';
import Input from '../common/Input';
import { useToast } from '../Toast';

interface AdminManagementProps {
  teamId: number;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ teamId }) => {
  const [admins, setAdmins] = useState<AdminBasicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', name: 'Admin', email: '', password: '' });
  const { showToast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, [teamId]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await adminManagementService.getAdminsByTeam(teamId);
      setAdmins(data);
    } catch (error) {
      showToast('관리자 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.name || !newAdmin.password) {
      showToast('사용자 이름, 이름, 비밀번호를 모두 입력해주세요.', 'error');
      return;
    }

    const request: CreateAdminRequest = {
      teamId,
      username: newAdmin.username,
      name: newAdmin.name,
      password: newAdmin.password,
      email: newAdmin.email || null,
    };

    try {
      await adminManagementService.createAdmin(request);
      showToast('새로운 관리자가 생성되었습니다.', 'success');
      setNewAdmin({ username: '', name: 'Admin', email: '', password: '' });
      fetchAdmins();
    } catch (error) {
      showToast('관리자 생성에 실패했습니다.', 'error');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (window.confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
      try {
        await adminManagementService.deleteAdmin(adminId);
        showToast('관리자가 삭제되었습니다.', 'success');
        fetchAdmins();
      } catch (error) {
        showToast('관리자 삭제에 실패했습니다.', 'error');
      }
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">팀 관리자</h3>
      <div className="mb-4 p-4 border rounded-lg">
        <h4 className="font-semibold mb-2">새 관리자 추가</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="사용자 이름"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
          />
          <Input
            placeholder="이름"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
          />
          <Input
            placeholder="비밀번호"
            type="password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
          />
          <Input
            placeholder="이메일 (선택)"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
          />
        </div>
        <Button onClick={handleCreateAdmin} className="mt-4">
          관리자 추가
        </Button>
      </div>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자 이름
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">삭제</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleDeleteAdmin(admin.id)} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default AdminManagement;
