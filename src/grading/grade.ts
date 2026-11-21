import type { Question, RubricPoint } from '../data/types';
import type { GradeResult, PointResult, PointStatus, SlotScore } from './types';
import { compact, normalize } from './normalize';

export const CREDIT: Record<PointStatus, number> = { match: 1, partial: 0.5, suspect: 0.5, miss: 0 };

const creditOf = (p: PointResult, examMode: boolean) =>
  p.override === 'yes' ? 1 : p.override === 'no' ? 0 : examMode && p.status === 'suspect' ? 0 : p.credit;

/** คะแนนรายช่อง 0..1 — ได้เต็มเมื่อได้น้ำหนักประเด็นถึง need (ไม่ต้องตอบครบทุกประเด็นในเฉลย) */
export function slotFraction(points: PointResult[], slot: SlotScore, examMode = false): number {
  const earned = points.filter((p) => p.slot === slot.id).reduce((s, p) => s + creditOf(p, examMode) * p.weight, 0);
  return slot.need > 0 ? Math.min(1, earned / slot.need) : 0;
}

/** คะแนนรวม % — โบนัสไม่นับในตัวหาร และรวมแล้วไม่เกิน 100 · ถ้ามี slots คิดรายช่องแล้วถ่วงน้ำหนัก */
export function scorePercent(points: PointResult[], examMode = false, slots?: SlotScore[]): number {
  if (slots?.length) {
    const tw = slots.reduce((s, x) => s + x.weight, 0) || 1;
    const v = slots.reduce((s, x) => s + x.weight * slotFraction(points, x, examMode), 0) / tw;
    return Math.round(v * 1000) / 10;
  }
  let earned = 0;
  let denom = 0;
  for (const p of points) {
    if (!p.bonus) denom += p.weight;
    earned += creditOf(p, examMode) * p.weight;
  }
  if (denom === 0) return 0;
  return Math.min(100, Math.round((earned / denom) * 1000) / 10);
}

export const slotScores = (q: Question): SlotScore[] | undefined =>
  q.slots?.map((s) => ({ id: s.id, label: s.label, weight: s.weight, need: s.need }));

// ───────────── Deterministic ─────────────

export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/,/g, '.').replace(/[−–]/g, '-').replace(/\s/g, '');
  if (!s) return null;
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function gradeNumeric(q: Question, values: Record<string, string>): GradeResult {
  const points: PointResult[] = (q.numericFields ?? []).map((f) => {
    const v = parseNumber(values[f.id] ?? '');
    const ok = v !== null && Math.abs(v - f.expected) <= f.tol;
    return {
      id: f.id, label: f.label, weight: f.weight,
      status: ok ? 'match' : 'miss', credit: ok ? 1 : 0,
      quote: values[f.id] ?? '',
      reason: ok ? 'ถูกต้อง' : v === null ? 'ยังไม่ได้กรอก / อ่านค่าไม่ได้' : `ตอบ ${v} — เฉลย ${f.expected}`,
    };
  });
  return { questionId: q.id, method: 'exact', points, percent: scorePercent(points) };
}

export function gradeMatching(q: Question, pairs: Record<string, string>): GradeResult {
  const points: PointResult[] = (q.pairs ?? []).map((p) => {
    const ok = pairs[p.left] === p.right;
    return {
      id: p.left, label: `${p.left} ↔ ${p.right}`, weight: 1,
      status: ok ? 'match' : 'miss', credit: ok ? 1 : 0,
      quote: pairs[p.left] ? `${p.left} ↔ ${pairs[p.left]}` : '',
      reason: ok ? 'ถูกต้อง' : pairs[p.left] ? `จับคู่กับ ${pairs[p.left]}` : 'ยังไม่ได้จับคู่',
    };
  });
  return { questionId: q.id, method: 'exact', points, percent: scorePercent(points) };
}

/** ให้คะแนนบางส่วนตามสัดส่วนคู่ (i<j) ที่ลำดับถูก (Kendall tau แบบ 0..1) */
export function orderingScore(correct: string[], given: string[]): number {
  const pos = new Map(given.map((s, i) => [s, i]));
  let good = 0;
  let total = 0;
  for (let i = 0; i < correct.length; i++)
    for (let j = i + 1; j < correct.length; j++) {
      total++;
      const a = pos.get(correct[i]);
      const b = pos.get(correct[j]);
      if (a !== undefined && b !== undefined && a < b) good++;
    }
  return total ? good / total : 0;
}

export function gradeOrdering(q: Question, order: string[]): GradeResult {
  const correct = q.order ?? [];
  const points: PointResult[] = correct.map((step, i) => {
    const ok = order[i] === step;
    return {
      id: `pos${i}`, label: `${i + 1}. ${step}`, weight: 0,
      status: ok ? 'match' : 'miss', credit: ok ? 1 : 0,
      quote: order[i] ?? '', reason: ok ? 'ตำแหน่งถูก' : `ตำแหน่งนี้ตอบ: ${order[i] ?? '-'}`,
    };
  });
  const tau = orderingScore(correct, order);
  // ใช้ Kendall เป็นคะแนนจริง (แถวรายตำแหน่งมีไว้แสดงผล weight = 0)
  points.unshift({
    id: 'kendall', label: 'ความถูกต้องของลำดับ (นับคู่ที่เรียงถูก)', weight: 1,
    status: tau === 1 ? 'match' : tau >= 0.5 ? 'partial' : 'miss', credit: tau,
    reason: `${Math.round(tau * 100)}% ของคู่ขั้นตอนเรียงถูก`,
  });
  return { questionId: q.id, method: 'exact', points, percent: Math.round(tau * 1000) / 10 };
}

