import React from 'react';
import { useTeam } from '../contexts/TeamContext';
import PlayerCard from '../components/player/PlayerCard';
import { usePlayers } from '../hooks/usePlayers';

const Home: React.FC = () => {
  const { currentTeam } = useTeam();
  const { data: playersPage } = usePlayers(0, 12);
  
  const players = playersPage?.content || [];
  const mainPlayers = players.filter(player => player.isActive).slice(0, 11);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <span className="text-4xl">⚽</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {currentTeam?.name || 'Football Club'}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              {currentTeam?.description || '열정과 실력으로 무장한 최고의 축구 클럽'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Squad */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">주전 선수단</h2>
          <p className="text-gray-600">우리 팀의 핵심 선수들을 소개합니다</p>
        </div>
        
        {mainPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
            {mainPlayers.map((player) => (
              <PlayerCard 
                key={player.id}
                player={player}
                showStats={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-16">
            <div className="text-gray-400 text-lg">등록된 선수가 없습니다</div>
          </div>
        )}


        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <div className="flex justify-center space-x-4">
            <a 
              href="/players" 
              className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
            >
              선수단
            </a>
            <a 
              href="/matches" 
              className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors text-lg font-medium"
            >
              경기 일정
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;