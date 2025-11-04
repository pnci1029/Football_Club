import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/common';
import { adminStadiumService, AdminStadium } from '../../services/adminStadiumService';
import { adminTeamService, AdminTeam } from '../../services/adminTeamService';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../components/Toast';

const AdminStadiums: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { ToastContainer } = useToast();
  const [stadiums, setStadiums] = useState<AdminStadium[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [page] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTeams = useCallback(async () => {
    try {
      const response = await adminTeamService.getAllTeams(0, 100);
      if (response.success) {
        setTeams(response.data.content);
        const teamIdParam = searchParams.get('teamId');
        if (teamIdParam) {
          const teamId = parseInt(teamIdParam, 10);
          if (response.data.content.some(team => team.id === teamId)) {
            setSelectedTeam(teamId);
          } else if (response.data.content.length > 0) {
            setSelectedTeam(response.data.content[0].id);
          }
        } else if (response.data.content.length > 0) {
          setSelectedTeam(response.data.content[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  }, [searchParams]);

  const loadStadiums = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const response = await adminStadiumService.getAllStadiums(page, 10, selectedTeam);
      if (response.success && response.data) {
        setStadiums(response.data.content || []);
      }
    } catch (error) {
      console.error('Failed to load stadiums:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, page]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    if (selectedTeam) {
      loadStadiums();
    }
  }, [selectedTeam, loadStadiums]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">구장 관리</h1>
          <p className="text-gray-600 mt-2">등록된 구장들을 관리합니다</p>
        </div>
      </div>

      <Card>
        <div className="flex gap-2">
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">팀 선택</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stadiums.map((stadium) => (
            <Card key={stadium.id}>
              <h3 className="text-lg font-semibold">{stadium.name}</h3>
              <p className="text-sm text-gray-600">{stadium.address}</p>
              <p className="text-sm text-gray-500 mt-2">{stadium.teamName}</p>
            </Card>
          ))}
        </div>
      )}

      {!loading && stadiums.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">구장이 없습니다</h3>
            <p className="text-gray-600">선택된 팀에 등록된 구장이 없습니다.</p>
          </div>
        </Card>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminStadiums;