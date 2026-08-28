import type { BridgeData, PracticePlan, PracticeSession } from './types';

export const FREE_ACTIVE_LIMIT = 1;
export const SESSION_TARGET = 8;

export function makeRevisitDates(start = new Date()): string[] {
  return [1, 3, 7, 14].map((days) => {
    const date = new Date(start);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  });
}

export function createPlan(input: Omit<PracticePlan, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'revisitDates'>): PracticePlan {
  const now = new Date().toISOString();
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    archived: false,
    revisitDates: makeRevisitDates(new Date(now))
  };
}

export function nextRevisit(plan: PracticePlan, now = new Date()): string | undefined {
  const today = now.toISOString().slice(0, 10);
  return plan.revisitDates.find((date) => date >= today) ?? plan.revisitDates.at(-1);
}

export function sessionProgress(sessions: PracticeSession[], planId: string): number {
  return sessions.filter((session) => session.planId === planId).length;
}

export function validateImport(value: unknown): BridgeData {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain Bridge data.');
  const data = value as Partial<BridgeData>;
  if (data.version !== 1 || !Array.isArray(data.plans) || !Array.isArray(data.sessions)) {
    throw new Error('This file is not a supported Bridge export.');
  }
  const validPlans = data.plans.every((plan) => plan && typeof plan.id === 'string' && typeof plan.piece === 'string' && typeof plan.drill === 'string');
  const validSessions = data.sessions.every((session) => session && typeof session.id === 'string' && typeof session.planId === 'string' && typeof session.transferNote === 'string');
  if (!validPlans || !validSessions) throw new Error('Some practice records are incomplete. Export again and retry.');
  return data as BridgeData;
}

export function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(plans: PracticePlan[], sessions: PracticeSession[]): string {
  const header = ['piece', 'goal', 'obstacle', 'drill', 'success cue', 'completed at', 'cue met', 'transfer note'];
  const rows = sessions.map((session) => {
    const plan = plans.find((item) => item.id === session.planId);
    return [plan?.piece ?? 'Deleted plan', plan?.title ?? '', plan?.obstacle ?? '', plan?.drill ?? '', plan?.successCue ?? '', session.completedAt, session.cueMet, session.transferNote];
  });
  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}
