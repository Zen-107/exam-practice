import { useMemo, useRef, useState } from 'react';
import type { Question } from '../data/types';
import type { Answer } from '../grading/types';
import type { InputMode } from '../store/history';
import { ArrowRight, ChevronDown, ChevronUp, GripVertical, Lightbulb, Mic, Sparkles, Undo2 } from 'lucide-react';
import { VoiceButton } from './VoiceButton';

const isMulti = (q: Question) => (q.slots?.length ?? 0) > 1;

/** รวมคำตอบทุกช่องเป็นข้อความเดียว (ส่งให้ AI ตรวจ / แสดงผล) — มีหัวข้อช่องกำกับ */
export function joinParts(q: Question, parts: Record<string, string>): string {
  return (q.slots ?? []).map((s) => `【${s.label}】\n${(parts[s.id] ?? '').trim() || '-'}`).join('\n\n');
}

/** draft ของข้อแบบหลายช่องเก็บเป็น JSON */
export const draftOf = (a: Answer): string => (a.kind === 'text' ? (a.parts ? JSON.stringify(a.parts) : a.text) : '');

export function emptyAnswer(q: Question, mode: InputMode, draft = ''): Answer {
  const source = mode === 'voice' ? 'voice' : 'typed';
  switch (q.type) {
    case 'numeric': return { kind: 'numeric', values: {} };
    case 'matching': return { kind: 'matching', pairs: {} };
    case 'ordering': return { kind: 'ordering', order: shuffle(q.order ?? [], q.id) };
    default: {
      if (!isMulti(q)) return { kind: 'text', text: draft.startsWith('{') ? '' : draft, source };
      let parts: Record<string, string> = {};
      try { if (draft.startsWith('{')) parts = JSON.parse(draft); } catch { /* draft เก่า */ }
      return { kind: 'text', text: joinParts(q, parts), source, parts };
    }
  }
}

export function isAnswered(a: Answer): boolean {
  if (a.kind === 'text') return a.parts ? Object.values(a.parts).some((v) => v.trim()) : a.text.trim().length > 0;
  if (a.kind === 'numeric') return Object.values(a.values).some((v) => v.trim());
  if (a.kind === 'matching') return Object.keys(a.pairs).length > 0;
  return true;
}

/** สับลำดับแบบคงที่ต่อข้อ แต่ไม่ให้ตรงกับเฉลย */
function shuffle<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (const c of seed + Date.now().toString().slice(0, -5)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift()!);
  return a;
}

type Props = { q: Question; mode: InputMode; value: Answer; onChange: (a: Answer) => void; disabled?: boolean };

export function AnswerInput(p: Props) {
  if (p.value.kind === 'numeric') return <NumericInput {...p} value={p.value} />;
  if (p.value.kind === 'matching') return <MatchingInput {...p} value={p.value} />;
  if (p.value.kind === 'ordering') return <OrderingInput {...p} value={p.value} />;
  return <TextInput {...p} value={p.value} />;
}

function TextInput(p: Props & { value: Extract<Answer, { kind: 'text' }> }) {
  return isMulti(p.q) ? <SlotsInput {...p} /> : <SingleInput {...p} />;
}

