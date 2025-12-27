import React, { useState, useEffect } from 'react';
import KakaoMultiMap from './KakaoMultiMap';
import SimpleMap from './SimpleMap';
import StadiumDetailModal from './StadiumDetailModal';
import { stadiumService } from '../../services/stadiumService';
import { Teams } from '../../api';

interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
  teamCode?: string | null;
  teamSubdomain?: string | null; // 서브도메인 추가
  facilities?: string[] | null;
  hourlyRate?: number | null;
  contactNumber?: string | null;
  imageUrls?: string[] | null;
  // 팀 연락처 정보
  teamContactPhone?: string | null;
  teamKakaoId?: string | null;
}

interface TeamInfo {
  id: number;
  name: string;
  subdomain: string;
  description: string;
}

const TeamMapSection: React.FC = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStadiums, setFilteredStadiums] = useState<Stadium[]>([]);
  const [useKakaoMap, setUseKakaoMap] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // 병렬로 스타디움과 팀 데이터를 가져옵니다
        const [stadiumResponse, teamsResponse] = await Promise.all([
          stadiumService.getStadiums(0, 1000),
          Teams.public.getAll()
        ]);

        console.log('✅ Teams API 응답:', teamsResponse);

        // Team 타입을 TeamInfo 타입으로 변환하고 맵으로 만들어서 빠른 조회 가능하게 합니다
        const teamsMap = new Map<number, TeamInfo>();
        teamsResponse.forEach((team) => {
          // Team 타입에서 subdomain 필드가 없으므로 code를 subdomain으로 사용
          const teamInfo: TeamInfo = {
            id: team.id,
            name: team.name,
            subdomain: team.code, // code를 subdomain으로 사용
            description: team.description
          };
          teamsMap.set(team.id, teamInfo);
        });

        // StadiumDto를 Stadium 인터페이스에 맞게 변환하면서 팀 서브도메인 추가
        const transformedStadiums: Stadium[] = (stadiumResponse.content || []).map(stadium => {
          const teamInfo = teamsMap.get(stadium.teamId);
          return {
            id: stadium.id,
            name: stadium.name,
            address: stadium.address,
            latitude: stadium.latitude,
            longitude: stadium.longitude,
            teamId: stadium.teamId,
            teamName: stadium.teamName,
            teamCode: stadium.teamCode || null,
            teamSubdomain: teamInfo?.subdomain || null,
            facilities: stadium.facilities,
            hourlyRate: stadium.hourlyRate,
            contactNumber: stadium.contactNumber,
            imageUrls: stadium.imageUrls,
            teamContactPhone: stadium.teamContactPhone,
            teamKakaoId: stadium.teamKakaoId
          };
        });

        console.log(`✅ ${transformedStadiums.length}개 스타디움 데이터 변환 완료:`, transformedStadiums);

        const convertedTeams = Array.from(teamsMap.values());
        setTeams(convertedTeams);
        setStadiums(transformedStadiums);
        setFilteredStadiums(transformedStadiums);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError('팀 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStadiums(stadiums);
    } else {
      const filtered = stadiums.filter(stadium =>
          stadium.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stadium.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStadiums(filtered);
    }
  }, [searchQuery, stadiums]);

  const handleStadiumClick = (stadium: Stadium) => {
    setSelectedStadium(stadium);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStadium(null);
  };

  if (error) {
    return (
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            다시 시도
          </button>
        </div>
    );
  }

  return (
      <div className="relative">
        {/* 검색 및 필터 영역 */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="팀명, 구장명, 지역으로 검색..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              전체 {filteredStadiums.length}개 팀
            </span>
              {searchQuery && (
                  <button
                      onClick={() => setSearchQuery('')}
                      className="text-primary-600 hover:text-primary-700 underline"
                  >
                    검색 초기화
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="relative">
          {isLoading ? (
              <div className="h-96 sm:h-[500px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">전국 축구팀 정보를 불러오는 중...</p>
                </div>
              </div>
          ) : filteredStadiums.length > 0 ? (
              <div className="space-y-4">
                {useKakaoMap ? (
                    <KakaoMultiMap
                        key="kakao-multi-map"
                        stadiums={filteredStadiums}
                        onStadiumClick={handleStadiumClick}
                        onMapError={() => {
                          setUseKakaoMap(false);
                        }}
                        height="500px"
                        className="w-full"
                    />
                ) : (
                    <div className="space-y-3">
                      {/* 카카오맵 실패 안내 */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-yellow-600">⚠️</div>
                            <div className="text-sm text-yellow-800">
                              카카오맵 연결에 문제가 있어 간단한 지도로 표시됩니다.
                            </div>
                          </div>
                          <button
                              onClick={() => setUseKakaoMap(true)}
                              className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 shadow-sm"
                          >
                            카카오맵 재시도
                          </button>
                        </div>
                      </div>
                      <SimpleMap
                          stadiums={filteredStadiums}
                          onStadiumClick={handleStadiumClick}
                          height="500px"
                          className="w-full"
                      />
                    </div>
                )}
              </div>
          ) : (
              <div className="h-96 sm:h-[500px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏟️</div>
                  <p className="text-gray-600 text-lg">
                    {searchQuery ? '검색 결과가 없습니다' : '등록된 축구팀이 없습니다'}
                  </p>
                  {searchQuery && (
                      <button
                          onClick={() => setSearchQuery('')}
                          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        모든 팀 보기
                      </button>
                  )}
                </div>
              </div>
          )}
        </div>

        {/* 하단 정보 영역 */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>💡 마커를 클릭하면 팀 상세정보를 확인할 수 있습니다</span>
            </div>
            <div className="flex items-center gap-4">
              <span>📍 지도를 드래그하여 원하는 지역을 탐색해보세요</span>
            </div>
          </div>
        </div>


        {/* 스타디움 상세 모달 */}
        <StadiumDetailModal
            stadium={selectedStadium}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
        />
      </div>
  );
};

export default TeamMapSection;
