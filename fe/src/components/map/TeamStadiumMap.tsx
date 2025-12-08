import React, { useEffect, useRef, useState } from 'react';

// 카카오맵 타입 선언 - 필요한 부분만 any로 처리
declare const window: Window & {
  kakao?: any;
};

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
}

interface TeamStadiumMapProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  height?: string;
  className?: string;
}

const TeamStadiumMap: React.FC<TeamStadiumMapProps> = ({
  stadiums,
  onStadiumClick,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          // 대한민국 중심 좌표 (서울)
          const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
          
          const options = {
            center,
            level: 7 // 적당한 줌 레벨
          };
          
          const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
          setMap(mapInstance);
          setIsLoading(false);
        }
      });
    };
    
    script.onerror = () => {
      setError('지도를 불러오는데 실패했습니다.');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !stadiums.length) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커들 생성
    const newMarkers: any[] = [];
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
          if (markerData.infowindow) {
            markerData.infowindow.close();
          }
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
      map.setBounds(bounds);
    }
  }, [map, stadiums, onStadiumClick]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">지도를 불러오는 중...</span>
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
    <div className={`${className} rounded-lg overflow-hidden shadow-lg`}>
      <div ref={mapContainer} style={{ width: '100%', height }} />
    </div>
  );
};

export default TeamStadiumMap;