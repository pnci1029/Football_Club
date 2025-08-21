import React, { useState } from 'react';
import { useStadiums } from '../hooks/useStadiums';
import { StadiumDto } from '../types/stadium';
import { Card, Button, LoadingSpinner } from '../components/common';

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
  const { data: stadiumsPage, loading, error, refetch } = useStadiums(0, 20);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const stadiums = stadiumsPage?.content || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">경기장 정보</h1>
        <p className="text-gray-600">우리가 경기할 수 있는 다양한 경기장을 소개합니다</p>
      </div>

      {!selectedStadium ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=경기장';
                  }}
                />
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{stadium.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📍</span>
                    {stadium.address}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">이용요금</span>
                    <span className="font-medium text-primary-600">{formatPrice(stadium.hourlyRate)}</span>
                  </div>
                  {stadium.availableHours && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">이용시간</span>
                      <span className="font-medium">{stadium.availableHours}</span>
                    </div>
                  )}
                </div>

                {facilities.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">주요 시설</p>
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
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedStadium(null)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            className="mb-6"
          >
            목록으로 돌아가기
          </Button>

          <Card padding="lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                {(() => {
                  const images = parseImageUrls(selectedStadium.imageUrls);
                  return (
                    <>
                      <img
                        src={images[0] || 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=경기장'}
                        alt={selectedStadium.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
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

              <div>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStadium.name}</h1>
                  <p className="text-gray-600 flex items-center mb-2">
                    <span className="mr-2">📍</span>
                    {selectedStadium.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-primary-600 font-semibold text-lg">{formatPrice(selectedStadium.hourlyRate)}</div>
                    <div className="text-sm text-gray-600">이용요금</div>
                  </div>
                  {selectedStadium.availableHours && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 font-semibold text-lg">
                        {selectedStadium.availableHours}
                      </div>
                      <div className="text-sm text-gray-600">이용시간</div>
                    </div>
                  )}
                  {selectedStadium.contactNumber && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-orange-600 font-semibold text-lg">{selectedStadium.contactNumber}</div>
                      <div className="text-sm text-gray-600">연락처</div>
                    </div>
                  )}
                </div>

                {(() => {
                  const facilities = parseFacilities(selectedStadium.facilities);
                  return facilities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">편의시설</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {facilities.map((facility, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                            {facility}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1">
                    예약 문의
                  </Button>
                  <Button variant="outline">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Stadiums;