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
  teamId: number;
  teamName: string;
  facilities?: string[] | null;
  hourlyRate?: number | null;
  availableHours?: string | null;
  availableDays?: string[] | null;
  contactNumber?: string | null;
  imageUrls?: string[] | null;
  // 팀 연락처 정보  
  teamContactPhone?: string | null;
  teamKakaoId?: string | null;
}