import React from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';

interface StadiumMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  stadium: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

const StadiumMapModal: React.FC<StadiumMapModalProps> = ({
  isOpen,
  onClose,
  stadium
}) => {
  if (!stadium) return null;

  const hasCoordinates = stadium.latitude !== undefined && stadium.longitude !== undefined;

  const openInKakaoMap = () => {
    if (hasCoordinates) {
      const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(stadium.name)},${stadium.latitude},${stadium.longitude}`;
      window.open(kakaoMapUrl, '_blank');
    } else {
      const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(stadium.address)}`;
      window.open(kakaoMapUrl, '_blank');
    }
  };

  const openInNaverMap = () => {
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(stadium.address)}`;
    window.open(naverMapUrl, '_blank');
  };

  const openInGoogleMap = () => {
    if (hasCoordinates) {
      const googleMapUrl = `https://maps.google.com/maps?q=${stadium.latitude},${stadium.longitude}`;
      window.open(googleMapUrl, '_blank');
    } else {
      const googleMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(stadium.address)}`;
      window.open(googleMapUrl, '_blank');
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(stadium.address);
      alert('주소가 클립보드에 복사되었습니다!');
    } catch (error) {
      // 클립보드 복사 실패 시 폴백
      const textArea = document.createElement('textarea');
      textArea.value = stadium.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('주소가 클립보드에 복사되었습니다!');
    }
  };

  const copyCoordinates = async () => {
    const coordinates = `${stadium.latitude}, ${stadium.longitude}`;
    try {
      await navigator.clipboard.writeText(coordinates);
      alert('좌표가 클립보드에 복사되었습니다!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = coordinates;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('좌표가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${stadium.name} 위치`}
      size="lg"
    >
      <div className="space-y-4">
        {/* 지도 */}
        <div className="w-full h-64 rounded-lg overflow-hidden border">
          {hasCoordinates ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center relative">
              <div className="text-center text-white">
                <h3 className="text-lg font-bold mb-1">{stadium.name}</h3>
                <p className="text-gray-100 text-sm">지도 정보</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">좌표 정보가 없습니다</p>
                <p className="text-xs text-gray-400">구장의 위치 좌표를 설정해주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 주소 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">주소</h4>
              <p className="text-sm text-gray-700 break-all">{stadium.address}</p>
            </div>
          </div>
        </div>

        {/* 복사 버튼들 */}
        <div className="grid gap-3 grid-cols-1">
          <Button
            type="button"
            variant="outline"
            onClick={copyAddress}
            className="text-gray-600"
          >
            주소 복사
          </Button>
        </div>

        {/* 외부 지도 앱 열기 */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">다른 지도에서 보기</h4>
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={openInKakaoMap}
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
            >
              카카오지도
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={openInNaverMap}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              네이버지도
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={openInGoogleMap}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              구글지도
            </Button>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StadiumMapModal;