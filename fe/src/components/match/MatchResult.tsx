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
      <div className="space-y-3 sm:space-y-4">
        {/* Header - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-lg">{resultStyle.icon}</span>
            <span className={`font-semibold text-base sm:text-base ${resultStyle.text}`}>
              {getResultText(result)}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-sm text-gray-600">
              {formatDate(match.date)} {match.time}
            </div>
            <div className="text-xs text-gray-500">
              {getMatchTypeText(match.matchType)}
            </div>
          </div>
        </div>

        {/* Score Display - 모바일 최적화 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Our Team */}
            <div className="text-center flex-1 sm:flex-none max-w-[5rem] sm:max-w-none">
              <div className="text-primary-600 font-bold text-sm sm:text-lg mb-1 truncate">
                {ourTeamName}
              </div>
              <div className={`text-2xl sm:text-3xl font-bold ${resultStyle.text}`}>
                {ourScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isHome ? 'HOME' : 'AWAY'}
              </div>
            </div>

            {/* VS */}
            <div className="text-gray-400 text-lg sm:text-xl font-bold px-2">
              VS
            </div>

            {/* Opponent */}
            <div className="text-center flex-1 sm:flex-none max-w-[5rem] sm:max-w-none">
              <div className="text-gray-900 font-bold text-sm sm:text-lg mb-1 truncate">
                {opponent}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-600">
                {opponentScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {!isHome ? 'HOME' : 'AWAY'}
              </div>
            </div>
          </div>
        </div>

        {/* Venue & League - 모바일 최적화 */}
        <div className="text-center pt-2 sm:pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 break-words px-2">📍 {match.venue}</div>
          {match.league && (
            <div className="text-xs text-gray-500 mt-1">{match.league}</div>
          )}
        </div>

        {/* Stats Section (Optional) - 모바일 최적화 */}
        {showStats && (
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-xs sm:text-sm text-gray-600">득점차</div>
                <div className={`text-base sm:text-lg font-bold ${resultStyle.text}`}>
                  {Math.abs(ourScore - opponentScore)}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">경기방식</div>
                <div className="text-base sm:text-lg font-medium text-gray-900">
                  {getMatchTypeText(match.matchType)}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">홈/어웨이</div>
                <div className="text-base sm:text-lg font-medium text-gray-900">
                  {isHome ? '홈' : '어웨이'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Summary - 모바일 최적화 */}
        <div className={`text-center py-2 sm:py-2 rounded-lg ${resultStyle.bg} ${resultStyle.text}`}>
          <div className="text-xs sm:text-sm font-medium px-2 break-words">
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