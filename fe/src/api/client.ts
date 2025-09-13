/**
 * 통합 API 클라이언트 - 모든 API 호출을 중앙화
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getApiBaseUrl } from '../utils/config';
import { 
  ApiResponse, 
  PageResponse, 
  PageParams, 
  SearchParams,
  ApiError,
  ApiEndpoint 
} from './types';
import { buildUrl } from './endpoints';

class UnifiedApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 호스트 헤더 설정 (멀티테넌트)
        config.headers['X-Forwarded-Host'] = window.location.host;
        
        // 인증 토큰 추가 (필요시)
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || '알 수 없는 오류가 발생했습니다',
          details: error.response?.data,
          timestamp: new Date().toISOString(),
        };

        // 401 인증 오류시 로그아웃 처리
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/login';
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Generic HTTP 메서드들
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, { params, ...config });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // 페이징 지원 GET
  async getPage<T>(
    url: string, 
    params?: PageParams & Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<PageResponse<T>> {
    const pageParams = {
      page: params?.page || 0,
      size: params?.size || 10,
      ...params,
    };
    return this.get<PageResponse<T>>(url, pageParams, config);
  }

  // 검색 지원 GET  
  async search<T>(
    url: string,
    params?: SearchParams & Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<PageResponse<T>> {
    const searchParams = {
      page: params?.page || 0,
      size: params?.size || 10,
      search: params?.search,
      sort: params?.sort,
      direction: params?.direction || 'desc',
      ...params,
    };
    return this.get<PageResponse<T>>(url, searchParams, config);
  }

  // API 엔드포인트 기반 호출
  async callEndpoint<T>(
    endpoint: ApiEndpoint,
    pathParams?: Record<string, string | number>,
    data?: any,
    queryParams?: any
  ): Promise<T> {
    const url = pathParams ? buildUrl(endpoint.path, pathParams) : endpoint.path;
    
    switch (endpoint.method) {
      case 'GET':
        return this.get<T>(url, queryParams);
      case 'POST':
        return this.post<T>(url, data);
      case 'PUT':
        return this.put<T>(url, data);
      case 'DELETE':
        return this.delete<T>(url);
      case 'PATCH':
        return this.patch<T>(url, data);
      default:
        throw new Error(`Unsupported HTTP method: ${endpoint.method}`);
    }
  }

  // CRUD 헬퍼 메서드들
  async getList<T>(baseUrl: string, params?: PageParams): Promise<PageResponse<T>> {
    return this.getPage<T>(baseUrl, params);
  }

  async getById<T>(baseUrl: string, id: string | number): Promise<T> {
    return this.get<T>(`${baseUrl}/${id}`);
  }

  async create<T>(baseUrl: string, data: any): Promise<T> {
    return this.post<T>(baseUrl, data);
  }

  async update<T>(baseUrl: string, id: string | number, data: any): Promise<T> {
    return this.put<T>(`${baseUrl}/${id}`, data);
  }

  async remove<T>(baseUrl: string, id: string | number): Promise<T> {
    return this.delete<T>(`${baseUrl}/${id}`);
  }

  // 파일 업로드 지원
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 헬스 체크
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.get<any>('/health');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 현재 설정 정보
  getConfig() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.client.defaults.headers,
    };
  }
}

// 싱글톤 인스턴스
export const apiClient = new UnifiedApiClient();

// 편의 함수들
export const api = {
  // 기본 HTTP 메서드
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, params),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
  patch: <T>(url: string, data?: any) => apiClient.patch<T>(url, data),

  // 페이징/검색
  getPage: <T>(url: string, params?: PageParams) => apiClient.getPage<T>(url, params),
  search: <T>(url: string, params?: SearchParams) => apiClient.search<T>(url, params),

  // CRUD 헬퍼
  getList: <T>(baseUrl: string, params?: PageParams) => apiClient.getList<T>(baseUrl, params),
  getById: <T>(baseUrl: string, id: string | number) => apiClient.getById<T>(baseUrl, id),
  create: <T>(baseUrl: string, data: any) => apiClient.create<T>(baseUrl, data),
  update: <T>(baseUrl: string, id: string | number, data: any) => apiClient.update<T>(baseUrl, id, data),
  remove: <T>(baseUrl: string, id: string | number) => apiClient.remove<T>(baseUrl, id),

  // 파일 업로드
  uploadFile: <T>(url: string, file: File, data?: any) => apiClient.uploadFile<T>(url, file, data),

  // 헬스 체크
  healthCheck: () => apiClient.healthCheck(),

  // 엔드포인트 기반 호출
  callEndpoint: <T>(
    endpoint: ApiEndpoint,
    pathParams?: Record<string, string | number>,
    data?: any,
    queryParams?: any
  ) => apiClient.callEndpoint<T>(endpoint, pathParams, data, queryParams),
};

export default apiClient;