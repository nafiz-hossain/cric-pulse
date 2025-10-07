export interface BattingStats {
  defence: number;
  missHit: number;
  goodHit: number;
  edgeBack: number;
}

export interface BowlingStats {
  legal: number;
  fullToss: number;
  wide: number;
  short: number;
  noBall?: number;
}

export interface PlayerSession {
  playerId: string;
  playerName: string;
  type: 'batting' | 'bowling';
  stats: BattingStats | BowlingStats;
  date: string;
  sessionId: string;
  inputBy: string;
  inputByEmail: string;
}

export interface PracticeSession {
  id: string;
  date: string;
  createdBy: string;
  createdByEmail: string;
  players: PlayerSession[];
}