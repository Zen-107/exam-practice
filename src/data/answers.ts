import fullExMd from './full_Ex_answer.md?raw';
import type { Question } from './types';

/** แยกเฉลยเต็มตามหัวข้อ "## ข้อ N" */
function splitSections(md: string): Map<number, string> {
  const out = new Map<number, string>();
  const parts = md.split(/^## ข้อ /m).slice(1);
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (Number.isFinite(n)) out.set(n, ('## ข้อ ' + p).replace(/\n---\s*$/m, '').trim());
  }
  return out;
}

const fullEx = splitSections(fullExMd);

export function fullAnswer(q: Question): string {
  if (q.answerMd) return q.answerMd;
  if (q.exam === 'full_Ex') return fullEx.get(q.examNo) ?? '';
  return '';
}
