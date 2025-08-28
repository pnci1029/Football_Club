import React from 'react';
import { Player, PlayerDto, Position } from '../../types/player';

// PlayerCard는 두 타입 모두 지원 (더미 데이터와 실제 API 데이터)
interface PlayerCardProps {
  player: Player | PlayerDto;
  onClick?: (player: Player | PlayerDto) => void;
  showStats?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onClick, 
  showStats = false 
}) => {
  const getPositionColor = (position: string): string => {
    const colors: {[key: string]: string} = {
      GK: 'bg-position-gk text-white',
      DF: 'bg-position-df text-white',  
      MF: 'bg-position-mf text-white',
      FW: 'bg-position-fw text-white'
    };
    return colors[position] || 'bg-gray-500 text-white';
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
        bg-white rounded-lg shadow-sm border border-gray-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onClick?.(player)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 프로필 이미지 */}
      <div className="relative">
        <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden">
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
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-sm font-bold">
            {player.backNumber || (player as Player).jerseyNumber}
          </div>
        )}
        {player.isActive === false && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              비활성
            </span>
          </div>
        )}
      </div>

      {/* 선수 정보 */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
        
        <div className="flex items-center justify-between">
          <span className={`
            inline-block px-3 py-1 rounded text-sm font-medium
            ${getPositionColor(player.position)}
          `}>
            {getPositionName(player.position)}
          </span>
          
          {(player.backNumber || (player as Player).jerseyNumber) && (
            <span className="text-gray-500 font-medium">
              #{player.backNumber || (player as Player).jerseyNumber}
            </span>
          )}
        </div>
        
        {showStats && (player as Player).stats && (
          <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{(player as Player).stats?.matchesPlayed || 0}</div>
              <div>경기</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{(player as Player).stats?.goals || 0}</div>
              <div>골</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{(player as Player).stats?.assists || 0}</div>
              <div>도움</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;