/**
 * Admin Notice API 모듈 - 관리자 전용 공지사항 관리 API
 */

import { api } from '../client';
import type { Notice } from '../types';

export interface CreateNoticeRequest {
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  authorPassword: string;
  teamId: number;
  isGlobalVisible?: boolean;
}

export interface AdminUpdateNoticeRequest {
  title?: string;
  content?: string;
  teamId: number;
  isGlobalVisible?: boolean;
}

export const adminNoticeApi = {
  // 관리자용 공지사항 작성
  createNotice: (data: CreateNoticeRequest): Promise<Notice> => 
    api.callEndpoint<Notice>({
      method: 'POST',
      path: `/api/v1/admin/notices?teamId=${data.teamId}`,
      requiresAuth: true,
    }, undefined, data as CreateNoticeRequest & Record<string, unknown>),

  // 관리자용 공지사항 수정
  updateNotice: (noticeId: number, data: AdminUpdateNoticeRequest): Promise<Notice> => 
    api.callEndpoint<Notice>({
      method: 'PUT',
      path: `/api/v1/admin/notices/${noticeId}?teamId=${data.teamId}`,
      requiresAuth: true,
    }, undefined, data as AdminUpdateNoticeRequest & Record<string, unknown>),

  // 관리자용 공지사항 삭제
  deleteNotice: (noticeId: number, teamId: number): Promise<string> => 
    api.callEndpoint<string>({
      method: 'DELETE',
      path: `/api/v1/admin/notices/${noticeId}?teamId=${teamId}`,
      requiresAuth: true,
    }),
};

export default adminNoticeApi;