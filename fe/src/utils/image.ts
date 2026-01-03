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
   * 아바타 이미지 생성
   */
  static createAvatar(
    name: string, 
    size: number = 150, 
    backgroundColor: string = '3b82f6', 
    textColor: string = 'ffffff'
  ): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${backgroundColor}&color=${textColor}&bold=true&rounded=true`;
  }

  /**
   * 플레이어 프로필 이미지 생성
   */
  static createPlayerProfile(playerName: string, size: number = 150): string {
    return ImageUtil.createAvatar(playerName, size, '3b82f6', 'ffffff'); // 블루 배경, 화이트 텍스트
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

}