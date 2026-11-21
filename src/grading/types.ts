export type PointStatus = 'match' | 'partial' | 'suspect' | 'miss';

export interface PointResult {
  id: string;
  label: string;
  status: PointStatus;
  /** 0..1 ก่อนคูณ weight */
  credit: number;
  weight: number;
  bonus?: boolean;
  /** ข้อความจากคำตอบที่เป็นหลักฐาน */
  quote?: string;
  reason?: string;
  hint?: string;
  /** ผู้ใช้กดยืนยันเอง */
  override?: 'yes' | 'no';
  slot?: string;
}

export interface SlotScore { id: string; label: string; weight: number; need: number }

export type GradeMethod = 'ai' | 'keyword' | 'exact';

export interface GradeResult {
  questionId: string;
  method: GradeMethod;
  /** ข้อความเตือน เช่น ตรวจแบบหยาบเพราะ offline */
  notice?: string;
  /** ใครเป็นผู้ตรวจ เช่น "AI ในเครื่องคุณ · qwen2.5:7b" (ไม่ใส่ = ตัวตรวจของเว็บ) */
  by?: string;
  points: PointResult[];
  percent: number;
  /** ถ้ามี: คิดคะแนนรายช่อง (แต่ละช่องได้เต็มเมื่อได้ประเด็นถึง need) */
  slots?: SlotScore[];
}

export type Answer =
  | { kind: 'text'; text: string; source: 'typed' | 'voice'; parts?: Record<string, string> }
  | { kind: 'numeric'; values: Record<string, string> }
  | { kind: 'matching'; pairs: Record<string, string> }   // left -> right
  | { kind: 'ordering'; order: string[] };
