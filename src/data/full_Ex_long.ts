import { fullEx } from './full_Ex.js';
import { FULL_EX_RECAP } from './full_Ex_recap.js';
import type { AnswerSlot, Question, RubricPoint } from './types';

/**
 * Final Exam แบบข้อสอบจริง: 5 ข้อยาว ตอบในช่องเดียวต่อข้อ (ตามกระดาษ full_Ex.pdf)
 * รวม rubric ของการ์ดย่อยใน full_Ex.ts เข้าด้วยกัน โดยคงสัดส่วนคะแนนของแต่ละส่วนไว้
 * ส่วนจับคู่ / เรียงลำดับ / คำนวณ แปลงเป็นประเด็นที่ต้องเขียนในคำตอบ
 */

const PROMPTS: Record<number, string> = {
  1: 'จงให้คำจำกัดความ (Definition) ที่ครบถ้วนและสมบูรณ์ของศาสตร์ต่อไปนี้ (2%)\nArtificial Intelligence (AI), Computational Intelligence (CI), Expert Systems, Fuzzy Logic, Artificial Neural Network, Natural Language Processing (NLP)',
  2: 'จงอธิบายสรุปและแสดงให้เห็นถึงกระบวนการแก้ปัญหาของ Human Problem Solving เปรียบเทียบกับ Expert System Problem Solving (3%)',
  3: 'จงอธิบายและแสดงสถาปัตยกรรมให้เห็นว่า กระบวนการออกแบบ AI System ตามแนวทาง Knowledge Engineering เหมือนหรือแตกต่างจากกระบวนการออกแบบ AI System ตามแนวทางของ Data Engineering อย่างไร (3%)',
  4: 'จาก Model ดังสมการ และ Dataset ดังต่อไปนี้ (8%)\n4.1 จงอธิบายว่า จะทำให้ Model นี้เป็น AI Model ที่ชาญฉลาดได้อย่างไร และ AI Model ที่ชาญฉลาดนี้ สามารถชาญฉลาดได้โดยมีเงื่อนไขและขอบเขตหรือไม่ อย่างไร\n4.2 ค่า w₁, w₂ และ b เกี่ยวข้องกับการทำ Model ให้เป็น AI Model หรือไม่ ถ้าเกี่ยวข้อง จงแสดงวิธีการหาค่า w₁, w₂ และ b ที่ทำให้ Model นี้เป็น AI Model ที่ชาญฉลาดได้มากที่สุด โดยใช้ Mean Square Error ดังสมการ (แสดงวิธีทำเป็นขั้นตอนโดยละเอียด)',
  5: 'จากปัญหาข้อ 4 ถ้าเราใช้ Gradient Descent Algorithm หาค่า w₁, w₂ และ b จะช่วยทำให้ AI Model ที่ได้ฉลาดกว่าหรือมีข้อดีกว่าวิธีในข้อ 4 หรือไม่ อย่างไร และจงอธิบายว่า Gradient Descent Algorithm คือ Algorithm อะไร มีความสำคัญต่อการพัฒนา AI System อย่างไร (4%)',
};

const TITLES: Record<number, string> = {
  1: 'Definition: AI, CI, Expert Systems, Fuzzy Logic, ANN, NLP',
  2: 'Human Problem Solving vs Expert System Problem Solving',
  3: 'Knowledge Engineering vs Data Engineering',
  4: 'AI Model y = w₁x₁ + w₂x₂ + b และการหาค่าด้วย MSE',
  5: 'Gradient Descent Algorithm',
};

/** แปลงตัวเลขเป็นรูปที่นักศึกษาอาจเขียน เช่น 1.2 → ["1.2", "6/5"] */
const numForms = (n: number): string[] => {
  const forms = [String(n)];
  for (const d of [2, 3, 4, 5, 10]) {
    const k = Math.round(n * d);
    if (Math.abs(k / d - n) < 1e-9 && d > 1 && !Number.isInteger(n)) { forms.push(`${k}/${d}`); break; }
  }
  return forms;
};

