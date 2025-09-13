/**
 * Images API 모듈 - 이미지 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ApiResponse,
} from '../types';

export const imagesApi = {
  // 이미지 업로드
  upload: (file: File): Promise<ApiResponse<{ url: string }>> =>
    api.callEndpoint<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.IMAGES.UPLOAD,
      undefined,
      { file }
    ),

  // 이미지 URL 생성 (서버에서 생성된 URL)
  generateUrl: (key: string): Promise<ApiResponse<{ url: string }>> =>
    api.callEndpoint<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.IMAGES.GENERATE_URL,
      { key }
    ),
};

export const Images = {
  // Images API
  api: imagesApi,

  // 편의 메서드들
  async uploadImage(file: File): Promise<string> {
    if (!file) {
      throw new Error('파일을 선택해주세요.');
    }

    // 파일 크기 체크 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('파일 크기는 10MB 이하여야 합니다.');
    }

    // 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 지원)');
    }

    const response = await imagesApi.upload(file);
    return response.data.url;
  },

  async generateImageUrl(key: string): Promise<string> {
    if (!key) {
      throw new Error('이미지 키가 필요합니다.');
    }

    const response = await imagesApi.generateUrl(key);
    return response.data.url;
  },

  // 이미지 미리보기 생성
  createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('파일 읽기에 실패했습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
      reader.readAsDataURL(file);
    });
  },

  // 이미지 크기 조정 (클라이언트 사이드)
  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 원본 비율 유지하면서 크기 조정
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 리사이징에 실패했습니다.'));
              return;
            }

            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = URL.createObjectURL(file);
    });
  },

  // 이미지 형식 변환
  async convertToFormat(file: File, format: 'jpeg' | 'png' | 'webp' = 'jpeg', quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${format}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 변환에 실패했습니다.'));
              return;
            }

            const fileName = file.name.replace(/\.[^/.]+$/, `.${format}`);
            const convertedFile = new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            resolve(convertedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = URL.createObjectURL(file);
    });
  },

  // 파일 크기 포맷팅
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default Images;