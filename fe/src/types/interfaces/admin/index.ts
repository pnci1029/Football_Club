export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalStadiums: number;
  totalMatches: number;
  teams: TeamStats[];
}

export interface TeamStats {
  id: number;
  name: string;
  code: string;
  playerCount: number;
  stadiumCount: number;
}

export interface PlayerDto {
  id: number;
  name: string;
  position: string;
  uniformNumber: number;
  teamId: number;
  teamName: string;
}

export interface StadiumDto {
  id: number;
  name: string;
  address: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  imageUrls: string[];
  teamId?: number;
  teamName?: string;
}

export interface TenantInfo {
  id: number;
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDashboard {
  teamInfo: TenantInfo;
  stats: {
    playerCount: number;
    stadiumCount: number;
    matchCount: number;
  };
}

export interface TenantSettings {
  themeColor?: string;
  logoUrl?: string;
  contactEmail?: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateTenantData {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface InquiryStats {
  totalInquiries: number;
  pendingInquiries: number;
  resolvedInquiries: number;
  averageResponseTime: number;
}