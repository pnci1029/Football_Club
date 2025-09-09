import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import Modal from '../common/Modal';
import { Button } from '../common';
import { CreateStadiumRequest, adminStadiumService } from '../../services/adminStadiumService';

interface StadiumCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStadiumCreated: () => void;
  teamId?: number;
}

const StadiumCreateModal: React.FC<StadiumCreateModalProps> = ({
  isOpen,
  onClose,
  onStadiumCreated,
  teamId
}) => {
  const [formData, setFormData] = useState<CreateStadiumRequest>({
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
  const [showPostcode, setShowPostcode] = useState(false);

  // 기본 시설 옵션들
  const defaultFacilities = [
    '주차장', '샤워실', '조명', '잔디', '인조잔디', '화장실', 
    '음료수 판매', '공 대여', '휴게실', '의료실'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || formData.hourlyRate <= 0) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await adminStadiumService.createStadium(formData, teamId);
      if (response.success) {
        onStadiumCreated();
        onClose();
        resetForm();
      } else {
        setError(response.message || '구장 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('구장 생성 중 오류가 발생했습니다.');
      console.error('Create stadium error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setFacilityInput('');
    setError('');
  };

  const handleChange = (field: keyof CreateStadiumRequest, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFacility = (facility: string) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
    }
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };

  const addCustomFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      addFacility(facilityInput.trim());
      setFacilityInput('');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 다음 우편번호 서비스 완료 핸들러
  const handlePostcodeComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    // 주소 설정
    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }));

    // 좌표 검색
    searchCoordinatesFromAddress(fullAddress);
    setShowPostcode(false);
  };

  // 주소로 좌표 검색
  const searchCoordinatesFromAddress = async (address: string) => {
    try {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error('카카오맵 서비스가 로드되지 않았습니다.');
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = result[0];
          const lat = parseFloat(coords.y);
          const lng = parseFloat(coords.x);
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
          console.log(`좌표 검색 성공: ${address} -> (${lat}, ${lng})`);
        } else {
          console.error('주소 검색 실패:', address, status);
          // 검색 실패시 기본 좌표 설정 (서울시청)
          setFormData(prev => ({
            ...prev,
            latitude: 37.5666805,
            longitude: 126.9784147
          }));
        }
      });
    } catch (error) {
      console.error('좌표 검색 오류:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 구장 생성"
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
            value={formData.name}
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
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="주소 검색 버튼을 클릭하세요"
              readOnly
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPostcode(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              주소 검색
            </Button>
          </div>
        </div>


        {/* 시간당 요금 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시간당 요금 (원) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleChange('hourlyRate', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="100000"
            required
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
            value={formData.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="010-1234-5678"
          />
        </div>

        {/* 이용 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이용 시간 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.availableHours}
            onChange={(e) => handleChange('availableHours', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="09:00-22:00"
            required
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
                    if (formData.facilities.includes(facility)) {
                      removeFacility(facility);
                    } else {
                      addFacility(facility);
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.facilities.includes(facility)
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
          {formData.facilities.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">선택된 시설</div>
              <div className="flex flex-wrap gap-2">
                {formData.facilities.map(facility => (
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
            {loading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>

      {/* 다음 우편번호 서비스 모달 */}
      {showPostcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">주소 검색</h3>
                <button
                  onClick={() => setShowPostcode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <DaumPostcode
                onComplete={handlePostcodeComplete}
                autoClose={false}
                style={{ height: '400px' }}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StadiumCreateModal;