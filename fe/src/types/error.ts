export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
  code?: string;
  timestamp?: string;
}

export interface NetworkError extends Error {
  status?: number;
  response?: {
    data?: ErrorResponse;
    status?: number;
    statusText?: string;
  };
}

// Utility type for handling unknown errors
export type UnknownError = any;

// Helper function to extract error message
export function getErrorMessage(error: UnknownError, defaultMessage: string = '오류가 발생했습니다.'): string {
  if (!error) return defaultMessage;
  
  // API error response
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error?.message) return error.response.data.error.message;
  
  // Standard error
  if (error.message) return error.message;
  
  return defaultMessage;
}