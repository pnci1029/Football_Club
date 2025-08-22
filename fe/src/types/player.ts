export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export const POSITIONS = {
  GK: 'GK',
  DF: 'DF',
  MF: 'MF',
  FW: 'FW'
} as const;

// BE DTO와 매칭되는 Player 타입
export interface PlayerDto {
  id: number;
  name: string;
  position: string;
  profileImageUrl?: string;
  backNumber?: number;
  teamId: number;
  teamName: string;
  isActive: boolean;
}

// 더미 데이터용 확장 타입 (추후 제거 예정)
export interface Player {
  id: number;
  name: string;
  position: string;
  age?: number;
  nationality?: string;
  jerseyNumber?: number;
  photo?: string;
  profileImageUrl?: string;
  backNumber?: number;
  teamId?: number;
  teamName?: string;
  isActive?: boolean;
  stats?: PlayerStats;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

export interface CreatePlayerRequest {
  name: string;
  position: string;
  backNumber?: number;
  profileImageUrl?: string;
}

export interface UpdatePlayerRequest {
  name?: string;
  position?: string;
  backNumber?: number;
  profileImageUrl?: string;
  isActive?: boolean;
}