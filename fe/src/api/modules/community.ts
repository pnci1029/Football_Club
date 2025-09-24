/**
 * Community API 모듈 - 커뮤니티 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
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

export interface CreatePostRequest {
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  authorPassword: string;
  teamId: number;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  authorPassword: string;
  teamId: number;
}

export interface CreateCommentRequest {
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPassword: string;
  teamId: number;
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

export const communityApi = {
  // 게시글 목록 조회
  getPosts: (teamId: number, page: number = 0, size: number = 20, keyword?: string): Promise<CommunityPostsResponse> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (keyword) {
      params.append('keyword', keyword);
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
  createPost: (data: CreatePostRequest): Promise<CommunityPost> =>
    api.callEndpoint<CommunityPost>(API_ENDPOINTS.COMMUNITY.CREATE_POST, undefined, data as CreatePostRequest & Record<string, unknown>),

  // 게시글 수정
  updatePost: (postId: number, data: UpdatePostRequest): Promise<CommunityPost> =>
    api.callEndpoint<CommunityPost>(API_ENDPOINTS.COMMUNITY.UPDATE_POST, { postId }, data as UpdatePostRequest & Record<string, unknown>),

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
  createComment: (postId: number, data: CreateCommentRequest): Promise<CommunityComment> =>
    api.callEndpoint<CommunityComment>(API_ENDPOINTS.COMMUNITY.CREATE_COMMENT, { postId }, data as CreateCommentRequest & Record<string, unknown>),

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
  checkPostOwnership: (postId: number, teamId: number, authorPassword: string): Promise<boolean> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<boolean>({
      method: 'GET',
      path: `/v1/community/posts/${postId}/ownership?${params.toString()}`
    });
  },

  // 댓글 작성자 권한 확인
  checkCommentOwnership: (commentId: number, teamId: number, authorPassword: string): Promise<boolean> => {
    const params = new URLSearchParams({
      teamId: teamId.toString(),
      authorPassword: authorPassword
    });
    return api.callEndpoint<boolean>({
      method: 'GET',
      path: `/v1/community/comments/${commentId}/ownership?${params.toString()}`
    });
  },
};

export default communityApi;