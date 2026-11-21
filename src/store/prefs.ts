import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const K_THEME = 'cpe310.theme.v1';
const K_CAT = 'cpe310.cat.v1';
const K_SET = 'cpe310.set.v1';

function read(k: string): string | null {
  try { return localStorage.getItem(k); } catch { return null; }
}
function write(k: string, v: string) {
  try { localStorage.setItem(k, v); } catch { /* blocked */ }
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

export const getTheme = (): Theme => {
  const t = read(K_THEME);
  return t === 'light' || t === 'dark' ? t : 'system';
};

const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function applyTheme(t: Theme = getTheme()) {
  const dark = t === 'dark' || (t === 'system' && !!mq?.matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1f3d' : '#1d4ed8');
}
mq?.addEventListener('change', () => { if (getTheme() === 'system') applyTheme(); emit(); });

export function setTheme(t: Theme) { write(K_THEME, t); applyTheme(t); emit(); }

export const getCatOn = () => read(K_CAT) !== 'off';
export function setCatOn(on: boolean) { write(K_CAT, on ? 'on' : 'off'); emit(); }

/** ชุดข้อสอบล่าสุดที่เปิด (ใช้กับลิงก์ในแถบบน) */
export const getLastSet = () => read(K_SET) ?? 'full_Ex';
export const setLastSet = (id: string) => { write(K_SET, id); emit(); };

/** re-render เมื่อค่าตั้งค่าเปลี่ยน */
export function usePrefs() {
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    listeners.add(f);
    return () => { listeners.delete(f); };
  }, []);
  return {
    theme: getTheme(),
    isDark: typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    catOn: getCatOn(),
    lastSet: getLastSet(),
  };
}
