/**
 * 커뮤니티 권한 관리 유틸리티
 */

import { communityApi } from '../api/modules/community';
import type { OwnershipCheckResponse } from '../api/types';

interface AuthState {
  postId?: number;
  commentId?: number;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  lastChecked?: Date;
}

class CommunityAuthManager {
  private authCache = new Map<string, AuthState>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  private getCacheKey(type: 'post' | 'comment', id: number, teamId: number): string {
    return `${type}:${id}:${teamId}`;
  }

  private isCacheValid(lastChecked?: Date): boolean {
    if (!lastChecked) return false;
    return Date.now() - lastChecked.getTime() < this.CACHE_DURATION;
  }

  async checkPostOwnership(
    postId: number, 
    teamId: number, 
    password: string
  ): Promise<OwnershipCheckResponse> {
    const cacheKey = this.getCacheKey('post', postId, teamId);
    const cached = this.authCache.get(cacheKey);

    // 캐시된 결과가 유효하고 같은 비밀번호인 경우 반환
    if (cached && this.isCacheValid(cached.lastChecked)) {
      return {
        isOwner: cached.isOwner,
        canEdit: cached.canEdit,
        canDelete: cached.canDelete
      };
    }

    try {
      const result = await communityApi.checkPostOwnership(postId, teamId, password);
      
      // 결과 캐싱
      this.authCache.set(cacheKey, {
        postId,
        isOwner: result.isOwner,
        canEdit: result.canEdit,
        canDelete: result.canDelete,
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      // 에러 발생 시 권한 없음으로 처리
      return {
        isOwner: false,
        canEdit: false,
        canDelete: false
      };
    }
  }

  async checkCommentOwnership(
    commentId: number, 
    teamId: number, 
    password: string
  ): Promise<OwnershipCheckResponse> {
    const cacheKey = this.getCacheKey('comment', commentId, teamId);
    const cached = this.authCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.lastChecked)) {
      return {
        isOwner: cached.isOwner,
        canEdit: cached.canEdit,
        canDelete: cached.canDelete
      };
    }

    try {
      const result = await communityApi.checkCommentOwnership(commentId, teamId, password);
      
      this.authCache.set(cacheKey, {
        commentId,
        isOwner: result.isOwner,
        canEdit: result.canEdit,
        canDelete: result.canDelete,
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      return {
        isOwner: false,
        canEdit: false,
        canDelete: false
      };
    }
  }

  clearCache(type?: 'post' | 'comment', id?: number, teamId?: number): void {
    if (type && id && teamId) {
      const cacheKey = this.getCacheKey(type, id, teamId);
      this.authCache.delete(cacheKey);
    } else {
      this.authCache.clear();
    }
  }

  // 세션 스토리지를 이용한 임시 권한 저장 (페이지 새로고침 시에도 유지)
  setTemporaryAuth(type: 'post' | 'comment', id: number, teamId: number, auth: OwnershipCheckResponse): void {
    const key = `community_auth_${type}_${id}_${teamId}`;
    const data = {
      ...auth,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  getTemporaryAuth(type: 'post' | 'comment', id: number, teamId: number): OwnershipCheckResponse | null {
    const key = `community_auth_${type}_${id}_${teamId}`;
    const stored = sessionStorage.getItem(key);
    
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      const isExpired = Date.now() - data.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        sessionStorage.removeItem(key);
        return null;
      }

      return {
        isOwner: data.isOwner,
        canEdit: data.canEdit,
        canDelete: data.canDelete
      };
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  clearTemporaryAuth(type?: 'post' | 'comment', id?: number, teamId?: number): void {
    if (type && id && teamId) {
      const key = `community_auth_${type}_${id}_${teamId}`;
      sessionStorage.removeItem(key);
    } else {
      // 모든 커뮤니티 권한 관련 세션 스토리지 삭제
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('community_auth_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }
}

export const communityAuthManager = new CommunityAuthManager();
export default communityAuthManager;