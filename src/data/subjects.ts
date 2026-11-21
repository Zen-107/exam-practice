import { fullExLong } from './full_Ex_long.js';
import { justChose1, JC1_CATEGORIES } from './just_chose1.js';
import type { ExamSetId, Question } from './types';

export interface ExamSet {
  id: ExamSetId;
  title: string;
  subtitle: string;
  questions: Question[];
  categories?: { id: string; label: string }[];
  /** จัดกลุ่มในหน้ารายข้อตาม examNo (ข้อใหญ่) */
  groupByExamNo?: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  sets: ExamSet[];
  /** วิชาที่จองที่ไว้ก่อน ยังไม่มีข้อสอบ */
  placeholder?: boolean;
  /** รูปแบบสอบจริง: เอาข้อจากชุดไหนบ้าง (pick = สุ่มกี่ข้อ, ไม่ใส่ = ออกทั้งชุด) */
  exam?: { setId: ExamSetId; pick?: number }[];
}

export const SUBJECTS: Subject[] = [
  {
    id: 'cpe310', code: 'CPE310', name: 'Artificial Intelligence',
    sets: [
      {
        id: 'full_Ex', title: 'Final Exam', subtitle: `${fullExLong.length} ข้อ (แบบเขียนยาว ตามกระดาษ) · 20%`,
        questions: fullExLong,
      },
      {
        id: 'Just_chose1', title: 'Understanding Pre-Exam Lib', subtitle: `${justChose1.length} ข้อ · ${JC1_CATEGORIES.length} หมวด`,
        questions: justChose1, categories: JC1_CATEGORIES,
      },
    ],
    // สอบจริง: full_Ex ออกทั้งหมด + สุ่ม Just_chose1 มา 1 ข้อ
    exam: [{ setId: 'full_Ex' }, { setId: 'Just_chose1', pick: 1 }],
  },
  // ── วิชาถัดไป: จองที่ไว้ก่อน ── เพิ่มชุดข้อสอบได้โดยใส่ ExamSet ลงใน sets แล้วเอา placeholder ออก
  {
    id: 'next', code: 'CPE3XX', name: 'วิชาถัดไป (ยังไม่ได้เพิ่ม)',
    sets: [], placeholder: true,
  },
];

export const ALL_SETS: ExamSet[] = SUBJECTS.flatMap((s) => s.sets);
export const SET_BY_ID = new Map(ALL_SETS.map((s) => [s.id, s]));
export const subjectOfSet = (id: string) => SUBJECTS.find((s) => s.sets.some((x) => x.id === id));
export const SUBJECT_BY_ID = new Map(SUBJECTS.map((s) => [s.id, s]));

/** สรุปรูปแบบสอบจริงเป็นข้อความ เช่น "Final Exam ทั้งหมด + สุ่ม Understanding Pre-Exam Lib 1 ข้อ" */
export function examSummary(s: Subject): string {
  return (s.exam ?? []).map((p) => {
    const set = SET_BY_ID.get(p.setId)!;
    return p.pick ? `สุ่ม ${set.title} ${p.pick} ข้อ` : `${set.title} ทั้งหมด`;
  }).join(' + ');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** จัดข้อสอบตามรูปแบบของวิชา — ทีละส่วน; ส่วนที่สุ่มจะถูกสุ่มใหม่ทุกครั้ง */
export function buildExam(s: Subject): { setId: ExamSetId; random: boolean; questions: Question[] }[] {
  return (s.exam ?? []).map((p) => {
    const qs = SET_BY_ID.get(p.setId)!.questions;
    return { setId: p.setId, random: !!p.pick, questions: p.pick ? shuffle(qs).slice(0, p.pick).sort((a, b) => a.examNo - b.examNo) : qs };
  });
}

export const randomQuestion = (setId: ExamSetId) => {
  const qs = SET_BY_ID.get(setId)!.questions;
  return qs[Math.floor(Math.random() * qs.length)];
};
