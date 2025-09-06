import { apiClient } from './api';

export interface CreateInquiryRequest {
  name: string;
  email: string;
  phone: string;
  teamName: string;
  message?: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

class InquiryService {
  private basePath = '/api/v1/inquiries';

  /**
   * 무료 체험 신청
   */
  async createInquiry(request: CreateInquiryRequest): Promise<ApiResponse<InquiryDto>> {
    return apiClient.post<ApiResponse<InquiryDto>>(this.basePath, request);
  }

  /**
   * 이메일 중복 확인
   */
  async checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get<ApiResponse<{ exists: boolean }>>(`${this.basePath}/check-email/${encodeURIComponent(email)}`);
  }

  /**
   * 이메일로 본인 문의 내역 조회
   */
  async getInquiriesByEmail(email: string): Promise<ApiResponse<InquiryDto[]>> {
    return apiClient.get<ApiResponse<InquiryDto[]>>(`${this.basePath}/email/${encodeURIComponent(email)}`);
  }
}

export const inquiryService = new InquiryService();
