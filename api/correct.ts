import { QUESTION_BY_ID } from '../src/data/index.js';
import { json } from './_lib/env.js';
import { correctTranscript } from './_lib/correct.js';

/** POST { questionId, text } → { text, raw, corrected } — แก้คำที่ถอดเสียงเพี้ยน (ใช้กับตัวถอดเสียงของเบราว์เซอร์) */
export async function POST(req: Request): Promise<Response> {
  let body: { questionId?: string; text?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const raw = (body.text ?? '').slice(0, 4000).trim();
  if (!raw) return json({ error: 'empty' }, 400);
  const fixed = await correctTranscript(raw, QUESTION_BY_ID.get(body.questionId ?? ''));
  return json({ text: fixed.text, raw, corrected: fixed.corrected });
}
