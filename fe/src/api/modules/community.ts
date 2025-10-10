/**
 * Community API 모듈 - 커뮤니티 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { 
  CommunityPost,
  CommunityPostDetail,
  CommunityComment,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  CreateCommunityCommentRequest,
  OwnershipCheckRequest,
  OwnershipCheckResponse,
  CommunityPostsResponse
} from '../types';

export const communityApi = {
  // 카테고리 목록 조회
  getCategories: (): Promise<{value: string, displayName: string}[]> =>
    api.callEndpoint<{value: string, displayName: string}[]>({
      method: 'GET',
      path: '/api/v1/community/categories'
    }),

  // 게시글 목록 조회
  getPosts: (teamId: number, page: number = 0, size: number = 20, keyword?: string, category?: string, isNotice?: boolean): Promise<CommunityPostsResponse> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (keyword) {
      params.append('keyword', keyword);
    }
    if (category) {
      params.append('category', category);
    }
    if (isNotice !== undefined) {
      params.append('isNotice', isNotice.toString());
    }

    return api.callEndpoint<CommunityPostsResponse>({
      ...API_ENDPOINTS.COMMUNITY.GET_POSTS,
      path: `${API_ENDPOINTS.COMMUNITY.GET_POSTS.path}?${params.toString()}`
    });
  },

  // 게시글 상세 조회
  getPost: (postId: number, teamId: number): Promise<CommunityPostDetail> => {
    const params = new URLSearchParams({ teamId: teamId.toString() });
    return api.callEndpoint<CommunityPostDetail>({
      ...API_ENDPOINTS.COMMUNITY.GET_POST,
      path: `${API_ENDPOINTS.COMMUNITY.GET_POST.path.replace('{postId}', postId.toString())}?${params.toString()}`
    });
  },

  // 게시글 작성
  createPost: (data: CreateCommunityPostRequest): Promise<CommunityPost> =>
    api.callEndpoint<CommunityPost>(API_ENDPOINTS.COMMUNITY.CREATE_POST, undefined, data as CreateCommunityPostRequest & Record<string, unknown>),

  // 게시글 수정
  updatePost: (postId: number, data: UpdateCommunityPostRequest): Promise<CommunityPost> =>
    api.callEndpoint<CommunityPost>(API_ENDPOINTS.COMMUNITY.UPDATE_POST, { postId }, data as UpdateCommunityPostRequest & Record<string, unknown>),

  // 게시글 삭제
  deletePost: (postId: number, teamId: number, authorPassword: string): Promise<string> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<string>({
      ...API_ENDPOINTS.COMMUNITY.DELETE_POST,
      path: `${API_ENDPOINTS.COMMUNITY.DELETE_POST.path.replace('{postId}', postId.toString())}?${params.toString()}`
    });
  },

  // 댓글 작성
  createComment: (postId: number, data: CreateCommunityCommentRequest): Promise<CommunityComment> =>
    api.callEndpoint<CommunityComment>(API_ENDPOINTS.COMMUNITY.CREATE_COMMENT, { postId }, data as CreateCommunityCommentRequest & Record<string, unknown>),

  // 댓글 삭제
  deleteComment: (commentId: number, teamId: number, authorPassword: string): Promise<string> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<string>({
      ...API_ENDPOINTS.COMMUNITY.DELETE_COMMENT,
      path: `${API_ENDPOINTS.COMMUNITY.DELETE_COMMENT.path.replace('{commentId}', commentId.toString())}?${params.toString()}`
    });
  },

  // 게시글 작성자 권한 확인
  checkPostOwnership: (postId: number, teamId: number, authorPassword: string): Promise<OwnershipCheckResponse> => {
    const data: OwnershipCheckRequest = {
      authorPassword,
      teamId
    };
    return api.callEndpoint<OwnershipCheckResponse>({
      method: 'POST',
      path: `/api/v1/community/posts/${postId}/ownership`
    }, undefined, data as OwnershipCheckRequest & Record<string, unknown>);
  },

  // 댓글 작성자 권한 확인
  checkCommentOwnership: (commentId: number, teamId: number, authorPassword: string): Promise<OwnershipCheckResponse> => {
    const data: OwnershipCheckRequest = {
      authorPassword,
      teamId
    };
    return api.callEndpoint<OwnershipCheckResponse>({
      method: 'POST',
      path: `/api/v1/community/comments/${commentId}/ownership`
    }, undefined, data as OwnershipCheckRequest & Record<string, unknown>);
  },
};

export default communityApi;
