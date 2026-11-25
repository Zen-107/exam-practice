import type { AnswerSlot, Question, RubricPoint, SlideRef } from './types';
import raw from './cpe320_open.data.js';

/**
 * CPE320 Software Engineering — Open Exam (30 ข้อ, สอบจริงสุ่มออก 10 ข้อ · รวม 20% → ข้อละ 2%)
 * cpe320_open.data.ts สร้างด้วย `python -I scripts/extract_cpe320.py`
 * rubric คัดเองทีละข้อ (scripts/cpe320_rubric.py) · สรุปเฉลยแบบความเรียง (scripts/cpe320_recap.py)
 */

interface Raw {
  no: number; title: string; category: string; prompt: string;
  slideRefs: SlideRef[]; rubric: RubricPoint[]; slots: AnswerSlot[]; vocab: string[]; answerMd: string; outsideSlides: boolean; recap: Record<string, string>;
}

const data = raw as { categories: { id: string; label: string; from: number; to: number }[]; questions: unknown[] };

export const CPE320_CATEGORIES = data.categories;
export const CPE320_PICK = 10;
export const CPE320_WEIGHT = 2;

export const cpe320Open: Question[] = (data.questions as Raw[]).map((r) => ({
  id: `se${r.no}`,
  exam: 'cpe320_open',
  examNo: r.no,
  part: String(r.no),
  title: r.title,
  type: 'essay',
  weight: CPE320_WEIGHT,
  examPrompt: r.prompt,
  prompt: r.prompt,
  slideRefs: r.slideRefs,
  rubric: r.rubric,
  slots: r.slots,
  vocab: r.vocab,
  answerMd: r.answerMd,
  recap: r.recap,
  category: r.category,
}));
