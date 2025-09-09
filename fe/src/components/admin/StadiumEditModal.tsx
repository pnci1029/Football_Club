import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';
import { UpdateStadiumRequest, adminStadiumService } from '../../services/adminStadiumService';
import { StadiumDto } from '../../services/adminService';

interface StadiumEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStadiumUpdated: () => void;
  stadium: StadiumDto | null;
}

const StadiumEditModal: React.FC<StadiumEditModalProps> = ({
  isOpen,
  onClose,
  onStadiumUpdated,
  stadium
}) => {
  const [formData, setFormData] = useState<UpdateStadiumRequest>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    hourlyRate: 0,
    contactNumber: '',
    facilities: [],
    availableHours: '09:00-22:00',
    imageUrls: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facilityInput, setFacilityInput] = useState('');

  // 기본 시설 옵션들
  const defaultFacilities = [
    '주차장', '샤워실', '조명', '잔디', '인조잔디', '화장실', 
    '음료수 판매', '공 대여', '휴게실', '의료실'
  ];

  // 모달이 열릴 때 stadium 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen && stadium) {
      setFormData({
        name: stadium.name,
        address: stadium.address,
        latitude: stadium.latitude || 0,
        longitude: stadium.longitude || 0,
        hourlyRate: stadium.hourlyRate,
        contactNumber: stadium.contactNumber || '',
        facilities: stadium.facilities || [],
        availableHours: stadium.availableHours,
        imageUrls: stadium.imageUrls || []
      });
      setError('');
      setFacilityInput('');
    }
  }, [isOpen, stadium]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stadium) return;

    if (!formData.name || !formData.address || (formData.hourlyRate && formData.hourlyRate <= 0)) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await adminStadiumService.updateStadium(stadium.id, formData);
      if (response.success) {
        onStadiumUpdated();
        onClose();
      } else {
        setError(response.message || '구장 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('구장 수정 중 오류가 발생했습니다.');
      console.error('Update stadium error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateStadiumRequest, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFacility = (facility: string) => {
    const currentFacilities = formData.facilities || [];
    if (facility && !currentFacilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...currentFacilities, facility]
      }));
    }
  };

  const removeFacility = (facility: string) => {
    const currentFacilities = formData.facilities || [];
    setFormData(prev => ({
      ...prev,
      facilities: currentFacilities.filter(f => f !== facility)
    }));
  };

  const addCustomFacility = () => {
    if (facilityInput.trim()) {
      const currentFacilities = formData.facilities || [];
      if (!currentFacilities.includes(facilityInput.trim())) {
        addFacility(facilityInput.trim());
        setFacilityInput('');
      }
    }
  };

  const handleClose = () => {
    setError('');
    setFacilityInput('');
    onClose();
  };

  // 주소로 좌표 검색
  const searchCoordinates = async () => {
    if (!formData.address) {
      alert('주소를 먼저 입력해주세요.');
      return;
    }

    try {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        alert('카카오맵 서비스가 로드되지 않았습니다.');
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(formData.address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = result[0];
          const lat = parseFloat(coords.y);
          const lng = parseFloat(coords.x);
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
          alert(`좌표 검색 완료!\n위도: ${lat}\n경도: ${lng}`);
        } else {
          alert('주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.');
        }
      });
    } catch (error) {
      console.error('좌표 검색 오류:', error);
      alert('좌표 검색 중 오류가 발생했습니다.');
    }
  };

  if (!stadium) return null;

  const currentFacilities = formData.facilities || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`구장 수정 - ${stadium.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 구장명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            구장명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="구장명을 입력하세요"
            required
          />
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="구장 주소를 입력하세요"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={searchCoordinates}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              좌표 검색
            </Button>
          </div>
        </div>

        {/* 좌표 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위도
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude || 0}
              onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="37.5666805"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경도
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude || 0}
              onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="126.9784147"
            />
          </div>
        </div>

        {/* 시간당 요금 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시간당 요금 (원)
          </label>
          <input
            type="number"
            value={formData.hourlyRate || 0}
            onChange={(e) => handleChange('hourlyRate', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="100000"
            min="0"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            연락처
          </label>
          <input
            type="tel"
            value={formData.contactNumber || ''}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="010-1234-5678"
          />
        </div>

        {/* 이용 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이용 시간
          </label>
          <input
            type="text"
            value={formData.availableHours || ''}
            onChange={(e) => handleChange('availableHours', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="09:00-22:00"
          />
          <p className="text-xs text-gray-500 mt-1">
            예: 09:00-22:00, 24시간 등
          </p>
        </div>

        {/* 시설 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시설
          </label>
          
          {/* 기본 시설 선택 */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-2">기본 시설</div>
            <div className="flex flex-wrap gap-2">
              {defaultFacilities.map(facility => (
                <button
                  key={facility}
                  type="button"
                  onClick={() => {
                    if (currentFacilities.includes(facility)) {
                      removeFacility(facility);
                    } else {
                      addFacility(facility);
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    currentFacilities.includes(facility)
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* 커스텀 시설 추가 */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={facilityInput}
              onChange={(e) => setFacilityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFacility())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="추가할 시설을 입력하세요"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomFacility}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              추가
            </Button>
          </div>

          {/* 선택된 시설 */}
          {currentFacilities.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">선택된 시설</div>
              <div className="flex flex-wrap gap-2">
                {currentFacilities.map(facility => (
                  <span
                    key={facility}
                    className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? '수정 중...' : '수정'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StadiumEditModal;