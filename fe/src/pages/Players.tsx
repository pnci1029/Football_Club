import React, { useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { PlayerDto } from '../types/player';
import { LoadingSpinner, Button, Card } from '../components/common';
import PlayerCard from '../components/player/PlayerCard';

interface FilterState {
  position: string;
  isActive: boolean | null;
}

const Players: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDto | null>(null);
  const [filter, setFilter] = useState<FilterState>({ position: 'ALL', isActive: null });
  const { data: playersPage, loading, error, refetch } = usePlayers(0, 50);
  
  const positions = ['ALL', 'GK', 'DF', 'MF', 'FW'];
  const positionNames: {[key: string]: string} = {
    ALL: '전체',
    GK: '골키퍼',
    DF: '수비수',
    MF: '미드필더',
    FW: '공격수'
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

  let players = playersPage?.content || [];
  
  // 필터링 적용
  if (filter.position !== 'ALL') {
    players = players.filter(player => player.position === filter.position);
  }
  
  if (filter.isActive !== null) {
    players = players.filter(player => player.isActive === filter.isActive);
  }

  if (!selectedPlayer) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 헤더 - 모바일 최적화 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">선수단</h1>
          <p className="text-sm sm:text-base text-gray-600">우리 팀의 선수들을 소개합니다</p>
        </div>

        {/* 필터 메뉴 - 모바일 최적화 */}
        <div className="mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">포지션</label>
              <div className="flex flex-wrap gap-2">
                {positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setFilter(prev => ({ ...prev, position: pos }))}
                    className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                      filter.position === pos 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    {positionNames[pos]}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">상태</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(prev => ({ ...prev, isActive: null }))}
                  className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    filter.isActive === null 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilter(prev => ({ ...prev, isActive: true }))}
                  className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    filter.isActive === true 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  활성
                </button>
                <button
                  onClick={() => setFilter(prev => ({ ...prev, isActive: false }))}
                  className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    filter.isActive === false 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  비활성
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600 mt-4">
            총 {players.length}명의 선수
          </div>
        </div>

        {/* 선수 그리드 - 모바일 최적화 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {players.map((player: PlayerDto) => (
            <PlayerCard 
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
              showStats={false}
            />
          ))}
        </div>
        
        {/* 빈 상태 - 모바일 최적화 */}
        {players.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 text-base sm:text-lg mb-3">해당 조건의 선수가 없습니다</div>
            <button 
              onClick={() => setFilter({ position: 'ALL', isActive: null })}
              className="text-primary-600 hover:text-primary-700 active:text-primary-800 text-sm sm:text-base touch-manipulation"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // 선수 상세 보기 - 모바일 최적화
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Button
        variant="ghost"
        onClick={() => setSelectedPlayer(null)}
        leftIcon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
        className="mb-4 sm:mb-6 text-sm sm:text-base touch-manipulation"
      >
        선수 목록으로 돌아가기
      </Button>

      <Card padding="lg">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            {/* 프로필 이미지 - 모바일 최적화 */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden bg-gray-100 mb-4">
              <img 
                src={selectedPlayer.profileImageUrl || `https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=${selectedPlayer.name.charAt(0)}`}
                alt={`${selectedPlayer.name} 프로필`}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* 이름 - 모바일 최적화 */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{selectedPlayer.name}</h1>
            
            {/* 뱃지들 - 모바일 최적화 */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-4">
              <span className="bg-primary-50 text-primary-700 px-3 py-2 sm:px-4 rounded-full text-sm font-medium">
                {positionNames[selectedPlayer.position] || selectedPlayer.position}
              </span>
              
              {selectedPlayer.backNumber && (
                <span className="bg-gray-100 text-gray-700 px-3 py-2 sm:px-4 rounded-full text-sm font-medium">
                  #{selectedPlayer.backNumber}
                </span>
              )}
              
              <span className={`px-3 py-2 sm:px-4 rounded-full text-sm font-medium ${
                selectedPlayer.isActive 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {selectedPlayer.isActive ? '활성' : '비활성'}
              </span>
            </div>
            
            {/* 팀명 - 모바일 최적화 */}
            <div className="text-base sm:text-lg text-gray-600">
              {selectedPlayer.teamName}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Players;