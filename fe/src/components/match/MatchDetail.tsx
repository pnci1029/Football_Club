import React from 'react';
import { Card, Button } from '../common';

interface MatchEvent {
  id: number;
  matchId: number;
  minute: number;
  player: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  description: string;
  team: string;
}

interface MatchDetailProps {
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
    season?: string;
    weather?: string;
    attendance?: number;
    referee?: string;
  };
  events?: MatchEvent[];
  ourTeamName?: string;
  onBack?: () => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({
  match,
  events = [],
  ourTeamName = 'Football Club',
  onBack
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
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
      case 'win': return 'text-green-600 bg-green-50 border-green-200';
      case 'loss': return 'text-red-600 bg-red-50 border-red-200';
      case 'draw': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResultText = (result: string | null) => {
    switch (result) {
      case 'win': return '승리';
      case 'loss': return '패배';
      case 'draw': return '무승부';
      default: return '';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'goal': return '골';
      case 'yellow_card': return '경고';
      case 'red_card': return '퇴장';
      case 'substitution': return '교체';
      default: return type;
    }
  };

  const sortedEvents = events.sort((a, b) => a.minute - b.minute);
  const result = getMatchResult();

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Back Button - 모바일 최적화 */}
      {onBack && (
        <Button 
          variant="ghost" 
          onClick={onBack}
          leftIcon={
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
          className="text-sm sm:text-base py-3 sm:py-2 touch-manipulation"
        >
          경기 목록으로 돌아가기
        </Button>
      )}

      {/* Main Match Info - 모바일 최적화 */}
      <Card padding="lg">
        {/* Status & Type */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center flex-wrap gap-2 mb-3 sm:mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              {getMatchTypeText(match.matchType)}
            </span>
          </div>
          
          {/* Date & Venue - 모바일 최적화 */}
          <div className="text-base sm:text-lg text-gray-600 mb-2 px-4 sm:px-0">
            {formatDate(match.date)} {match.time}
          </div>
          <div className="text-sm text-gray-500 mb-4 sm:mb-6 px-4 sm:px-0 break-words">📍 {match.venue}</div>

          {/* Teams & Score - 모바일 최적화 */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12 mb-4 sm:mb-6">
            {/* Home Team */}
            <div className="text-center flex-1 sm:flex-none max-w-[6rem] sm:max-w-none">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 truncate ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.homeTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Home</div>
            </div>

            {/* Score */}
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                  `${match.homeScore} : ${match.awayScore}`
                ) : match.status === 'live' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                  `${match.homeScore} : ${match.awayScore}`
                ) : (
                  'VS'
                )}
              </div>
              {result && (
                <div className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border ${getResultColor(result)}`}>
                  우리팀 {getResultText(result)}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center flex-1 sm:flex-none max-w-[6rem] sm:max-w-none">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 truncate ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                {match.awayTeam}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Away</div>
            </div>
          </div>

          {/* Live Indicator - 모바일 최적화 */}
          {match.status === 'live' && (
            <div className="flex items-center justify-center py-3 sm:py-3 bg-green-50 rounded-lg border border-green-200 mb-4 sm:mb-6">
              <div className="flex items-center text-green-700">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium">경기 진행중</span>
              </div>
            </div>
          )}
        </div>

        {/* Match Details Grid - 모바일 최적화 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Match Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">경기 정보</h3>
            <div className="space-y-2 sm:space-y-3">
              {match.league && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">리그</span>
                  <span className="font-medium truncate ml-4">{match.league}</span>
                </div>
              )}
              {match.season && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">시즌</span>
                  <span className="font-medium truncate ml-4">{match.season}</span>
                </div>
              )}
              {match.weather && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">날씨</span>
                  <span className="font-medium truncate ml-4">{match.weather}</span>
                </div>
              )}
              {match.attendance && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">관중</span>
                  <span className="font-medium truncate ml-4">{match.attendance.toLocaleString()}명</span>
                </div>
              )}
              {match.referee && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">주심</span>
                  <span className="font-medium truncate ml-4">{match.referee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Match Events - 모바일 최적화 */}
          {sortedEvents.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">주요 사건</h3>
              <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                {sortedEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs sm:text-sm font-medium text-primary-600 min-w-[2.5rem] sm:min-w-[3rem] text-center">
                      {event.minute}'
                    </div>
                    <div className="text-base sm:text-lg flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{event.player}</span>
                        <span className={`text-xs px-1.5 sm:px-2 py-1 rounded truncate ${
                          isOurTeam(event.team) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {event.team}
                        </span>
                        <span className="text-xs px-1.5 sm:px-2 py-1 bg-white rounded">
                          {getEventTypeText(event.type)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 break-words">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - 모바일 최적화 */}
        {match.status === 'scheduled' && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" className="w-full sm:w-auto py-3 sm:py-2 text-sm sm:text-base touch-manipulation">
                경기 알림 설정
              </Button>
              <Button variant="outline" className="w-full sm:w-auto py-3 sm:py-2 text-sm sm:text-base touch-manipulation">
                캘린더에 추가
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MatchDetail;