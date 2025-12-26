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
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<{ marker: any; infowindow: any }[]>([]);

  useEffect(() => {
    if (!window.kakao || !mapContainer.current) {
      return;
    }

    if (window.kakao.maps && window.kakao.maps.Map) {
      initializeMap();
    } else {
      window.kakao.maps?.load(initializeMap);
    }

    function initializeMap() {
      if (!mapContainer.current) return;
      
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      };

      const mapInstance = new window.kakao.maps.Map(mapContainer.current, mapOption);

      setTimeout(() => {
        mapInstance.relayout();
        mapInstance.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
      }, 100);

      setMap(mapInstance);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!map || !stadiums.length) return;

    markersRef.current.forEach(item => item.marker.setMap(null));
    markersRef.current = [];

    const newMarkers: { marker: any; infowindow: any }[] = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    stadiums.forEach((stadium) => {
      const position = new window.kakao.maps.LatLng(stadium.latitude, stadium.longitude);

      const marker = new window.kakao.maps.Marker({
        position,
        map
      });

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

      window.kakao.maps.event.addListener(marker, 'click', () => {
        markersRef.current.forEach((markerData) => {
          markerData.infowindow.close();
        });

        infowindow.open(map, marker);

        if (onStadiumClick) {
          onStadiumClick(stadium);
        }
      });

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

    if (stadiums.length > 0) {
      map.setBounds(bounds);
    }
  }, [map, stadiums, onStadiumClick]);

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
