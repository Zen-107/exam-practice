import { config, fetchWithKeys, type Provider } from './env.js';

type Msg = { role: 'system' | 'user'; content: string };
export type ChatResult =
  | { ok: true; content: string; model: string; provider: string }
  | { ok: false; error: 'not_configured' | 'rate_limited' | 'upstream_error' | 'upstream_unreachable'; detail?: string };

/**
 * เรียก LLM ตามลำดับผู้ให้บริการ (ในเครื่องก่อน → cloud สำรอง)
 * - ส่ง temperature / response_format เฉพาะที่ตั้งไว้; ถ้าโดน 400/422 ลองใหม่แบบไม่ส่ง (gateway บางเจ้าไม่รับ)
 * - 429 / 5xx / ต่อไม่ติด / timeout → ลองผู้ให้บริการถัดไป
 */
export async function chat(messages: Msg[], opts: { json?: boolean; providers?: Provider[] } = {}): Promise<ChatResult> {
  const providers = opts.providers ?? config.graderProviders();
  if (!providers.length) return { ok: false, error: 'not_configured' };
  let lastErr: ChatResult = { ok: false, error: 'upstream_unreachable' };

  for (const p of providers) {
    const minimal = { model: p.model, messages };
    const full = {
      ...minimal,
      ...(p.temperature !== undefined ? { temperature: p.temperature } : {}),
      ...(opts.json && p.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
    const call = (payload: object) => fetchWithKeys(p.keys, (key) => fetch(`${p.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(p.timeoutMs),
    }));
    try {
      let res = await call(full);
      if ((res.status === 400 || res.status === 422) && Object.keys(full).length > Object.keys(minimal).length) res = await call(minimal);
      if (res.ok) {
        const data = await res.json();
        const content: string = data?.choices?.[0]?.message?.content ?? '';
        // โมเดลคิดก่อนตอบ (เช่น Qwen3, DeepSeek-R1 ในเครื่อง) อาจใส่ <think>…</think> มาด้วย
        return { ok: true, content: content.replace(/<think>[\s\S]*?<\/think>/g, '').trim(), model: p.model, provider: p.label };
      }
      console.warn(`[grader] ${p.label} (${p.model}) HTTP ${res.status} — ลองตัวถัดไป`);
      lastErr = res.status === 429
        ? { ok: false, error: 'rate_limited' }
        : { ok: false, error: 'upstream_error', detail: `${p.label} ${res.status}: ${(await res.text()).slice(0, 300)}` };
    } catch (e) {
      console.warn(`[grader] ${p.label} (${p.model}) ต่อไม่ได้: ${String(e).slice(0, 200)} — ลองตัวถัดไป`);
      lastErr = { ok: false, error: 'upstream_unreachable', detail: `${p.label}: ${String(e).slice(0, 200)}` };
    }
  }
  return lastErr;
}
