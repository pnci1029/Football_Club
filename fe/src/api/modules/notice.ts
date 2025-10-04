/**
 * Notice API 모듈 - 공지사항 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { 
  Notice,
  NoticeDetail,
  NoticeComment,
  CreateNoticeRequest,
  UpdateNoticeRequest,
  CreateNoticeCommentRequest,
  NoticeOwnershipCheckRequest,
  NoticeOwnershipCheckResponse,
  NoticesResponse
} from '../types';

export const noticeApi = {
  // 공지사항 목록 조회
  getNotices: (teamId: number, page: number = 0, size: number = 20, keyword?: string): Promise<NoticesResponse> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (keyword) {
      params.append('keyword', keyword);
    }

    return api.callEndpoint<NoticesResponse>({
      method: 'GET',
      path: `/api/v1/notices?${params.toString()}`
    });
  },

  // 공지사항 상세 조회
  getNotice: (noticeId: number, teamId: number): Promise<NoticeDetail> => {
    const params = new URLSearchParams({ teamId: teamId.toString() });
    return api.callEndpoint<NoticeDetail>({
      method: 'GET',
      path: `/api/v1/notices/${noticeId}?${params.toString()}`
    });
  },


  // 공지사항 작성
  createNotice: (data: CreateNoticeRequest): Promise<Notice> =>
    api.callEndpoint<Notice>({
      method: 'POST',
      path: '/api/v1/notices'
    }, undefined, data as CreateNoticeRequest & Record<string, unknown>),

  // 공지사항 수정
  updateNotice: (noticeId: number, data: UpdateNoticeRequest): Promise<Notice> =>
    api.callEndpoint<Notice>({
      method: 'PUT',
      path: `/api/v1/notices/${noticeId}`
    }, { noticeId }, data as UpdateNoticeRequest & Record<string, unknown>),

  // 공지사항 삭제
  deleteNotice: (noticeId: number, teamId: number, authorPassword: string): Promise<string> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<string>({
      method: 'DELETE',
      path: `/api/v1/notices/${noticeId}?${params.toString()}`
    });
  },

  // 댓글 작성
  createComment: (noticeId: number, data: CreateNoticeCommentRequest): Promise<NoticeComment> =>
    api.callEndpoint<NoticeComment>({
      method: 'POST',
      path: `/api/v1/notices/${noticeId}/comments`
    }, { noticeId }, data as CreateNoticeCommentRequest & Record<string, unknown>),

  // 댓글 삭제
  deleteComment: (commentId: number, teamId: number, authorPassword: string): Promise<string> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<string>({
      method: 'DELETE',
      path: `/api/v1/notices/comments/${commentId}?${params.toString()}`
    });
  },

  // 공지사항 작성자 권한 확인
  checkNoticeOwnership: (noticeId: number, teamId: number, authorPassword: string): Promise<NoticeOwnershipCheckResponse> => {
    const data: NoticeOwnershipCheckRequest = {
      authorPassword,
      teamId
    };
    return api.callEndpoint<NoticeOwnershipCheckResponse>({
      method: 'POST',
      path: `/api/v1/notices/${noticeId}/ownership`
    }, undefined, data as NoticeOwnershipCheckRequest & Record<string, unknown>);
  },

  // 댓글 작성자 권한 확인
  checkCommentOwnership: (commentId: number, teamId: number, authorPassword: string): Promise<NoticeOwnershipCheckResponse> => {
    const data: NoticeOwnershipCheckRequest = {
      authorPassword,
      teamId
    };
    return api.callEndpoint<NoticeOwnershipCheckResponse>({
      method: 'POST',
      path: `/api/v1/notices/comments/${commentId}/ownership`
    }, undefined, data as NoticeOwnershipCheckRequest & Record<string, unknown>);
  },
};

export default noticeApi;