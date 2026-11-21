import { useEffect, useState } from 'react';
import { Coffee, Timer } from 'lucide-react';
import { catSay } from './WindowCat';

/**
 * เตือนให้พักเมื่อใช้แอปต่อเนื่องเกิน 2 ชม.
 * นับเฉพาะตอนแท็บเปิดอยู่ (visible) เก็บใน localStorage จึงนับต่อแม้รีเฟรชหน้า
 * ถ้าหายไปเกิน 15 นาที ถือว่าพักแล้ว เริ่มนับใหม่
 */
const LIMIT = 2 * 60 * 60 * 1000;
const SNOOZE = 15 * 60 * 1000;
const AWAY_RESET = 15 * 60 * 1000;
const TICK = 15 * 1000;
const KEY = 'cpe310.study.v1';

interface Study { activeMs: number; lastTick: number; remindAt: number }

function load(): Study {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Study | null;
    if (s && Date.now() - s.lastTick < AWAY_RESET) return s;
  } catch { /* ignore */ }
  return { activeMs: 0, lastTick: Date.now(), remindAt: LIMIT };
}
function save(s: Study) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

const fmt = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} ชม.${m % 60 ? ` ${m % 60} นาที` : ''}` : `${m} นาที`;
};

export function BreakReminder() {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    let s = load();
    save(s);
    const tick = () => {
      const now = Date.now();
      if (now - s.lastTick >= AWAY_RESET) s = { activeMs: 0, lastTick: now, remindAt: LIMIT };
      else if (document.visibilityState === 'visible') s.activeMs += now - s.lastTick;
      s.lastTick = now;
      save(s);
      if (s.activeMs >= s.remindAt && !open) {
        setUsed(s.activeMs);
        setOpen(true);
        catSay('ทำมาเกิน 2 ชม. แล้ว พักก่อนน้า');
      }
    };
    const t = setInterval(tick, TICK);
    const onVis = () => { if (document.visibilityState === 'visible') { s = load(); s.lastTick = Date.now(); save(s); } };
    document.addEventListener('visibilitychange', onVis);
    tick();
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [open]);

  if (!open) return null;

  const rest = () => { save({ activeMs: 0, lastTick: Date.now(), remindAt: LIMIT }); setOpen(false); };
  const snooze = () => { const s = load(); s.remindAt = s.activeMs + SNOOZE; save(s); setOpen(false); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="break-title">
      <div className="w-full max-w-sm rounded-3xl border border-orange-200 bg-white p-6 text-center shadow-2xl dark:border-orange-500/30 dark:bg-[#0d1a2d]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
          <Coffee size={34} aria-hidden />
        </span>
        <h2 id="break-title" className="mt-3 text-2xl font-extrabold">พักก่อนนะ</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          ทำมาแล้ว <b>{fmt(used)}</b> เกิน 2 ชั่วโมงแล้ว<br />ลุกยืดเส้น ดื่มน้ำ พักสายตาสัก 10–15 นาที แล้วค่อยกลับมาอ่านต่อ
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={rest} autoFocus
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 font-semibold text-white hover:bg-orange-400">
            <Coffee size={18} /> ไปพักแล้ว
          </button>
          <button type="button" onClick={snooze}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#26385a] dark:text-slate-200 dark:hover:bg-[#15253d]">
            <Timer size={18} /> ขออีก 15 นาที
          </button>
        </div>
      </div>
    </div>
  );
}
