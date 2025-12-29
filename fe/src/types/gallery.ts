export enum GalleryCategory {
  MATCH = 'MATCH',
  TRAINING = 'TRAINING', 
  EVENT = 'EVENT',
  PLAYER = 'PLAYER',
  FACILITY = 'FACILITY',
  ACHIEVEMENT = 'ACHIEVEMENT',
  HIGHLIGHT = 'HIGHLIGHT',
  ETC = 'ETC'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum PlayType {
  GOAL = 'GOAL',
  ASSIST = 'ASSIST',
  SAVE = 'SAVE',
  TACKLE = 'TACKLE',
  PASS = 'PASS',
  SHOT = 'SHOT',
  FOUL = 'FOUL',
  CARD = 'CARD',
  SUBSTITUTION = 'SUBSTITUTION',
  ETC = 'ETC'
}

export interface GalleryMedia {
  id: number;
  fileName: string;
  fileUrl: string;
  mediaType: MediaType;
  filePath: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  isCover: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface HighlightMetadata {
  id: number;
  playType: PlayType;
  playerNames?: string;
  gameMinute?: number;
  highlightRating: number;
  description?: string;
}

export interface GalleryTag {
  id: number;
  tagName: string;
  color?: string;
}

export interface Gallery {
  id: number;
  teamId: number;
  teamSubdomain: string;
  title: string;
  description?: string;
  category: GalleryCategory;
  viewCount: number;
  mediaFiles: GalleryMedia[];
  tags: GalleryTag[];
  highlightMetadata?: HighlightMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryListParams {
  page?: number;
  size?: number;
  keyword?: string;
  category?: GalleryCategory;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface GalleryResponse {
  content: Gallery[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateGalleryRequest {
  title: string;
  description?: string;
  category: GalleryCategory;
  tags?: string[];
  highlightMetadata?: {
    playType: PlayType;
    playerNames?: string;
    gameMinute?: number;
    highlightRating: number;
    description?: string;
  };
}

export interface UpdateGalleryRequest {
  title?: string;
  description?: string;
  category?: GalleryCategory;
  tags?: string[];
  highlightMetadata?: {
    playType: PlayType;
    playerNames?: string;
    gameMinute?: number;
    highlightRating: number;
    description?: string;
  };
}

export interface GalleryStatistics {
  totalGalleryCount: number;
  categoryStats: Record<GalleryCategory, number>;
  totalViewCount: number;
  totalMediaCount: number;
  thisMonthGalleryCount: number;
}

export interface PopularGalleryResponse {
  galleries: Gallery[];
}