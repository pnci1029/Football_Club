import { allNoticeApi } from '../api/modules/allNotice';
import { Notice } from '../types/interfaces/notice';

export interface AllNoticeResponse {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class AllNoticeService {
  /**
   * 전체 팀의 공지사항 목록 조회
   */
  async getAllNotices(
    page: number = 0,
    size: number = 10,
    teamId?: number,
    keyword?: string
  ): Promise<AllNoticeResponse> {
    const response = await allNoticeApi.getAllNotices({
      page,
      size,
      teamId,
      keyword
    });
    
    // AllNoticePost를 Notice 타입으로 변환
    const content: Notice[] = response.content.map((item) => ({
      ...item,
      teamSubdomain: item.teamSubdomain ?? undefined,
      authorEmail: undefined,
      authorPhone: undefined,
      isGlobalVisible: false // 기본값
    }));
    
    return {
      content,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      size: response.size,
      number: response.number,
      first: response.first,
      last: response.last
    };
  }

  /**
   * 전체 노출 설정된 공지사항 목록 조회 (메인 페이지용)
   */
  async getGlobalNotices(
    page: number = 0,
    size: number = 10,
    keyword?: string
  ): Promise<AllNoticeResponse> {
    const response = await allNoticeApi.getGlobalNotices({
      page,
      size,
      keyword
    });
    
    // AllNoticePost를 Notice 타입으로 변환
    const content: Notice[] = response.content.map((item) => ({
      ...item,
      teamSubdomain: item.teamSubdomain ?? undefined,
      authorEmail: undefined,
      authorPhone: undefined,
      isGlobalVisible: true // 글로벌 공지사항이므로 true
    }));
    
    return {
      content,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      size: response.size,
      number: response.number,
      first: response.first,
      last: response.last
    };
  }

  /**
   * 활성 팀 목록 조회
   */
  async getActiveTeams() {
    return await allNoticeApi.getActiveTeams();
  }

  /**
   * 팀 사이트 URL 생성
   */
  getTeamUrl(teamSubdomain: string | null): string {
    return allNoticeApi.getTeamUrl(teamSubdomain);
  }
}

export const allNoticeService = new AllNoticeService();