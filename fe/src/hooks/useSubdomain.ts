import { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { teamService } from '../services/teamService';

export const useSubdomain = () => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const detectSubdomain = async () => {
      try {
        const host = window.location.hostname;
        
        // 관리자 모드 확인
        if (host.startsWith('admin.')) {
          setIsAdminMode(true);
          setIsLoading(false);
          return;
        }

        // 로컬 테스트용 .local 도메인 처리
        if (host.endsWith('.football-club.local')) {
          const teamCode = host.replace('.football-club.local', '');
          console.log('로컬 테스트 - 팀 코드:', teamCode);
          const team = await teamService.getTeamByCode(teamCode);
          setCurrentTeam(team);
          setIsLoading(false);
          return;
        }

        // localhost 환경에서 서브도메인 처리 (개발용)
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          // kim.localhost:3000, park.localhost:3000 형태 처리
          const subdomainMatch = host.match(/^([a-zA-Z0-9-]+)\.localhost/);
          if (subdomainMatch) {
            const teamCode = subdomainMatch[1];
            console.log('로컬호스트 서브도메인 - 팀 코드:', teamCode);
            const team = await teamService.getTeamByCode(teamCode);
            setCurrentTeam(team);
          } else {
            // 서브도메인이 없는 경우 첫 번째 팀을 기본으로 사용
            const teams = await teamService.getAllTeams();
            if (teams.length > 0) {
              setCurrentTeam(teams[0]);
            }
          }
          setIsLoading(false);
          return;
        }

        // 프로덕션 팀 서브도메인 추출
        const teamMatch = host.match(/^([a-zA-Z0-9-]+)\.footballclub\.com$/);
        if (teamMatch) {
          const teamCode = teamMatch[1];
          const team = await teamService.getTeamByCode(teamCode);
          setCurrentTeam(team);
        }
      } catch (error) {
        console.error('팀 정보를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    detectSubdomain();
  }, []);

  return { currentTeam, isLoading, isAdminMode };
};