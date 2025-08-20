export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  position: Position;
  backNumber?: number;
  profileImageUrl?: string;
  teamId: string;
  isActive: boolean;
  stats?: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface CreatePlayerRequest {
  name: string;
  position: Position;
  backNumber?: number;
  teamId: string;
}