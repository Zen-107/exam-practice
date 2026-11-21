import { fullEx } from './full_Ex.js';
import { fullExLong } from './full_Ex_long.js';
import { justChose1 } from './just_chose1.js';
import type { Question } from './types';

// fullEx = การ์ดย่อยเดิม (ยังเก็บไว้ให้ประวัติเก่าเปิดได้) · fullExLong = 5 ข้อยาวที่ใช้จริง
export const ALL_QUESTIONS: Question[] = [...fullExLong, ...fullEx, ...justChose1];
export const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
export type { Question } from './types';
