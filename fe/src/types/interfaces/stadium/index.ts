export interface Stadium {
  id: number;
  name: string;
  address: string;
  capacity?: number;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  imageUrls: string[];
  teamId?: number;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStadiumRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  imageUrls: string[];
  capacity?: number;
}

export interface UpdateStadiumRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  contactNumber?: string;
  facilities?: string[];
  availableHours?: string;
  imageUrls?: string[];
  capacity?: number;
}

export interface StadiumApiResponse {
  success: boolean;
  data: Stadium | Stadium[];
  message?: string;
  error?: string;
}

export interface StadiumPageResponse {
  content: Stadium[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface StadiumSearchParams {
  teamId?: number;
  page?: number;
  size?: number;
  search?: string;
}

export interface PostcodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
}

export interface KakaoGeocoderResult {
  x: string;
  y: string;
  address_name: string;
}

export interface KakaoGeocoderStatus {
  OK: string;
  ZERO_RESULT: string;
  ERROR: string;
}