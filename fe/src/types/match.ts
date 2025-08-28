export interface MatchDto {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    code: string;
  };
  awayTeam: {
    id: number;
    name: string;
    code: string;
  };
  stadium: {
    id: number;
    name: string;
  };
  matchDate: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

export interface MatchEvent {
  id: number;
  matchId: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  player: string;
  team: 'home' | 'away';
  minute: number;
  description: string;
}