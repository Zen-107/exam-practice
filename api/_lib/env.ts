export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

const MAX_KEYS = 9;

/** อ่าน key หลัก + สำรอง: NAME, NAME_2 … NAME_9 (ตัดค่าว่างและค่าซ้ำ) */
export function keyList(name: string): string[] {
  const names = [name, ...Array.from({ length: MAX_KEYS - 1 }, (_, i) => `${name}_${i + 2}`)];
  return [...new Set(names.map(env).filter((k): k is string => !!k))];
}

const GROQ_URL = 'https://api.groq.com/openai/v1';
const trimUrl = (u: string) => u.replace(/\/+$/, '');

/**
 * เซิร์ฟเวอร์ AI ในเครื่อง/วงแลน (LM Studio, Ollama, vLLM, llama.cpp …) ไม่ต้องใช้ key
 * ดูจาก host: localhost, 127.x, 10.x, 192.168.x, 172.16–31.x, *.local, host.docker.internal
 */
export function isLocalUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h === 'localhost' || h === '::1' || h === '[::1]' || h.endsWith('.local') || h === 'host.docker.internal'
      || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
  } catch {
    return false;
  }
}

/** ผู้ให้บริการ LLM แบบ OpenAI-compatible (/chat/completions) */
export interface Provider {
  label: string;
  baseUrl: string;
  model: string;
  /** key ที่ลองตามลำดับ — เซิร์ฟเวอร์ในเครื่องใช้ ['local'] (ส่งไปเฉยๆ ไม่ได้ตรวจ) */
  keys: string[];
  local: boolean;
  jsonMode: boolean;
  temperature?: number;
  timeoutMs: number;
}

function provider(prefix: 'GRADER' | 'GRADER_FALLBACK', fallbackKeys: string[] = []): Provider | null {
  const baseUrl = trimUrl(env(`${prefix}_BASE_URL`) ?? (prefix === 'GRADER' ? GROQ_URL : ''));
  if (!baseUrl) return null;
  const local = isLocalUrl(baseUrl) || env(`${prefix}_KEYLESS`) === 'true';
  let keys = keyList(`${prefix}_API_KEY`);
  if (!keys.length && baseUrl === GROQ_URL) keys = fallbackKeys;
  if (!keys.length && local) keys = ['local'];
  if (!keys.length) return null;
  const t = env(`${prefix}_TEMPERATURE`);
  return {
    label: local ? 'local' : new URL(baseUrl).hostname,
    baseUrl,
    model: env(`${prefix}_MODEL`) ?? (baseUrl === GROQ_URL ? 'openai/gpt-oss-120b' : 'local-model'),
    keys,
    local,
    jsonMode: env(`${prefix}_JSON_MODE`) !== 'false',
    temperature: t !== undefined && Number.isFinite(Number(t)) ? Number(t) : undefined,
    // AI ในเครื่องช้ากว่า cloud มาก → ค่าเริ่มต้น 2 นาที
    timeoutMs: Number(env(`${prefix}_TIMEOUT_MS`)) || (local ? 120_000 : 40_000),
  };
}

export const config = {
  groqKeys: () => keyList('GROQ_API_KEY'),

  /**
   * ลำดับตัวตรวจ: GRADER_* ก่อน → GRADER_FALLBACK_* (ถ้าตั้ง) → Groq (ถ้ามี GROQ_API_KEY และตัวแรกไม่ใช่ Groq อยู่แล้ว)
   * ตัวแรกล่ม/โควตาเต็ม/ต่อไม่ติด จะขยับไปตัวถัดไปเอง
   */
  graderProviders: (): Provider[] => {
    const groq = keyList('GROQ_API_KEY');
    const list = [provider('GRADER', groq), provider('GRADER_FALLBACK', groq)].filter((p): p is Provider => !!p);
    if (groq.length && !list.some((p) => p.baseUrl === GROQ_URL) && env('GRADER_GROQ_FALLBACK') !== 'false') {
      list.push({ label: 'api.groq.com', baseUrl: GROQ_URL, model: env('GROQ_MODEL') ?? 'openai/gpt-oss-120b', keys: groq, local: false, jsonMode: true, timeoutMs: 40_000 });
    }
    return list;
  },

  /** ส่งเฉลยเต็มให้ตัวตรวจกี่ตัวอักษร (ชุด Just_chose1) — โมเดลเล็ก/context สั้นตั้ง 0–2000 เพื่อประหยัด token */
  answerKeyChars: () => {
    const v = Number(env('GRADER_ANSWER_KEY_CHARS'));
    return Number.isFinite(v) && env('GRADER_ANSWER_KEY_CHARS') !== undefined ? Math.max(0, v) : 8000;
  },

  // ───── ถอดเสียง (OpenAI-compatible /audio/transcriptions) ─────
  sttBaseUrl: () => trimUrl(env('STT_BASE_URL') ?? GROQ_URL),
  sttKeys: () => {
    const own = keyList('STT_API_KEY');
    if (own.length) return own;
    const base = config.sttBaseUrl();
    if (base === GROQ_URL) return keyList('GROQ_API_KEY');
    return isLocalUrl(base) ? ['local'] : [];
  },
  sttModel: () => env('STT_MODEL') ?? 'whisper-large-v3',
  /** ให้ AI แก้คำที่ถอดเสียงเพี้ยนหลัง Whisper (ปิดด้วย STT_CORRECT=false) */
  sttCorrect: () => env('STT_CORRECT') !== 'false',
};

/**
 * เรียก upstream ด้วย key ตัวแรกก่อนเสมอ — ใช้ key สำรองเฉพาะเมื่อตัวก่อนหน้าโดน
 * 429 (โควตาเต็ม) หรือ 401/403 (key ใช้ไม่ได้) เท่านั้น ไม่หมุนเวียน key ตามปกติ
 */
export async function fetchWithKeys(keys: string[], send: (key: string) => Promise<Response>): Promise<Response> {
  let last: Response | null = null;
  for (const key of keys) {
    last = await send(key);
    if (![429, 401, 403].includes(last.status)) return last;
  }
  if (!last) throw new Error('no_keys');
  return last;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
