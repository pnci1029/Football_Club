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
  const hasInitialized = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    
    const detectSubdomain = async () => {
      if (isCancelled || hasInitialized.current) return;
      hasInitialized.current = true;
      
      try {
        const host = window.location.hostname;
        
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
          // console.log('🖥️ localhost 환경 감지');
          // kim.localhost:3000 형태 처리 (개발 환경)
          const subdomainMatch = host.match(/^([a-zA-Z0-9-]+)\.localhost/);
          if (subdomainMatch) {
            const teamCode = subdomainMatch[1];
            // console.log('🏷️ 서브도메인 팀 코드:', teamCode);
            // console.log('📡 API 호출 시작 - getTeamByCode:', teamCode);
            const team = await teamService.getTeamByCode(teamCode);
            if (!isCancelled) {
              if (team) {
                // console.log('✅ 팀 정보 로드 성공:', team);
                setCurrentTeam(team);
              } else {
                console.error(`❌ 팀 코드 '${teamCode}'를 찾을 수 없습니다.`);
                // 팀을 찾을 수 없을 때 첫 번째 팀으로 대체
                // console.log('📡 API 호출 시작 - getAllTeams (fallback)');
                const teams = await teamService.getAllTeams();
                if (teams.length > 0) {
                  // console.log('✅ 첫 번째 팀으로 대체:', teams[0]);
                  setCurrentTeam(teams[0]);
                }
              }
            }
          } else {
            // console.log('🏠 서브도메인 없음 - 기본 팀 로드');
            // 서브도메인이 없는 경우 첫 번째 팀을 기본으로 사용
            // console.log('📡 API 호출 시작 - getAllTeams (default)');
            const teams = await teamService.getAllTeams();
            if (!isCancelled && teams.length > 0) {
              // console.log('✅ 기본 팀 로드:', teams[0]);
              setCurrentTeam(teams[0]);
            }
          }
          if (!isCancelled) {
            setIsLoading(false);
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
            } else {
              console.error(`❌ 팀 코드 '${teamCode}'를 찾을 수 없습니다.`);
            }
          }
        }
      } catch (error) {
        console.error('💥 팀 정보를 가져오는데 실패했습니다:', error);
        // API 에러 시 기본 팀 정보로 설정
        if (!isCancelled) {
          // console.log('🔄 기본 팀 정보 설정');
          // 현재 서브도메인에서 팀 코드 추출
          const host = window.location.hostname;
          let teamCode = 'default';
          
          // 서브도메인에서 팀 코드 추출
          const subdomainMatch = host.match(/^([a-zA-Z0-9-]+)\./);
          if (subdomainMatch && subdomainMatch[1] !== 'admin' && subdomainMatch[1] !== 'www') {
            teamCode = subdomainMatch[1];
          }
          
          // 팀 코드를 해시하여 일관된 ID 생성 (간단한 방법)
          let teamId = '1'; // 기본값
          if (teamCode === 'kim') teamId = '2';
          else if (teamCode === 'park') teamId = '3';
          else {
            // 다른 팀 코드들은 해시값으로 ID 생성
            teamId = Math.abs(teamCode.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0)).toString();
          }
          
          setCurrentTeam({
            id: teamId,
            name: `${teamCode.charAt(0).toUpperCase() + teamCode.slice(1)} FC`,
            code: teamCode,
            description: '기본 축구 클럽',
            logoUrl: '',
            createdAt: new Date().toISOString()
          });
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

  return { currentTeam, isLoading, isAdminMode };
};