/** แบ่งคำตอบเป็นช่องๆ ตาม q.slots — แต่ละช่องมีหัวข้อ + วิธีตอบ */
function SlotsInput({ q, mode, value, onChange, disabled }: Props & { value: Extract<Answer, { kind: 'text' }> }) {
  const slots = q.slots ?? [];
  const [active, setActive] = useState(slots[0]?.id ?? '');
  const latest = useRef(value);
  latest.current = value;
  const activeRef = useRef(active);
  activeRef.current = active;
  const setPart = (id: string, v: string, source = latest.current.source) => {
    const parts = { ...(latest.current.parts ?? {}), [id]: v };
    onChange({ kind: 'text', parts, text: joinParts(q, parts), source });
  };
  // ผลถอดเสียงกลับมาแบบ async → ใช้ช่องที่เลือกล่าสุดจาก ref
  const append = (t: string) => {
    const id = activeRef.current;
    const cur = latest.current.parts?.[id] ?? '';
    setPart(id, cur + (cur && !/\s$/.test(cur) ? ' ' : '') + t.trim(), 'voice');
  };
  const replace = (from: string, to: string) => {
    const id = activeRef.current;
    const cur = latest.current.parts?.[id] ?? '';
    const i = cur.lastIndexOf(from);
    if (i >= 0) setPart(id, cur.slice(0, i) + to + cur.slice(i + from.length), 'voice');
  };
  /** ช่องตัวเลข: เก็บค่าแยกเป็น "<slot>:<field>" แล้วประกอบข้อความ "Σx₁ = 7" ให้ช่องหลัก (ใช้ตรวจ/แสดงผล) */
  const setField = (slotId: string, fid: string, v: string) => {
    const slot = slots.find((s) => s.id === slotId)!;
    const parts = { ...(latest.current.parts ?? {}), [`${slotId}:${fid}`]: v };
    const lines = (slot.fields ?? []).map((f) => [f.label, (parts[`${slotId}:${f.id}`] ?? '').trim()] as const).filter(([, x]) => x).map(([l, x]) => `${l} = ${x}`);
    const work = (parts[`${slotId}:work`] ?? '').trim();
    parts[slotId] = [...lines, ...(work ? [`วิธีทำ: ${work}`] : [])].join('\n');
    onChange({ kind: 'text', parts, text: joinParts(q, parts), source: latest.current.source });
  };
  const activeLabel = slots.find((s) => s.id === active)?.label;
  const filled = slots.filter((s) => (value.parts?.[s.id] ?? '').trim()).length;

  return (
    <div className="flex flex-col gap-3">
      {mode === 'voice' && !disabled && (
        <div className="sticky top-16 z-[1] rounded-xl bg-blue-50/95 py-3 backdrop-blur dark:bg-[#0f2340]/95">
          <VoiceButton questionId={q.id} onText={append} onReplace={replace} />
          <p className="mt-1 flex items-center justify-center gap-1 px-2 text-center text-xs text-slate-500"><Mic size={12} /> พูดลงช่อง: <b className="text-blue-700 dark:text-blue-300">{activeLabel}</b> (แตะช่องอื่นเพื่อเปลี่ยน)</p>
        </div>
      )}
      <p className="text-sm text-slate-500">ตอบแยก {slots.length} ช่อง · กรอกแล้ว {filled}/{slots.length} — เขียนสั้นๆ ตรงประเด็นได้เลย ไม่ต้องยาวเท่าเฉลย</p>
      {slots.map((s, i) => {
        const v = value.parts?.[s.id] ?? '';
        return (
          <div key={s.id} className={`rounded-xl border p-3 transition ${active === s.id && mode === 'voice' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-[#1d2d47]'}`}>
            <label htmlFor={`${q.id}-${s.id}`} className="flex items-baseline gap-2">
              <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-md bg-blue-600 px-1 text-xs font-bold text-white">{i + 1}</span>
              <span className="font-semibold leading-snug">{s.label}</span>
            </label>
            {s.tip && <p className="ml-8 mt-0.5 flex items-start gap-1 text-xs text-slate-500"><Lightbulb size={12} className="mt-0.5 shrink-0" aria-hidden />{s.tip}</p>}
            {s.fields ? (
              <div className="mt-2 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {s.fields.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]">
                      <span className="shrink-0 font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">{f.label} =</span>
                      <input
                        inputMode="decimal" autoComplete="off" disabled={disabled}
                        value={value.parts?.[`${s.id}:${f.id}`] ?? ''}
                        onFocus={() => setActive(s.id)}
                        onChange={(e) => setField(s.id, f.id, e.target.value)}
                        className="min-h-10 w-full min-w-0 bg-transparent font-mono text-base outline-none"
                      />
                    </label>
                  ))}
                </div>
                <textarea
                  value={value.parts?.[`${s.id}:work`] ?? ''} disabled={disabled}
                  onFocus={() => setActive(s.id)}
                  onChange={(e) => setField(s.id, 'work', e.target.value)}
                  rows={2} placeholder="วิธีทำย่อๆ (ไม่บังคับ) เช่น ตั้ง 3 สมการจาก ∂MSE = 0 แล้วแก้"
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2.5 text-base leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]"
                />
              </div>
            ) : <textarea
              id={`${q.id}-${s.id}`} value={v} disabled={disabled}
              onFocus={() => setActive(s.id)}
              onChange={(e) => setPart(s.id, e.target.value)}
              rows={s.short ? 2 : s.placeholder?.includes('\n') ? 4 : 3}
              placeholder={s.placeholder ?? (s.short ? 'นิยามสั้นๆ…' : 'ตอบสั้นๆ เป็นข้อๆ ได้…')}
              className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white p-2.5 text-base leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]"
            />}
          </div>
        );
      })}
    </div>
  );
}

