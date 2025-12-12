import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';
import { AdminTeam, UpdateTeamRequest, adminTeamService } from '../../services/adminTeamService';

interface TeamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: AdminTeam | null;
  onTeamUpdated: () => void;
}

const TeamEditModal: React.FC<TeamEditModalProps> = ({
  isOpen,
  onClose,
  team,
  onTeamUpdated
}) => {
  const [formData, setFormData] = useState<UpdateTeamRequest>({
    code: '',
    name: '',
    description: '',
    logoUrl: '',
    contactPhone: '',
    kakaoId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setFormData({
        code: team.code || '',
        name: team.name || '',
        description: team.description || '',
        logoUrl: team.logoUrl || '',
        contactPhone: team.contactPhone || '',
        kakaoId: team.kakaoId || ''
      });
      setError('');
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminTeamService.updateTeam(team.id, formData);
      if (response.success) {
        onTeamUpdated();
        onClose();
      } else {
        setError(response.message || '팀 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('팀 정보 수정 중 오류가 발생했습니다.');
      console.error('Update team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateTeamRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="팀 정보 수정"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 팀 코드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 코드 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀 코드를 입력하세요 (예: teamA)"
            required
            pattern="[a-zA-Z0-9-_]+"
            title="영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다"
          />
          <p className="text-xs text-gray-500 mt-1">
            서브도메인으로 사용됩니다. 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능
          </p>
        </div>

        {/* 팀 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀 이름을 입력하세요"
            required
          />
        </div>

        {/* 팀 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀에 대한 설명을 입력하세요"
          />
        </div>

        {/* 로고 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            로고 URL
          </label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* 연락처 정보 섹션 */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">팀 연락처 정보</h4>
          
          {/* 대표 연락처 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표 연락처
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="010-1234-5678"
            />
            <p className="text-xs text-gray-500 mt-1">
              다른 팀에서 경기 신청 시 연락받을 전화번호
            </p>
          </div>

          {/* 카카오톡 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카카오톡 ID
            </label>
            <input
              type="text"
              value={formData.kakaoId}
              onChange={(e) => handleChange('kakaoId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="yourteam_kakao"
            />
            <p className="text-xs text-gray-500 mt-1">
              카카오톡으로 연락받을 수 있는 ID
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamEditModal;