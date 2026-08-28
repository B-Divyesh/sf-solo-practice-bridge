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
  if (!isRecord(value)) throw new Error('This file does not contain Bridge data.');
  const data = value as Partial<BridgeData>;
  if (data.version !== 1 || !isIsoDateTime(data.exportedAt) || !Array.isArray(data.plans) || !Array.isArray(data.sessions)) {
    throw new Error('This file is not a supported Bridge export.');
  }
  const validPlans = data.plans.every(isPracticePlan);
  const validSessions = data.sessions.every(isPracticeSession);
  const planIds = new Set(data.plans.map((plan) => plan.id));
  const uniquePlanIds = planIds.size === data.plans.length;
  const sessionIds = new Set(data.sessions.map((session) => session.id));
  const uniqueSessionIds = sessionIds.size === data.sessions.length;
  const sessionsHavePlans = data.sessions.every((session) => planIds.has(session.planId));
  if (!validPlans || !validSessions || !uniquePlanIds || !uniqueSessionIds || !sessionsHavePlans) {
    throw new Error('Some practice records are incomplete or invalid. Export again and retry.');
  }
  return data as BridgeData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isText(value: unknown, maximum: number): value is string {
  return isNonEmptyString(value) && value.length <= maximum;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && isIsoDate(value.slice(0, 10))
    && !Number.isNaN(new Date(value).getTime());
}

function isWholeNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;
}

function isPracticePlan(value: unknown): value is PracticePlan {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id)
    && isText(value.title, 140)
    && isText(value.piece, 100)
    && isText(value.obstacle, 400)
    && isText(value.drill, 400)
    && isText(value.successCue, 180)
    && isWholeNumberInRange(value.drillMinutes, 1, 30)
    && isWholeNumberInRange(value.pieceMinutes, 1, 30)
    && Array.isArray(value.revisitDates) && value.revisitDates.length === 4 && value.revisitDates.every(isIsoDate)
    && isIsoDateTime(value.createdAt)
    && isIsoDateTime(value.updatedAt)
    && typeof value.archived === 'boolean';
}

function isPracticeSession(value: unknown): value is PracticeSession {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id)
    && isNonEmptyString(value.planId)
    && isIsoDateTime(value.completedAt)
    && isText(value.transferNote, 500)
    && ['yes', 'almost', 'not-yet'].includes(value.cueMet as string)
    && isWholeNumberInRange(value.durationSeconds, 0, Number.MAX_SAFE_INTEGER);
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
