import { config, json } from './_lib/env.js';

/** บอก client ว่า server เปิดความสามารถอะไรไว้บ้าง (ไม่เปิดเผย key บอกแค่จำนวน/ชื่อโมเดล) */
export async function GET(): Promise<Response> {
  const providers = config.graderProviders();
  const first = providers[0];
  return json({
    stt: config.sttKeys().length > 0,
    grader: providers.length > 0,
    graderModel: first ? `${first.model}${first.local ? ' · ในเครื่อง' : ''}` : null,
    graderChain: providers.map((p) => `${p.model} @ ${p.label}`),
    keySlots: { stt: config.sttKeys().length, groq: config.groqKeys().length },
  });
}
