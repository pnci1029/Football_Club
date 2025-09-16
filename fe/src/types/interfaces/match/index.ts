export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  stadiumName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMatchRequest {
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
}

export interface UpdateMatchRequest {
  homeTeamId?: number;
  awayTeamId?: number;
  stadiumId?: number;
  matchDate?: string;
  status?: Match['status'];
  homeScore?: number;
  awayScore?: number;
}

export interface MatchApiResponse {
  success: boolean;
  data: Match | Match[];
  message?: string;
  error?: string;
}

export interface MatchPageResponse {
  content: Match[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MatchSearchParams {
  teamId?: number;
  stadiumId?: number;
  status?: Match['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface MatchStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}