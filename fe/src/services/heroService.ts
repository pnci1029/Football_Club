import { apiClient } from './api';
import { HeroSlide, CreateHeroSlideRequest, UpdateHeroSlideRequest } from '../types/hero';

export class HeroService {
  static async getActiveSlides(teamId: number): Promise<HeroSlide[]> {
    return await apiClient.get<HeroSlide[]>(`/api/v1/hero-slides/active?teamId=${teamId}`);
  }

  static async getAllSlides(teamId: number): Promise<HeroSlide[]> {
    return apiClient.get<HeroSlide[]>(`/api/v1/admin/hero-slides?teamId=${teamId}`);
  }

  static async createSlide(teamId: number, data: CreateHeroSlideRequest, file?: File): Promise<HeroSlide> {
    const formData = new FormData();
    formData.append('teamId', teamId.toString());
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('gradientColor', data.gradientColor.toLowerCase());
    formData.append('isActive', data.isActive.toString());
    formData.append('sortOrder', data.sortOrder.toString());
    
    if (file) {
      formData.append('file', file);
    }
    
    return apiClient.uploadFile<{ data: HeroSlide }>(`/api/v1/admin/hero-slides?teamId=${teamId}`, formData)
      .then(response => response.data);
  }

  static async updateSlide(id: number, data: UpdateHeroSlideRequest): Promise<HeroSlide> {
    const payload = {
      ...data,
      gradientColor: data.gradientColor ? data.gradientColor.toUpperCase() : undefined
    };
    return apiClient.put<HeroSlide>(`/api/v1/admin/hero-slides/${id}`, payload);
  }

  static async deleteSlide(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/v1/admin/hero-slides/${id}`);
  }

  static async updateSortOrder(slides: Array<{ id: number; sortOrder: number }>): Promise<void> {
    return apiClient.put<void>('/api/v1/admin/hero-slides/sort-order', { slides });
  }
}