// ───────────── Keyword fallback ─────────────

// เทียบบนข้อความ compact (ไม่มีช่องว่าง) — จึงไม่ใส่คำสั้นอย่าง "no" ที่ไปโผล่ใน "knowledge"
const NEGATIONS = ['ไม่ใช่', 'ไม่ได้', 'ไม่มี', 'ไม่เกี่ยว', 'ไม่ต้อง', 'ไม่สามารถ', 'not', "n't"];
/** วลีที่ขึ้นต้นด้วย "ไม่" แต่เป็นคำที่ rubric ต้องการ */
const NEG_WHITELIST = ['ไม่แน่นอน', 'ไม่ชัดเจน', 'ไม่เป็นเชิงเส้น', 'ไม่เชิงเส้น', 'ไม่เหนื่อย', 'ไม่ลืม', 'ไม่มีอารมณ์', 'ไม่ได้ฉลาดกว่า', 'ไม่ฉลาดกว่า', 'ไม่ต่าง', 'ไม่มี common sense', 'ไม่มีcommonsense', 'ไม่เรียนรู้'];

function negatedNear(text: string, idx: number): boolean {
  const before = text.slice(Math.max(0, idx - 20), idx);
  let cleaned = before;
  for (const w of NEG_WHITELIST) cleaned = cleaned.split(w).join('');
  return NEGATIONS.some((n) => cleaned.includes(n));
}

export function keywordPoint(answer: string, p: RubricPoint): { status: PointStatus; evidence: string[] } {
  const text = compact(answer);
  const evidence: string[] = [];
  let negated = false;
  for (const group of p.keywords) {
    let found: string | null = null;
    for (const k of group) {
      const ck = compact(k);
      const idx = ck ? text.indexOf(ck) : -1;
      if (idx >= 0) {
        found = k;
        // keyword ที่ตัวเองขึ้นต้นด้วย "ไม่" ไม่ต้องเช็ค negation
        if (!ck.startsWith('ไม่') && negatedNear(text, idx)) negated = true;
        break;
      }
    }
    if (!found) return { status: 'miss', evidence };
    evidence.push(found);
  }
  return { status: negated ? 'suspect' : 'match', evidence };
}

export function gradeKeyword(q: Question, answer: string, notice?: string, parts?: Record<string, string>): GradeResult {
  const points: PointResult[] = (q.rubric ?? []).map((p) => {
    // แบ่งช่อง: หาคำสำคัญเฉพาะในช่องของประเด็นนั้น
    const r = keywordPoint(parts && p.slot ? parts[p.slot] ?? '' : answer, p);
    return {
      id: p.id, label: p.text, weight: p.weight, bonus: p.bonus, hint: p.hint, slot: p.slot,
      status: r.status, credit: CREDIT[r.status],
      quote: r.evidence.join(', '),
      reason: r.status === 'match' ? 'พบคำสำคัญ' : r.status === 'suspect' ? 'พบคำสำคัญแต่มีคำปฏิเสธอยู่ใกล้ๆ' : 'ไม่พบคำสำคัญ',
    };
  });
  const slots = slotScores(q);
  return { questionId: q.id, method: 'keyword', notice, points, slots, percent: scorePercent(points, false, slots) };
}

// ───────────── AI result → quote check ─────────────

export interface AiPoint { id: string; status: 'match' | 'partial' | 'miss'; quote?: string; reason?: string }

/** quote ต้องอยู่ในคำตอบจริง (เทียบแบบ compact) — กัน AI อ้างหลักฐานที่ไม่มีอยู่ */
export function quoteFound(answer: string, quote: string | undefined): boolean {
  if (!quote) return false;
  const a = compact(answer);
  // ยอมให้ quote ถูกตัดด้วย … หรือ ... เป็นหลายท่อน
  const parts = quote.split(/…|\.\.\./).map(compact).filter((s) => s.length > 0);
  if (!parts.length) return false;
  return parts.every((p) => a.includes(p));
}

export function fuseAi(q: Question, answer: string, ai: AiPoint[]): GradeResult {
  const byId = new Map(ai.map((p) => [p.id, p]));
  const points: PointResult[] = (q.rubric ?? []).map((p) => {
    const r = byId.get(p.id);
    let status: PointStatus = r?.status ?? 'miss';
    let reason = r?.reason ?? 'ตัวตรวจไม่ได้ส่งผลประเด็นนี้กลับมา';
    if ((status === 'match' || status === 'partial') && !quoteFound(answer, r?.quote)) {
      status = 'suspect';
      reason = `${reason} (⚠️ หาประโยคหลักฐานในคำตอบไม่เจอ)`;
    }
    return {
      id: p.id, label: p.text, weight: p.weight, bonus: p.bonus, hint: p.hint, slot: p.slot,
      status, credit: CREDIT[status], quote: r?.quote, reason,
    };
  });
  const slots = slotScores(q);
  return { questionId: q.id, method: 'ai', points, slots, percent: scorePercent(points, false, slots) };
}

export { normalize };
