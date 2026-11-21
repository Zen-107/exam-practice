import type { Answer, GradeResult } from '../grading/types';

export interface Attempt { questionId: string; at: number; answer: Answer; result: GradeResult; exam?: boolean }
export type InputMode = 'voice' | 'typed';

const K_ATTEMPTS = 'cpe310.attempts.v1';
const K_MODE = 'cpe310.mode.v1';
const K_DRAFT = 'cpe310.draft.';

function read<T>(k: string, fallback: T): T {
  try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function write(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full / blocked */ }
}

export const getMode = (): InputMode => read<InputMode>(K_MODE, 'typed');
export const setMode = (m: InputMode) => write(K_MODE, m);

export const getAttempts = (): Attempt[] => read<Attempt[]>(K_ATTEMPTS, []);
export function addAttempt(a: Attempt) {
  const all = getAttempts();
  all.push(a);
  write(K_ATTEMPTS, all.slice(-500));
}
export function updateAttempt(at: number, questionId: string, result: GradeResult) {
  const all = getAttempts();
  const i = all.findIndex((x) => x.at === at && x.questionId === questionId);
  if (i >= 0) { all[i].result = result; write(K_ATTEMPTS, all); }
}
export function lastAttempt(questionId: string): Attempt | undefined {
  const all = getAttempts().filter((a) => a.questionId === questionId);
  return all[all.length - 1];
}
export function clearAttempts() { write(K_ATTEMPTS, []); }

export const getDraft = (id: string) => read<string>(K_DRAFT + id, '');
export const setDraft = (id: string, v: string) => write(K_DRAFT + id, v);

export function exportJson(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), attempts: getAttempts() }, null, 2);
}
