import { useState, useEffect, useRef } from 'react';
import { Team } from '../types/team';
import { teamService } from '../services/teamService';

// 팀 정보 캐시 (메모리 캐시)
const teamCache = new Map<string, Team>();
const cacheTimestamp = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 캐시 헬퍼 함수들
const getCachedTeam = (key: string): Team | null => {
  const cached = teamCache.get(key);
  const timestamp = cacheTimestamp.get(key);

  if (cached && timestamp && Date.now() - timestamp < CACHE_DURATION) {
    return cached;
  }

  // 캐시 만료 시 정리
  teamCache.delete(key);
  cacheTimestamp.delete(key);
  return null;
};

const setCachedTeam = (key: string, team: Team) => {
  teamCache.set(key, team);
  cacheTimestamp.set(key, Date.now());
};

export const useSubdomain = () => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [teamNotFound, setTeamNotFound] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const detectSubdomain = async () => {
      if (isCancelled) return;

      try {
        const host = window.location.hostname;
        console.log('현재 호스트:', host);

        // 관리자 모드 확인
        if (host.startsWith('admin.')) {
          if (!isCancelled) {
            setIsAdminMode(true);
            setIsLoading(false);
          }
          return;
        }

        // 로컬 테스트용 .local 도메인 처리
        if (host.endsWith('.football-club.local')) {
          const teamCode = host.replace('.football-club.local', '');

          // 캐시 확인
          const cachedTeam = getCachedTeam(teamCode);
          if (cachedTeam) {
            if (!isCancelled) {
              setCurrentTeam(cachedTeam);
              setIsLoading(false);
            }
            return;
          }

          const team = await teamService.getTeamByCode(teamCode);
          if (!isCancelled) {
            if (team) {
              setCachedTeam(teamCode, team);
              setCurrentTeam(team);
            } else {
              console.error(`❌ 팀 코드 '${teamCode}'를 찾을 수 없습니다.`);
            }
            setIsLoading(false);
          }
          return;
        }

        // localhost 환경에서 서브도메인 처리 (개발용)
        if (host.includes('localhost') || host.includes('127.0.0.1')) {

          // kim.localhost:3000 형태 처리 (개발 환경)
          const subdomainMatch = host.match(/^([a-zA-Z0-9-]+)\.localhost/);

          if (subdomainMatch) {
            const teamCode = subdomainMatch[1];
            try {
              const team = await teamService.getTeamByCode(teamCode);
              if (!isCancelled) {
                if (team) {
                  setCurrentTeam(team);
                  setIsLoading(false);
                } else {
                  // 팀이 존재하지 않음을 표시
                  setTeamNotFound(true);
                  setIsLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('API 에러:', error);
              if (!isCancelled) {
                // API 에러 시에도 팀을 찾을 수 없음으로 처리
                setTeamNotFound(true);
                setIsLoading(false);
                return;
              }
            }
          } else {
            // 서브도메인이 없는 경우 기본 팀 정보로 즉시 설정
            if (!isCancelled) {
              setCurrentTeam({
                id: '1',
                name: 'Football Club',
                code: 'default',
                description: '기본 축구 클럽',
                logoUrl: '',
                createdAt: new Date().toISOString()
              });
              setIsLoading(false);
            }
          }
          return;
        }

        // 프로덕션 팀 서브도메인 추출 (football-club.kr 도메인도 포함)
        const teamMatch = host.match(/^([a-zA-Z0-9-]+)\.(footballclub\.com|football-club\.kr)$/);
        if (teamMatch) {
          const teamCode = teamMatch[1];

          // 캐시 확인
          const cachedTeam = getCachedTeam(teamCode);
          if (cachedTeam) {
            if (!isCancelled) {
              setCurrentTeam(cachedTeam);
              setIsLoading(false);
            }
            return;
          }

          const team = await teamService.getTeamByCode(teamCode);
          if (!isCancelled) {
            if (team) {
              setCachedTeam(teamCode, team);
              setCurrentTeam(team);
              setIsLoading(false);
            } else {
              // 팀이 존재하지 않음을 표시
              setTeamNotFound(true);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('💥 팀 정보를 가져오는데 실패했습니다:', error);

        // 서브도메인이 있는 경우에만 404로 리다이렉트
        const host = window.location.hostname;
        const hasSubdomain = host.match(/^([a-zA-Z0-9-]+)\.(localhost|football-club\.kr)$/);

        if (!isCancelled) {
          if (hasSubdomain && hasSubdomain[1] !== 'www') {
            // 서브도메인이 있고 www가 아닌 경우 팀을 찾을 수 없음으로 표시
            setTeamNotFound(true);
            setIsLoading(false);
            return;
          } else {
            // localhost 환경에서 서브도메인 없이 접근한 경우에만 기본 팀 정보 설정
            setCurrentTeam({
              id: '1',
              name: 'Football Club',
              code: 'default',
              description: '기본 축구 클럽',
              logoUrl: '',
              createdAt: new Date().toISOString()
            });
          }
        }
      } finally {
        if (!isCancelled) {
          // console.log('🏁 useSubdomain 초기화 완료');
          setIsLoading(false);
        }
      }
    };

    detectSubdomain();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { currentTeam, isLoading, isAdminMode, teamNotFound };
};
