/**
 * 통합 API 타입 정의
 */

// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: ApiError | null;
  timestamp: string;
}

// 페이징 응답 타입
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 공통 페이징 파라미터
export interface PageParams {
  page?: number;
  size?: number;
}

// 공통 검색 파라미터
export interface SearchParams extends PageParams {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 엔드포인트 메타데이터
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description?: string;
  requiresAuth?: boolean;
  isAdmin?: boolean;
}

// 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// 실체 도메인 타입들 (기존에서 가져오기)
export interface Team {
  id: number;
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: number;
  name: string;
  backNumber: number;
  position: string;
  teamId: number;
  profileImageUrl?: string;
  createdAt: string;
}

export interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  teamId?: number;
  createdAt: string;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'FEEDBACK' | 'OTHER';
  name?: string;
  email: string;
  phone?: string;
  teamName?: string;
  message?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: number;
  teamId: number;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  sortOrder: number;
  active: boolean;
  isActive: boolean;
  createdAt: string;
}

// 대시보드 통계 타입
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

// Auth 관련 타입들
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 문의 관련 타입들
export interface CreateInquiryRequest {
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'FEEDBACK' | 'OTHER';
  authorName?: string;
  authorEmail?: string;
  phone?: string;
}

export interface UpdateInquiryStatusRequest {
  status: Inquiry['status'];
  responseMessage?: string;
}

// Hero Slides 관련 타입들
export interface CreateHeroSlideRequest {
  title: string;
  content?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateHeroSlideRequest {
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
}

// 요청 타입들
export interface CreateTeamRequest {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface CreatePlayerRequest {
  name: string;
  backNumber: number;
  position: string;
  profileImageUrl?: string;
}

export interface UpdatePlayerRequest {
  name?: string;
  backNumber?: number;
  position?: string;
  profileImageUrl?: string;
}

export interface CreateStadiumRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
}

export interface UpdateStadiumRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
}

export interface CreateMatchRequest {
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
}

export interface UpdateMatchRequest {
  matchDate?: string;
  status?: Match['status'];
  homeScore?: number;
  awayScore?: number;
}

export interface CreateInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  teamName?: string;
  message: string;
}

export interface UpdateInquiryStatusRequest {
  status: Inquiry['status'];
  responseMessage?: string;
}

export interface CreateHeroSlideRequest {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateHeroSlideRequest {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Community 관련 타입들
export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  category: string;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostDetail {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  viewCount: number;
  category: string;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string;
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityPostRequest {
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  authorPassword: string;
  category: string;
  teamId: number;
}

export interface UpdateCommunityPostRequest {
  title?: string;
  content?: string;
  authorPassword: string;
  teamId: number;
}

export interface CreateCommunityCommentRequest {
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPassword: string;
  teamId: number;
}

export interface OwnershipCheckRequest {
  authorPassword: string;
  teamId: number;
}

export interface OwnershipCheckResponse {
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CommunityPostsResponse {
  content: CommunityPost[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Notice 관련 타입들
export interface Notice {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments: NoticeComment[];
}

export interface NoticeComment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  authorPassword: string;
  teamId: number;
}

export interface UpdateNoticeRequest {
  title?: string;
  content?: string;
  authorPassword: string;
  teamId: number;
}

export interface CreateNoticeCommentRequest {
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPassword: string;
  teamId: number;
}

export interface NoticeOwnershipCheckRequest {
  authorPassword: string;
  teamId: number;
}

export interface NoticeOwnershipCheckResponse {
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface NoticesResponse {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// AllNotice 관련 타입들 (전체 팀 공지사항 조회용)
export interface AllNoticePost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  teamName: string;
  teamSubdomain: string | null;
  isNotice: boolean;
}

export interface TeamInfo {
  id: number;
  name: string;
  subdomain: string | null;
  description: string | null;
}
