import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminTeamService, AdminTeam } from '../../services/adminTeamService';
import TeamCreateModal from '../../components/admin/TeamCreateModal';
import { useToast } from '../../components/Toast';

const AdminTeams: React.FC = () => {
  const navigate = useNavigate();
  const { success, ToastContainer } = useToast();
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTeams = async () => {
    try {
      const response = await adminTeamService.getAllTeams(page, 10);
      if (response.success) {
        setTeams(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const handleTeamCreated = () => {
    loadTeams();
    setShowCreateModal(false);
    success('팀이 성공적으로 생성되었습니다.');
  };

  const handleViewTeamDetail = (team: AdminTeam) => {
    navigate(`/admin/teams/${team.id}`);
  };



  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
          <p className="text-gray-600 mt-2">등록된 팀들을 관리합니다</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCreateTeam}
          >
            <span className="mr-2">➕</span>
            팀 추가
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="팀명, 코드 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                선수 수
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTeamDetail(team)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {team.logoUrl ? (
                        <img className="h-10 w-10 rounded-full" src={team.logoUrl} alt={`${team.name} 로고`} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">{team.code.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.playerCount || 0}명</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTeamDetail(team);
                    }}
                  >
                    관리
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <div className="text-center py-12">
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">팀이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 조건에 맞는 팀이 없습니다.' : '등록된 팀이 없습니다.'}
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateTeam}
            >
              <span className="mr-2">➕</span>
              첫 번째 팀 추가하기
            </Button>
          </div>
        </Card>
      )}



      {/* 팀 생성 모달 */}
      <TeamCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={handleTeamCreated}
      />

      <ToastContainer />
    </div>
  );
};

export default AdminTeams;