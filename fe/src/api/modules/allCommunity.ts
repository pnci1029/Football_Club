import { apiClient } from '../client';
import type { ApiResponse, PageResponse } from '../types';

export interface AllCommunityPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  teamName: string;
  teamSubdomain: string | null;
}

export interface TeamInfo {
  id: number;
  name: string;
  subdomain: string | null;
  description: string | null;
}

export interface AllCommunityParams {
  page?: number;
  size?: number;
  teamId?: number;
  keyword?: string;
}

export const allCommunityApi = {
  /**
   * 전체 팀의 커뮤니티 게시글 목록 조회
   */
  getAllCommunityPosts: async (params: AllCommunityParams = {}): Promise<PageResponse<AllCommunityPost>> => {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.teamId !== undefined) searchParams.set('teamId', params.teamId.toString());
    if (params.keyword) searchParams.set('keyword', params.keyword);

    const url = `/api/v1/all-community/posts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<PageResponse<AllCommunityPost>>>(url);
    return response.data;
  },

  /**
   * 활성 팀 목록 조회
   */
  getActiveTeams: async (): Promise<TeamInfo[]> => {
    const response = await apiClient.get<ApiResponse<TeamInfo[]>>('/api/v1/all-community/teams');
    return response.data;
  },

  /**
   * 팀 사이트 URL 생성
   */
  getTeamUrl: (teamSubdomain: string | null): string => {
    if (!teamSubdomain) return '#';

    const hostname = window.location.hostname;

    // 로컬 개발 환경
    if (hostname.includes('localhost')) {
      return `http://${teamSubdomain}.localhost:3000`;
    }

    // 배포 환경
    return `https://${teamSubdomain}.football-club.kr`;
  }
};
