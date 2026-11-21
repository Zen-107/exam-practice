import { LoaderCircle, Mic, Sparkles, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getHealth } from '../grading/client';

type Engine = 'whisper' | 'browser' | 'none';
const MAX_MS = 3 * 60 * 1000;

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const m of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'])
    if (MediaRecorder.isTypeSupported?.(m)) return m;
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SR: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition : undefined;

/**
 * ปุ่มไมค์: ใช้ Groq Whisper (ผ่าน /api/transcribe) ถ้า server พร้อม ไม่งั้นใช้ Web Speech ของเบราว์เซอร์
 * onText ส่งข้อความที่ถอดได้ (ต่อท้ายคำตอบ)
 */
export function VoiceButton({ questionId, onText, onReplace, big }: {
  questionId: string;
  onText: (t: string) => void;
  /** แทนที่ข้อความ from → to ในคำตอบ (ใช้ตอนกด "ใช้ข้อความดิบแทน") */
  onReplace?: (from: string, to: string) => void;
  big?: boolean;
}) {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [state, setState] = useState<'idle' | 'rec' | 'busy'>('idle');
  const [interim, setInterim] = useState('');
  const [err, setErr] = useState('');
  const [secs, setSecs] = useState(0);
  /** ผลถอดเสียงล่าสุด: ข้อความดิบจาก Whisper กับที่ AI แก้แล้ว */
  const [last, setLast] = useState<{ raw: string; fixed: string } | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const sr = useRef<any>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    getHealth().then((h) => {
      // ใช้ตัวถอดเสียงของเบราว์เซอร์ก่อน (ฟรี ไม่ใช้ key) — Whisper (Groq key) เป็นทางสำรองเท่านั้น
      // Opera / Brave / Vivaldi มี API แต่ส่งเสียงไปถอดที่ Google ไม่ได้ → ข้ามไปใช้ Whisper
      if (SR && !BROKEN_SR) setEngine('browser');
      else if (h.stt && pickMime() && typeof navigator.mediaDevices?.getUserMedia === 'function') setEngine('whisper');
      else setEngine('none');
    });
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    window.clearInterval(timer.current);
    try { rec.current?.state === 'recording' && rec.current.stop(); } catch { /* ignore */ }
    try { sr.current?.stop(); } catch { /* ignore */ }
  }

  async function startWhisper() {
    setErr('');
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setErr('ไม่ได้รับสิทธิ์ใช้ไมค์ — อนุญาตไมค์ในการตั้งค่าเบราว์เซอร์'); return; }
    const mime = pickMime();
    const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      window.clearInterval(timer.current);
      setState('busy');
      const blob = new Blob(chunks, { type: (r.mimeType || mime || 'audio/webm').split(';')[0] });
      try {
        const res = await fetch(`/api/transcribe?q=${encodeURIComponent(questionId)}`, { method: 'POST', headers: { 'content-type': blob.type }, body: blob });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.text) {
          onText(data.text);
          setLast(data.corrected && data.raw ? { raw: data.raw, fixed: data.text } : null);
        }
        else if (res.ok) setErr('ไม่ได้ยินเสียงพูด ลองใหม่อีกครั้ง');
        else if (data.error === 'rate_limited') { setErr('โควตาถอดเสียงฟรีเต็มชั่วคราว — สลับไปใช้ตัวถอดเสียงของเบราว์เซอร์'); if (SR) setEngine('browser'); }
        else setErr(`ถอดเสียงไม่สำเร็จ (${data.error ?? res.status})`);
      } catch {
        setErr('ส่งเสียงไม่สำเร็จ — เช็คอินเทอร์เน็ต');
      }
      setState('idle');
    };
    rec.current = r;
    r.start(1000);
    setState('rec');
    setSecs(0);
    const t0 = Date.now();
    timer.current = window.setInterval(() => {
      const ms = Date.now() - t0;
      setSecs(Math.floor(ms / 1000));
      if (ms > MAX_MS) r.stop();
    }, 500);
  }

  function startBrowser() {
    setErr('');
    const s = new SR();
    s.lang = 'th-TH';
    s.continuous = true;
    s.interimResults = true;
    let gotAny = false;
    let errored = false;
    s.onresult = (e: any) => {
      gotAny = true;
      let fin = '';
      let tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t; else tmp += t;
      }
      if (fin) onText(fin);
      setInterim(tmp);
    };
    s.onerror = (e: any) => {
      errored = true;
      setErr(SR_ERR[e.error] ?? `ถอดเสียงผิดพลาด (${e.error})`);
    };
    s.onend = () => {
      setState('idle');
      setInterim('');
      if (!gotAny && !errored) setErr('ไม่ได้ข้อความกลับมา — เบราว์เซอร์นี้อาจไม่รองรับการถอดเสียง ลองใช้ Chrome, Edge หรือ Safari');
    };
    sr.current = s;
    s.start();
    setState('rec');
  }

  function toggle() {
    if (state === 'rec') { stopAll(); if (engine === 'browser') setState('idle'); return; }
    if (engine === 'whisper') startWhisper(); else if (engine === 'browser') startBrowser();
  }

  if (engine === null) return null;
  if (engine === 'none')
    return (
      <div className="mx-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
        <b>เบราว์เซอร์นี้ถอดเสียงไม่ได้</b>{BROKEN_SR ? ` (${BROKEN_SR})` : ''} — เปิดหน้านี้ด้วย Chrome, Edge หรือ Safari แทน
        หรือพิมพ์ตอบไปก่อน
      </div>
    );

  const label = state === 'rec' ? `หยุดอัด ${engine === 'whisper' ? fmt(secs) : ''}` : state === 'busy' ? 'กำลังถอดเสียง…' : 'กดเพื่อพูดตอบ';
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button" onClick={toggle} disabled={state === 'busy'}
        aria-label={label}
        className={`grid place-items-center rounded-full font-bold text-white shadow-lg transition ${big ? 'h-24 w-24 text-4xl' : 'h-14 w-14 text-2xl'} ${state === 'rec' ? 'animate-pulse bg-rose-600' : state === 'busy' ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {state === 'rec' ? <Square size={big ? 34 : 20} fill="currentColor" /> : state === 'busy' ? <LoaderCircle size={big ? 38 : 22} className="animate-spin" /> : <Mic size={big ? 42 : 24} />}
      </button>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {interim && <span className="text-sm italic text-slate-400">{interim}</span>}
      <span className="text-xs text-slate-400">{engine === 'whisper' ? 'ถอดเสียงด้วย Whisper (พูดจบแล้วกดหยุด)' : 'ถอดเสียงด้วยเบราว์เซอร์ (แบบสด)'}</span>
      {err && <span className="text-sm text-rose-600 dark:text-rose-400">{err}</span>}
      {last && (
        <details className="mx-4 max-w-full text-xs text-slate-500">
          <summary className="cursor-pointer text-center"><Sparkles size={13} className="inline" /> AI แก้คำที่ถอดเพี้ยนให้แล้ว — ดูข้อความดิบ</summary>
          <p className="mt-1 rounded-lg bg-slate-100 p-2 dark:bg-[#15253d]">{last.raw}</p>
          {onReplace && (
            <button type="button" className="mt-1 text-blue-600 underline dark:text-blue-300"
              onClick={() => { onReplace(last.fixed, last.raw); setLast(null); }}>ใช้ข้อความดิบแทน</button>
          )}
        </details>
      )}
    </div>
  );
}

/** เบราว์เซอร์ที่มี webkitSpeechRecognition แต่ใช้งานจริงไม่ได้ (ไม่มีบริการถอดเสียงของ Google) */
const BROKEN_SR: string | null = (() => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/\bOPR\/|\bOpera\b|OPX\//.test(ua)) return 'Opera';
  if ((navigator as any).brave) return 'Brave';
  if (/Vivaldi/.test(ua)) return 'Vivaldi';
  return null;
})();

const SR_ERR: Record<string, string> = {
  'not-allowed': 'ไม่ได้รับสิทธิ์ใช้ไมค์ — กดอนุญาตไมค์ที่แถบที่อยู่ของเบราว์เซอร์',
  'service-not-allowed': 'เบราว์เซอร์นี้ไม่อนุญาตให้ถอดเสียง — ลองใช้ Chrome, Edge หรือ Safari',
  network: 'ส่งเสียงไปถอดไม่ได้ — เบราว์เซอร์นี้อาจไม่รองรับ (เช่น Opera/Brave) หรือเน็ตหลุด',
  'no-speech': 'ไม่ได้ยินเสียงพูด ลองพูดใกล้ไมค์อีกครั้ง',
  'audio-capture': 'ไม่พบไมค์ — เช็คว่าเสียบไมค์/เลือกไมค์ถูกตัว',
  'language-not-supported': 'เบราว์เซอร์นี้ไม่รองรับการถอดเสียงภาษาไทย',
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
