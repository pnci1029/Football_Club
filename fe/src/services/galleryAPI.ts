import axios from 'axios';
import {
  Gallery,
  GalleryDto,
  GalleryDetailDto,
  GalleryResponse,
  GalleryListParams,
  CreateGalleryRequest,
  UpdateGalleryRequest,
  GalleryStatistics,
  PopularGalleryResponse,
  PlayType
} from '../types/gallery';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터를 사용하여 토큰 및 호스트 정보 추가
api.interceptors.request.use((config) => {
  // 클라이언트 호스트 정보 전달 (서브도메인 인식용)
  const host = window.location.host;
  config.headers['X-Forwarded-Host'] = host;

  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const galleryAPI = {
  // Public API - 갤러리 조회
  getGalleries: async (params: GalleryListParams = {}): Promise<GalleryResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/api/v1/gallery?${queryParams.toString()}`);
    return response.data;
  },

  // Public API - 갤러리 상세 조회
  getGallery: async (id: number): Promise<GalleryDetailDto> => {
    const response = await api.get(`/api/v1/gallery/${id}`);
    return response.data;
  },

  // Public API - 추천 갤러리 조회
  getFeaturedGalleries: async (limit: number = 5): Promise<GalleryResponse> => {
    const response = await api.get(`/api/v1/gallery/featured?limit=${limit}`);
    return response.data;
  },

  // Public API - 인기 갤러리 조회
  getPopularGalleries: async (limit: number = 5): Promise<GalleryResponse> => {
    const response = await api.get(`/api/v1/gallery/popular?limit=${limit}`);
    return response.data;
  },

  // Public API - 최신 갤러리 조회
  getRecentGalleries: async (limit: number = 5): Promise<GalleryResponse> => {
    const response = await api.get(`/api/v1/gallery/recent?limit=${limit}`);
    return response.data;
  },

  // Public API - 하이라이트 갤러리 조회
  getHighlightGalleries: async (playType?: PlayType, page: number = 0, size: number = 10): Promise<GalleryResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (playType) {
      queryParams.append('playType', playType);
    }

    const response = await api.get(`/api/v1/gallery/highlights?${queryParams.toString()}`);
    return response.data;
  },

  // Public API - 팀별 태그 목록 조회
  getTagsByTeam: async (): Promise<string[]> => {
    const response = await api.get('/api/v1/gallery/tags');
    return response.data;
  },

  // Public API - 인기 태그 조회
  getPopularTags: async (limit: number = 20): Promise<{ tagName: string; count: number; percentage: number; }[]> => {
    const response = await api.get(`/api/v1/gallery/tags/popular?limit=${limit}`);
    return response.data;
  },

  // Admin API - 갤러리 생성
  createGallery: async (data: CreateGalleryRequest): Promise<Gallery> => {
    const response = await api.post('/api/v1/admin/gallery', data);
    return response.data;
  },

  // Admin API - 갤러리 수정
  updateGallery: async (id: number, data: UpdateGalleryRequest): Promise<Gallery> => {
    const response = await api.put(`/api/v1/admin/gallery/${id}`, data);
    return response.data;
  },

  // Admin API - 갤러리 삭제
  deleteGallery: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/gallery/${id}`);
  },

  // Admin API - 미디어 파일 업로드
  uploadMediaFiles: async (galleryId: number, files: File[]): Promise<Gallery> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post(`/api/v1/admin/gallery/${galleryId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin API - 미디어 파일 삭제
  deleteMediaFile: async (galleryId: number, mediaId: number): Promise<void> => {
    await api.delete(`/api/v1/admin/gallery/${galleryId}/media/${mediaId}`);
  },

  // Admin API - 미디어 파일 정렬 순서 변경
  updateMediaOrder: async (galleryId: number, mediaOrders: { mediaId: number; sortOrder: number }[]): Promise<Gallery> => {
    const response = await api.put(`/api/v1/admin/gallery/${galleryId}/media/order`, { mediaOrders });
    return response.data;
  },

  // Admin API - 갤러리 통계 조회
  getGalleryStatistics: async (): Promise<GalleryStatistics> => {
    const response = await api.get('/api/v1/admin/gallery/statistics');
    return response.data;
  },

  // Admin API - 갤러리 활성화/비활성화
  toggleGalleryStatus: async (id: number): Promise<Gallery> => {
    const response = await api.patch(`/api/v1/admin/gallery/${id}/toggle-status`);
    return response.data;
  },
};

export default galleryAPI;
