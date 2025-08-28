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
        transition-all duration-300 hover:-translate-y-2 hover:scale-105
        p-6 border border-gray-100 relative overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onClick?.(player)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7.5,13C7.5,11.07 9.07,9.5 11,9.5C12.93,9.5 14.5,11.07 14.5,13C14.5,14.93 12.93,16.5 11,16.5C9.07,16.5 7.5,14.93 7.5,13Z"/>
        </svg>
      </div>
      
      {/* 프로필 이미지 및 등번호 */}
      <div className="relative mb-4">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
          <img 
            src={player.profileImageUrl || (player as Player).photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=96`} 
            alt={`${player.name} 프로필`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=96`;
            }}
          />
        </div>
        {(player.backNumber || (player as Player).jerseyNumber) && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white">
            {player.backNumber || (player as Player).jerseyNumber}
          </div>
        )}
      </div>
      
      {/* 선수 정보 */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-gray-900 truncate">{player.name}</h3>
        
        <div className="flex items-center justify-center space-x-2">
          <span className={`
            inline-block px-4 py-1 rounded-full text-sm font-bold
            ${getPositionColor(player.position)}
          `}>
            {getPositionName(player.position)}
          </span>
          {(player.backNumber || (player as Player).jerseyNumber) && (
            <span className="text-sm text-gray-500 font-medium">
              #{player.backNumber || (player as Player).jerseyNumber}
            </span>
          )}
        </div>
        
        {showStats && (player as Player).stats && (
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <div className="flex justify-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-primary-600">{(player as Player).stats?.matchesPlayed || 0}</div>
                <div className="text-gray-600 text-xs">경기</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{(player as Player).stats?.goals || 0}</div>
                <div className="text-gray-600 text-xs">골</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{(player as Player).stats?.assists || 0}</div>
                <div className="text-gray-600 text-xs">도움</div>
              </div>
            </div>
          </div>
        )}
        
        {player.isActive === false && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              비활성
            </span>
          </div>
        )}
        
        {player.isActive !== false && (
          <div className="mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;