export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  gradientColor: 'slate' | 'blue' | 'green' | 'purple' | 'red';
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroSlideRequest {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  gradientColor: 'slate' | 'blue' | 'green' | 'purple' | 'red';
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateHeroSlideRequest {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  gradientColor?: 'slate' | 'blue' | 'green' | 'purple' | 'red';
  isActive?: boolean;
  sortOrder?: number;
}

export const GRADIENT_OPTIONS = {
  slate: 'from-slate-800 via-slate-700 to-slate-900',
  blue: 'from-blue-800 via-blue-700 to-blue-900',
  green: 'from-green-800 via-green-700 to-green-900',
  purple: 'from-purple-800 via-purple-700 to-purple-900',
  red: 'from-red-800 via-red-700 to-red-900'
} as const;