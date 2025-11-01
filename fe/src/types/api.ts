export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorDetails;
  timestamp: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AdminBasicInfo {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateAdminRequest {
  teamId: number;
  username: string;
  name: string;
  password?: string;
  email: string | null;
}