function SingleInput({ q, mode, value, onChange, disabled }: Props & { value: Extract<Answer, { kind: 'text' }> }) {
  const latest = useRef(value);
  latest.current = value;
  const append = (t: string) => {
    // ใช้ค่าล่าสุดจาก ref — ผลถอดเสียงกลับมาแบบ async หลังจาก render ที่กดอัด
    const cur = latest.current.text;
    const sep = cur && !/\s$/.test(cur) ? ' ' : '';
    onChange({ kind: 'text', text: cur + sep + t.trim(), source: 'voice' });
  };
  const replace = (from: string, to: string) => {
    const cur = latest.current.text;
    const i = cur.lastIndexOf(from);
    if (i >= 0) onChange({ kind: 'text', text: cur.slice(0, i) + to + cur.slice(i + from.length), source: 'voice' });
  };
  return (
    <div className="flex flex-col gap-3">
      {mode === 'voice' && !disabled && (
        <div className="rounded-xl bg-blue-50/60 py-4 dark:bg-blue-500/10">
          <VoiceButton questionId={q.id} onText={append} onReplace={replace} big />
        </div>
      )}
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {mode === 'voice' ? 'ข้อความที่ถอดได้ — แก้ไขคำที่ผิดได้ก่อนส่ง' : 'คำตอบ'}
      </label>
      {q.slots?.[0]?.tip && (
        <p className="-mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <Lightbulb size={15} className="mt-0.5 shrink-0" aria-hidden /> วิธีตอบ: {q.slots[0].tip}
        </p>
      )}
      <textarea
        value={value.text}
        disabled={disabled}
        onChange={(e) => onChange({ kind: 'text', text: e.target.value, source: value.source })}
        rows={mode === 'voice' ? 6 : (q.rubric?.length ?? 0) > 8 ? 16 : 9}
        placeholder={mode === 'voice' ? 'กดไมค์แล้วพูดคำตอบ…' : 'พิมพ์คำตอบ ไทยปนอังกฤษได้'}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-base leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]"
      />
      {!disabled && value.source === 'voice' && value.text.trim().length > 3 && (
        <FixWords q={q} text={value.text} onApply={(t) => onChange({ kind: 'text', text: t, source: 'voice' })} />
      )}
      {mode === 'typed' && !disabled && (
        <details className="text-sm text-slate-500">
          <summary className="cursor-pointer">พูดเติมคำตอบ</summary>
          <div className="pt-3"><VoiceButton questionId={q.id} onText={append} onReplace={replace} /></div>
        </details>
      )}
    </div>
  );
}

/** ปุ่มให้ AI แก้คำที่ถอดเสียงเพี้ยน — กดเองเมื่อต้องการ (ใช้ key ของตัวตรวจ 1 ครั้ง) พร้อมปุ่มย้อนกลับ */
function FixWords({ q, text, onApply }: { q: Question; text: string; onApply: (t: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<{ before: string; after: string } | null>(null);
  const [msg, setMsg] = useState('');

  const run = async () => {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/correct', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ questionId: q.id, text }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.text) {
        if (d.text === text) setMsg('ไม่พบคำที่ต้องแก้');
        else { setUndo({ before: text, after: d.text }); onApply(d.text); }
      } else setMsg('แก้คำไม่สำเร็จ ลองใหม่อีกครั้ง หรือแก้เองในช่อง');
    } catch { setMsg('ไม่มีอินเทอร์เน็ต — แก้เองในช่องได้'); }
    setBusy(false);
  };

  // ถ้าผู้ใช้แก้ข้อความต่อหลังจาก AI แก้ ปุ่มย้อนกลับจะหายไป (กันทับสิ่งที่พิมพ์เพิ่ม)
  const canUndo = undo && undo.after === text;
  return (
    <div className="-mt-1 flex flex-wrap items-center gap-2 text-sm">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-lg border border-blue-300 px-3 py-1.5 font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10">
        {busy ? 'กำลังแก้คำ…' : <span className="flex items-center gap-1.5"><Sparkles size={15} /> ให้ AI แก้คำที่ถอดเพี้ยน</span>}
      </button>
      {canUndo && (
        <button type="button" onClick={() => { onApply(undo.before); setUndo(null); }} className="flex items-center gap-1 text-slate-500 underline"><Undo2 size={14} /> ย้อนกลับ</button>
      )}
      {canUndo && <span className="text-xs text-slate-500">แก้แล้ว — ตรวจดูอีกรอบก่อนส่ง</span>}
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}

function NumericInput({ q, value, onChange, disabled }: Props & { value: Extract<Answer, { kind: 'numeric' }> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(q.numericFields ?? []).map((f) => (
        <label key={f.id} className="flex flex-col gap-1">
          <span className="font-mono text-sm font-semibold">{f.label}</span>
          <input
            inputMode="decimal" autoComplete="off" disabled={disabled}
            value={value.values[f.id] ?? ''}
            onChange={(e) => onChange({ kind: 'numeric', values: { ...value.values, [f.id]: e.target.value } })}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-mono text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]"
          />
        </label>
      ))}
      <p className="col-span-full text-xs text-slate-500">ตอบเป็นทศนิยมหรือเศษส่วนก็ได้ เช่น 0.4 หรือ 2/5</p>
    </div>
  );
}

