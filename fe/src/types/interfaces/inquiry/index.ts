export interface Inquiry {
  id: number;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'FEEDBACK' | 'OTHER';
  name?: string;
  email: string;
  phone?: string;
  teamName?: string;
  message?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryRequest {
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'FEEDBACK' | 'OTHER';
  name?: string;
  email: string;
  phone?: string;
  teamName?: string;
  message?: string;
}

export interface UpdateInquiryStatusRequest {
  status: Inquiry['status'];
  responseMessage?: string;
}

export interface InquiryApiResponse {
  success: boolean;
  data: Inquiry | Inquiry[];
  message?: string;
  error?: string;
}

export interface InquiryPageResponse {
  content: Inquiry[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface InquirySearchParams {
  status?: Inquiry['status'];
  category?: Inquiry['category'];
  page?: number;
  size?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface InquiryStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
}