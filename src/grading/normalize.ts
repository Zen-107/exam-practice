/** คำที่ STT ภาษาไทยมักถอดศัพท์อังกฤษเพี้ยน → แก้ก่อนตรวจ (เติมจากผล Phase 3b) */
export const ASR_FIX: [string, string][] = [
  ['อินเฟอเรนซ์', 'inference'], ['อินเฟอร์เรนซ์', 'inference'], ['อินเฟอเรน', 'inference'],
  ['เอนจิน', 'engine'], ['เอ็นจิน', 'engine'], ['เอ็นจิ้น', 'engine'],
  ['นอลเลจเบส', 'knowledge base'], ['โนวเลจเบส', 'knowledge base'], ['นอลเลจ', 'knowledge'], ['โนวเลจ', 'knowledge'],
  ['เวิร์กกิ้งเมมโมรี่', 'working memory'], ['เวิร์คกิ้งเมมโมรี่', 'working memory'], ['เมมโมรี่', 'memory'], ['เมมโมรี', 'memory'],
  ['ฟัซซี่', 'fuzzy'], ['ฟัซซี', 'fuzzy'], ['ฟัสซี่', 'fuzzy'], ['ฟัสซี', 'fuzzy'],
  ['ลอจิก', 'logic'], ['โลจิก', 'logic'],
  ['เมมเบอร์ชิพ', 'membership'], ['เมมเบอร์ชิป', 'membership'],
  ['ดีซิชั่นเมคกิ้ง', 'decision making'], ['ดีซิชั่น', 'decision'],
  ['นิวรอลเน็ตเวิร์ก', 'neural network'], ['นิวรัลเน็ตเวิร์ก', 'neural network'], ['นิวรอล', 'neural'], ['นิวรัล', 'neural'],
  ['แมชชีนเลิร์นนิ่ง', 'machine learning'], ['ดีปเลิร์นนิ่ง', 'deep learning'], ['ดีพเลิร์นนิ่ง', 'deep learning'],
  ['เกรเดียนต์', 'gradient'], ['เกรเดียน', 'gradient'], ['กราเดียนท์', 'gradient'],
  ['ดีเซนต์', 'descent'], ['ดีเซ็นต์', 'descent'],
  ['เลิร์นนิ่งเรต', 'learning rate'], ['เลิร์นนิ่งเรท', 'learning rate'],
  ['แบ็คพรอพาเกชัน', 'backpropagation'], ['แบ็กพรอพาเกชัน', 'backpropagation'], ['แบ็คพรอพ', 'backpropagation'],
  ['ซิกมอยด์', 'sigmoid'], ['แอคติเวชัน', 'activation'], ['แอคทิเวชั่น', 'activation'],
  ['โอเวอร์ฟิตติ้ง', 'overfitting'], ['โอเวอร์ฟิต', 'overfitting'],
  ['ซูเปอร์ไวซ์', 'supervised'], ['ซุปเปอร์ไวซ์', 'supervised'],
  ['ไฮบริด', 'hybrid'], ['ดาต้า', 'data'], ['เดต้า', 'data'], ['โมเดล', 'model'],
  ['เอ็มเอสอี', 'mse'], ['เอ็นแอลพี', 'nlp'], ['เอเอ็นเอ็น', 'ann'],
  ['ซาเดห์', 'zadeh'],
  ['ศูนย์ถึงหนึ่ง', '0 ถึง 1'],
];

/** แก้คำทับศัพท์ที่ถอดเพี้ยน (ใช้กับข้อความที่มาจากเสียง) */
export function fixAsr(text: string): string {
  let t = text;
  for (const [bad, good] of ASR_FIX) t = t.split(bad).join(good);
  return t;
}

/** normalize สำหรับเทียบ: ตัวพิมพ์เล็ก, ตัด zero-width, ยุบช่องว่าง, แก้ ASR */
export function normalize(raw: string): string {
  return fixAsr(raw)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[“”"'‘’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** ตัดช่องว่างและเครื่องหมายทิ้งทั้งหมด — ใช้เทียบ substring ให้ทนต่อการเว้นวรรค (ภาษาไทยไม่มีเว้นวรรคระหว่างคำ) */
export function compact(raw: string): string {
  return normalize(raw).replace(/[\s.,;:!?()\[\]{}…\-–—_/\\|*#>]/g, '');
}
