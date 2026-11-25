import type { ExamSetId } from './types';

/** ชื่อวิชาของชุดข้อสอบ (ใช้ใน prompt ตัวตรวจ / ตัวแก้คำ STT) — ไม่ import ข้อมูลข้อสอบ ให้ไฟล์เล็ก */
export const courseOf = (exam: ExamSetId | undefined): string =>
  exam === 'cpe320_open' ? 'CPE320 Software Engineering' : 'CPE310 Artificial Intelligence';
