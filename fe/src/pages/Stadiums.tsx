import React, { useState } from 'react';
import { useStadiums } from '../hooks/useStadiums';
import { StadiumDto } from '../types/stadium';
import { Card, Button, LoadingSpinner } from '../components/common';
import StadiumMapModal from '../components/admin/StadiumMapModal';
import StadiumsMapView from '../components/stadiums/StadiumsMapView';
import { ImageUtil } from '../utils/image';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const formatPrice = (price?: number) => {
  return price ? `${price.toLocaleString()}원/시간` : '문의';
};

const parseImageUrls = (imageUrls?: string): string[] => {
  if (!imageUrls) return [];
  try {
    return JSON.parse(imageUrls);
  } catch {
    return imageUrls.split(',').map(url => url.trim());
  }
};

const parseFacilities = (facilities?: string): string[] => {
  if (!facilities) return [];
  try {
    return JSON.parse(facilities);
  } catch {
    return facilities.split(',').map(facility => facility.trim());
  }
};

const Stadiums: React.FC = () => {
  const [selectedStadium, setSelectedStadium] = useState<StadiumDto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapStadium, setMapStadium] = useState<StadiumDto | null>(null);
  const { data: stadiumsData, loading, error } = useStadiums();
  const stadiums = stadiumsData?.content || [];

  const handleViewMap = (stadium: StadiumDto) => {
    setMapStadium(stadium);
    setShowMapModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-center items-center h-48 sm:h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm sm:text-base">경기장을 불러오는데 실패했습니다: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              경기장 정보
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              총 <span className="font-semibold text-primary-600">{stadiums?.length || 0}</span>개의 경기장
            </p>
          </div>

          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">목록</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">지도</span>
            </button>
          </div>
        </div>
      </div>

      {!selectedStadium ? (
        <>
          {viewMode === 'grid' ? (
            /* 경기장 대형 카드 - 한 줄에 하나씩 */
            <div className="space-y-6">
              {stadiums.map((stadium) => {
                const facilities = parseFacilities(stadium.facilities);
                return (
                  <Card
                    key={stadium.id}
                    hover
                    padding="none"
                    onClick={() => setSelectedStadium(stadium)}
                    className="overflow-hidden"
                  >
                    <div className="md:flex">
                      {/* 구장 지도 - 큰 사이즈 */}
                      <div className="md:w-1/2 lg:w-2/3">
                        <div className="relative h-64 md:h-80 lg:h-96">
                          {stadium.latitude && stadium.longitude ? (
                            <Map
                              center={{
                                lat: stadium.latitude,
                                lng: stadium.longitude,
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                              }}
                              level={3}
                            >
                              <MapMarker
                                position={{
                                  lat: stadium.latitude,
                                  lng: stadium.longitude,
                                }}
                                title={stadium.name}
                              />
                            </Map>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <div className="text-center">
                                <div className="text-4xl text-gray-400 mb-2">📍</div>
                                <p className="text-gray-500">위치 정보 없음</p>
                              </div>
                            </div>
                          )}
                          {/* 구장명 오버레이 */}
                          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                            🏟️ {stadium.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* 구장 정보 */}
                      <div className="md:w-1/2 lg:w-1/3 p-6 flex flex-col justify-between">
                        <div>
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{stadium.name}</h3>
                            <div className="flex items-start">
                              <span className="text-gray-400 mr-2 mt-1">📍</span>
                              <p className="text-gray-600 text-sm leading-relaxed">{stadium.address}</p>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">이용요금</span>
                              <span className="font-semibold text-lg text-primary-600">{formatPrice(stadium.hourlyRate)}</span>
                            </div>
                            {stadium.availableHours && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">이용시간</span>
                                <span className="font-medium">{stadium.availableHours}</span>
                              </div>
                            )}
                            {stadium.contactNumber && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">연락처</span>
                                <span className="font-medium">{stadium.contactNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* 시설 */}
                          {facilities.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">이용 가능한 시설</h4>
                              <div className="flex flex-wrap gap-1">
                                {facilities.slice(0, 4).map((facility, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                  >
                                    {facility}
                                  </span>
                                ))}
                                {facilities.length > 4 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    +{facilities.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMap(stadium);
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            📍 지도보기
                          </button>
                          <button
                            onClick={() => setSelectedStadium(stadium)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            자세히 보기
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* 지도 뷰 */
            <div className="h-96 sm:h-[500px] lg:h-[600px]">
              <StadiumsMapView
                stadiums={stadiums}
                onStadiumClick={setSelectedStadium}
                height="100%"
              />
            </div>
          )}

          {/* 경기장이 없는 경우 */}
          {stadiums.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">등록된 경기장이 없습니다</h3>
              <p className="text-gray-600">아직 등록된 경기장이 없습니다.</p>
            </div>
          )}
        </>
      ) : (
        /* 선택된 경기장 상세 정보 */
        <div>
          <Button
            variant="outline"
            onClick={() => setSelectedStadium(null)}
            className="mb-6"
          >
            ← 목록으로 돌아가기
          </Button>

          <Card padding="lg">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                {(() => {
                  const images = parseImageUrls(selectedStadium.imageUrls);
                  return (
                    <>
                      <img
                        src={ImageUtil.createSafeImageSrc(images[0], () => ImageUtil.createStadiumPlaceholder(selectedStadium.name))}
                        alt={selectedStadium.name}
                        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg mb-4"
                      />
                      {images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {images.slice(1, 4).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedStadium.name} ${index + 2}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{selectedStadium.name}</h1>
                <p className="text-gray-600 flex items-center justify-center">
                  <span className="mr-1">📍</span>
                  {selectedStadium.address}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">이용요금</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(selectedStadium.hourlyRate)}</p>
                  </div>
                  
                  {selectedStadium.availableHours && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">이용시간</h3>
                      <p className="text-lg font-medium text-green-800">{selectedStadium.availableHours}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedStadium.contactNumber && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">연락처</h3>
                      <p className="text-lg font-medium text-orange-800">{selectedStadium.contactNumber}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleViewMap(selectedStadium)}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    📍 지도에서 보기
                  </button>
                </div>
              </div>

              {(() => {
                const facilities = parseFacilities(selectedStadium.facilities);
                return facilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">이용 가능한 시설</h3>
                    <div className="flex flex-wrap gap-2">
                      {facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}

      {/* 지도 모달 */}
      {showMapModal && mapStadium && (
        <StadiumMapModal
          stadium={mapStadium}
          isOpen={showMapModal}
          onClose={() => {
            setShowMapModal(false);
            setMapStadium(null);
          }}
        />
      )}
    </div>
  );
};

export default Stadiums;