export interface Team {
  id: string;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface TeamStats {
  totalPlayers: number;
  activePlayers: number;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
}