import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../constants/api';
import { TokenManager } from '../utils/tokenManager';

class ApiClient {
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
        // 클라이언트 호스트 정보 전달 (서브도메인 인식용)
        const host = window.location.host;
        config.headers['X-Forwarded-Host'] = host;

        const token = TokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          TokenManager.clearTokens();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url);
      return response.data as T;
    } catch (error: unknown) {
      console.error('DELETE request failed:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { status: unknown; data: unknown } };
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      throw error;
    }
  }

  // 파일 업로드용 메서드
  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
