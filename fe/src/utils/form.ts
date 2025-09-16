/**
 * 폼 관련 유틸리티 함수
 */

import { useState, useCallback } from 'react';

/**
 * 일반적인 폼 변경 핸들러
 */
export const createFormChangeHandler = <T>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => {
  return (field: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
};

/**
 * 폼 입력값 변경 핸들러
 */
export const createInputChangeHandler = <T>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
};

/**
 * 폼 상태 관리 커스텀 훅
 */
export const useFormState = <T>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = createFormChangeHandler(setFormData);
  const handleInputChange = createInputChangeHandler(setFormData);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setError('');
    setLoading(false);
  }, [initialData]);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
    if (isLoading) {
      setError('');
    }
  }, []);

  return {
    formData,
    setFormData,
    loading,
    setLoading: setLoadingState,
    error,
    setError,
    handleChange,
    handleInputChange,
    resetForm,
  };
};

/**
 * 폼 검증 유틸리티
 */
export class FormValidator {
  /**
   * 필수 필드 검증
   */
  static required(value: unknown, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}은(는) 필수입니다.`;
    }
    return null;
  }

  /**
   * 최소 길이 검증
   */
  static minLength(value: string, minLength: number, fieldName: string): string | null {
    if (value && value.length < minLength) {
      return `${fieldName}은(는) ${minLength}자 이상이어야 합니다.`;
    }
    return null;
  }

  /**
   * 최대 길이 검증
   */
  static maxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value && value.length > maxLength) {
      return `${fieldName}은(는) ${maxLength}자 이하여야 합니다.`;
    }
    return null;
  }

  /**
   * 이메일 형식 검증
   */
  static email(value: string, fieldName: string = '이메일'): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return `올바른 ${fieldName} 형식이 아닙니다.`;
    }
    return null;
  }

  /**
   * 숫자 범위 검증
   */
  static numberRange(value: number, min: number, max: number, fieldName: string): string | null {
    if (value < min || value > max) {
      return `${fieldName}은(는) ${min}~${max} 범위여야 합니다.`;
    }
    return null;
  }

  /**
   * 다중 검증 실행
   */
  static validate(validations: Array<() => string | null>): string | null {
    for (const validation of validations) {
      const error = validation();
      if (error) {
        return error;
      }
    }
    return null;
  }
}

/**
 * 파일 업로드 유틸리티
 */
export class FileUploadUtil {
  /**
   * 파일 크기 검증 (바이트 단위)
   */
  static validateFileSize(file: File, maxSizeInMB: number): string | null {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.`;
    }
    return null;
  }

  /**
   * 파일 확장자 검증
   */
  static validateFileExtension(file: File, allowedExtensions: string[]): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return `허용되는 파일 확장자: ${allowedExtensions.join(', ')}`;
    }
    return null;
  }

  /**
   * 이미지 파일 여부 검증
   */
  static validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return '이미지 파일만 업로드 가능합니다. (jpg, png, gif)';
    }
    return null;
  }

  /**
   * 파일을 Base64로 변환
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}