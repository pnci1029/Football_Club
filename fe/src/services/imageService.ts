import { getApiBaseUrl } from '../utils/config';

export interface ImageUploadResponse {
  success: boolean;
  filename: string;
  originalName: string;
  url: string;
  size: number;
}

export interface ImageUploadError {
  error: string;
}

export class ImageService {
  private static getBaseUrl(): string {
    return getApiBaseUrl();
  }
  
  // 이미지 업로드는 직접 백엔드 포트로 (Cafe24 웹서버 제한 우회)
  private static getImageUploadUrl(): string {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost')) {
      return 'http://localhost:8082';
    }
    // 프로덕션에서는 직접 백엔드 포트 사용
    return 'https://football-club.kr:8082';
  }
  
  private static readonly UPLOAD_URL = `${ImageService.getImageUploadUrl()}/api/v1/images/upload`;
  private static readonly DELETE_URL = `${ImageService.getBaseUrl()}/api/v1/images`;

  /**
   * 이미지 파일을 업로드합니다.
   */
  static async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      // 파일 크기 검증 (10MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('파일 크기가 10MB를 초과합니다.');
      }

      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('지원되지 않는 파일 형식입니다. (jpg, png, gif, webp만 허용)');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`업로드 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '업로드에 실패했습니다.');
      }

      return result as ImageUploadResponse;

    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * 업로드된 이미지를 삭제합니다.
   */
  static async deleteImage(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.DELETE_URL}/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status}`);
      }

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Image delete error:', error);
      return false;
    }
  }

  /**
   * 파일에서 이미지 미리보기 URL을 생성합니다.
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * 미리보기 URL의 메모리를 해제합니다.
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * 파일명에서 URL을 생성합니다.
   */
  static getImageUrl(filename: string): string {
    return `${ImageService.getBaseUrl()}/uploads/${filename}`;
  }
}
