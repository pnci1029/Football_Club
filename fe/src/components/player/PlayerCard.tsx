import React from 'react';
import { Player, PlayerDto } from '../../types/player';

// PlayerCard는 두 타입 모두 지원 (더미 데이터와 실제 API 데이터)
interface PlayerCardProps {
  player: Player | PlayerDto;
  onClick?: (player: Player | PlayerDto) => void;
  showStats?: boolean;
}

const PlayerCard = React.memo<PlayerCardProps>(({ 
  player, 
  onClick, 
  showStats = false 
}) => {
  const getPositionColor = (position: string): string => {
    const colors: {[key: string]: string} = {
      GK: 'bg-orange-100 text-orange-700',
      DF: 'bg-blue-100 text-blue-700',  
      MF: 'bg-green-100 text-green-700',
      FW: 'bg-red-100 text-red-700'
    };
    return colors[position] || 'bg-gray-100 text-gray-700';
  };

  const getPositionName = (position: string): string => {
    const names: {[key: string]: string} = {
      GK: '골키퍼',
      DF: '수비수',
      MF: '미드필더',
      FW: '공격수'
    };
    return names[position] || position;
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md
        transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden
        ${onClick ? 'cursor-pointer touch-manipulation' : ''}
      `}
      onClick={() => onClick?.(player)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 프로필 이미지 - 모바일 최적화 */}
      <div className="relative overflow-hidden">
        <div className="w-full aspect-[3/4] bg-gray-50 overflow-hidden rounded-t-xl relative">
          <img 
            src={player.profileImageUrl || (player as Player).photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=300`} 
            alt={`${player.name} 프로필`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=300`;
            }}
          />
        </div>
        {(player.backNumber || (player as Player).jerseyNumber) && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white rounded-md px-2 py-1 text-xs font-semibold">
            {player.backNumber || (player as Player).jerseyNumber}
          </div>
        )}
        {player.isActive === false && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
              비활성
            </span>
          </div>
        )}
      </div>

      {/* 선수 정보 - 모바일 최적화 */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
          {player.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className={`
            inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
            ${getPositionColor(player.position)}
          `}>
            {getPositionName(player.position)}
          </span>
          
          {(player.backNumber || (player as Player).jerseyNumber) && (
            <span className="text-gray-500 font-medium text-xs">
              #{player.backNumber || (player as Player).jerseyNumber}
            </span>
          )}
        </div>
        
        {/* 통계 - 모바일 최적화 */}
        {showStats && (player as Player).stats && (
          <div className="flex justify-between text-xs text-gray-600 pt-3 border-t border-gray-100/80">
            <div className="text-center flex-1">
              <div className="font-bold text-gray-900 text-sm">{(player as Player).stats?.matchesPlayed || 0}</div>
              <div className="text-xs text-gray-500">경기</div>
            </div>
            <div className="text-center flex-1">
              <div className="font-bold text-blue-600 text-sm">{(player as Player).stats?.goals || 0}</div>
              <div className="text-xs text-gray-500">골</div>
            </div>
            <div className="text-center flex-1">
              <div className="font-bold text-green-600 text-sm">{(player as Player).stats?.assists || 0}</div>
              <div className="text-xs text-gray-500">도움</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PlayerCard;