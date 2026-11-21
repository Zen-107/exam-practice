import type { Question } from '../data/types';
import type { Answer, GradeResult } from './types';
import { fuseAi, gradeKeyword, gradeMatching, gradeNumeric, gradeOrdering, type AiPoint } from './grade';
import { normalize } from './normalize';
import { buildGraderMessages, parseGraderOutput } from './prompt';
import { DirectAiError, directChat } from './browserLlm';
import { getAiSettings, usesOwnAi } from '../store/aiSettings';

export interface Health { stt: boolean; grader: boolean; graderModel: string | null }
let healthPromise: Promise<Health> | null = null;

export function getHealth(): Promise<Health> {
  healthPromise ??= fetch('/api/health')
    .then((r) => (r.ok ? r.json() : { stt: false, grader: false, graderModel: null }))
    .catch(() => ({ stt: false, grader: false, graderModel: null }));
  return healthPromise;
}

const ERR_TEXT: Record<string, string> = {
  rate_limited: 'โควตาตัวตรวจ AI ฟรีเต็มชั่วคราว',
  not_configured: 'server ยังไม่ได้ตั้งค่าตัวตรวจ AI',
  upstream_unreachable: 'ต่อเซิร์ฟเวอร์ AI ไม่ได้ (ถ้าใช้ AI ในเครื่อง เช็คว่าเปิด server แล้ว)',
  offline: 'ไม่มีอินเทอร์เน็ต',
  locked: 'หมดเวลาเข้าเว็บ — รีเฟรชหน้าแล้วใส่รหัสใหม่',
};

// ───── แคชผลตรวจ: ส่งคำตอบเดิมซ้ำ (เช่น กดทำใหม่แล้วส่งเหมือนเดิม) ไม่ต้องเรียก AI อีก ─────
const K_CACHE = 'cpe310.gradecache.v1';
const CACHE_MAX = 200;
interface CacheEntry { k: string; points: AiPoint[] }

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
/** key ผูกกับข้อ + rubric ปัจจุบัน + คำตอบ (หลัง normalize) — rubric เปลี่ยน แคชเดิมก็ไม่ถูกใช้ */
const cacheKey = (q: Question, text: string) =>
  `${q.id}:${hash((q.rubric ?? []).map((p) => p.id + p.text).join('|'))}:${hash(normalize(text))}`;

function readCache(): CacheEntry[] {
  try { return JSON.parse(localStorage.getItem(K_CACHE) ?? '[]'); } catch { return []; }
}
function cacheGet(k: string): AiPoint[] | undefined {
  return readCache().find((e) => e.k === k)?.points;
}
function cachePut(k: string, points: AiPoint[]) {
  try {
    const all = readCache().filter((e) => e.k !== k);
    all.push({ k, points });
    localStorage.setItem(K_CACHE, JSON.stringify(all.slice(-CACHE_MAX)));
  } catch { /* storage เต็ม/ถูกปิด */ }
}

export async function gradeAnswer(q: Question, a: Answer): Promise<GradeResult> {
  if (a.kind === 'numeric') return gradeNumeric(q, a.values);
  if (a.kind === 'matching') return gradeMatching(q, a.pairs);
  if (a.kind === 'ordering') return gradeOrdering(q, a.order);

  // text รวมทุกช่องพร้อมหัวข้อช่องแล้ว (ดู joinParts)
  const text = a.text.trim();
  const parts = a.parts;
  const hasContent = parts ? Object.entries(parts).some(([k, v]) => !k.includes(':') && v.trim().length >= 2) : text.length >= 3;
  if (!hasContent) return gradeKeyword(q, text, 'คำตอบว่าง', parts);

  const key = cacheKey(q, text);
  const cached = cacheGet(key);
  if (cached) return { ...fuseAi(q, text, cached), notice: 'คำตอบเหมือนครั้งก่อน — ใช้ผลตรวจเดิม ไม่เรียก AI ซ้ำ (ประหยัดโควตา)' };

  // ───── AI ของผู้ใช้เอง (ตั้งในหน้า "ตั้งค่าตัวตรวจ"): เบราว์เซอร์เรียกตรง ไม่ผ่าน server ของเว็บ ─────
  const ai = getAiSettings();
  let ownNotice = '';
  if (usesOwnAi(ai)) {
    const by = `${ai.mode === 'local' ? 'AI ในเครื่องคุณ' : 'API ของคุณ'} · ${ai.model}`;
    let why = '';
    try {
      const content = await directChat(ai, buildGraderMessages(q, text, a.source, ai.answerKeyChars), { json: true });
      const pts = parseGraderOutput(content, q);
      if (pts) {
        cachePut(key, pts);
        return { ...fuseAi(q, text, pts), by };
      }
      why = 'โมเดลตอบไม่เป็นรูปแบบที่อ่านได้ ลองโมเดลที่ใหญ่ขึ้น';
    } catch (e) {
      why = describeDirectError(e);
    }
    if (!ai.fallbackToServer) {
      return gradeKeyword(q, text, `${by} ใช้ไม่ได้ (${why}) — ตรวจแบบหยาบด้วยคำสำคัญแทน`, parts);
    }
    ownNotice = `${by} ใช้ไม่ได้ (${why}) — ใช้ตัวตรวจของเว็บแทน`;
  }

  let reason = 'offline';
  if (navigator.onLine || location.hostname === 'localhost') {
    const h = await getHealth();
    if (h.grader) {
      try {
        const r = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ questionId: q.id, answer: text, source: a.source }),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && Array.isArray(data.points)) {
          cachePut(key, data.points as AiPoint[]);
          return { ...fuseAi(q, text, data.points as AiPoint[]), ...(ownNotice ? { notice: ownNotice } : {}) };
        }
        reason = data.error ?? `http_${r.status}`;
      } catch {
        reason = 'offline';
      }
    } else reason = 'not_configured';
  }
  const why = ERR_TEXT[reason] ?? `ตัวตรวจ AI ใช้ไม่ได้ (${reason})`;
  return gradeKeyword(q, text, `${ownNotice ? ownNotice + ' · ' : ''}${why} — ตรวจแบบหยาบด้วยคำสำคัญแทน ผลอาจคลาดเคลื่อน ใช้ปุ่มยืนยันเองได้`, parts);
}

export function describeDirectError(e: unknown): string {
  if (e instanceof DirectAiError) {
    if (e.kind === 'cors_or_offline') return 'ต่อไม่ติด: เปิด server หรือยัง / เปิด CORS หรือยัง / อนุญาตให้เว็บเข้าถึงเครื่องหรือยัง';
    if (e.kind === 'timeout') return e.message;
    if (e.kind === 'http' && (e.status === 401 || e.status === 403)) return 'API key ไม่ถูกต้อง';
    if (e.kind === 'http' && e.status === 404) return 'ไม่พบ endpoint หรือชื่อโมเดล — เช็ค Base URL และ Model';
    if (e.kind === 'http' && e.status === 429) return 'โควตาเต็ม';
    return e.message;
  }
  return String(e);
}
