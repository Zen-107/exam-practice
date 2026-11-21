import type { AnswerSlot, Question, RubricPoint, SlideRef } from './types';
import raw from './just_chose1.data.js';

/**
 * Just_chose1 — Understanding Pre-Exam Lib (131 ข้อ; กระดาษข้าม ข้อ 72)
 * just_chose1.json สร้างด้วย `python -I scripts/extract_just_chose1.py`
 * rubric สร้างอัตโนมัติจากเฉลย (แถวตาราง / bullet / หัวข้อย่อย) จึงใช้ AI ตรวจโดยดูเฉลยเต็มประกอบ
 */

interface Raw {
  no: number; title: string; category: string; opinion: boolean; prompt: string;
  slideRefs: SlideRef[]; rubric: RubricPoint[]; slots: AnswerSlot[]; vocab: string[]; answerMd: string; seeAlso: number[];
}

const data = raw as { categories: { id: string; label: string; from: number; to: number }[]; questions: unknown[] };

export const JC1_CATEGORIES: { id: string; label: string; from: number; to: number }[] = data.categories;

export const justChose1: Question[] = (data.questions as Raw[]).map((r) => ({
  id: `jc${r.no}`,
  exam: 'Just_chose1',
  examNo: r.no,
  part: String(r.no),
  title: r.title,
  type: 'essay',
  weight: 0,
  examPrompt: r.prompt,
  prompt: r.prompt,
  slideRefs: r.slideRefs,
  rubric: r.rubric,
  // ช่องเดียว = ไม่ต้องแบ่ง (แต่ยังใช้เกณฑ์ need ผ่อนปรนของช่องนั้น)
  slots: r.slots,
  vocab: r.vocab,
  answerMd: r.answerMd,
  category: r.category,
  opinion: r.opinion,
  autoRubric: true,
}));
