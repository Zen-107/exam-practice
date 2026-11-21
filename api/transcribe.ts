import { QUESTION_BY_ID } from '../src/data/index.js';
import { config, fetchWithKeys, json } from './_lib/env.js';
import { correctTranscript } from './_lib/correct.js';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel รับ body ได้สูงสุด ~4.5MB

/** POST raw audio body (content-type: audio/webm | audio/mp4 | ...) ?q=<questionId> → { text } */
export async function POST(req: Request): Promise<Response> {
  const keys = config.sttKeys();
  if (!keys.length) return json({ error: 'not_configured' }, 503);

  const url = new URL(req.url);
  const q = QUESTION_BY_ID.get(url.searchParams.get('q') ?? '');
  const type = (req.headers.get('content-type') ?? 'audio/webm').split(';')[0];
  if (!type.startsWith('audio/') && !type.startsWith('video/')) return json({ error: 'bad_type' }, 400);

  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: 'empty_audio' }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: 'too_large' }, 413);

  const ext = type.includes('mp4') || type.includes('m4a') ? 'm4a'
    : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : type.includes('mpeg') ? 'mp3' : 'webm';

  // prompt ของ Whisper: บอกว่าเป็นไทยปนอังกฤษ + รายการศัพท์ของข้อนี้ (ช่วยการสะกดศัพท์อังกฤษ)
  // ⚠️ อย่าใส่โจทย์ยาวๆ — Whisper มักพ่นข้อความ prompt ออกมาเป็นผลถอดเสียง (มี echoesPrompt กันไว้)
  const prompt = q?.vocab?.length ? `คำตอบวิชา AI ภาษาไทยปนศัพท์อังกฤษ: ${q.vocab.join(', ')}`.slice(0, 500) : '';
  const makeForm = (withPrompt: boolean) => {
    const form = new FormData();
    form.append('file', new Blob([buf], { type }), `answer.${ext}`);
    form.append('model', config.sttModel());
    form.append('language', 'th');
    form.append('temperature', '0');
    form.append('response_format', 'json');
    if (withPrompt && prompt) form.append('prompt', prompt);
    return form;
  };
  const call = (withPrompt: boolean) => fetchWithKeys(keys, (key) => fetch(`${config.sttBaseUrl()}/audio/transcriptions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: makeForm(withPrompt),
    signal: AbortSignal.timeout(config.sttBaseUrl().includes('groq.com') ? 25_000 : 120_000),
  }));

  let raw = '';
  try {
    for (const withPrompt of prompt ? [true, false] : [false]) {
      const upstream = await call(withPrompt);
      if (upstream.status === 429) return json({ error: 'rate_limited' }, 429);
      if (!upstream.ok) return json({ error: 'upstream_error', status: upstream.status, detail: (await upstream.text()).slice(0, 500) }, 502);
      const data = await upstream.json();
      raw = typeof data?.text === 'string' ? data.text.trim() : '';
      // ถ้าผลถอดเสียงคือการพ่น prompt ซ้ำ → ลองใหม่แบบไม่มี prompt
      if (!(withPrompt && echoesPrompt(raw, q?.vocab ?? []))) break;
      raw = '';
    }
  } catch (e) {
    return json({ error: 'upstream_unreachable', detail: String(e) }, 502);
  }
  if (!raw) return json({ text: '', raw: '' });
  // ขั้นที่ 2 (เฉพาะเมื่อขอ ?correct=1): ให้ AI แก้คำที่ถอดเพี้ยน — ปกติผู้ใช้กดปุ่มแก้เองทีหลัง เพื่อประหยัดโควตา
  if (url.searchParams.get('correct') !== '1') return json({ text: raw, raw, corrected: false });
  const fixed = await correctTranscript(raw, q);
  return json({ text: fixed.text, raw, corrected: fixed.corrected });
}

/** ผลถอดเสียงมีรายการศัพท์จาก prompt เรียงติดกัน ≥3 คำ แบบ "a, b, c" = Whisper พ่น prompt ออกมา */
export function echoesPrompt(text: string, vocab: string[]): boolean {
  if (vocab.length < 3) return false;
  const t = text.toLowerCase();
  for (let i = 0; i + 2 < vocab.length; i++) {
    const run = vocab.slice(i, i + 3).join(', ').toLowerCase();
    if (t.includes(run)) return true;
  }
  return false;
}
