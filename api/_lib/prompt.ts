import type { Question } from '../../src/data/types';
import { buildGraderMessages as build } from '../../src/grading/prompt.js';
import { config } from './env.js';

/** prompt ตัวตรวจ (ตัวจริงอยู่ที่ src/grading/prompt.ts ใช้ร่วมกับฝั่งเบราว์เซอร์) */
export const buildGraderMessages = (q: Question, answer: string, source: 'typed' | 'voice') =>
  build(q, answer, source, config.answerKeyChars());
