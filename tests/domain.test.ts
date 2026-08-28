import { describe, expect, it } from 'vitest';
import { escapeCsv, makeRevisitDates, nextRevisit, sessionProgress, toCsv, validateImport } from '../src/domain';
import type { PracticePlan, PracticeSession } from '../src/types';

const plan: PracticePlan = {
  id: 'plan-1', title: 'Land the shift quietly', piece: 'Test piece', obstacle: 'Thumb locks', drill: 'Two-note loop', successCue: 'Three loose repeats', drillMinutes: 3, pieceMinutes: 4,
  revisitDates: ['2026-08-29', '2026-08-31', '2026-09-04', '2026-09-11'], createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z', archived: false
};
const session: PracticeSession = { id: 's-1', planId: 'plan-1', completedAt: '2026-08-28T12:00:00.000Z', transferNote: 'Felt "lighter", twice', cueMet: 'almost', durationSeconds: 420 };

describe('practice domain', () => {
  it('builds a spaced four-date revisit sequence', () => {
    expect(makeRevisitDates(new Date('2026-08-28T12:00:00Z'))).toEqual(['2026-08-29', '2026-08-31', '2026-09-04', '2026-09-11']);
  });

  it('selects the next non-past revisit and counts sessions by plan', () => {
    expect(nextRevisit(plan, new Date('2026-08-30T12:00:00Z'))).toBe('2026-08-31');
    expect(sessionProgress([session, { ...session, id: 'other', planId: 'other-plan' }], plan.id)).toBe(1);
  });

  it('escapes portable CSV and includes transfer context', () => {
    expect(escapeCsv('one, two')).toBe('"one, two"');
    const csv = toCsv([plan], [session]);
    expect(csv).toContain('Test piece');
    expect(csv).toContain('"Felt ""lighter"", twice"');
  });

  it('rejects incomplete imports and accepts only a complete versioned backup', () => {
    expect(() => validateImport({ plans: [] })).toThrow(/supported Bridge export/);
    expect(() => validateImport({
      version: 1,
      exportedAt: '2026-08-28T00:00:00.000Z',
      plans: [{ id: 'malformed-plan', piece: 'Broken Import', drill: 'one note' }],
      sessions: []
    })).toThrow(/incomplete or invalid/);
    expect(validateImport({ version: 1, exportedAt: '2026-08-28T00:00:00.000Z', plans: [plan], sessions: [session] }).plans).toHaveLength(1);
  });
});
