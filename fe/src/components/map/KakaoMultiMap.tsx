import React, { useEffect, useRef, useState } from 'react';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
}

interface KakaoMultiMapProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  onMapError?: () => void;
  height?: string;
  className?: string;
}

const KakaoMultiMap: React.FC<KakaoMultiMapProps> = ({
                                                       stadiums,
                                                       onStadiumClick,
                                                       onMapError,
                                                       height = '400px',
                                                       className = ''
                                                     }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<{ marker: any; infowindow: any }[]>([]);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    console.log('🗺️ KakaoMultiMap useEffect 실행:', {
      hasContainer: !!mapContainer.current,
      stadiumCount: stadiums.length,
      hasKakao: !!window.kakao
    });

    if (!mapContainer.current) {
      console.log('❌ mapContainer가 없음, 50ms 후 재시도');
      const timer = setTimeout(() => {
        if (mapContainer.current) {
          console.log('✅ mapContainer 재시도 성공');
          initializeMapDirectly();
        } else {
          console.log('❌ mapContainer 재시도 실패');
          setIsLoading(false);
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    if (stadiums.length === 0) {
      console.log('❌ stadiums 배열이 비어있음');
      setIsLoading(false);
      return;
    }

    // KakaoMap 방식과 동일하게 전역 window.kakao 사용
    if (!window.kakao) {
      console.log('❌ window.kakao가 없음');
      setError('카카오맵 API가 로드되지 않았습니다.');
      setIsLoading(false);
      onMapError?.();
      return;
    }

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao.maps && window.kakao.maps.Map) {
      initializeMap();
    } else {
      // API가 아직 로드되지 않았다면 로드될 때까지 기다림
      window.kakao.maps?.load(initializeMap);
    }

    // cleanup function
    return () => {
      cleanupMarkers();
    };
  }, [stadiums, onStadiumClick, onMapError]);

  const initializeMapDirectly = () => {
    if (stadiums.length === 0) {
      console.log('❌ stadiums 배열이 비어있음');
      setIsLoading(false);
      return;
    }

    if (!window.kakao) {
      console.log('❌ window.kakao가 없음');
      setError('카카오맵 API가 로드되지 않았습니다.');
      setIsLoading(false);
      onMapError?.();
      return;
    }

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao.maps && window.kakao.maps.Map) {
      initializeMap();
    } else {
      // API가 아직 로드되지 않았다면 로드될 때까지 기다림
      window.kakao.maps?.load(initializeMap);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current) return;

    // 기존 마커 제거
    cleanupMarkers();

    // 서울 중심 좌표로 기본 설정
    const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
    const mapOption = {
      center,
      level: 7 // 지도의 확대 레벨
    };

    // 지도 생성 또는 재사용
    if (!mapRef.current) {
      mapRef.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
    }
    const map = mapRef.current;

    // KakaoMap 방식과 동일하게 지도 크기 재조정
    setTimeout(() => {
      map.relayout();
      map.setCenter(center);
    }, 100);

    // 새로운 마커들 생성
    const newMarkers: { marker: any; infowindow: any }[] = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    stadiums.forEach((stadium) => {
      const position = new window.kakao.maps.LatLng(stadium.latitude, stadium.longitude);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map
      });

      // 인포윈도우 내용
      const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <div style="font-weight: bold; color: #2563eb; margin-bottom: 5px;">
            ${stadium.teamName}
          </div>
          <div style="font-size: 14px; margin-bottom: 3px;">
            📍 ${stadium.name}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${stadium.address}
          </div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infoContent
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 모두 닫기
        markersRef.current.forEach((markerData) => {
          markerData.infowindow.close();
        });

        // 현재 인포윈도우 열기
        infowindow.open(map, marker);

        // 외부 콜백 호출
        if (onStadiumClick) {
          onStadiumClick(stadium);
        }
      });

      // 마커 호버 효과
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infowindow.close();
      });

      newMarkers.push({ marker, infowindow });
      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    // 모든 마커가 보이도록 지도 범위 조정
    if (stadiums.length > 0) {
      setTimeout(() => {
        map.setBounds(bounds);
      }, 100);
    }

    setIsLoading(false);
    setError(null);
  };

  const cleanupMarkers = () => {
    markersRef.current.forEach(item => item.marker.setMap(null));
    markersRef.current = [];
  };

  if (isLoading) {
    return (
        <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">카카오맵을 불러오는 중...</span>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className={`${className} flex items-center justify-center bg-red-50 rounded-lg border border-red-200`} style={{ height }}>
          <div className="text-center">
            <div className="text-red-600 mb-2">🗺️</div>
            <div className="text-red-700 font-medium">{error}</div>
          </div>
        </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height, minHeight: '300px' }}
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
};

export default KakaoMultiMap;
