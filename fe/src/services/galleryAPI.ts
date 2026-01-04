import { apiClient } from './api';
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
import { ApiResponse } from '../types/api';

export class GalleryService {
  // Public API - 갤러리 조회
  async getGalleries(params: GalleryListParams = {}): Promise<GalleryResponse> {
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

    const response = await apiClient.get<ApiResponse<GalleryResponse>>(`/api/v1/gallery?${queryParams.toString()}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 갤러리 상세 조회
  async getGallery(id: number): Promise<GalleryDetailDto> {
    const response = await apiClient.get<ApiResponse<GalleryDetailDto>>(`/api/v1/gallery/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 정보를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 추천 갤러리 조회
  async getFeaturedGalleries(limit: number = 5): Promise<GalleryResponse> {
    const response = await apiClient.get<ApiResponse<GalleryResponse>>(`/api/v1/gallery/featured?limit=${limit}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '추천 갤러리를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 인기 갤러리 조회
  async getPopularGalleries(limit: number = 5): Promise<GalleryResponse> {
    const response = await apiClient.get<ApiResponse<GalleryResponse>>(`/api/v1/gallery/popular?limit=${limit}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '인기 갤러리를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 최신 갤러리 조회
  async getRecentGalleries(limit: number = 5): Promise<GalleryResponse> {
    const response = await apiClient.get<ApiResponse<GalleryResponse>>(`/api/v1/gallery/recent?limit=${limit}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '최신 갤러리를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 하이라이트 갤러리 조회
  async getHighlightGalleries(playType?: PlayType, page: number = 0, size: number = 10): Promise<GalleryResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (playType) {
      queryParams.append('playType', playType);
    }

    const response = await apiClient.get<ApiResponse<GalleryResponse>>(`/api/v1/gallery/highlights?${queryParams.toString()}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '하이라이트 갤러리를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 팀별 태그 목록 조회
  async getTagsByTeam(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/gallery/tags');
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '팀별 태그 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 인기 태그 조회
  async getPopularTags(limit: number = 20): Promise<{ tagName: string; count: number; percentage: number; }[]> {
    const response = await apiClient.get<ApiResponse<{ tagName: string; count: number; percentage: number; }[]>>(`/api/v1/gallery/tags/popular?limit=${limit}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '인기 태그를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 갤러리 생성
  async createGallery(data: CreateGalleryRequest): Promise<Gallery> {
    const response = await apiClient.post<ApiResponse<Gallery>>('/api/v1/gallery', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 생성에 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 갤러리 수정
  async updateGallery(id: number, data: UpdateGalleryRequest): Promise<Gallery> {
    const response = await apiClient.put<ApiResponse<Gallery>>(`/api/v1/gallery/${id}`, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 수정에 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 갤러리 삭제
  async deleteGallery(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/gallery/${id}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || '갤러리 삭제에 실패했습니다');
    }
  }

  // Public API - 미디어 파일 업로드
  async uploadMediaFiles(galleryId: number, files: File[]): Promise<Gallery> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.uploadFile<ApiResponse<Gallery>>(`/api/v1/gallery/${galleryId}/media`, formData);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '미디어 파일 업로드에 실패했습니다');
    }
    
    return response.data;
  }

  // Public API - 미디어 파일 삭제
  async deleteMediaFile(galleryId: number, mediaId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/gallery/${galleryId}/media/${mediaId}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || '미디어 파일 삭제에 실패했습니다');
    }
  }

  // Admin API - 미디어 파일 정렬 순서 변경
  async updateMediaOrder(galleryId: number, mediaOrders: { mediaId: number; sortOrder: number }[]): Promise<Gallery> {
    const response = await apiClient.put<ApiResponse<Gallery>>(`/api/v1/admin/gallery/${galleryId}/media/order`, { mediaOrders });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '미디어 순서 수정에 실패했습니다');
    }
    
    return response.data;
  }

  // Admin API - 갤러리 통계 조회
  async getGalleryStatistics(): Promise<GalleryStatistics> {
    const response = await apiClient.get<ApiResponse<GalleryStatistics>>('/api/v1/admin/gallery/statistics');
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 통계를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  // Admin API - 갤러리 활성화/비활성화
  async toggleGalleryStatus(id: number): Promise<Gallery> {
    const response = await apiClient.put<ApiResponse<Gallery>>(`/api/v1/admin/gallery/${id}/toggle-status`, {});
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '갤러리 상태 변경에 실패했습니다');
    }
    
    return response.data;
  }
}

export const galleryService = new GalleryService();
export default galleryService;
