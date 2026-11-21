import { describe, expect, it } from 'vitest';
import { QUESTION_BY_ID, ALL_QUESTIONS } from '../data';
import { fuseAi, gradeKeyword, gradeMatching, gradeNumeric, gradeOrdering, orderingScore, parseNumber, quoteFound, scorePercent } from './grade';
import { compact, normalize } from './normalize';

const q = (id: string) => QUESTION_BY_ID.get(id)!;

describe('data', () => {
  it('weights per exam question match the paper (2,3,3,8,4)', () => {
    const sum = new Map<number, number>();
    for (const x of ALL_QUESTIONS.filter((q) => q.exam === 'full_Ex' && q.id.includes('_'))) sum.set(x.examNo, (sum.get(x.examNo) ?? 0) + x.weight);
    expect([1, 2, 3, 4, 5].map((n) => Math.round(sum.get(n)! * 1000) / 1000)).toEqual([2, 3, 3, 8, 4]);
    // 5 ข้อยาว: น้ำหนักข้อ และผลรวม weight ของ rubric (ไม่นับโบนัส) ต้องเท่ากับคะแนนข้อ
    const long = ['fx1', 'fx2', 'fx3', 'fx4', 'fx5'].map((id) => ALL_QUESTIONS.find((q) => q.id === id)!);
    expect(long.map((q) => Math.round(q.weight * 1000) / 1000)).toEqual([2, 3, 3, 8, 4]);
    for (const q of long) expect(q.rubric!.filter((p) => !p.bonus).reduce((s, p) => s + p.weight, 0)).toBeCloseTo(q.weight, 6);
  });
  it('ids are unique and essays have rubric', () => {
    expect(new Set(ALL_QUESTIONS.map((x) => x.id)).size).toBe(ALL_QUESTIONS.length);
    for (const x of ALL_QUESTIONS) if (x.type === 'essay') expect(x.rubric?.length).toBeGreaterThan(0);
  });
});

describe('normalize', () => {
  it('fixes ASR transliterations', () => {
    expect(normalize('อินเฟอเรนซ์เอนจิน กับ นอลเลจเบส')).toContain('inference');
    expect(normalize('ฟัซซี่ลอจิก')).toBe('fuzzylogic');
    expect(compact('ค่า ศูนย์ถึงหนึ่ง')).toBe('ค่า0ถึง1');
  });
});

describe('numeric (ข้อ 4.2)', () => {
  it('full marks for the answer key', () => {
    const r = gradeNumeric(q('fx4_2_calc'), { s_x1x1: '21', s_x2x2: '14', s_x1: '7', s_x2: '6', s_y: '12', s_x1y: '34', s_x2y: '26', s_x1x2: '15', w1: '1.2', w2: '2/5', b: '0.4', mse: '0' });
    expect(r.percent).toBe(100);
  });
  it('partial when w is wrong', () => {
    const r = gradeNumeric(q('fx4_2_calc'), { w1: '1.2', w2: '0.5', b: '0.4', mse: '0' });
    expect(r.percent).toBeGreaterThan(0);
    expect(r.percent).toBeLessThan(100);
  });
  it('parses comma decimals and fractions', () => {
    expect(parseNumber('0,4')).toBe(0.4);
    expect(parseNumber('6/5')).toBe(1.2);
    expect(parseNumber('')).toBeNull();
  });
});

