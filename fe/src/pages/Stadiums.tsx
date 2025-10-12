import React, { useState } from 'react';
import { useStadiums } from '../hooks/useStadiums';
import { StadiumDto } from '../types/stadium';
import { Card, LoadingSpinner } from '../components/common';
import StadiumMapModal from '../components/admin/StadiumMapModal';
import StadiumsMapView from '../components/stadiums/StadiumsMapView';
import KakaoMap from '../components/map/KakaoMap';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const formatPrice = (price?: number) => {
  return price ? `${price.toLocaleString()}원/시간` : '문의';
};

const parseFacilities = (facilities?: string | string[]): string[] => {
  if (!facilities) return [];

  // 이미 배열인 경우
  if (Array.isArray(facilities)) return facilities;

  // 문자열인 경우에만 처리
  if (typeof facilities === 'string') {
    try {
      return JSON.parse(facilities);
    } catch {
      return facilities.split(',').map(facility => facility.trim());
    }
  }

  return [];
};

const parseDays = (days?: string[]): string[] => {
  return days || [];
};

const formatDayName = (day: string): string => {
  const dayLabels: Record<string, string> = {
    'MONDAY': '월',
    'TUESDAY': '화',
    'WEDNESDAY': '수',
    'THURSDAY': '목',
    'FRIDAY': '금',
    'SATURDAY': '토',
    'SUNDAY': '일'
  };
  return dayLabels[day] || day;
};

const Stadiums: React.FC = () => {
  const { success, ToastContainer } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapStadium, setMapStadium] = useState<StadiumDto | null>(null);
  const { data: stadiumsData, loading, error, refetch } = useStadiums();
  const { admin, isAuthenticated } = useAuth();
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

          <div className="flex items-center space-x-3">
            {/* 관리자 기능 */}
            {isAuthenticated && admin && (
              <button
                onClick={() => {/* TODO: 구장 추가 모달 */}}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                구장 추가
              </button>
            )}

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
      </div>

      {viewMode === 'grid' ? (
        /* 경기장 대형 카드 - 한 줄에 하나씩 */
        <div className="space-y-6">
          {stadiums.map((stadium) => {
            const facilities = parseFacilities(stadium.facilities);
            return (
              <Card
                key={stadium.id}
                padding="none"
                className="overflow-hidden"
              >
                <div className="flex flex-col">
                  {/* 구장 지도 - 위쪽 전체 너비 */}
                  <div className="w-full">
                    <div className="relative h-64 sm:h-80 lg:h-96">
                      {/* 실제 카카오맵 표시 */}
                      {stadium.latitude && stadium.longitude ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <KakaoMap
                            latitude={stadium.latitude}
                            longitude={stadium.longitude}
                            stadiumName={stadium.name}
                            address={stadium.address}
                            height="100%"
                            className="border-0"
                          />
                        </div>
                      ) : (
                        /* 좌표가 없는 경우 기본 이미지 */
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-600">
                          <div className="text-center text-white">
                            <div className="text-6xl mb-4">🏟️</div>
                            <h3 className="text-2xl font-bold mb-2">{stadium.name}</h3>
                            <p className="text-green-100 text-sm">
                              📍 위치 정보가 설정되지 않았습니다
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 구장 정보 오버레이 */}
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-800 px-3 py-2 rounded-lg shadow-md">
                        <div className="text-sm font-semibold">{formatPrice(stadium.hourlyRate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 구장 정보 - 아래쪽 전체 너비 */}
                  <div className="w-full p-6 bg-white border-t border-gray-100">
                    {/* 헤더 정보 */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{stadium.name}</h3>

                      {/* 주소 정보 박스 */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start flex-1">
                            <span className="text-gray-500 mr-3 mt-1 text-lg">📍</span>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium leading-relaxed">
                                {stadium.address}
                              </p>
                            </div>
                          </div>

                          {/* 주소 복사 버튼 */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(stadium.address);
                              success('주소가 복사되었습니다!');
                            }}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="주소 복사"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 정보 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* 이용요금 */}
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <div className="mb-2">
                          <span className="text-gray-700 font-medium">이용요금</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{formatPrice(stadium.hourlyRate)}</p>
                      </div>

                      {/* 이용시간 */}
                      {stadium.availableHours && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                          <div className="mb-2">
                            <span className="text-gray-700 font-medium">이용시간</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{stadium.availableHours}</p>
                        </div>
                      )}

                      {/* 이용요일 */}
                      {(() => {
                        const availableDays = parseDays(stadium.availableDays);
                        return availableDays.length > 0 && (
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <div className="mb-2">
                              <span className="text-gray-700 font-medium">이용요일</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {availableDays.map((day) => (
                                <span
                                  key={day}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 font-medium"
                                >
                                  {formatDayName(day)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 연락처 */}
                      {stadium.contactNumber && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                          <div className="mb-2">
                            <span className="text-gray-700 font-medium">연락처</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{stadium.contactNumber}</p>
                        </div>
                      )}
                    </div>

                    {/* 시설 */}
                    {facilities.length > 0 && (
                      <div className="mb-6">
                        <div className="mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">이용 가능한 시설</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {facilities.slice(0, 6).map((facility, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {facility}
                            </span>
                          ))}
                          {facilities.length > 6 && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded text-sm bg-gray-200 text-gray-600 border border-gray-300">
                              +{facilities.length - 6}개 더
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 액션 버튼들 */}
                    <div className={`grid gap-3 ${isAuthenticated && admin ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMap(stadium);
                        }}
                        className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        🗺️ 지도보기
                      </button>

                      {/* 길찾기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (stadium.latitude && stadium.longitude) {
                            const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(stadium.name)},${stadium.latitude},${stadium.longitude}`;
                            window.open(kakaoMapUrl, '_blank');
                          } else {
                            const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(stadium.address)}`;
                            window.open(searchUrl, '_blank');
                          }
                        }}
                        className="px-4 py-3 text-sm font-semibold text-green-700 bg-gradient-to-r from-green-100 to-green-200 border border-green-300 rounded-xl hover:from-green-200 hover:to-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        🚗 길찾기
                      </button>

                      {/* 관리자 기능 */}
                      {isAuthenticated && admin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              /* TODO: 구장 수정 모달 */
                            }}
                            className="px-4 py-3 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-xl hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            ✏️ 수정
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              /* TODO: 구장 삭제 확인 */
                            }}
                            className="px-4 py-3 text-sm font-semibold text-red-700 bg-gradient-to-r from-red-100 to-red-200 border border-red-300 rounded-xl hover:from-red-200 hover:to-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            🗑️ 삭제
                          </button>
                        </>
                      )}
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

      <ToastContainer />
    </div>
  );
};

export default Stadiums;
