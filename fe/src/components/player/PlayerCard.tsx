import React from 'react';
import { Player, Position } from '../../types/player';

interface PlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  showStats?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onClick, 
  showStats = false 
}) => {
  const getPositionColor = (position: Position): string => {
    const colors = {
      GK: 'bg-position-gk text-white',
      DF: 'bg-position-df text-white',  
      MF: 'bg-position-mf text-white',
      FW: 'bg-position-fw text-white'
    };
    return colors[position];
  };

  const getPositionName = (position: Position): string => {
    const names = {
      GK: '골키퍼',
      DF: '수비수',
      MF: '미드필더',
      FW: '공격수'
    };
    return names[position];
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
            src={player.profileImageUrl || '/images/default-player.png'} 
            alt={`${player.name} 프로필`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {player.backNumber && (
          <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {player.backNumber}
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
        
        {showStats && player.stats && (
          <div className="flex justify-center space-x-4 text-sm text-gray-600 pt-2">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{player.stats.gamesPlayed}</div>
              <div>경기</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{player.stats.goals}</div>
              <div>골</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{player.stats.assists}</div>
              <div>도움</div>
            </div>
          </div>
        )}
        
        {!player.isActive && (
          <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
            비활성
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;