function MatchingInput({ q, value, onChange, disabled }: Props & { value: Extract<Answer, { kind: 'matching' }> }) {
  const lefts = (q.pairs ?? []).map((p) => p.left);
  const rights = useMemo(() => shuffle((q.pairs ?? []).map((p) => p.right), q.id + 'r'), [q]);
  const [sel, setSel] = useState<string | null>(null);
  const usedRight = new Set(Object.values(value.pairs));

  const pickRight = (r: string) => {
    if (!sel || disabled) return;
    const next = { ...value.pairs };
    for (const k of Object.keys(next)) if (next[k] === r) delete next[k];
    next[sel] = r;
    onChange({ kind: 'matching', pairs: next });
    setSel(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500">แตะฝั่ง Human ก่อน แล้วแตะฝั่ง Expert System ที่ทำหน้าที่เดียวกัน</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Human Expert</h4>
          {lefts.map((l) => (
            <button key={l} type="button" disabled={disabled} onClick={() => setSel(l)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-medium ${sel === l ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/40 dark:bg-blue-500/15' : 'border-slate-300 dark:border-[#26385a]'}`}>
              {l}
              {value.pairs[l] && <span className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300"><ArrowRight size={12} /> {value.pairs[l]}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Expert System</h4>
          {rights.map((r) => (
            <button key={r} type="button" disabled={disabled || !sel} onClick={() => pickRight(r)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-medium ${usedRight.has(r) ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-300 dark:border-[#26385a]'} ${sel ? 'hover:border-blue-400' : 'opacity-80'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderingInput({ value, onChange, disabled }: Props & { value: Extract<Answer, { kind: 'ordering' }> }) {
  const [drag, setDrag] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (disabled || to < 0 || to >= value.order.length || from === to) return;
    const o = [...value.order];
    const [x] = o.splice(from, 1);
    o.splice(to, 0, x);
    onChange({ kind: 'ordering', order: o });
  };
  return (
    <ol className="flex flex-col gap-2">
      {value.order.map((s, i) => (
        <li key={s} draggable={!disabled}
          onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-2 dark:border-[#26385a] dark:bg-[#081322]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold dark:bg-[#15253d]">{i + 1}</span>
          <GripVertical size={16} className="shrink-0 cursor-grab text-slate-400" aria-hidden />
          <span className="flex-1 cursor-grab text-sm font-medium">{s}</span>
          <button type="button" aria-label="ขึ้น" disabled={disabled || i === 0} onClick={() => move(i, i - 1)} className="h-10 w-10 rounded-lg border border-slate-300 disabled:opacity-30 dark:border-[#26385a] grid place-items-center"><ChevronUp size={18} /></button>
          <button type="button" aria-label="ลง" disabled={disabled || i === value.order.length - 1} onClick={() => move(i, i + 1)} className="h-10 w-10 rounded-lg border border-slate-300 disabled:opacity-30 dark:border-[#26385a] grid place-items-center"><ChevronDown size={18} /></button>
        </li>
      ))}
    </ol>
  );
}
