export interface Player {
  id: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  nationality: string;
  jerseyNumber: number;
  photo: string;
  stats?: {
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    matchesPlayed?: number;
  };
}

export const dummyPlayers: Player[] = [
  {
    id: 1,
    name: '김민재',
    position: 'DF',
    age: 27,
    nationality: '대한민국',
    jerseyNumber: 3,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 2,
      assists: 1,
      yellowCards: 3,
      redCards: 0,
      matchesPlayed: 15
    }
  },
  {
    id: 2,
    name: '손흥민',
    position: 'FW',
    age: 31,
    nationality: '대한민국',
    jerseyNumber: 7,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 12,
      assists: 8,
      yellowCards: 2,
      redCards: 0,
      matchesPlayed: 18
    }
  },
  {
    id: 3,
    name: '조현우',
    position: 'GK',
    age: 32,
    nationality: '대한민국',
    jerseyNumber: 1,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 1,
      redCards: 0,
      matchesPlayed: 20
    }
  },
  {
    id: 4,
    name: '이강인',
    position: 'MF',
    age: 23,
    nationality: '대한민국',
    jerseyNumber: 18,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 6,
      assists: 11,
      yellowCards: 4,
      redCards: 0,
      matchesPlayed: 19
    }
  },
  {
    id: 5,
    name: '황희찬',
    position: 'FW',
    age: 28,
    nationality: '대한민국',
    jerseyNumber: 11,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 9,
      assists: 4,
      yellowCards: 3,
      redCards: 1,
      matchesPlayed: 16
    }
  },
  {
    id: 6,
    name: '김진수',
    position: 'DF',
    age: 25,
    nationality: '대한민국',
    jerseyNumber: 2,
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 1,
      assists: 3,
      yellowCards: 5,
      redCards: 0,
      matchesPlayed: 17
    }
  },
  {
    id: 7,
    name: '박지성',
    position: 'MF',
    age: 30,
    nationality: '대한민국',
    jerseyNumber: 13,
    photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 4,
      assists: 7,
      yellowCards: 2,
      redCards: 0,
      matchesPlayed: 20
    }
  },
  {
    id: 8,
    name: '이용',
    position: 'DF',
    age: 35,
    nationality: '대한민국',
    jerseyNumber: 20,
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 0,
      assists: 2,
      yellowCards: 6,
      redCards: 0,
      matchesPlayed: 14
    }
  },
  {
    id: 9,
    name: '정우영',
    position: 'MF',
    age: 26,
    nationality: '대한민국',
    jerseyNumber: 8,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 3,
      assists: 9,
      yellowCards: 1,
      redCards: 0,
      matchesPlayed: 18
    }
  },
  {
    id: 10,
    name: '백승호',
    position: 'FW',
    age: 24,
    nationality: '대한민국',
    jerseyNumber: 9,
    photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=face',
    stats: {
      goals: 7,
      assists: 3,
      yellowCards: 2,
      redCards: 0,
      matchesPlayed: 15
    }
  }
];