export interface PracticePlan {
  id: string;
  title: string;
  piece: string;
  obstacle: string;
  drill: string;
  successCue: string;
  drillMinutes: number;
  pieceMinutes: number;
  revisitDates: string[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface PracticeSession {
  id: string;
  planId: string;
  completedAt: string;
  transferNote: string;
  cueMet: 'yes' | 'almost' | 'not-yet';
  durationSeconds: number;
}

export interface BridgeData {
  version: 1;
  exportedAt: string;
  plans: PracticePlan[];
  sessions: PracticeSession[];
}

export interface LicenseState {
  token: string;
  valid: boolean;
  checkedAt: number;
}
