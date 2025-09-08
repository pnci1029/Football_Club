import React, { useState, useMemo } from 'react';
import { MatchDto } from '../types/match';
import { useMatches } from '../hooks/useMatches';
import { Button, LoadingSpinner } from '../components/common';
import { MatchCard, MatchDetail } from '../components/match';


const getOurTeamName = () => {
  // Get our team name from subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  if (subdomain === 'admin' || subdomain === 'localhost') {
    return 'Football Club'; // Default name for admin or localhost
  }
  return subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' FC';
};


// Transform MatchDto to MatchCard format
const transformMatchForCard = (match: MatchDto) => {
  return {
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeScore: match.homeTeamScore ?? undefined,
    awayScore: match.awayTeamScore ?? undefined,
    date: match.matchDate.split('T')[0],
    time: match.matchDate.split('T')[1]?.substring(0, 5) || '00:00',
    venue: match.stadium.name,
    status: match.status.toLowerCase() as 'scheduled' | 'live' | 'finished' | 'cancelled',
    matchType: 'league' as const,
    league: undefined
  };
};

// Transform MatchDto to MatchDetail format
const transformMatchForDetail = (match: MatchDto) => {
  return {
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeScore: match.homeTeamScore ?? undefined,
    awayScore: match.awayTeamScore ?? undefined,
    date: match.matchDate.split('T')[0],
    time: match.matchDate.split('T')[1]?.substring(0, 5) || '00:00',
    venue: match.stadium.name,
    status: match.status.toLowerCase() as 'scheduled' | 'live' | 'finished' | 'cancelled',
    matchType: 'league' as const,
    league: undefined,
    season: '2023-24',
    weather: undefined,
    attendance: undefined,
    referee: undefined
  };
};

const Matches: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchDto | null>(null);
  const { data: matchesPage, loading, error } = useMatches(0, 50);

  const filteredMatches = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const matchesData = matchesPage?.content || [];

    return matchesData.filter(match => {
      if (filter === 'upcoming') {
        return match.status === 'SCHEDULED' || match.matchDate >= today;
      }
      if (filter === 'finished') {
        return match.status === 'FINISHED';
      }
      return true;
    }).sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  }, [filter, matchesPage?.content]);



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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 헤더 - 모바일 최적화 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">경기 일정</h1>
        <p className="text-sm sm:text-base text-gray-600">우리 팀의 경기 일정과 결과를 확인하세요</p>
      </div>

      {!selectedMatch ? (
        <>
          {/* 필터 버튼 - 모바일 최적화 */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1 sm:flex-none py-3 sm:py-2 text-sm sm:text-base touch-manipulation"
            >
              전체
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
              className="flex-1 sm:flex-none py-3 sm:py-2 text-sm sm:text-base touch-manipulation"
            >
              예정된 경기
            </Button>
            <Button
              variant={filter === 'finished' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('finished')}
              className="flex-1 sm:flex-none py-3 sm:py-2 text-sm sm:text-base touch-manipulation"
            >
              경기 결과
            </Button>
          </div>

          {/* 경기 목록 - 모바일 최적화 */}
          <div className="space-y-3 sm:space-y-4">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={transformMatchForCard(match)}
                ourTeamName={getOurTeamName()}
                onCardClick={() => setSelectedMatch(match)}
              />
            ))}

            {/* 빈 상태 - 모바일 최적화 */}
            {filteredMatches.length === 0 && (
              <div className="text-center text-gray-500 py-12 sm:py-16 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">⚽</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  관리자 페이지에서 경기를 추가해주세요.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <MatchDetail
          match={transformMatchForDetail(selectedMatch)}
          events={[]} // No events data yet
          ourTeamName={getOurTeamName()}
          onBack={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

export default Matches;