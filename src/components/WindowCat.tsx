import { useEffect, useRef, useState } from 'react';
import { SPRITES, SPRITE_H, SPRITE_W, spriteRects, type Pose } from './pixelCat';

/**
 * แมวส้มพิกเซลเดินไปมาที่ขอบล่างของหน้าต่าง (ไม่ปีนขอบข้าง)
 * - เดิน (2 เฟรม) / นั่ง / หมอบ (loaf) / นอนเหยียด / นอนขดหลับ / หันกลับ / งอแงเล่นๆ พร้อมบอลลูนคำพูด
 * - สไปรต์มาจาก scripts/gen_pixel_cat.py
 * - แตะแมว = ลูบหัว · ซ่อนได้ที่ปุ่มแมวบนแถบบน
 * - ฟัง event "cat-say" เพื่อพูดข้อความจากส่วนอื่น (เช่น เตือนให้พัก)
 * (ไม่ผูกกับ prefers-reduced-motion เพราะ Windows ที่ปิด animation effects จะทำให้แมวไม่เดินเลย)
 */
const PX = 2;                 // 1 พิกเซลสไปรต์ = 2px
const W = SPRITE_W * PX;
const H = SPRITE_H * PX;
const RECTS = Object.fromEntries(Object.entries(SPRITES).map(([k, v]) => [k, spriteRects(v)])) as Record<Pose, ReturnType<typeof spriteRects>>;
const SPEED = 40;   // px/s
const EDGE = 8;     // ระยะห่างจากขอบซ้าย/ขวา

const IDLE_LINES = ['เมี้ยว~', 'อ่านถึงไหนแล้วเหมียว', 'Inference Engine คืออะไรน้า', 'สู้ๆ นะ', 'หิวปลาทู', 'ง่วงจัง…', 'ตั้งใจอ่านอยู่ใช่มั้ย'];
const GRUMPY_LINES = ['ไม่เอาาา ไม่อ่านแล้ว!', 'เล่นกับเค้าหน่อยสิ', 'เบื่อแล้วว หม่ำๆ', 'ฮึ่ม! สนใจเค้าบ้าง', 'งอนแล้ว ไม่คุยด้วย', 'ข้อสอบยากกว่าปลาทูอีก'];
const PET_LINES = ['ครืดดด~', 'ตรงนั้นแหละ ดีมาก', 'เมี้ยว ♡', 'ลูบอีกๆ', 'หายงอนแล้ว'];
const SLEEP_LINES = ['ง่วง… ขอนอนแป๊บ', 'Zzz…', 'ครอก~ ฟี้~'];
const WAKE_LINES = ['อ๊ะ ตื่นแล้ว!', 'ใครปลุกเค้า…'];

type Mood = 'walk' | 'sit' | 'loaf' | 'sleep' | 'grumpy' | 'pet';
const pickLine = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export function WindowCat() {
  const ref = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>('walk');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [say, setSay] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [sleepPose, setSleepPose] = useState<'lie' | 'curl'>('curl');
  const ctl = useRef({ until: 0, mood: 'walk' as Mood, sayUntil: 0, x: 0, frame: 0 });
  const [side, setSide] = useState<'left' | 'center' | 'right'>('center');

  const act = (m: Mood, ms: number, line?: string) => {
    ctl.current.mood = m;
    ctl.current.until = performance.now() + ms;
    setMood(m);
    if (line) {
      const x = ctl.current.x;
      setSide(x < 140 ? 'left' : x > window.innerWidth - 140 ? 'right' : 'center');
      setSay(line); ctl.current.sayUntil = performance.now() + Math.max(ms, 2800); }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = EDGE + W / 2 + Math.random() * 120;
    let dir: 1 | -1 = 1;
    let last = performance.now();
    let nextEvent = last + 5000 + Math.random() * 7000;
    let raf = 0;

    const place = () => {
      const max = window.innerWidth - EDGE - W / 2;
      x = Math.min(Math.max(x, EDGE + W / 2), max);
      ctl.current.x = x;
      el.style.transform = `translate(${x - W / 2}px, ${window.innerHeight - H + 2}px)`;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const c = ctl.current;
      if (c.sayUntil && now > c.sayUntil) { c.sayUntil = 0; setSay(null); }
      if (c.mood !== 'walk' && now > c.until) { c.mood = 'walk'; setMood('walk'); }

      if (c.mood === 'walk') {
        x += dir * SPEED * dt;
        const max = window.innerWidth - EDGE - W / 2;
        if (x >= max || x <= EDGE + W / 2) { dir = dir === 1 ? -1 : 1; setFacing(dir); }
        // สลับเฟรมขาเดิน ทุก ~16px
        const f = Math.floor(x / 16) % 2;
        if (f !== c.frame) { c.frame = f; setFrame(f); }
        if (now > nextEvent) {
          nextEvent = now + 9000 + Math.random() * 14000;
          const r = Math.random();
          if (r < 0.2) act('sit', 3000 + Math.random() * 4000, Math.random() < 0.5 ? pickLine(IDLE_LINES) : undefined);
          else if (r < 0.35) act('loaf', 5000 + Math.random() * 5000, Math.random() < 0.4 ? pickLine(IDLE_LINES) : undefined); // หมอบ
          else if (r < 0.5) { setSleepPose(Math.random() < 0.5 ? 'lie' : 'curl'); act('sleep', 9000 + Math.random() * 9000, pickLine(SLEEP_LINES)); } // นอน
          else if (r < 0.65) act('grumpy', 3200, pickLine(GRUMPY_LINES));                          // งอแงเล่นๆ
          else if (r < 0.8) { dir = dir === 1 ? -1 : 1; setFacing(dir); }                           // เปลี่ยนใจ หันกลับ
          else act('sit', 2000, pickLine(IDLE_LINES));
        }
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => { last = performance.now(); };
    const onSay = (e: Event) => act('sit', 6000, (e as CustomEvent<string>).detail);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', place);
    window.addEventListener('cat-say', onSay);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', place);
      window.removeEventListener('cat-say', onSay);
    };
  }, []);

  const sprite: Pose = mood === 'walk' ? (frame ? 'walk2' : 'walk1') : mood === 'sleep' ? sleepPose : mood;
  return (
    <div ref={ref} className={`window-cat is-${mood}`} style={{ width: W, height: H }}>
      {say && <div className={`cat-bubble side-${side}`} role="status">{say}</div>}
      {mood === 'pet' && <div className="cat-hearts" aria-hidden>♥</div>}
      <button type="button" aria-label="ลูบแมว" title="ลูบแมว" className="cat-hit"
        onClick={() => act('pet', 2200, pickLine(ctl.current.mood === 'sleep' ? WAKE_LINES : PET_LINES))}>
        <svg viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`} width={W} height={H} shapeRendering="crispEdges"
          style={{ transform: facing === -1 ? 'scaleX(-1)' : undefined }}>
          {RECTS[sprite].map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />)}
        </svg>
      </button>
    </div>
  );
}

/** ให้แมวพูด (ถ้าแมวเปิดอยู่) */
export const catSay = (text: string) => window.dispatchEvent(new CustomEvent('cat-say', { detail: text }));
