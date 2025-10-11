import { AdminLevel } from '../../enums';

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccountDto {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  adminLevel: AdminLevel;
  teamSubdomain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
  adminLevel: AdminLevel;
  teamSubdomain?: string;
}

export interface UpdateAdminRequest {
  email?: string;
  name?: string;
  role?: string;
  teamSubdomain?: string;
  isActive?: boolean;
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
  description?: string;
  playerCount: number;
  stadiumCount: number;
  matchCount?: number;
  winRate?: number;
  createdAt: string;
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
  availableDays: string[];
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

export interface AdminCommunityPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  category: string;
  isNotice: boolean;
  isActive: boolean;
  viewCount: number;
  commentCount: number;
  teamName: string;
  teamCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCommunityComment {
  id: number;
  content: string;
  authorName: string;
  isActive: boolean;
  postId: number;
  postTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCommunityPostDetail {
  post: AdminCommunityPost;
  comments: AdminCommunityComment[];
}