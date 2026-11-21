import { afterEach, describe, expect, it } from 'vitest';
import middleware from './middleware';

const saved = process.env.ACCESS_CODE;
afterEach(() => { process.env.ACCESS_CODE = saved; });
const isNext = (r: Response) => r.headers.get('x-middleware-next') === '1';
const post = (code: string, back = '/#/list') => {
  const body = new FormData();
  body.set('code', code); body.set('back', back);
  return new Request('https://x.vercel.app/__access', { method: 'POST', body });
};

describe('access code gate', () => {
  it('open when ACCESS_CODE is not set', async () => {
    delete process.env.ACCESS_CODE;
    expect(isNext(await middleware(new Request('https://x.vercel.app/')))).toBe(true);
  });
  it('shows login page / locks api without cookie', async () => {
    process.env.ACCESS_CODE = 'mango';
    const page = await middleware(new Request('https://x.vercel.app/assets/index.js'));
    expect(isNext(page)).toBe(false);
    expect(await page.text()).toContain('รหัสเข้าเว็บ');
    const api = await middleware(new Request('https://x.vercel.app/api/grade', { method: 'POST' }));
    expect(api.status).toBe(401);
    expect(isNext(await middleware(new Request('https://x.vercel.app/manifest.webmanifest')))).toBe(true);
  });
  it('wrong code rejected, right code sets cookie that unlocks everything', async () => {
    process.env.ACCESS_CODE = 'mango, durian';
    expect((await middleware(post('apple'))).status).toBe(401);
    const ok = await middleware(post('durian'));
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe('/#/list');
    const cookie = ok.headers.get('set-cookie')!.split(';')[0];
    expect(isNext(await middleware(new Request('https://x.vercel.app/api/grade', { headers: { cookie } })))).toBe(true);
    // เปลี่ยนรหัสแล้ว cookie เก่าใช้ไม่ได้
    process.env.ACCESS_CODE = 'newcode';
    expect(isNext(await middleware(new Request('https://x.vercel.app/', { headers: { cookie } })))).toBe(false);
  });
  it('does not redirect to other sites', async () => {
    process.env.ACCESS_CODE = 'mango';
    expect((await middleware(post('mango', '//evil.com'))).headers.get('location')).toBe('/');
  });
});
