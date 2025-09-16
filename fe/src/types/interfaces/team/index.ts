export interface Team {
  id: string;
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamApiResponse {
  success: boolean;
  data: Team | Team[];
  message?: string;
}

export interface TeamStats {
  id: number;
  name: string;
  code: string;
  playerCount: number;
  stadiumCount: number;
}

export interface TeamPageResponse {
  content: Team[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreateTeamData {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface TeamSearchParams {
  query: string;
  page?: number;
  size?: number;
}