function cardPoints(c: Question): RubricPoint[] {
  const pre = (id: string) => `${c.id}__${id}`;
  if (c.type === 'essay') {
    const main = (c.rubric ?? []).filter((p) => !p.bonus);
    const sum = main.reduce((s, p) => s + p.weight, 0) || 1;
    return (c.rubric ?? []).map((p) => ({ ...p, id: pre(p.id), weight: (p.weight / sum) * c.weight, text: p.text }));
  }
  if (c.type === 'matching') {
    const n = c.pairs?.length ?? 1;
    return (c.pairs ?? []).map((p, i) => ({
      id: pre(`pair${i}`), weight: c.weight / n,
      text: `${p.left} ของมนุษย์ เทียบได้กับ ${p.right} ของ Expert System`,
      keywords: [[p.left.toLowerCase()], [p.right.toLowerCase()]],
      hint: `${p.left} ของมนุษย์ ตรงกับส่วนไหนของ Expert System?`,
    }));
  }
  if (c.type === 'ordering') {
    const steps = c.order ?? [];
    // แยก "รู้ชื่อขั้นตอน" กับ "ลำดับถูก" — ผิดลำดับนิดหน่อยยังได้คะแนนส่วนแรก
    return [{
      id: pre('steps'), weight: c.weight * 0.6,
      text: `บอกขั้นตอนหลักได้ (ไม่ต้องครบทุกขั้น): ${steps.join(', ')}`,
      keywords: steps.slice(0, 3).map((s) => [s.toLowerCase().split(/[ (]/)[0]]),
      hint: `ขั้นตอนมีทั้งหมด ${steps.length} ขั้น เริ่มที่ ${steps[0]} จบที่ ${steps[steps.length - 1]}`,
    }, {
      id: pre('order'), weight: c.weight * 0.4,
      text: `เรียงลำดับถูก (ผิดตำแหน่ง 1–2 ขั้นยังพอได้): ${steps.join(' → ')}`,
      keywords: [[steps[0].toLowerCase().split(/[ (]/)[0]]],
      hint: `ขั้นแรกคือ ${steps[0]}`,
    }];
  }
  // numeric → ประเด็นที่ต้องแสดงในวิธีทำ
  const fields = c.numericFields ?? [];
  const total = fields.reduce((s, f) => s + f.weight, 0) || 1;
  const sums = fields.filter((f) => f.label.startsWith('Σ'));
  const rest = fields.filter((f) => !f.label.startsWith('Σ'));
  const pts: RubricPoint[] = [];
  if (sums.length) {
    pts.push({
      id: pre('sums'), weight: (sums.reduce((s, f) => s + f.weight, 0) / total) * c.weight,
      text: `คำนวณผลรวมจาก Dataset ถูก: ${sums.map((f) => `${f.label} = ${f.expected}`).join(', ')}`,
      keywords: sums.slice(0, 4).map((f) => [String(f.expected)]),
      hint: 'ทำตารางผลรวมแต่ละคอลัมน์จาก Dataset ก่อน แล้วค่อยตั้ง 3 สมการ',
    });
  }
  for (const f of rest) {
    pts.push({
      id: pre(f.id), weight: (f.weight / total) * c.weight,
      text: `ได้ ${f.label} = ${f.expected}`,
      keywords: [numForms(f.expected)],
      hint: `แก้ระบบสมการให้ได้ค่า ${f.label}`,
    });
  }
  return pts;
}

/** วิธีตอบแต่ละช่อง (เน้นตอบสั้น ตรงประเด็น แบบที่เขียนในห้องสอบ) */
const SLOT_UI: Record<string, { tip: string; placeholder?: string }> = {
  fx1_ai: { tip: 'นิยามสั้นๆ 1–2 ประโยค: อธิบาย/เลียนแบบความฉลาดของมนุษย์ ด้วยกระบวนการคำนวณ' },
  fx1_ci: { tip: 'นิยามสั้นๆ + ต่างจาก AI ตรงไหน + ยกตัวอย่าง 1–2 เทคนิค' },
  fx1_es: { tip: 'นิยามสั้นๆ + องค์ประกอบหลัก (KB, Inference Engine …)' },
  fx1_fuzzy: { tip: 'นิยามสั้นๆ + ใช้กับข้อมูลแบบไหน + ค่าความเป็นสมาชิก' },
  fx1_ann: { tip: 'นิยามสั้นๆ: เลียนแบบอะไร + เรียนรู้อย่างไร' },
  fx1_nlp: { tip: 'นิยามสั้นๆ: ให้คอมทำอะไรกับภาษามนุษย์ + ตัวอย่างงาน' },
  fx2_match: { tip: 'จับคู่ทีละบรรทัด 4 คู่', placeholder: 'ส่วนของมนุษย์ ↔ ส่วนของ Expert System\n…\n…\n…' },
  fx2_process: { tip: 'เล่าขั้นตอนเป็นข้อๆ: ฝั่งมนุษย์ แล้วฝั่ง ES', placeholder: 'มนุษย์: 1) … 2) …\nES: 1) … 2) …' },
  fx2_compare: { tip: 'เหมือน 1–2 ข้อ · ต่าง 2–3 ข้อ', placeholder: 'เหมือน: …\nต่าง: …' },
  fx3_ke_order: { tip: 'เขียนชื่อขั้นตอนเรียงลำดับ', placeholder: '1. …\n2. …\n3. …' },
  fx3_de_order: { tip: 'เขียนชื่อขั้นตอนเรียงลำดับ', placeholder: '1. …\n2. …\n3. …' },
  fx3_compare: { tip: 'สถาปัตยกรรมย่อๆ + เหมือน 1–2 ข้อ · ต่าง 2–3 ข้อ', placeholder: 'เหมือน: …\nต่าง: …' },
  fx4_1: { tip: 'ทำให้ฉลาดอย่างไร (2–3 ข้อ) + มีเงื่อนไข/ขอบเขตอะไรบ้าง' },
  fx4_2_concept: { tip: 'เกี่ยวไหม + ขั้นตอนหาค่าด้วย MSE ย่อๆ' },
  fx4_2_calc: { tip: 'กรอกแค่ตัวเลข (ทศนิยมหรือเศษส่วนก็ได้ เช่น 1.2 หรือ 6/5) — ไม่ต้องพิมพ์ Σ หรือตัวห้อย' },
  fx5_better: { tip: 'ฉลาดกว่าไหม + เหตุผล 1–2 ข้อ' },
  fx5_what: { tip: 'คืออะไร + ขั้นตอนหลักเป็นข้อๆ' },
  fx5_importance: { tip: 'สำคัญอย่างไร 1–2 ข้อ' },
};

/** ต้องได้กี่ส่วนของประเด็นหลักถึงได้เต็มช่อง */
const NEED_FRACTION = { essay: 0.7, matching: 0.75, ordering: 0.6, numeric: 0.85 } as const;

function cardSlot(c: Question, pts: RubricPoint[]): AnswerSlot {
  const main = pts.filter((p) => !p.bonus).reduce((s, p) => s + p.weight, 0);
  const label = c.part.includes('·') ? c.part.split('·')[1].trim() : c.part;
  return {
    id: c.id,
    label: c.examNo === 4 && c.part.startsWith('4.2') ? `4.2 ${label}` : label,
    tip: SLOT_UI[c.id]?.tip,
    placeholder: SLOT_UI[c.id]?.placeholder,
    weight: c.weight,
    need: main * NEED_FRACTION[c.type],
    // ข้อคำนวณ: ช่องตัวเลขตามสัญลักษณ์ในเฉลย (ผลรวมก่อน แล้วคำตอบสุดท้าย)
    ...(c.numericFields ? { fields: c.numericFields.map((f) => ({ id: f.id, label: f.label })) } : {}),
  };
}

export const fullExLong: Question[] = [1, 2, 3, 4, 5].map((n) => {
  const cards = fullEx.filter((c) => c.examNo === n);
  const uniq = <T,>(a: T[], key: (x: T) => string) => [...new Map(a.map((x) => [key(x), x])).values()];
  return {
    id: `fx${n}`,
    exam: 'full_Ex',
    examNo: n,
    part: String(n),
    title: TITLES[n],
    type: 'essay',
    weight: Math.round(cards.reduce((s, c) => s + c.weight, 0) * 1000) / 1000,
    examPrompt: PROMPTS[n],
    prompt: PROMPTS[n],
    slideRefs: uniq(cards.flatMap((c) => c.slideRefs), (s) => `${s.file}|${s.pages}`),
    rubric: cards.flatMap((c) => cardPoints(c).map((p) => ({ ...p, slot: c.id }))),
    slots: cards.map((c) => cardSlot(c, cardPoints(c))),
    recap: Object.fromEntries(cards.filter((c) => FULL_EX_RECAP[c.id]).map((c) => [c.id, FULL_EX_RECAP[c.id]])),
    vocab: [...new Set(cards.flatMap((c) => c.vocab))],
  } satisfies Question;
});
