import { makeRevisitDates } from './domain';
import type { BridgeData, PracticePlan, PracticeSession } from './types';

export function sampleBridgeData(now = new Date()): BridgeData {
  const created = new Date(now);
  created.setDate(created.getDate() - 2);
  const createdAt = created.toISOString();
  const plan: PracticePlan = {
    id: 'demo-autumn-leaves',
    title: 'Keep the line connected through the shift',
    piece: 'Autumn Leaves, bars 17–24',
    obstacle: 'My left hand tightens before the shift, so the phrase breaks.',
    drill: 'Loop the last two notes before the shift at 64 bpm. Keep the thumb light. Play four calm repeats.',
    successCue: 'Three connected repeats before returning to the full phrase.',
    drillMinutes: 3,
    pieceMinutes: 4,
    revisitDates: makeRevisitDates(created),
    createdAt,
    updatedAt: now.toISOString(),
    archived: false
  };
  const sessionTime = new Date(now);
  sessionTime.setDate(sessionTime.getDate() - 1);
  sessionTime.setHours(18, 30, 0, 0);
  const session: PracticeSession = {
    id: 'demo-autumn-leaves-session',
    planId: plan.id,
    completedAt: sessionTime.toISOString(),
    transferNote: 'The shift stayed smooth twice at 64 bpm. It tightened again when I rushed the pickup.',
    cueMet: 'almost',
    durationSeconds: 420
  };
  return { version: 1, exportedAt: now.toISOString(), plans: [plan], sessions: [session] };
}
