import { apiClient } from './api';

export interface InquiryDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  teamName: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface UpdateInquiryStatusRequest {
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELED';
  adminNote?: string;
}

export interface InquirySearchRequest {
  name?: string;
  email?: string;
  teamName?: string;
  status?: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELED';
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

class AdminInquiryService {
  private basePath = '/api/v1/admin/inquiries';

  /**
   * 모든 문의 조회 (페이징)
   */
  async getAllInquiries(
    page: number = 0,
    size: number = 20,
    searchParams?: InquirySearchRequest
  ): Promise<ApiResponse<PagedResponse<InquiryDto>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (searchParams) {
      if (searchParams.status) params.append('status', searchParams.status);
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.email) params.append('email', searchParams.email);
      if (searchParams.teamName) params.append('teamName', searchParams.teamName);
    }

    return apiClient.get<ApiResponse<PagedResponse<InquiryDto>>>(`${this.basePath}?${params.toString()}`);
  }

  /**
   * 특정 문의 상세 조회
   */
  async getInquiry(id: number): Promise<ApiResponse<InquiryDto>> {
    return apiClient.get<ApiResponse<InquiryDto>>(`${this.basePath}/${id}`);
  }

  /**
   * 문의 상태 변경
   */
  async updateInquiryStatus(id: number, request: UpdateInquiryStatusRequest): Promise<ApiResponse<InquiryDto>> {
    return apiClient.put<ApiResponse<InquiryDto>>(`${this.basePath}/${id}/status`, request);
  }

  /**
   * 상태별 문의 조회
   */
  async getInquiriesByStatus(
    status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELED',
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<InquiryDto>>> {
    return apiClient.get<ApiResponse<PagedResponse<InquiryDto>>>(`${this.basePath}/status/${status}?page=${page}&size=${size}`);
  }

  /**
   * 문의 통계 조회
   */
  async getInquiryStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    contacted: number;
    completed: number;
    canceled: number;
  }>> {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/stats`);
  }

  /**
   * 최근 문의 조회
   */
  async getRecentInquiries(limit: number = 5): Promise<ApiResponse<InquiryDto[]>> {
    return apiClient.get<ApiResponse<InquiryDto[]>>(`${this.basePath}/recent?limit=${limit}`);
  }
}

export const adminInquiryService = new AdminInquiryService();