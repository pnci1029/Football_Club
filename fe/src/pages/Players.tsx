import React from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { PlayerDto } from '../types/player';
import { LoadingSpinner } from '../components/common';

const getPositionColor = (position: string) => {
  switch (position) {
    case 'GK':
      return 'bg-position-gk text-white';
    case 'DF':
      return 'bg-position-df text-white';
    case 'MF':
      return 'bg-position-mf text-white';
    case 'FW':
      return 'bg-position-fw text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getPositionName = (position: string) => {
  switch (position) {
    case 'GK':
      return '골키퍼';
    case 'DF':
      return '수비수';
    case 'MF':
      return '미드필더';
    case 'FW':
      return '공격수';
    default:
      return position;
  }
};

const Players: React.FC = () => {
  const { data: playersPage, loading, error, refetch } = usePlayers(0, 20);

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

  const players = playersPage?.content || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">선수단</h1>
        <p className="text-gray-600">우리 팀의 선수들을 소개합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player: PlayerDto) => (
          <div
            key={player.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={player.profileImageUrl || `https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=${player.name.charAt(0)}`}
                alt={player.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=' + player.name.charAt(0);
                }}
              />
              {player.backNumber && (
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                    #{player.backNumber}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                  {getPositionName(player.position)}
                </span>
              </div>
              {!player.isActive && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    비활성
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{player.name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{player.teamName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;