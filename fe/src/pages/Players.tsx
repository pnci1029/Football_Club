import React from 'react';
import { dummyPlayers, Player } from '../data/players';

const getPositionColor = (position: Player['position']) => {
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

const getPositionName = (position: Player['position']) => {
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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">선수단</h1>
        <p className="text-gray-600">우리 팀의 선수들을 소개합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dummyPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=' + player.name.charAt(0);
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  #{player.jerseyNumber}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                  {getPositionName(player.position)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{player.name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{player.age}세</span>
                  <span className="mx-2">•</span>
                  <span>{player.nationality}</span>
                </div>
              </div>

              {player.stats && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">경기</span>
                      <span className="font-medium">{player.stats.matchesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">골</span>
                      <span className="font-medium text-green-600">{player.stats.goals || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">도움</span>
                      <span className="font-medium text-blue-600">{player.stats.assists || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">경고</span>
                      <span className="font-medium text-yellow-600">{player.stats.yellowCards || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;