export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export type UnknownError = Error | ApiError | unknown;

export const getErrorMessage = (error: UnknownError, defaultMessage: string = '알 수 없는 오류가 발생했습니다.'): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('code' in error && 'message' in error) {
      const apiError = error as ApiError;
      return apiError.message;
    }
  }
  
  return defaultMessage;
};