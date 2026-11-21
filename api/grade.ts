import { QUESTION_BY_ID } from '../src/data/index.js';
import { json } from './_lib/env.js';
import { chat } from './_lib/llm.js';
import { buildGraderMessages } from './_lib/prompt.js';
import { parseGraderOutput } from '../src/grading/prompt.js';

const MAX_ANSWER = 8000;

/** POST { questionId, answer, source } → { points: [{id,status,quote,reason}], model, provider } */
export async function POST(req: Request): Promise<Response> {
  let body: { questionId?: string; answer?: string; source?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const q = body.questionId ? QUESTION_BY_ID.get(body.questionId) : undefined;
  if (!q || q.type !== 'essay' || !q.rubric) return json({ error: 'unknown_question' }, 400);
  const answer = (body.answer ?? '').slice(0, MAX_ANSWER);
  if (answer.trim().length < 3) return json({ error: 'empty_answer' }, 400);

  const source = body.source === 'voice' ? 'voice' : 'typed';
  const r = await chat(buildGraderMessages(q, answer, source), { json: true });
  if (!r.ok) {
    const status = r.error === 'not_configured' ? 503 : r.error === 'rate_limited' ? 429 : 502;
    return json({ error: r.error, detail: r.detail }, status);
  }

  const points = parseGraderOutput(r.content, q);
  if (!points) return json({ error: 'bad_model_output', detail: r.content.slice(0, 300) }, 502);

  return json({ points, model: r.model, provider: r.provider });
}
