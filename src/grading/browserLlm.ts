import type { AiSettings } from '../store/aiSettings';
import type { ChatMessage } from './prompt';

/**
 * เรียก LLM แบบ OpenAI-compatible จากเบราว์เซอร์โดยตรง (ไม่ผ่าน server ของเว็บ)
 * ใช้กับ AI ในเครื่องผู้ใช้ (http://localhost…) หรือ API key ของผู้ใช้เอง
 * เงื่อนไขฝั่งผู้ใช้: server ต้องเปิด CORS ให้เว็บนี้ — ดูหน้า "ตั้งค่าตัวตรวจ"
 */
export type DirectError = 'cors_or_offline' | 'timeout' | 'http' | 'bad_output';
export class DirectAiError extends Error {
  constructor(public kind: DirectError, message: string, public status?: number) { super(message); }
}

const url = (s: AiSettings, path: string) => `${s.baseUrl.replace(/\/+$/, '')}${path}`;
const headers = (s: AiSettings) => ({
  'content-type': 'application/json',
  ...(s.apiKey ? { authorization: `Bearer ${s.apiKey}` } : {}),
});

async function send(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  try {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const name = (e as Error)?.name;
    if (name === 'TimeoutError' || name === 'AbortError') throw new DirectAiError('timeout', `รอเกิน ${Math.round(timeoutMs / 1000)} วินาที`);
    // เบราว์เซอร์ไม่บอกสาเหตุ: server ปิดอยู่ / port ผิด / ไม่ได้เปิด CORS / ไม่ได้อนุญาตเข้าถึงเครือข่ายในเครื่อง
    throw new DirectAiError('cors_or_offline', String((e as Error)?.message ?? e));
  }
}

export async function directChat(s: AiSettings, messages: ChatMessage[], opts: { json?: boolean; timeoutMs?: number } = {}): Promise<string> {
  const timeout = opts.timeoutMs ?? s.timeoutMs;
  const minimal = { model: s.model, messages };
  const full = { ...minimal, ...(opts.json && s.jsonMode ? { response_format: { type: 'json_object' } } : {}) };
  const post = (body: object) => send(url(s, '/chat/completions'), { method: 'POST', headers: headers(s), body: JSON.stringify(body) }, timeout);

  let res = await post(full);
  if ((res.status === 400 || res.status === 422) && full !== minimal && 'response_format' in full) res = await post(minimal);
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new DirectAiError('http', `HTTP ${res.status} ${detail}`, res.status);
  }
  const data = await res.json().catch(() => null);
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new DirectAiError('bad_output', 'ไม่พบ choices[0].message.content');
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

/** รายชื่อโมเดลที่ server โหลดไว้ (GET /models) */
export async function listModels(s: AiSettings): Promise<string[]> {
  const res = await send(url(s, '/models'), { headers: s.apiKey ? { authorization: `Bearer ${s.apiKey}` } : {} }, 10_000);
  if (!res.ok) throw new DirectAiError('http', `HTTP ${res.status}`, res.status);
  const data = await res.json().catch(() => null);
  const list: unknown[] = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
  return list.map((m: any) => String(m?.id ?? m?.name ?? '')).filter(Boolean);
}
