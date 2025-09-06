import React from 'react';
import { Card } from '../common';

interface MatchCardProps {
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    date: string;
    time: string;
    venue: string;
    status: 'scheduled' | 'live' | 'finished' | 'cancelled';
    matchType: 'league' | 'cup' | 'friendly';
    league?: string;
  };
  ourTeamName?: string;
  onCardClick?: (matchId: number) => void;
  compact?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  ourTeamName = 'Football Club',
  onCardClick,
  compact = false 
}) => {
  const isOurTeam = (teamName: string) => teamName === ourTeamName;
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예정';
      case 'live': return '진행중';
      case 'finished': return '종료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'finished': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchTypeText = (type: string) => {
    switch (type) {
      case 'league': return '리그전';
      case 'cup': return '컵대회';
      case 'friendly': return '친선경기';
      default: return type;
    }
  };

  const getMatchResult = () => {
    if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) {
      return null;
    }
    
    const isHome = isOurTeam(match.homeTeam);
    const ourScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    if (ourScore > opponentScore) return 'win';
    if (ourScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'win': return 'text-green-600 bg-green-50';
      case 'loss': return 'text-red-600 bg-red-50';
      case 'draw': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultText = (result: string | null) => {
    switch (result) {
      case 'win': return '승';
      case 'loss': return '패';
      case 'draw': return '무';
      default: return '-';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const result = getMatchResult();

  const handleClick = () => {
    if (onCardClick) {
      onCardClick(match.id);
    }
  };

  if (compact) {
    return (
      <Card 
        hover 
        padding="sm" 
        onClick={handleClick}
        className="cursor-pointer touch-manipulation"
      >
        {/* 컴팩트 모드 - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-gray-500">
              {formatDate(match.date)} {match.time}
            </div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
          </div>
          
          {/* 팀 정보 - 모바일 최적화 */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="text-center flex-1 sm:flex-none">
              <div className={`text-sm sm:text-sm font-medium truncate ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500">HOME</div>
            </div>
            
            <div className="text-center px-2">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                  `${match.homeScore} : ${match.awayScore}`
                ) : (
                  'VS'
                )}
              </div>
              {result && (
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getResultColor(result)}`}>
                  {getResultText(result)}
                </div>
              )}
            </div>
            
            <div className="text-center flex-1 sm:flex-none">
              <div className={`text-sm sm:text-sm font-medium truncate ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.awayTeam}
              </div>
              <div className="text-xs text-gray-500">AWAY</div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      hover 
      padding="md" 
      onClick={handleClick}
      className="cursor-pointer touch-manipulation"
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Header - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
            <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              {getMatchTypeText(match.matchType)}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {formatDate(match.date)} {match.time}
          </div>
        </div>

        {/* Match Info - 모바일 최적화 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            {/* Home Team */}
            <div className="text-center flex-1 sm:flex-none">
              <div className={`text-base sm:text-lg font-bold mb-1 truncate ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Home</div>
            </div>

            {/* Score */}
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                  `${match.homeScore} : ${match.awayScore}`
                ) : (
                  'VS'
                )}
              </div>
              {result && (
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getResultColor(result)}`}>
                  우리팀 {getResultText(result)}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center flex-1 sm:flex-none">
              <div className={`text-base sm:text-lg font-bold mb-1 truncate ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.awayTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Away</div>
            </div>
          </div>

          {/* Venue & League - 모바일 최적화 */}
          <div className="text-center lg:text-right">
            <div className="text-sm text-gray-600 mb-1 truncate">📍 {match.venue}</div>
            {match.league && (
              <div className="text-xs text-gray-500 truncate">{match.league}</div>
            )}
          </div>
        </div>

        {/* Live Status Indicator - 모바일 최적화 */}
        {match.status === 'live' && (
          <div className="flex items-center justify-center py-3 sm:py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">경기 진행중</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;