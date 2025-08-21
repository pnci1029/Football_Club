export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
  league?: string;
  season: string;
  matchType: 'league' | 'cup' | 'friendly';
  weather?: string;
  attendance?: number;
  referee?: string;
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