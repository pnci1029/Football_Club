import { apiClient } from '../client';
import type { ApiResponse, PageResponse, AllNoticePost, TeamInfo } from '../types';

export interface AllNoticeParams {
  page?: number;
  size?: number;
  teamId?: number;
  keyword?: string;
}

export const allNoticeApi = {
  /**
   * 전체 팀의 공지사항 목록 조회
   */
  getAllNotices: async (params: AllNoticeParams = {}): Promise<PageResponse<AllNoticePost>> => {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.teamId !== undefined) searchParams.set('teamId', params.teamId.toString());
    if (params.keyword) searchParams.set('keyword', params.keyword);

    const url = `/v1/all-notices${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<PageResponse<AllNoticePost>>>(url);
    return response.data;
  },

  /**
   * 활성 팀 목록 조회
   */
  getActiveTeams: async (): Promise<TeamInfo[]> => {
    const response = await apiClient.get<ApiResponse<TeamInfo[]>>('/v1/all-notices/teams');
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