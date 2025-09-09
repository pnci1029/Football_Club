/**
 * 이미지 관련 유틸리티 함수
 */

/**
 * 플레이스홀더 이미지 생성 유틸리티
 */
export class ImageUtil {
  /**
   * Canvas를 이용한 플레이스홀더 이미지 생성 (Data URI)
   */
  static createPlaceholder(
    width: number = 400,
    height: number = 400,
    text?: string,
    backgroundColor: string = 'e5e7eb',
    textColor: string = '9ca3af'
  ): string {
    // ui-avatars.com을 우선적으로 사용
    const placeholderText = text || 'No Image';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(placeholderText)}&size=${Math.min(width, height)}&background=${backgroundColor}&color=${textColor}&bold=true&rounded=false`;
  }

  /**
   * 사각형 플레이스홀더 이미지 (기본 400x400)
   */
  static createSquarePlaceholder(size: number = 400, text?: string): string {
    return ImageUtil.createPlaceholder(size, size, text);
  }

  /**
   * UI Avatars를 이용한 아바타 생성
   */
  static createAvatar(
    name: string,
    size: number = 128,
    backgroundColor?: string,
    color?: string
  ): string {
    const params = new URLSearchParams({
      name: name.trim(),
      size: size.toString(),
      rounded: 'true',
      bold: 'true',
    });

    if (backgroundColor) {
      params.append('background', backgroundColor.replace('#', ''));
    }

    if (color) {
      params.append('color', color.replace('#', ''));
    }

    return `https://ui-avatars.com/api/?${params.toString()}`;
  }

  /**
   * 첫 글자를 이용한 아바타 생성
   */
  static createInitialAvatar(name: string, size: number = 128): string {
    const initial = name.charAt(0).toUpperCase();
    return ImageUtil.createAvatar(initial, size);
  }

  /**
   * 팀 로고 플레이스홀더 생성
   */
  static createTeamLogo(teamName: string, size: number = 100): string {
    const initial = teamName.charAt(0).toUpperCase();
    return ImageUtil.createAvatar(initial, size, '1f2937', 'ffffff'); // 다크 그레이 배경, 화이트 텍스트
  }

  /**
   * 스타디움 이미지 플레이스홀더 생성
   */
  static createStadiumPlaceholder(stadiumName?: string): string {
    const text = stadiumName || 'Stadium';
    return ImageUtil.createPlaceholder(400, 300, text, '374151', 'ffffff'); // 다크 배경, 화이트 텍스트
  }

  /**
   * 플레이어 프로필 이미지 생성
   */
  static createPlayerProfile(playerName: string, size: number = 150): string {
    return ImageUtil.createAvatar(playerName, size, '3b82f6', 'ffffff'); // 블루 배경, 화이트 텍스트
  }

  /**
   * 이미지 URL 유효성 검증
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const validUrl = new URL(url);
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const extension = validUrl.pathname.split('.').pop()?.toLowerCase();
      
      return Boolean(extension && validExtensions.includes(extension));
    } catch {
      return false;
    }
  }

  /**
   * 이미지 로드 상태 확인
   */
  static checkImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * 이미지 URL과 폴백 URL을 이용한 안전한 이미지 소스 생성
   */
  static createSafeImageSrc(primaryUrl?: string, fallbackGenerator?: () => string): string {
    if (primaryUrl && primaryUrl.trim() !== '') {
      return primaryUrl;
    }
    
    return fallbackGenerator ? fallbackGenerator() : ImageUtil.createPlaceholder();
  }

  /**
   * 이미지 리사이즈 (Canvas 사용)
   */
  static resizeImage(
    file: File, 
    maxWidth: number, 
    maxHeight: number, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 비율 계산
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  }
}