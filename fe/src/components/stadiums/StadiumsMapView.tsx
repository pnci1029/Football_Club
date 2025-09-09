import React, { useState, useEffect } from 'react';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { StadiumDto } from '../../types/stadium';

interface StadiumsMapViewProps {
  stadiums: StadiumDto[];
  onStadiumClick?: (stadium: StadiumDto) => void;
  height?: string;
}

const StadiumsMapView: React.FC<StadiumsMapViewProps> = ({ 
  stadiums, 
  onStadiumClick, 
  height = '400px' 
}) => {
  const [selectedStadium, setSelectedStadium] = useState<StadiumDto | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // 카카오맵 로딩 상태 체크
    const checkKakaoMap = () => {
      if (typeof window !== 'undefined') {
        console.log('카카오맵 로딩 상태 체크:', {
          kakao: !!window.kakao,
          maps: !!(window.kakao && window.kakao.maps),
          readyState: window.kakao && window.kakao.maps && (window.kakao.maps as any).readyState
        });
        
        if (!window.kakao) {
          console.error('window.kakao가 로드되지 않았습니다');
          setMapError('카카오맵 스크립트가 로드되지 않았습니다.');
          return false;
        }
        if (!window.kakao.maps) {
          console.error('window.kakao.maps가 로드되지 않았습니다');
          setMapError('카카오맵 API가 초기화되지 않았습니다.');
          return false;
        }
        console.log('카카오맵 API 로드 완료:', window.kakao.maps);
        setMapError(null);
        return true;
      }
      return false;
    };

    // 초기 체크
    if (checkKakaoMap()) {
      return;
    }

    // 재시도 로직 (최대 10초간 1초마다)
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
      retryCount++;
      console.log(`카카오맵 로딩 재시도 ${retryCount}/${maxRetries}`);
      
      if (checkKakaoMap() || retryCount >= maxRetries) {
        clearInterval(retryInterval);
        if (retryCount >= maxRetries && !window.kakao?.maps) {
          setMapError('카카오맵 로딩에 실패했습니다. 페이지를 새로고침해주세요.');
        }
      }
    }, 1000);

    return () => {
      clearInterval(retryInterval);
    };
  }, []);

  // 지도 중심점 계산
  const getMapCenter = () => {
    if (stadiums.length === 0) {
      // 기본 위치: 서울시청
      return { lat: 37.5666805, lng: 126.9784147 };
    }

    if (stadiums.length === 1) {
      const stadium = stadiums[0];
      if (stadium.latitude && stadium.longitude) {
        return { lat: stadium.latitude, lng: stadium.longitude };
      }
    }

    // 여러 구장의 중심점 계산
    const validStadiums = stadiums.filter(s => s.latitude && s.longitude);
    if (validStadiums.length === 0) {
      return { lat: 37.5666805, lng: 126.9784147 };
    }

    const avgLat = validStadiums.reduce((sum, s) => sum + s.latitude!, 0) / validStadiums.length;
    const avgLng = validStadiums.reduce((sum, s) => sum + s.longitude!, 0) / validStadiums.length;

    return { lat: avgLat, lng: avgLng };
  };

  // 지도 레벨 계산
  const getMapLevel = () => {
    if (stadiums.length <= 1) return 3;
    return 8; // 여러 구장이 있을 때는 더 넓은 범위
  };

  const handleMarkerClick = (stadium: StadiumDto) => {
    setSelectedStadium(selectedStadium?.id === stadium.id ? null : stadium);
    if (onStadiumClick) {
      onStadiumClick(stadium);
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setShowUserLocation(true);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  };

  return (
    <div className="relative" style={{ height }}>
      {stadiums.length === 0 ? (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height }}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">🏟️</div>
            <p className="text-gray-600">표시할 구장이 없습니다</p>
          </div>
        </div>
      ) : mapError ? (
        <div className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200" style={{ height }}>
          <div className="text-center p-6">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">지도를 불러올 수 없습니다</h3>
            <p className="text-red-600 mb-4">{mapError}</p>
            <div className="text-sm text-red-500 bg-red-100 p-3 rounded border-l-4 border-red-400">
              <p className="font-semibold mb-2">해결 방법:</p>
              <ul className="text-left space-y-1">
                <li>• 카카오 디벨로퍼에서 <code className="bg-red-200 px-1 rounded">{window.location.hostname}</code> 도메인을 등록하세요</li>
                <li>• API 키가 올바른지 확인하세요</li>
                <li>• 브라우저 개발자 도구 Console 탭에서 자세한 오류를 확인하세요</li>
              </ul>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-red-700">등록된 구장 목록:</h4>
              <div className="max-h-32 overflow-y-auto">
                {stadiums.map(stadium => (
                  <div key={stadium.id} className="text-sm bg-white p-2 rounded border mb-1">
                    <div className="font-medium">{stadium.name}</div>
                    <div className="text-gray-600">{stadium.address}</div>
                    {stadium.latitude && stadium.longitude && (
                      <div className="text-xs text-gray-500">
                        위도: {stadium.latitude}, 경도: {stadium.longitude}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 현재 위치 버튼 */}
          <button
            onClick={getCurrentLocation}
            className="absolute top-4 right-4 z-10 bg-white border border-gray-300 rounded-lg shadow-md p-2 hover:bg-gray-50 transition-colors"
            title="현재 위치 표시"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <Map
            center={getMapCenter()}
            style={{ width: '100%', height: '100%' }}
            level={getMapLevel()}
            className="rounded-lg"
          >
            {/* 사용자 현재 위치 마커 */}
            {showUserLocation && userLocation && (
              <MapMarker
                position={userLocation}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 30, height: 40 }
                }}
              />
            )}

            {stadiums.map((stadium) => {
              if (!stadium.latitude || !stadium.longitude) return null;

            return (
              <React.Fragment key={stadium.id}>
                <MapMarker
                  position={{ lat: stadium.latitude, lng: stadium.longitude }}
                  title={stadium.name}
                  onClick={() => handleMarkerClick(stadium)}
                  image={{
                    src: selectedStadium?.id === stadium.id 
                      ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                      : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                    size: selectedStadium?.id === stadium.id 
                      ? { width: 24, height: 35 }
                      : { width: 32, height: 36 }
                  }}
                />
                
                {selectedStadium?.id === stadium.id && (
                  <CustomOverlayMap
                    position={{ lat: stadium.latitude, lng: stadium.longitude }}
                    yAnchor={1}
                  >
                    <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-xs min-w-[250px] transform -translate-x-1/2">
                      {/* 말풍선 꼬리 */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
                      
                      <button
                        onClick={() => setSelectedStadium(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors shadow-md"
                      >
                        ×
                      </button>
                      
                      <div className="font-bold text-gray-900 mb-2 text-base">{stadium.name}</div>
                      <div className="text-sm text-gray-600 mb-3 break-words">{stadium.address}</div>
                      
                      <div className="space-y-2">
                        {stadium.hourlyRate && (
                          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                            <span className="text-sm text-blue-700 font-medium">시간당 요금</span>
                            <span className="text-sm font-bold text-blue-900">
                              {stadium.hourlyRate.toLocaleString()}원
                            </span>
                          </div>
                        )}
                        {stadium.availableHours && (
                          <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                            <span className="text-sm text-green-700 font-medium">운영시간</span>
                            <span className="text-sm font-bold text-green-900">
                              {stadium.availableHours}
                            </span>
                          </div>
                        )}
                        {stadium.contactNumber && (
                          <div className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded">
                            <span className="text-sm text-orange-700 font-medium">연락처</span>
                            <span className="text-sm font-bold text-orange-900">
                              {stadium.contactNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedStadium(null);
                          if (onStadiumClick) {
                            onStadiumClick(stadium);
                          }
                        }}
                        className="w-full mt-3 bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        상세 정보 보기
                      </button>
                    </div>
                  </CustomOverlayMap>
                )}
              </React.Fragment>
            );
          })}
          </Map>
        </>
      )}
    </div>
  );
};

export default StadiumsMapView;