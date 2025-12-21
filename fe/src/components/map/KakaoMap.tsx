import React, { useEffect, useRef } from 'react';

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  relayout(): void;
  setBounds(bounds: KakaoLatLngBounds): void;
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
}

interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void;
  close(): void;
}

interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  Map: new (container: HTMLElement, options: {
    center: KakaoLatLng;
    level: number;
  }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: {
    position: KakaoLatLng;
    map?: KakaoMap;
  }) => KakaoMarker;
  InfoWindow: new (options: {
    content: string;
    removable?: boolean;
  }) => KakaoInfoWindow;
  LatLngBounds: new () => KakaoLatLngBounds;
  event: {
    addListener: (target: KakaoMap | KakaoMarker, type: string, handler: () => void) => void;
  };
}

interface KakaoServices {
  Geocoder: new () => {
    addressSearch(address: string, callback: (result: unknown[], status: string) => void): void;
  };
  Status: {
    OK: string;
  };
}

interface KakaoSDK {
  maps: KakaoMaps;
  services: KakaoServices;
}

declare global {
  interface Window {
    kakao: KakaoSDK;
  }
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  stadiumName: string;
  address: string;
  width?: string;
  height?: string;
  className?: string;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  latitude,
  longitude,
  stadiumName,
  address,
  width = '100%',
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao || !mapContainer.current) {
      return;
    }

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao.maps && window.kakao.maps.Map) {
      initializeMap();
    } else {
      // API가 아직 로드되지 않았다면 로드될 때까지 기다림
      window.kakao.maps?.load(initializeMap);
    }

    function initializeMap() {
      if (!mapContainer.current) return;
      
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3 // 지도의 확대 레벨
      };

      // 지도 생성
      const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

      // 지도 크기 재조정 (중요!)
      setTimeout(() => {
        map.relayout();
        map.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
      }, 100);

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      });

      // 마커를 지도에 표시
      marker.setMap(map);

      // 인포윈도우 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #333;">
              ${stadiumName}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${address}
            </div>
          </div>
        `,
        removable: false
      });

      // 마커에 인포윈도우 표시
      infoWindow.open(map, marker);

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', function() {
        // 카카오맵 앱에서 열기
        const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(stadiumName)},${latitude},${longitude}`;
        window.open(kakaoMapUrl, '_blank');
      });
    }
  }, [latitude, longitude, stadiumName, address]);

  return (
    <div 
      ref={mapContainer} 
      style={{ width, height, minHeight: '300px' }} 
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
};

export default KakaoMap;