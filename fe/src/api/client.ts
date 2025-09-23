/**
 * 통합 API 클라이언트 - 모든 API 호출을 중앙화
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getApiBaseUrl } from '../utils/config';
import { TokenManager } from '../utils/tokenManager';
import { 
  ApiResponse, 
  PageResponse, 
  PageParams, 
  SearchParams,
  ApiError,
  ApiEndpoint 
} from './types';
import { buildUrl } from './endpoints';
import { QueryParams, RequestData, FileUploadData, PathParams } from '../types/interfaces/api';

class UnifiedApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

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
    // 요청 인터셉터 - 토큰 자동 첨부
    this.client.interceptors.request.use(
      async (config) => {
        // 호스트 헤더 설정 (멀티테넌트)
        config.headers['X-Forwarded-Host'] = window.location.host;
        
        // 토큰 갱신이 필요한지 확인
        if (TokenManager.needsRefresh()) {
          await this.refreshTokenIfNeeded();
        }

        // 유효한 액세스 토큰 첨부
        const token = TokenManager.getAccessToken();
        if (token && TokenManager.isAccessTokenValid()) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 401 에러 시 토큰 갱신 후 재시도
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // 401 에러이고 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (TokenManager.getRefreshToken()) {
            originalRequest._retry = true;
            
            try {
              const newToken = await this.refreshTokenIfNeeded();
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              // 리프레시 실패 시 로그인 페이지로 리다이렉트
              TokenManager.clearTokens();
              window.location.href = '/admin/login';
              return Promise.reject(refreshError);
            }
          } else {
            // 리프레시 토큰이 없으면 로그인 페이지로
            TokenManager.clearTokens();
            window.location.href = '/admin/login';
          }
        }

        const apiError: ApiError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || '알 수 없는 오류가 발생했습니다',
          details: error.response?.data as Record<string, unknown> | undefined,
          timestamp: new Date().toISOString(),
        };

        return Promise.reject(apiError);
      }
    );
  }

  // 토큰 갱신 로직
  private async refreshTokenIfNeeded(): Promise<string | null> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      TokenManager.clearTokens();
      return null;
    }

    // 이미 갱신 중이면 대기
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // 리프레시 API 호출 (인터셉터 없이 직접 호출)
      const response = await axios.post(
        `${getApiBaseUrl()}/api/admin/auth/refresh`,
        { refreshToken }, // body에 refreshToken 전송
        {
          headers: {
            'X-Forwarded-Host': window.location.host,
            'Content-Type': 'application/json',
          },
        }
      );

      // ApiResponse 래퍼 처리
      const responseData = response.data.data || response.data;
      const { accessToken, refreshToken: newRefreshToken } = responseData;
      
      TokenManager.setTokens(accessToken, newRefreshToken);
      
      // 대기 중인 요청들 처리
      this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
      this.failedQueue = [];

      return accessToken;
    } catch (error) {
      // 대기 중인 요청들 실패 처리
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      
      TokenManager.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Generic HTTP 메서드들
  async get<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, { params, ...config });
    return response.data;
  }

  async post<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: RequestData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // 페이징 지원 GET
  async getPage<T>(
    url: string, 
    params?: PageParams & Record<string, unknown>,
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
    params?: SearchParams & Record<string, unknown>,
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
    pathParams?: PathParams,
    data?: RequestData,
    queryParams?: QueryParams
  ): Promise<T> {
    const url = pathParams ? buildUrl(endpoint.path, pathParams) : endpoint.path;
    
    let response: any;
    switch (endpoint.method) {
      case 'GET':
        response = await this.get<any>(url, queryParams);
        break;
      case 'POST':
        response = await this.post<any>(url, data);
        break;
      case 'PUT':
        response = await this.put<any>(url, data);
        break;
      case 'DELETE':
        response = await this.delete<any>(url);
        break;
      case 'PATCH':
        response = await this.patch<any>(url, data);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${endpoint.method}`);
    }
    
    // ApiResponse 래퍼 처리 - data 필드가 있으면 unwrap
    return response.data || response;
  }

  // CRUD 헬퍼 메서드들
  async getList<T>(baseUrl: string, params?: PageParams): Promise<PageResponse<T>> {
    return this.getPage<T>(baseUrl, params as PageParams & Record<string, unknown>);
  }

  async getById<T>(baseUrl: string, id: string | number): Promise<T> {
    return this.get<T>(`${baseUrl}/${id}`);
  }

  async create<T>(baseUrl: string, data: RequestData): Promise<T> {
    return this.post<T>(baseUrl, data);
  }

  async update<T>(baseUrl: string, id: string | number, data: RequestData): Promise<T> {
    return this.put<T>(`${baseUrl}/${id}`, data);
  }

  async remove<T>(baseUrl: string, id: string | number): Promise<T> {
    return this.delete<T>(`${baseUrl}/${id}`);
  }

  // 파일 업로드 지원
  async uploadFile<T>(url: string, file: File, additionalData?: FileUploadData): Promise<T> {
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
  get: <T>(url: string, params?: QueryParams) => apiClient.get<T>(url, params),
  post: <T>(url: string, data?: RequestData) => apiClient.post<T>(url, data),
  put: <T>(url: string, data?: RequestData) => apiClient.put<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
  patch: <T>(url: string, data?: RequestData) => apiClient.patch<T>(url, data),

  // 페이징/검색
  getPage: <T>(url: string, params?: PageParams & Record<string, unknown>) => apiClient.getPage<T>(url, params),
  search: <T>(url: string, params?: SearchParams & Record<string, unknown>) => apiClient.search<T>(url, params),

  // CRUD 헬퍼
  getList: <T>(baseUrl: string, params?: PageParams) => apiClient.getList<T>(baseUrl, params),
  getById: <T>(baseUrl: string, id: string | number) => apiClient.getById<T>(baseUrl, id),
  create: <T>(baseUrl: string, data: RequestData) => apiClient.create<T>(baseUrl, data),
  update: <T>(baseUrl: string, id: string | number, data: RequestData) => apiClient.update<T>(baseUrl, id, data),
  remove: <T>(baseUrl: string, id: string | number) => apiClient.remove<T>(baseUrl, id),

  // 파일 업로드
  uploadFile: <T>(url: string, file: File, data?: FileUploadData) => apiClient.uploadFile<T>(url, file, data),

  // 헬스 체크
  healthCheck: () => apiClient.healthCheck(),

  // 엔드포인트 기반 호출
  callEndpoint: <T>(
    endpoint: ApiEndpoint,
    pathParams?: PathParams,
    data?: RequestData,
    queryParams?: QueryParams
  ) => apiClient.callEndpoint<T>(endpoint, pathParams, data, queryParams),
};

export default apiClient;