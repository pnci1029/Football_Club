import React from 'react';
import { Card } from '../common';

interface MatchResultProps {
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    date: string;
    time: string;
    venue: string;
    matchType: 'league' | 'cup' | 'friendly';
    league?: string;
  };
  ourTeamName?: string;
  showStats?: boolean;
}

const MatchResult: React.FC<MatchResultProps> = ({
  match,
  ourTeamName = 'Football Club',
  showStats = false
}) => {
  const isOurTeam = (teamName: string) => teamName === ourTeamName;
  
  const getMatchResult = () => {
    const isHome = isOurTeam(match.homeTeam);
    const ourScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    
    if (ourScore > opponentScore) return 'win';
    if (ourScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '🎉'
      };
      case 'loss': return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '😔'
      };
      case 'draw': return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '🤝'
      };
      default: return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⚽'
      };
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return '승리';
      case 'loss': return '패배';
      case 'draw': return '무승부';
      default: return '';
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const result = getMatchResult();
  const resultStyle = getResultColor(result);
  const opponent = isOurTeam(match.homeTeam) ? match.awayTeam : match.homeTeam;
  const isHome = isOurTeam(match.homeTeam);
  const ourScore = isHome ? match.homeScore : match.awayScore;
  const opponentScore = isHome ? match.awayScore : match.homeScore;

  return (
    <Card className={`${resultStyle.bg} ${resultStyle.border} border`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{resultStyle.icon}</span>
            <span className={`font-semibold ${resultStyle.text}`}>
              {getResultText(result)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {formatDate(match.date)} {match.time}
            </div>
            <div className="text-xs text-gray-500">
              {getMatchTypeText(match.matchType)}
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-6">
            {/* Our Team */}
            <div className="text-center">
              <div className="text-primary-600 font-bold text-lg mb-1">
                {ourTeamName}
              </div>
              <div className={`text-3xl font-bold ${resultStyle.text}`}>
                {ourScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isHome ? 'HOME' : 'AWAY'}
              </div>
            </div>

            {/* VS */}
            <div className="text-gray-400 text-xl font-bold">
              VS
            </div>

            {/* Opponent */}
            <div className="text-center">
              <div className="text-gray-900 font-bold text-lg mb-1">
                {opponent}
              </div>
              <div className="text-3xl font-bold text-gray-600">
                {opponentScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {!isHome ? 'HOME' : 'AWAY'}
              </div>
            </div>
          </div>
        </div>

        {/* Venue & League */}
        <div className="text-center pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">📍 {match.venue}</div>
          {match.league && (
            <div className="text-xs text-gray-500 mt-1">{match.league}</div>
          )}
        </div>

        {/* Stats Section (Optional) */}
        {showStats && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">득점차</div>
                <div className={`text-lg font-bold ${resultStyle.text}`}>
                  {Math.abs(ourScore - opponentScore)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">경기방식</div>
                <div className="text-lg font-medium text-gray-900">
                  {getMatchTypeText(match.matchType)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">홈/어웨이</div>
                <div className="text-lg font-medium text-gray-900">
                  {isHome ? '홈' : '어웨이'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Summary */}
        <div className={`text-center py-2 rounded-lg ${resultStyle.bg} ${resultStyle.text}`}>
          <div className="text-sm font-medium">
            {result === 'win' ? `${opponent}를 상대로 ${ourScore}:${opponentScore} 승리!` :
             result === 'loss' ? `${opponent}에게 ${ourScore}:${opponentScore} 패배` :
             `${opponent}와 ${ourScore}:${opponentScore} 무승부`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MatchResult;