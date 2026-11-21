import { next } from '@vercel/functions';

/**
 * รหัสเข้าเว็บ (Vercel Routing Middleware — ทำงานก่อนทุก request บน Vercel, ไม่ทำงานตอน bun run dev)
 * - ตั้ง ACCESS_CODE ใน Vercel → Settings → Environment Variables (ใส่หลายรหัสคั่นด้วย , ได้)
 * - ไม่ตั้ง = เว็บเปิดให้ทุกคน
 * - ใส่รหัสถูก → เก็บ cookie 90 วัน · ล็อกทั้งหน้าเว็บ ไฟล์ข้อมูล และ /api (กันคนนอกใช้โควตา AI)
 */
export const config = { matcher: '/:path*' };

const COOKIE = 'cpe310_access';
const MAX_AGE = 60 * 60 * 24 * 90;
/** ไฟล์ที่ต้องเปิดได้โดยไม่มี cookie (manifest/ไอคอน ถูกโหลดแบบไม่ส่ง cookie) */
const PUBLIC = new Set(['/manifest.webmanifest', '/icon.svg', '/favicon.ico', '/robots.txt']);

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const codes = () => (process.env.ACCESS_CODE ?? '').split(',').map((c) => c.trim()).filter(Boolean);
const tokenOf = (code: string) => sha256(`cpe310-access:${code}`);

function readCookie(req: Request, name: string): string | undefined {
  const m = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1];
}

export default async function middleware(req: Request): Promise<Response> {
  const list = codes();
  if (!list.length) return next();
  const url = new URL(req.url);
  if (PUBLIC.has(url.pathname)) return next();

  // ส่งรหัสจากฟอร์ม
  if (url.pathname === '/__access' && req.method === 'POST') {
    const form = await req.formData().catch(() => null);
    const code = String(form?.get('code') ?? '').trim();
    const back = String(form?.get('back') ?? '/');
    const safeBack = back.startsWith('/') && !back.startsWith('//') ? back : '/';
    if (list.includes(code)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: safeBack,
          'set-cookie': `${COOKIE}=${await tokenOf(code)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return loginPage(safeBack, true);
  }

  const token = readCookie(req, COOKIE);
  if (token) {
    const valid = await Promise.all(list.map(tokenOf));
    if (valid.includes(token)) return next();
  }

  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'locked' }), { status: 401, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
  return loginPage(url.pathname + url.search, false);
}

function loginPage(back: string, wrong: boolean): Response {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const html = `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>CPE310 ฝึกสอบ — ใส่รหัส</title>
<style>
  :root { color-scheme: light dark; --bg:#f2f6fc; --card:#fff; --text:#0f172a; --muted:#64748b; --line:#cbd5e1; --blue:#2563eb; }
  @media (prefers-color-scheme: dark) { :root { --bg:#060f1d; --card:#0d1a2d; --text:#e2e8f0; --muted:#94a3b8; --line:#26385a; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--text);
    font-family: "Sarabun", "TH Sarabun New", system-ui, -apple-system, "Segoe UI", sans-serif; font-size:17px; }
  form { width:100%; max-width:360px; background:var(--card); border:1px solid var(--line); border-radius:20px; padding:28px; box-shadow:0 10px 30px rgb(0 0 0 / .08); }
  .logo { width:44px; height:44px; border-radius:12px; background:var(--blue); color:#fff; display:grid; place-items:center; font-weight:800; }
  h1 { font-size:1.4rem; margin:14px 0 4px; } p { margin:0 0 18px; color:var(--muted); }
  input { width:100%; min-height:48px; border:1px solid var(--line); border-radius:12px; padding:0 14px; font:inherit; background:transparent; color:inherit; }
  input:focus { outline:2px solid var(--blue); outline-offset:1px; }
  button { width:100%; min-height:48px; margin-top:12px; border:0; border-radius:12px; background:var(--blue); color:#fff; font:inherit; font-weight:700; cursor:pointer; }
  .err { color:#e11d48; margin:10px 0 0; }
</style></head>
<body><form method="post" action="/__access">
  <div class="logo">310</div>
  <h1>CPE310 ฝึกสอบ</h1>
  <p>เว็บนี้สำหรับกลุ่มเพื่อน ใส่รหัสที่ได้รับเพื่อเข้าใช้งาน</p>
  <input name="code" type="password" autocomplete="current-password" placeholder="รหัสเข้าเว็บ" required autofocus>
  <input name="back" type="hidden" value="${esc(back)}">
  <button type="submit">เข้าเว็บ</button>
  ${wrong ? '<p class="err">รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง</p>' : ''}
</form></body></html>`;
  return new Response(html, { status: wrong ? 401 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
