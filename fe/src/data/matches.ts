export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
  league?: string;
  season: string;
  matchType: 'league' | 'cup' | 'friendly';
  weather?: string;
  attendance?: number;
  referee?: string;
}

export interface MatchEvent {
  id: number;
  matchId: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  player: string;
  team: 'home' | 'away';
  minute: number;
  description: string;
}

export const dummyMatches: Match[] = [
  {
    id: 1,
    homeTeam: 'Football Club',
    awayTeam: '서울 FC',
    date: '2025-01-25',
    time: '14:00',
    venue: '서울월드컵경기장',
    status: 'scheduled',
    league: '서울 아마추어 리그',
    season: '2025',
    matchType: 'league',
    weather: '맑음, 15°C'
  },
  {
    id: 2,
    homeTeam: '강남 유나이티드',
    awayTeam: 'Football Club',
    date: '2025-01-18',
    time: '16:00',
    venue: '잠실종합운동장 보조경기장',
    status: 'finished',
    score: {
      home: 1,
      away: 3
    },
    league: '서울 아마추어 리그',
    season: '2025',
    matchType: 'league',
    weather: '흐림, 8°C',
    attendance: 150,
    referee: '김심판'
  },
  {
    id: 3,
    homeTeam: 'Football Club',
    awayTeam: '마포 드래곤스',
    date: '2025-02-01',
    time: '15:30',
    venue: '상암 DMC 스타디움',
    status: 'scheduled',
    league: '서울 아마추어 리그',
    season: '2025',
    matchType: 'league',
    weather: '예상: 구름많음, 12°C'
  },
  {
    id: 4,
    homeTeam: '송파 FC',
    awayTeam: 'Football Club',
    date: '2025-01-11',
    time: '13:00',
    venue: '올림픽공원 체육관 축구장',
    status: 'finished',
    score: {
      home: 2,
      away: 2
    },
    league: '서울 아마추어 리그',
    season: '2025',
    matchType: 'league',
    weather: '맑음, 5°C',
    attendance: 200,
    referee: '박심판'
  },
  {
    id: 5,
    homeTeam: 'Football Club',
    awayTeam: '한강 FC',
    date: '2025-02-08',
    time: '14:30',
    venue: '한강공원 축구장',
    status: 'scheduled',
    matchType: 'friendly',
    season: '2025'
  },
  {
    id: 6,
    homeTeam: '은평 워리어스',
    awayTeam: 'Football Club',
    date: '2025-01-04',
    time: '15:00',
    venue: '은평구민체육센터',
    status: 'finished',
    score: {
      home: 0,
      away: 1
    },
    league: '서울 아마추어 리그',
    season: '2025',
    matchType: 'league',
    weather: '눈, -2°C',
    attendance: 80,
    referee: '이심판'
  },
  {
    id: 7,
    homeTeam: 'Football Club',
    awayTeam: '강서 스타즈',
    date: '2025-02-15',
    time: '16:00',
    venue: '서울월드컵경기장',
    status: 'scheduled',
    league: '컵 대회',
    season: '2025',
    matchType: 'cup'
  },
  {
    id: 8,
    homeTeam: '성동 FC',
    awayTeam: 'Football Club',
    date: '2024-12-21',
    time: '14:00',
    venue: '성동구민체육센터',
    status: 'finished',
    score: {
      home: 3,
      away: 1
    },
    league: '서울 아마추어 리그',
    season: '2024',
    matchType: 'league',
    weather: '맑음, 3°C',
    attendance: 120,
    referee: '최심판'
  }
];

export const dummyMatchEvents: MatchEvent[] = [
  {
    id: 1,
    matchId: 2,
    type: 'goal',
    player: '손흥민',
    team: 'away',
    minute: 15,
    description: '왼발 슛으로 선제골'
  },
  {
    id: 2,
    matchId: 2,
    type: 'goal',
    player: '김강남',
    team: 'home',
    minute: 32,
    description: '헤딩골로 동점'
  },
  {
    id: 3,
    matchId: 2,
    type: 'yellow_card',
    player: '박선수',
    team: 'home',
    minute: 45,
    description: '반칙성 태클'
  },
  {
    id: 4,
    matchId: 2,
    type: 'goal',
    player: '이강인',
    team: 'away',
    minute: 67,
    description: '프리킥 직접골'
  },
  {
    id: 5,
    matchId: 2,
    type: 'goal',
    player: '황희찬',
    team: 'away',
    minute: 84,
    description: '역습 상황에서 마무리'
  }
];