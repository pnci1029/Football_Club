export interface Stadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  facilities?: string;
  hourlyRate?: number;
  availableHours?: string;
  availableDays?: string[];
  contactNumber?: string;
  imageUrls?: string;
}

// API 응답용 타입
export interface StadiumDto {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  facilities?: string;
  hourlyRate?: number;
  availableHours?: string;
  availableDays?: string[];
  contactNumber?: string;
  imageUrls?: string;
}