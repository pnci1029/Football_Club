/**
 * Admin Community API 모듈 - 관리자 전용 커뮤니티 관리 API
 */

import { api } from '../client';

export interface AdminActionRequest {
  reason?: string;
}

export const adminCommunityApi = {
  // 게시글 비활성화 (숨김 처리)
  deactivatePost: (postId: number, reason?: string): Promise<string> => 
    api.callEndpoint<string>({
      method: 'PATCH',
      path: `/api/v1/admin/community/posts/${postId}/deactivate`,
      requiresAuth: true,
    }, undefined, reason ? { reason } : undefined),
};

export default adminCommunityApi;