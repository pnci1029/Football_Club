import { apiClient } from './api';
import { HeroSlide, CreateHeroSlideRequest, UpdateHeroSlideRequest } from '../types/hero';

export class HeroService {
  static async getActiveSlides(): Promise<HeroSlide[]> {
    return apiClient.get<HeroSlide[]>('/api/v1/admin/hero-slides/active');
  }

  static async getAllSlides(): Promise<HeroSlide[]> {
    return apiClient.get<HeroSlide[]>('/api/v1/admin/hero-slides');
  }

  static async createSlide(data: CreateHeroSlideRequest): Promise<HeroSlide> {
    return apiClient.post<HeroSlide>('/api/v1/admin/hero-slides', data);
  }

  static async updateSlide(id: number, data: UpdateHeroSlideRequest): Promise<HeroSlide> {
    return apiClient.put<HeroSlide>(`/api/v1/admin/hero-slides/${id}`, data);
  }

  static async deleteSlide(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/v1/admin/hero-slides/${id}`);
  }

  static async updateSortOrder(slides: Array<{ id: number; sortOrder: number }>): Promise<void> {
    return apiClient.put<void>('/api/v1/admin/hero-slides/sort-order', { slides });
  }
}