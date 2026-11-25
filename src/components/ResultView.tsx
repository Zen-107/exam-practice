import { useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronUp, CircleCheck, CircleDot, CircleX, Lightbulb, MapPin, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import type { Question } from '../data/types';
import type { GradeResult, PointResult } from '../grading/types';
import { scorePercent, slotFraction } from '../grading/grade';
import { fullAnswer } from '../data/answers';
import { Card, Markdown, ScoreBadge, SlideChips } from './ui';

const ICON: Record<PointResult['status'], { icon: LucideIcon; cls: string }> = {
  match: { icon: CircleCheck, cls: 'text-emerald-600 dark:text-emerald-400' },
  partial: { icon: CircleDot, cls: 'text-amber-500 dark:text-amber-400' },
  suspect: { icon: TriangleAlert, cls: 'text-amber-600 dark:text-amber-400' },
  miss: { icon: CircleX, cls: 'text-rose-600 dark:text-rose-400' },
};
const LABEL: Record<PointResult['status'], string> = { match: 'ตอบครบ', partial: 'ตอบบางส่วน', suspect: 'ไม่แน่ใจ', miss: 'ยังขาด' };

export function ResultView({ q, result, examMode, onChange }: { q: Question; result: GradeResult; examMode?: boolean; onChange?: (r: GradeResult) => void }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const setOverride = (id: string, ov: 'yes' | 'no' | undefined) => {
    const points = result.points.map((p) => (p.id === id ? { ...p, override: ov } : p));
    onChange?.({ ...result, points, percent: scorePercent(points, examMode, result.slots) });
  };

  const visible = result.points.filter((p) => p.weight > 0 || q.type === 'ordering');
  const canOverride = result.method !== 'exact';
  // แบ่งช่อง: จัดประเด็นตามช่องคำตอบ พร้อมคะแนนรายช่อง
  const groups = result.slots && result.slots.length > 1
    ? result.slots.map((s) => ({ id: s.id, slot: s, points: visible.filter((p) => p.slot === s.id) }))
    : [{ id: 'all', slot: undefined, points: visible }];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="text-4xl font-extrabold">{Math.round(result.percent)}%</div>
          <ScoreBadge percent={result.percent} />
          <span className="ml-auto text-sm text-slate-500">
            {result.method === 'ai' ? (result.by ? `ตรวจด้วย ${result.by}` : 'ตรวจด้วย AI') : result.method === 'keyword' ? 'ตรวจด้วยคำสำคัญ (หยาบ)' : 'ตรวจแบบตรงตัว'}
          </span>
        </div>
        {result.notice && <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><TriangleAlert size={18} className="shrink-0" aria-hidden />{result.notice}</p>}
        {result.slots && <p className="mt-2 text-xs text-slate-500">ไม่ต้องตอบครบทุกประเด็นในเฉลย — แต่ละช่องได้เต็มเมื่อได้ประเด็นหลักราว 60–70%</p>}
        {q.autoRubric && <p className="mt-2 text-xs text-slate-500">ประเด็นของข้อนี้สร้างอัตโนมัติจากเฉลย — ใช้ปุ่มยืนยันเองได้ถ้าเครื่องตรวจพลาด</p>}
      </Card>

      {groups.map((g, gi) => (
        <div key={g.id} className="flex flex-col gap-2">
          {g.slot && <SlotHeader n={gi + 1} label={g.slot.label} frac={slotFraction(result.points, g.slot, examMode)} />}
          {!examMode && <Recap text={q.recap?.[g.slot?.id ?? 'main'] ?? (g.slot ? undefined : q.recap?.[Object.keys(q.recap ?? {})[0]])}
            full={g.slot ? slotFraction(result.points, g.slot) >= 1 : result.percent >= 100} />}
          {g.points.map((p) => {
          const eff = p.override === 'yes' ? 'match' : p.override === 'no' ? 'miss' : p.status;
          const { icon: Icon, cls } = ICON[eff];
          return (
            <Card key={p.id} className="!p-4">
              <div className="flex gap-3">
                <Icon size={22} className={`shrink-0 ${cls}`} aria-label={LABEL[eff]} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{p.label}</span>
                    {p.bonus && <span className="rounded bg-violet-100 px-1.5 text-xs text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">โบนัส</span>}
                    <span className="text-xs text-slate-500">{LABEL[eff]}{p.override ? ' (ยืนยันเอง)' : ''}</span>
                  </div>
                  {p.quote && eff !== 'miss' && (
                    <blockquote className="mt-2 border-l-4 border-emerald-400 bg-emerald-50/60 px-3 py-1.5 text-sm dark:bg-emerald-500/10">“{p.quote}”</blockquote>
                  )}
                  {p.reason && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.reason}</p>}
                  {eff !== 'match' && p.hint && <p className="mt-1 flex items-start gap-1.5 text-sm text-blue-700 dark:text-blue-300"><Lightbulb size={15} className="mt-0.5 shrink-0" aria-hidden />{p.hint}</p>}
                  {canOverride && (p.status !== 'match' || p.override) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <button type="button" onClick={() => setOverride(p.id, p.override === 'yes' ? undefined : 'yes')}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 ${p.override === 'yes' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15' : 'border-slate-300 dark:border-[#26385a]'}`}><Check size={14} /> ฉันตอบประเด็นนี้แล้ว</button>
                      <button type="button" onClick={() => setOverride(p.id, p.override === 'no' ? undefined : 'no')}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 ${p.override === 'no' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15' : 'border-slate-300 dark:border-[#26385a]'}`}><X size={14} /> ยังไม่ได้ตอบ</button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
          })}
        </div>
      ))}

      <Card>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1 font-semibold"><MapPin size={16} className="text-rose-600 dark:text-rose-400" aria-hidden /> ที่มา:</span>
          <SlideChips refs={q.slideRefs} />
        </div>
        <button type="button" onClick={() => setShowAnswer((v) => !v)} className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
          {showAnswer ? <>ซ่อนเฉลยเต็ม <ChevronUp size={16} /></> : <>ดูเฉลยเต็มข้อ {q.examNo} <ChevronDown size={16} /></>}
        </button>
        {showAnswer && <div className="mt-3 border-t border-slate-200 pt-3 dark:border-[#1d2d47]"><Markdown md={fullAnswer(q)} /></div>}
      </Card>
    </div>
  );
}

/** สรุปเฉลยแบบความเรียง: ช่องที่ยังไม่เต็มเปิดไว้ให้อ่านเลย ช่องที่เต็มแล้วพับไว้ */
function Recap({ text, full }: { text?: string; full: boolean }) {
  if (!text) return null;
  if (full)
    return (
      <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-[#1d2d47] dark:bg-[#15253d]/50">
        <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300"><BookOpen size={15} aria-hidden /> สรุปเฉลยช่องนี้</summary>
        <p className="mt-2 leading-relaxed">{text}</p>
      </details>
    );
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/40 dark:bg-amber-500/10">
      <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300"><BookOpen size={15} aria-hidden /> ช่องนี้ยังไม่เต็ม อ่านเฉลยแบบนี้แล้วจำไว้</div>
      <p className="mt-1.5 leading-relaxed text-slate-800 dark:text-slate-200">{text}</p>
    </div>
  );
}

function SlotHeader({ n, label, frac }: { n: number; label: string; frac: number }) {
  const pct = Math.round(frac * 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="grid h-6 min-w-6 place-items-center rounded-md bg-blue-600 px-1 text-xs font-bold text-white">{n}</span>
      <span className="flex-1 font-bold leading-snug">{label}</span>
      <ScoreBadge percent={pct} />
    </div>
  );
}
