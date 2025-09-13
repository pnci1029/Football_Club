/**
 * Inquiries API 모듈 - 문의 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  Inquiry,
  CreateInquiryRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';

export const inquiriesApi = {
  // 문의 생성
  create: (data: CreateInquiryRequest): Promise<ApiResponse<Inquiry>> =>
    api.callEndpoint<ApiResponse<Inquiry>>(API_ENDPOINTS.INQUIRIES.CREATE, undefined, data),

  // 내 문의 목록 조회
  getMy: (params?: PageParams): Promise<ApiResponse<PageResponse<Inquiry>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Inquiry>>>(
      API_ENDPOINTS.INQUIRIES.MY_LIST,
      undefined,
      undefined,
      params
    ),

  // ID로 문의 조회
  getById: (id: number): Promise<ApiResponse<Inquiry>> =>
    api.callEndpoint<ApiResponse<Inquiry>>(API_ENDPOINTS.INQUIRIES.GET, { id }),
};

export const Inquiries = {
  // Public API
  public: inquiriesApi,

  // 편의 메서드들
  async createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
    const response = await inquiriesApi.create(data);
    return response.data;
  },

  async getMyInquiries(page: number = 0, size: number = 10): Promise<{
    inquiries: Inquiry[];
    total: number;
    hasNext: boolean;
  }> {
    const response = await inquiriesApi.getMy({ page, size });
    return {
      inquiries: response.data.content,
      total: response.data.totalElements,
      hasNext: !response.data.last,
    };
  },

  async getInquiryById(id: number): Promise<Inquiry> {
    const response = await inquiriesApi.getById(id);
    return response.data;
  },
};

export default Inquiries;