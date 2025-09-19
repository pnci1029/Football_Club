import { apiClient } from './api';
import { HeroSlides } from '../api';
import { HeroSlide, CreateHeroSlideRequest, UpdateHeroSlideRequest } from '../types/hero';

export class HeroService {
  static async getActiveSlides(teamId: number): Promise<HeroSlide[]> {
    return await apiClient.get<HeroSlide[]>(`/api/v1/hero-slides/active?teamId=${teamId}`);
  }

  static async getAllSlides(teamId: number): Promise<HeroSlide[]> {
    return apiClient.get<HeroSlide[]>(`/api/v1/admin/hero-slides?teamId=${teamId}`);
  }

  static async createSlide(teamId: number, data: CreateHeroSlideRequest): Promise<HeroSlide> {
    const payload = {
      ...data,
      teamId,
      gradientColor: data.gradientColor.toUpperCase()
    };
    return apiClient.post<HeroSlide>(`/api/v1/admin/hero-slides?teamId=${teamId}`, payload);
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
