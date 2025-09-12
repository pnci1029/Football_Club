import { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { teamService } from '../services/teamService';

export const useSubdomain = () => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const detectSubdomain = async () => {
      if (isCancelled) return;
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
          // console.log('🏠 로컬 테스트 - 팀 코드:', teamCode);
          // console.log('📡 API 호출 시작 - getTeamByCode:', teamCode);
          const team = await teamService.getTeamByCode(teamCode);
          if (!isCancelled) {
            if (team) {
              // console.log('✅ 팀 정보 로드 성공:', team);
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

        // 프로덕션 팀 서브도메인 추출
        const teamMatch = host.match(/^([a-zA-Z0-9-]+)\.footballclub\.com$/);
        if (teamMatch) {
          const teamCode = teamMatch[1];
          // console.log('🌍 프로덕션 팀 코드:', teamCode);
          // console.log('📡 API 호출 시작 - getTeamByCode:', teamCode);
          const team = await teamService.getTeamByCode(teamCode);
          if (!isCancelled) {
            if (team) {
              // console.log('✅ 팀 정보 로드 성공:', team);
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
          setCurrentTeam({
            id: '1',
            name: 'Football Club',
            code: 'default',
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