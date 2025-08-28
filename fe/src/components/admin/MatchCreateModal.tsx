import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';

interface Team {
  id: number;
  name: string;
  code: string;
}

interface Stadium {
  id: number;
  name: string;
  location?: string;
}

interface MatchCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: () => void;
}

const MatchCreateModal: React.FC<MatchCreateModalProps> = ({
  isOpen,
  onClose,
  onMatchCreated
}) => {
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    stadiumId: '',
    matchDate: '',
    matchTime: '',
    status: 'SCHEDULED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTeamsAndStadiums();
    }
  }, [isOpen]);

  const loadTeamsAndStadiums = async () => {
    try {
      // TODO: Replace with real API calls
      const mockTeams: Team[] = [
        { id: 1, name: 'FC Barcelona', code: 'barcelona' },
        { id: 2, name: 'Real Madrid', code: 'realmadrid' },
        { id: 3, name: 'Manchester United', code: 'manchester' },
      ];
      
      const mockStadiums: Stadium[] = [
        { id: 1, name: 'Camp Nou', location: 'Barcelona' },
        { id: 2, name: 'Santiago Bernabeu', location: 'Madrid' },
        { id: 3, name: 'Old Trafford', location: 'Manchester' },
      ];

      setTeams(mockTeams);
      setStadiums(mockStadiums);
    } catch (err) {
      setError('팀과 구장 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.homeTeamId || !formData.awayTeamId || !formData.stadiumId || 
        !formData.matchDate || !formData.matchTime) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      setError('홈팀과 원정팀은 다른 팀이어야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with real API call
      const matchDateTime = `${formData.matchDate}T${formData.matchTime}:00`;
      
      console.log('Creating match:', {
        homeTeamId: parseInt(formData.homeTeamId),
        awayTeamId: parseInt(formData.awayTeamId),
        stadiumId: parseInt(formData.stadiumId),
        matchDate: matchDateTime,
        status: formData.status
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onMatchCreated();
      onClose();
      resetForm();
    } catch (err) {
      setError('경기 생성에 실패했습니다.');
      console.error('Match creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      homeTeamId: '',
      awayTeamId: '',
      stadiumId: '',
      matchDate: '',
      matchTime: '',
      status: 'SCHEDULED'
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 경기 추가"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 홈팀 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            홈팀 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.homeTeamId}
            onChange={(e) => handleChange('homeTeamId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">홈팀을 선택하세요</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* 원정팀 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            원정팀 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.awayTeamId}
            onChange={(e) => handleChange('awayTeamId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">원정팀을 선택하세요</option>
            {teams.filter(team => team.id.toString() !== formData.homeTeamId).map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* 구장 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경기장 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.stadiumId}
            onChange={(e) => handleChange('stadiumId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">경기장을 선택하세요</option>
            {stadiums.map(stadium => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.name} {stadium.location && `(${stadium.location})`}
              </option>
            ))}
          </select>
        </div>

        {/* 경기 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경기 날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.matchDate}
            min={getMinDate()}
            onChange={(e) => handleChange('matchDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 경기 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경기 시간 <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.matchTime}
            onChange={(e) => handleChange('matchTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 경기 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경기 상태
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="SCHEDULED">예정</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="COMPLETED">종료</option>
            <option value="CANCELLED">취소</option>
          </select>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? '생성 중...' : '경기 생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MatchCreateModal;