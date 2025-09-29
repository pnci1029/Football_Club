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

export interface AdminUpdateNoticeRequest {
  title?: string;
  content?: string;
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

export interface CreateNoticeCommentRequest {
  content: string;
  authorName: string;
  authorEmail?: string;
  authorPassword: string;
  teamId: number;
}

export interface NoticeOwnershipResponse {
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}