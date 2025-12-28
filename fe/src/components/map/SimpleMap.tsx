import React, { useRef, useState, useEffect } from 'react';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
  teamSubdomain?: string | null;
}

interface SimpleMapProps {
  stadiums: Stadium[];
  onStadiumClick?: (stadium: Stadium) => void;
  height?: string;
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  stadiums,
  onStadiumClick,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const onStadiumClickRef = useRef(onStadiumClick);

  // 콜백 ref 업데이트
  useEffect(() => {
    onStadiumClickRef.current = onStadiumClick;
  }, [onStadiumClick]);

  // 위도/경도를 픽셀 좌표로 변환하는 간단한 함수
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    // 대한민국 경계 (대략적)
    const bounds = {
      north: 38.5,
      south: 33.0,
      east: 131.0,
      west: 125.0
    };

    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;

    return { x, y };
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* 간단한 지도 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="absolute inset-0 bg-gray-200 opacity-20">
          {/* 격자 패턴 */}
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* 중앙 표시 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="text-xs text-gray-600 mt-1 whitespace-nowrap">서울 (중심)</div>
        </div>
      </div>

      {/* 스타디움 마커들 */}
      {stadiums.map((stadium) => {
        const mapWidth = mapRef.current?.clientWidth || 800;
        const mapHeight = mapRef.current?.clientHeight || 400;
        const { x, y } = latLngToPixel(stadium.latitude, stadium.longitude, mapWidth, mapHeight);

        // 화면 경계 내에 있는지 확인
        if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) {
          return null;
        }

        return (
          <div
            key={stadium.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: x, top: y }}
            onClick={() => {
              // 모든 경우에 모달을 먼저 보여줌
              setSelectedStadium(stadium);
              onStadiumClickRef.current?.(stadium);
            }}
          >
            {/* 마커 아이콘 */}
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            {/* 호버 시 팀명 표시 (안정화) */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150 whitespace-nowrap z-10 pointer-events-none">
              {stadium.teamName}
            </div>
          </div>
        );
      })}

      {/* 선택된 스타디움 정보 */}
      {selectedStadium && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-20">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-blue-600">{selectedStadium.teamName}</h3>
            <button
              onClick={() => setSelectedStadium(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-1">📍 {selectedStadium.name}</div>
            <div className="text-xs text-gray-500">{selectedStadium.address}</div>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
          <span className="text-xs text-gray-600">축구팀 위치</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          마커를 클릭해보세요
        </div>
      </div>

      {/* 지도 참조 */}
      <div ref={mapRef} className="absolute inset-0"></div>
    </div>
  );
};

export default SimpleMap;