describe('matching / ordering', () => {
  it('matching', () => {
    const r = gradeMatching(q('fx2_match'), { 'Long-Term Memory': 'Knowledge Base', 'Short-Term Memory': 'Working Memory', Reasoning: 'User', Advisee: 'Inference Engine' });
    expect(r.percent).toBe(50);
  });
  it('kendall', () => {
    expect(orderingScore(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1);
    expect(orderingScore(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(0);
    const ke = q('fx3_ke_order');
    expect(gradeOrdering(ke, ke.order!).percent).toBe(100);
  });
});

describe('keyword fallback', () => {
  const fz = q('fx1_fuzzy');
  it('good answer passes required points', () => {
    const r = gradeKeyword(fz, 'Fuzzy Logic เลียนแบบการตัดสินใจของมนุษย์ ใช้กับข้อมูลที่คลุมเครือ ค่าความเป็นสมาชิกอยู่ระหว่าง 0 ถึง 1 โดย Zadeh 1965');
    expect(r.points.filter((p) => !p.bonus).every((p) => p.status === 'match')).toBe(true);
    expect(r.percent).toBe(100);
  });
  it('"ไม่แน่นอน" is not treated as negation', () => {
    const r = gradeKeyword(fz, 'ใช้กับข้อมูลที่ไม่แน่นอน');
    expect(r.points.find((p) => p.id === 'fuzzy_uncertain')!.status).toBe('match');
  });
  it('negation near keyword becomes suspect', () => {
    const r = gradeKeyword(fz, 'fuzzy ไม่ได้เลียนแบบการตัดสินใจ');
    expect(r.points.find((p) => p.id === 'fuzzy_decision')!.status).toBe('suspect');
  });
  it('voice transcript with transliteration still matches', () => {
    const r = gradeKeyword(q('fx1_es'), 'ประกอบด้วยนอลเลจเบสกับอินเฟอเรนซ์เอนจิน');
    expect(r.points.find((p) => p.id === 'es_components')!.status).toBe('match');
  });
});

describe('AI fusion + quote check', () => {
  const fz = q('fx1_fuzzy');
  const answer = 'Fuzzy logic คือการเลียนแบบการตัดสินใจของคน กับข้อมูลที่คลุมเครือ';
  it('verified quote keeps match', () => {
    const r = fuseAi(fz, answer, [{ id: 'fuzzy_decision', status: 'match', quote: 'เลียนแบบการตัดสินใจของคน' }]);
    expect(r.points.find((p) => p.id === 'fuzzy_decision')!.status).toBe('match');
  });
  it('fabricated quote is downgraded to suspect', () => {
    const r = fuseAi(fz, answer, [{ id: 'fuzzy_membership', status: 'match', quote: 'ค่าความเป็นสมาชิกอยู่ในช่วง 0 ถึง 1' }]);
    expect(r.points.find((p) => p.id === 'fuzzy_membership')!.status).toBe('suspect');
  });
  it('quote with ellipsis and different spacing', () => {
    expect(quoteFound(answer, 'Fuzzy  logic คือ … ข้อมูลที่คลุมเครือ')).toBe(true);
  });
  it('exam mode zeroes suspect; overrides win', () => {
    const r = fuseAi(fz, answer, [
      { id: 'fuzzy_decision', status: 'match', quote: 'การตัดสินใจ' },
      { id: 'fuzzy_uncertain', status: 'match', quote: 'ไม่มีจริง' },
    ]);
    expect(scorePercent(r.points, true)).toBeLessThan(scorePercent(r.points, false));
    const ov = r.points.map((p) => (p.id === 'fuzzy_uncertain' ? { ...p, override: 'yes' as const } : p));
    expect(scorePercent(ov, true)).toBeCloseTo(66.7, 1);
  });
});

import { fullAnswer } from '../data/answers';
import { fullEx } from '../data/full_Ex';
import { justChose1 } from '../data/just_chose1';
describe('full answers', () => {
  it('every exam question has its answer section', () => {
    for (const q of fullEx) expect(fullAnswer(q)).toMatch(new RegExp(`^## ข้อ ${q.examNo}`));
    expect(fullAnswer(fullEx.find((q) => q.examNo === 4)!)).toContain('1.2x_1');
  });
  it('Just_chose1: 131 ข้อ (ไม่มีข้อ 72) ทุกข้อมีโจทย์ เฉลย และ rubric', () => {
    expect(justChose1).toHaveLength(131);
    expect(justChose1.some((q) => q.examNo === 72)).toBe(false);
    for (const q of justChose1) {
      expect(q.prompt.length).toBeGreaterThan(5);
      expect(fullAnswer(q)).toMatch(new RegExp(`^## ข้อ ${q.examNo}`));
      expect(q.rubric!.length).toBeGreaterThan(0);
      for (const p of q.rubric!) expect(p.keywords.flat().length, `${q.id}/${p.id}`).toBeGreaterThan(0);
    }
    expect(new Set(justChose1.flatMap((q) => q.rubric!.map((p) => p.id))).size).toBe(justChose1.reduce((n, q) => n + q.rubric!.length, 0));
  });
});

import { slotFraction } from './grade';
import { joinParts } from '../input/AnswerInput';
describe('answer slots (ตอบเป็นช่องๆ + เกณฑ์ผ่อนปรน)', () => {
  const fx1 = ALL_QUESTIONS.find((x) => x.id === 'fx1')!;
  it('every rubric point belongs to an existing slot, every slot has points', () => {
    for (const x of ALL_QUESTIONS.filter((q) => q.slots)) {
      const ids = new Set(x.slots!.map((s) => s.id));
      for (const p of x.rubric!) expect(ids.has(p.slot!), `${x.id}/${p.id}`).toBe(true);
      for (const s of x.slots!) expect(x.rubric!.some((p) => p.slot === s.id), `${x.id}/${s.id}`).toBe(true);
    }
  });
  it('short answer covering the core idea gets the AI slot in full (keyword fallback)', () => {
    const parts = { fx1_ai: 'ศาสตร์ที่อธิบายและเลียนแบบความฉลาดของมนุษย์ ด้วยกระบวนการคำนวณของคอมพิวเตอร์' };
    const r = gradeKeyword(fx1, joinParts(fx1, parts), undefined, parts);
    expect(slotFraction(r.points, r.slots!.find((s) => s.id === 'fx1_ai')!)).toBe(1);
    // ช่องอื่นว่าง → ไม่ได้คะแนน แม้คำจะไปโผล่ในช่อง AI
    expect(slotFraction(r.points, r.slots!.find((s) => s.id === 'fx1_ci')!)).toBe(0);
    expect(r.percent).toBeCloseTo(100 / 6, 0);
  });
  it('list question: about 60% of listed points is full marks', () => {
    const q2 = ALL_QUESTIONS.find((x) => x.id === 'jc2')!;
    expect(q2.slots![0].need).toBeLessThan(q2.rubric!.length);
    const pts = q2.rubric!.map((p, i) => ({ id: p.id, label: p.text, weight: 1, slot: p.slot, status: (i < q2.slots![0].need ? 'match' : 'miss') as 'match' | 'miss', credit: i < q2.slots![0].need ? 1 : 0 }));
    expect(scorePercent(pts, false, q2.slots)).toBe(100);
  });
});

import { buildGraderMessages, parseGraderOutput } from './prompt';
describe('shared grader prompt / parser (server + browser)', () => {
  const q = ALL_QUESTIONS.find((x) => x.id === 'jc36')!;
  it('parses output wrapped in <think> and ```json, drops unknown ids', () => {
    const id = q.rubric![0].id;
    const out = parseGraderOutput('<think>hmm</think>```json\n{"points":[{"id":"' + id + '","status":"match","quote":"x"},{"id":"nope","status":"match"}]}\n```', q);
    expect(out).toEqual([{ id, status: 'match', quote: 'x', reason: undefined }]);
    expect(parseGraderOutput('sorry I cannot', q)).toBeNull();
  });
  it('answer key length is configurable (0 = rubric only)', () => {
    const withKey = buildGraderMessages(q, 'ans', 'typed', 4000)[1].content;
    const noKey = buildGraderMessages(q, 'ans', 'typed', 0)[1].content;
    expect(withKey).toContain('<answer_key>');
    expect(noKey).not.toContain('<answer_key>');
  });
});
