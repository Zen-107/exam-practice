import { useMemo, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { BookOpen, ChartColumn, Cat, Monitor, Moon, Settings as SettingsIcon, Sun, Timer, type LucideIcon } from 'lucide-react';
import { setCatOn, setTheme, usePrefs, type Theme } from '../store/prefs';
import { subjectOfSet } from '../data/subjects';
import { WindowCat } from './WindowCat';
import { BreakReminder } from './BreakReminder';

export function Shell({ children }: { children: ReactNode }) {
  const { catOn, lastSet } = usePrefs();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-blue-700 text-white shadow-md shadow-blue-900/20 dark:bg-[#0b1f3d]">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
          <a href="#/" className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm text-blue-700">310</span>
            <span className="hidden text-lg md:inline">ฝึกสอบ</span>
          </a>
          <nav className="ml-auto flex gap-0.5 text-[0.95rem]">
            <NavLink href={`#/list/${lastSet}`} match="#/list" icon={BookOpen}>รายข้อ</NavLink>
            <NavLink href={`#/exam/${subjectOfSet(lastSet)?.id ?? 'cpe310'}`} match="#/exam" icon={Timer}>สอบจริง</NavLink>
            <NavLink href="#/stats" match="#/stats" icon={ChartColumn}>สถิติ</NavLink>
          </nav>
          <div className="ml-1 flex items-center gap-0.5 border-l border-white/20 pl-1.5">
            <a href="#/settings" title="ตั้งค่าตัวตรวจ AI" aria-label="ตั้งค่าตัวตรวจ AI"
              className={`grid h-9 w-9 place-items-center rounded-lg transition hover:bg-white/10 ${location.hash.startsWith('#/settings') ? 'bg-white/20 text-white' : 'text-blue-100'}`}>
              <SettingsIcon size={19} />
            </a>
            <ThemeButton />
            <IconButton label={catOn ? 'ซ่อนแมว' : 'เรียกแมว'} onClick={() => setCatOn(!catOn)} active={catOn}>
              <Cat size={19} />
            </IconButton>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:pt-8">{children}</main>
      {catOn && <WindowCat />}
      <BreakReminder />
    </div>
  );
}

const THEME_NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<Theme, string> = { system: 'ตามเครื่อง', light: 'โหมดสว่าง', dark: 'โหมดมืด' };

function ThemeButton() {
  const { theme } = usePrefs();
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <IconButton label={`ธีม: ${THEME_LABEL[theme]} (กดเพื่อเปลี่ยน)`} onClick={() => setTheme(THEME_NEXT[theme])}>
      <Icon size={19} />
    </IconButton>
  );
}

function IconButton({ children, label, onClick, active }: { children: ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active}
      className={`grid h-9 w-9 place-items-center rounded-lg transition ${active ? 'text-white' : 'text-blue-100'} hover:bg-white/10`}>
      {children}
    </button>
  );
}

function NavLink({ href, match, icon: Icon, children }: { href: string; match: string; icon: LucideIcon; children: ReactNode }) {
  const active = location.hash.startsWith(match) || (match === '#/list' && location.hash.startsWith('#/q/'));
  return (
    <a href={href} title={String(children)}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-medium sm:px-3 ${active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'}`}>
      <Icon size={18} aria-hidden />
      <span className="hidden sm:inline">{children}</span>
    </a>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-[#1d2d47] dark:bg-[#0d1a2d] ${className}`}>{children}</div>;
}

type BtnProps = { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; className?: string; type?: 'button' | 'submit' };
export function Button({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }: BtnProps) {
  const v = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700',
    ghost: 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-[#26385a] dark:text-slate-200 dark:hover:bg-[#15253d]',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed ${v} ${className}`}>
      {children}
    </button>
  );
}

/** เฉลยมีอีโมจิ/สัญลักษณ์ 📍 ✓ ✗ → แทนด้วยไอคอน (CSS mask) ให้เข้าชุดกับ UI */
function iconize(md: string): string {
  return md
    .replace(/📍/g, '<span class="md-icon md-pin" aria-label="ที่มา"></span>')
    .replace(/✓/g, '<span class="md-icon md-check" aria-label="ใช่"></span>')
    .replace(/✗/g, '<span class="md-icon md-x" aria-label="ไม่ใช่"></span>');
}

export function Markdown({ md }: { md: string }) {
  const src = useMemo(() => iconize(md), [md]);
  return (
    <div className="prose-answer text-[1.02rem]">
      {/* rehypeRaw: เฉลยใช้ <br> ในตาราง — เนื้อหามาจากไฟล์เฉลยของเราเอง ไม่ใช่จากผู้ใช้ */}
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{src}</ReactMarkdown>
    </div>
  );
}

export function ScoreBadge({ percent }: { percent: number | undefined }) {
  if (percent === undefined) return <span className="text-xs text-slate-400">ยังไม่ทำ</span>;
  const c = percent >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    : percent >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c}`}>{Math.round(percent)}%</span>;
}

/** กล่องไอคอนสี่เหลี่ยมมน (แทนอีโมจิหัวการ์ด) */
export function IconTile({ icon: Icon, tone = 'blue', size = 'md' }: { icon: LucideIcon; tone?: 'blue' | 'amber' | 'violet' | 'slate' | 'emerald'; size?: 'md' | 'lg' }) {
  const t = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-[#15253d] dark:text-slate-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  }[tone];
  const s = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  return <span className={`grid shrink-0 place-items-center rounded-xl ${s} ${t}`}><Icon size={size === 'lg' ? 28 : 22} aria-hidden /></span>;
}

/** หัวข้อการ์ดพร้อมไอคอน */
export function CardTitle({ icon: Icon, children, className = '' }: { icon: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <h3 className={`flex items-center gap-2 font-bold ${className}`}>
      <Icon size={18} className="text-blue-600 dark:text-blue-300" aria-hidden />
      {children}
    </h3>
  );
}

export function SlideChips({ refs }: { refs: { file: string; pages: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {refs.map((s, i) => (
        <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-[#15253d]">
          {s.file}{s.pages && <span className="text-slate-500"> {/^\d/.test(s.pages) ? `หน้า ${s.pages}` : s.pages}</span>}
        </span>
      ))}
    </div>
  );
}

export function Dataset() {
  const rows = [[1, 1, 2], [2, 3, 4], [4, 2, 6]];
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-[#15253d]/70">
      <div className="font-mono">y = w₁x₁ + w₂x₂ + b</div>
      <table className="border-collapse text-center font-mono">
        <thead><tr>{['x₁', 'x₂', 'y'].map((h) => <th key={h} className="border border-slate-300 px-3 py-1 dark:border-slate-600">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border border-slate-300 px-3 py-1 dark:border-slate-600">{c}</td>)}</tr>)}</tbody>
      </table>
      <div className="font-mono text-xs">MSE = (1/n) Σ (Yᵢ − Ŷᵢ)²</div>
    </div>
  );
}

/** แท็บเลือกแบบปุ่ม (ใช้เลือกหมวด/ชุด) */
export function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button key={it.id} type="button" onClick={() => onChange(it.id)} aria-pressed={value === it.id}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${value === it.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 dark:border-[#26385a] dark:bg-[#0d1a2d] dark:text-slate-200'}`}>
          {it.label}{it.count !== undefined && <span className={`ml-1.5 text-xs ${value === it.id ? 'text-blue-100' : 'text-slate-400'}`}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function useToggle(init = false) {
  const [v, setV] = useState(init);
  return [v, () => setV((x) => !x)] as const;
}
