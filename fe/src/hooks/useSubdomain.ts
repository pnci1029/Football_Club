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

        // localhost 환경에서는 기본 팀 사용 (개발용)
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          // 개발 환경에서는 첫 번째 팀을 기본으로 사용
          const teams = await teamService.getAllTeams();
          if (teams.length > 0) {
            setCurrentTeam(teams[0]);
          }
          setIsLoading(false);
          return;
        }

        // 팀 서브도메인 추출
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