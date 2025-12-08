import React, { useState } from 'react';
import { Button } from '../common';
import { CreateTeamData } from '../../services/adminService';
import { getProductionDomain } from '../../utils/config';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: CreateTeamData) => Promise<void>;
  isLoading?: boolean;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateTeamData>({
    code: '',
    name: '',
    description: '',
    logoUrl: '',
    contactPhone: '',
    kakaoId: ''
  });
  const [errors, setErrors] = useState<Partial<CreateTeamData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTeamData> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = '서브도메인 코드는 필수입니다';
    } else if (!/^[a-z0-9]+$/.test(formData.code)) {
      newErrors.code = '서브도메인 코드는 영문 소문자와 숫자만 사용 가능합니다';
    } else if (formData.code.length < 2) {
      newErrors.code = '서브도메인 코드는 최소 2자 이상이어야 합니다';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '팀명은 필수입니다';
    } else if (formData.name.length < 2) {
      newErrors.name = '팀명은 최소 2자 이상이어야 합니다';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '팀 설명은 필수입니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        logoUrl: formData.logoUrl || undefined
      });
      
      // 성공 시 폼 초기화
      setFormData({
        code: '',
        name: '',
        description: '',
        logoUrl: '',
        contactPhone: '',
        kakaoId: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };

  const handleInputChange = (field: keyof CreateTeamData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              새 서브도메인 생성
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 바디 */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* 서브도메인 코드 */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              서브도메인 코드 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toLowerCase())}
                placeholder="예: kim, park, lee"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                maxLength={20}
              />
              <div className="absolute right-3 top-2 text-sm text-gray-400">
                .{getProductionDomain()}
              </div>
            </div>
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              영문 소문자와 숫자만 사용 가능 (최소 2자)
            </p>
          </div>

          {/* 팀명 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              팀명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="예: 김철수 FC"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 팀 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              팀 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="예: 서울 지역 축구 동호회"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={200}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* 로고 URL (선택사항) */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              로고 URL (선택사항)
            </label>
            <input
              type="url"
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* 연락처 정보 섹션 */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">팀 연락처 정보</h4>
            
            {/* 대표 연락처 */}
            <div className="mb-4">
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                대표 연락처
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                다른 팀에서 경기 신청 시 연락받을 전화번호
              </p>
            </div>

            {/* 카카오톡 ID */}
            <div>
              <label htmlFor="kakaoId" className="block text-sm font-medium text-gray-700 mb-1">
                카카오톡 ID
              </label>
              <input
                type="text"
                id="kakaoId"
                value={formData.kakaoId}
                onChange={(e) => handleInputChange('kakaoId', e.target.value)}
                placeholder="yourteam_kakao"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                카카오톡으로 연락받을 수 있는 ID
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                '생성'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;