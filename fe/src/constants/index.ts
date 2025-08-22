export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const POSITIONS = {
  GK: 'GK',
  DF: 'DF', 
  MF: 'MF',
  FW: 'FW'
} as const;

export const POSITION_COLORS = {
  [POSITIONS.GK]: 'bg-orange-500',
  [POSITIONS.DF]: 'bg-blue-500', 
  [POSITIONS.MF]: 'bg-green-500',
  [POSITIONS.FW]: 'bg-red-500'
} as const;

export const POSITION_NAMES = {
  [POSITIONS.GK]: '골키퍼',
  [POSITIONS.DF]: '수비수',
  [POSITIONS.MF]: '미드필더', 
  [POSITIONS.FW]: '공격수'
} as const;

export const DEFAULT_TEAM_LOGO = '/logo192.png';