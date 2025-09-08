import React, { useState } from 'react';
import { useStadiums } from '../hooks/useStadiums';
import { StadiumDto } from '../types/stadium';
import { Card, Button, LoadingSpinner } from '../components/common';
import StadiumMapModal from '../components/admin/StadiumMapModal';

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
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapStadium, setMapStadium] = useState<StadiumDto | null>(null);
  const { data: stadiumsPage, loading, error, refetch } = useStadiums(0, 20);

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
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={refetch}
            className="bg-primary-600 text-white px-4 py-3 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-primary-700 touch-manipulation"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const stadiums = stadiumsPage?.content || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 헤더 - 모바일 최적화 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">경기장 정보</h1>
        <p className="text-sm sm:text-base text-gray-600">우리가 경기할 수 있는 다양한 경기장을 소개합니다</p>
      </div>

      {!selectedStadium ? (
        <>
        {/* 경기장 그리드 - 모바일 최적화 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stadiums.map((stadium) => {
            const images = parseImageUrls(stadium.imageUrls);
            const facilities = parseFacilities(stadium.facilities);
            return (
              <Card
                key={stadium.id}
                hover
                padding="none"
                onClick={() => setSelectedStadium(stadium)}
              >
              <div className="relative">
                <img
                  src={images[0] || 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=경기장'}
                  alt={stadium.name}
                  className="w-full h-40 sm:h-48 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=경기장';
                  }}
                />
              </div>

              <div className="p-3 sm:p-4">
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{stadium.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center flex-1 min-w-0">
                      <span className="mr-1 text-sm">📍</span>
                      <span className="truncate">{stadium.address}</span>
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMap(stadium);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="지도에서 보기"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">이용요금</span>
                    <span className="font-medium text-primary-600 truncate ml-2">{formatPrice(stadium.hourlyRate)}</span>
                  </div>
                  {stadium.availableHours && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">이용시간</span>
                      <span className="font-medium truncate ml-2">{stadium.availableHours}</span>
                    </div>
                  )}
                </div>

                {facilities.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">주요 시설</p>
                    <div className="flex flex-wrap gap-1">
                      {facilities.slice(0, 3).map((facility, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {facility}
                        </span>
                      ))}
                      {facilities.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{facilities.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              </Card>
            );
          })}
        </div>
        </>
      ) : (
        <>
        {/* 경기장 상세 - 모바일 최적화 */}
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedStadium(null)}
            leftIcon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            className="mb-4 sm:mb-6 text-sm sm:text-base touch-manipulation"
          >
            목록으로 돌아가기
          </Button>

          <Card padding="lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* 이미지 섹션 - 모바일 최적화 */}
              <div>
                {(() => {
                  const images = parseImageUrls(selectedStadium.imageUrls);
                  return (
                    <>
                      <img
                        src={images[0] || 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=경기장'}
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
                              className="w-full h-16 sm:h-20 object-cover rounded"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* 정보 섹션 - 모바일 최적화 */}
              <div>
                <div className="mb-4 lg:mb-6">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{selectedStadium.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600 flex items-center mb-2">
                    <span className="mr-2">📍</span>
                    <span className="break-words">{selectedStadium.address}</span>
                  </p>
                </div>

                {/* 정보 카드 - 모바일 최적화 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 lg:mb-6">
                  <div className="bg-primary-50 p-3 sm:p-4 rounded-lg">
                    <div className="text-primary-600 font-semibold text-base sm:text-lg">{formatPrice(selectedStadium.hourlyRate)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">이용요금</div>
                  </div>
                  {selectedStadium.availableHours && (
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-green-600 font-semibold text-base sm:text-lg break-words">
                        {selectedStadium.availableHours}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">이용시간</div>
                    </div>
                  )}
                  {selectedStadium.contactNumber && (
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                      <div className="text-orange-600 font-semibold text-base sm:text-lg">{selectedStadium.contactNumber}</div>
                      <div className="text-xs sm:text-sm text-gray-600">연락처</div>
                    </div>
                  )}
                </div>

                {/* 편의시설 - 모바일 최적화 */}
                {(() => {
                  const facilities = parseFacilities(selectedStadium.facilities);
                  return facilities.length > 0 && (
                    <div className="mb-4 lg:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">편의시설</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {facilities.map((facility, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="break-words">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 액션 버튼 - 모바일 최적화 */}
                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1 py-3 sm:py-2 text-sm sm:text-base touch-manipulation">
                    예약 문의
                  </Button>
                  <Button 
                    variant="outline" 
                    className="py-3 sm:py-2 px-4 touch-manipulation"
                    onClick={() => handleViewMap(selectedStadium)}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        </>
      )}
      
      {/* 구장 위치 지도 모달 */}
      <StadiumMapModal
        isOpen={showMapModal}
        onClose={() => {
          setShowMapModal(false);
          setMapStadium(null);
        }}
        stadium={mapStadium}
      />
    </div>
  );
};

export default Stadiums;
