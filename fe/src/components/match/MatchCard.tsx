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
        className="cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {formatDate(match.date)} {match.time}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-sm font-medium ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500">HOME</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                  `${match.homeScore} : ${match.awayScore}`
                ) : (
                  'VS'
                )}
              </div>
              {result && (
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getResultColor(result)}`}>
                  {getResultText(result)}
                </div>
              )}
            </div>
            
            <div className="text-left">
              <div className={`text-sm font-medium ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
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
      className="cursor-pointer"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
            <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              {getMatchTypeText(match.matchType)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(match.date)} {match.time}
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Home Team */}
            <div className="text-center">
              <div className={`text-lg font-bold mb-1 ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Home</div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
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
            <div className="text-center">
              <div className={`text-lg font-bold mb-1 ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.awayTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Away</div>
            </div>
          </div>

          {/* Venue & League */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">📍 {match.venue}</div>
            {match.league && (
              <div className="text-xs text-gray-500">{match.league}</div>
            )}
          </div>
        </div>

        {/* Live Status Indicator */}
        {match.status === 'live' && (
          <div className="flex items-center justify-center py-2 bg-green-50 rounded-lg border border-green-200">
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