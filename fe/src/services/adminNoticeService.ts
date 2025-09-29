import { apiClient } from './api';

export interface Notice {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  teamName: string;
  teamSubdomain?: string;
}

export interface NoticeDetail extends Notice {
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

export interface NoticeListResponse {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}

class AdminNoticeService {
  // 공지사항 목록 조회 (팀별)
  async getNoticesByTeam(
    teamId: number,
    page: number = 0,
    size: number = 10,
    keyword?: string
  ): Promise<NoticeListResponse> {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      page: page.toString(),
      size: size.toString(),
    });

    if (keyword) {
      params.append('keyword', keyword);
    }

    const response = await apiClient.get<ApiResponse<NoticeListResponse>>(`/api/v1/notices?${params}`);
    return response.data;
  }

  // 전체 공지사항 목록 조회 (관리자용)
  async getAllNotices(
    page: number = 0,
    size: number = 10,
    keyword?: string
  ): Promise<NoticeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (keyword) {
      params.append('keyword', keyword);
    }

    const response = await apiClient.get<ApiResponse<NoticeListResponse>>(`/api/v1/all-notices?${params}`);
    return response.data;
  }

  // 공지사항 상세 조회
  async getNotice(teamId: number, noticeId: number): Promise<NoticeDetail> {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
    });

    const response = await apiClient.get<ApiResponse<NoticeDetail>>(`/api/v1/notices/${noticeId}?${params}`);
    return response.data;
  }

  // 공지사항 작성
  async createNotice(request: CreateNoticeRequest): Promise<Notice> {
    const response = await apiClient.post<ApiResponse<Notice>>('/api/v1/notices', request);
    return response.data;
  }

  // 공지사항 수정
  async updateNotice(noticeId: number, request: UpdateNoticeRequest): Promise<Notice> {
    const response = await apiClient.put<ApiResponse<Notice>>(`/api/v1/notices/${noticeId}`, request);
    return response.data;
  }

  // 공지사항 삭제
  async deleteNotice(teamId: number, noticeId: number, authorPassword: string): Promise<void> {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword,
    });

    await apiClient.delete<ApiResponse<string>>(`/api/v1/notices/${noticeId}?${params}`);
  }

  // 공지사항 권한 확인
  async checkNoticeOwnership(
    noticeId: number, 
    teamId: number, 
    authorPassword: string
  ): Promise<{ isOwner: boolean; canEdit: boolean; canDelete: boolean }> {
    const response = await apiClient.post<ApiResponse<{ isOwner: boolean; canEdit: boolean; canDelete: boolean }>>(`/api/v1/notices/${noticeId}/ownership`, {
      teamId,
      authorPassword,
    });
    return response.data;
  }

  // 댓글 작성
  async createComment(
    noticeId: number,
    request: {
      content: string;
      authorName: string;
      authorEmail?: string;
      authorPassword: string;
      teamId: number;
    }
  ): Promise<NoticeComment> {
    const response = await apiClient.post<ApiResponse<NoticeComment>>(`/api/v1/notices/${noticeId}/comments`, request);
    return response.data;
  }

  // 댓글 삭제
  async deleteComment(commentId: number, teamId: number, authorPassword: string): Promise<void> {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword,
    });

    await apiClient.delete<ApiResponse<string>>(`/api/v1/notices/comments/${commentId}?${params}`);
  }
}

export const adminNoticeService = new AdminNoticeService();