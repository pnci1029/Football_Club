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
        bg-white rounded-2xl shadow-card hover:shadow-soft
        transition-all duration-300 hover:-translate-y-1
        p-6 border border-gray-100
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onClick?.(player)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 프로필 이미지 및 등번호 */}
      <div className="relative mb-4">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100">
          <img 
            src={player.profileImageUrl || (player as Player).photo || '/images/default-player.png'} 
            alt={`${player.name} 프로필`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {(player.backNumber || (player as Player).jerseyNumber) && (
          <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {player.backNumber || (player as Player).jerseyNumber}
          </div>
        )}
      </div>
      
      {/* 선수 정보 */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
        
        <span className={`
          inline-block px-3 py-1 rounded-full text-xs font-medium
          ${getPositionColor(player.position)}
        `}>
          {getPositionName(player.position)}
        </span>
        
        {showStats && (player as Player).stats && (
          <div className="flex justify-center space-x-4 text-sm text-gray-600 pt-2">
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
        
        {player.isActive === false && (
          <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
            비활성
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;