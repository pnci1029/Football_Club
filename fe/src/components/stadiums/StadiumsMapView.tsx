import React from 'react';
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
  const handleStadiumClick = (stadium: StadiumDto) => {
    if (onStadiumClick) {
      onStadiumClick(stadium);
    }
  };

  const openExternalMap = (stadium: StadiumDto) => {
    if (stadium.latitude && stadium.longitude) {
      const url = `https://map.kakao.com/link/map/${encodeURIComponent(stadium.name)},${stadium.latitude},${stadium.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://map.kakao.com/link/search/${encodeURIComponent(stadium.address)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" 
      style={{ height }}
    >
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4">
        <h3 className="text-lg font-semibold">
          구장 목록 ({stadiums.length}개)
        </h3>
        <p className="text-gray-100 text-sm mt-1">
          구장을 클릭하면 외부 지도에서 확인할 수 있습니다
        </p>
      </div>

      {/* 구장 목록 */}
      <div className="max-h-80 overflow-y-auto">
        {stadiums.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <p>등록된 구장이 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stadiums.map((stadium) => (
              <div
                key={stadium.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStadiumClick(stadium)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {stadium.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {stadium.address}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{stadium.hourlyRate?.toLocaleString()}원/시간</span>
                      {stadium.contactNumber && (
                        <span>{stadium.contactNumber}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openExternalMap(stadium);
                    }}
                    className="ml-3 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    지도보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StadiumsMapView;