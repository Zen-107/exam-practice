export type QuestionType = 'essay' | 'numeric' | 'matching' | 'ordering';

export interface SlideRef {
  file: string;   // ชื่อไฟล์ใน Lec/ (ตัดเลขท้าย)
  pages: string;  // เช่น "73–85"
}

export interface RubricPoint {
  id: string;
  /** ประเด็นที่ต้องพูดถึง (ใช้ทั้งแสดงผลและส่งให้ AI ตรวจ) */
  text: string;
  weight: number;
  required?: boolean;
  /** โบนัส: ไม่ตอบไม่หัก ตอบได้ได้เพิ่ม (คะแนนรวมไม่เกิน 100%) */
  bonus?: boolean;
  /** เกณฑ์ที่ถือว่าตอบผิด แม้จะใช้คำคล้ายกัน */
  wrongIf?: string[];
  /** keyword fallback: outer = AND, inner = OR (ตัวพิมพ์เล็ก) */
  keywords: string[][];
  /** แสดงเมื่อขาดประเด็นนี้ */
  hint: string;
  /** ช่องคำตอบที่ประเด็นนี้อยู่ (ดู Question.slots) */
  slot?: string;
}

/** ช่องคำตอบย่อย — แบ่งคำตอบยาวเป็นช่องๆ ให้เขียนง่ายและตรวจทีละส่วน */
export interface AnswerSlot {
  id: string;
  label: string;
  /** แนะนำวิธีตอบช่องนี้ เช่น "ตอบเป็นข้อสั้นๆ อย่างน้อย 3 ข้อ" */
  tip?: string;
  placeholder?: string;
  /** สัดส่วนคะแนนของช่องในข้อนี้ */
  weight: number;
  /** ต้องได้น้ำหนักประเด็นรวมเท่านี้ถึงได้เต็มช่อง (ไม่ต้องตอบครบทุกประเด็นในเฉลย) */
  need: number;
  /** ช่องสั้น (บรรทัดเดียว-สองบรรทัด) */
  short?: boolean;
  /** ช่องกรอกตัวเลข (มีป้ายสัญลักษณ์ให้แล้ว ผู้ใช้พิมพ์แค่ตัวเลข) + ช่องวิธีทำไม่บังคับ */
  fields?: { id: string; label: string }[];
}

export interface NumericField {
  id: string;
  label: string;      // แสดงหน้าช่อง เช่น "Σx₁²"
  expected: number;
  tol: number;
  weight: number;
}

export interface Question {
  id: string;
  /** id ของชุดข้อสอบ (ดู subjects.ts) */
  exam: ExamSetId;
  /** หมายเลขข้อในข้อสอบจริง ใช้จัดกลุ่มและดึงเฉลยเต็ม */
  examNo: number;
  part: string;          // เช่น "1 · Fuzzy Logic"
  title: string;
  type: QuestionType;
  /** คะแนนในข้อสอบจริง (%) */
  weight: number;
  /** โจทย์ข้อใหญ่ตามกระดาษข้อสอบ */
  examPrompt: string;
  /** สิ่งที่การ์ดนี้ให้ตอบ */
  prompt: string;
  slideRefs: SlideRef[];
  rubric?: RubricPoint[];
  numericFields?: NumericField[];
  /** matching: ซ้ายจับคู่กับขวา (ลำดับในอาร์เรย์คือคู่ที่ถูก) */
  pairs?: { left: string; right: string }[];
  /** ordering: ลำดับที่ถูก */
  order?: string[];
  /** ศัพท์สำหรับช่วย STT (vocabulary hint) */
  vocab: string[];
  /** เฉลยเต็มของการ์ดนี้ (markdown) — ถ้าไม่มี ดึงจากไฟล์เฉลยตาม examNo */
  answerMd?: string;
  /** หมวดย่อยในชุด (ใช้กรองในหน้ารายข้อ) */
  category?: string;
  /** ข้อถามความเห็น — ตัวตรวจให้คะแนนตามแนวคิด ไม่ต้องตรงเฉลยคำต่อคำ */
  opinion?: boolean;
  /** rubric สร้างอัตโนมัติจากเฉลย (ยังไม่ได้ QC ทีละข้อ) */
  autoRubric?: boolean;
  /** ช่องคำตอบ (ข้อ essay) — ไม่ใส่ = ช่องเดียว */
  slots?: AnswerSlot[];
}

export type ExamSetId = 'full_Ex' | 'Just_chose1';
