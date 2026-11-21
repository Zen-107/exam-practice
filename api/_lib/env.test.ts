import { afterEach, describe, expect, it } from 'vitest';
import { config, fetchWithKeys, isLocalUrl, keyList } from './env';
import { chat } from './llm';

const saved = { ...process.env };
afterEach(() => { process.env = { ...saved }; });

describe('keyList', () => {
  it('reads up to 9 slots, skips blanks and duplicates', () => {
    process.env.X_KEY = 'a';
    process.env.X_KEY_2 = ' ';
    process.env.X_KEY_3 = 'a';
    expect(keyList('X_KEY')).toEqual(['a']);
    process.env.X_KEY_2 = 'b';
    process.env.X_KEY_3 = 'c';
    expect(keyList('X_KEY')).toEqual(['a', 'b', 'c']);
  });
});

describe('fetchWithKeys', () => {
  it('uses only the first key when it works', async () => {
    const used: string[] = [];
    const r = await fetchWithKeys(['a', 'b'], async (k) => { used.push(k); return new Response('ok', { status: 200 }); });
    expect(r.status).toBe(200);
    expect(used).toEqual(['a']);
  });
  it('falls back on 429 and 401, not on 500', async () => {
    const codes: Record<string, number> = { a: 429, b: 401, c: 200 };
    const used: string[] = [];
    const r = await fetchWithKeys(['a', 'b', 'c'], async (k) => { used.push(k); return new Response('', { status: codes[k] }); });
    expect(used).toEqual(['a', 'b', 'c']);
    expect(r.status).toBe(200);
    const used2: string[] = [];
    const r2 = await fetchWithKeys(['a', 'b'], async (k) => { used2.push(k); return new Response('', { status: 500 }); });
    expect(used2).toEqual(['a']);
    expect(r2.status).toBe(500);
  });
  it('returns last 429 when all keys are exhausted', async () => {
    const r = await fetchWithKeys(['a', 'b'], async () => new Response('', { status: 429 }));
    expect(r.status).toBe(429);
  });
});

describe('local AI providers', () => {
  const clear = () => { for (const k of Object.keys(process.env)) if (/^(GRADER|GROQ|STT)_/.test(k)) delete process.env[k]; };
  it('reads key slots beyond 3', () => {
    clear();
    process.env.G_KEY = 'a'; process.env.G_KEY_5 = 'e';
    expect(keyList('G_KEY')).toEqual(['a', 'e']);
  });
  it('detects local / LAN servers', () => {
    for (const u of ['http://localhost:1234/v1', 'http://127.0.0.1:11434/v1', 'http://192.168.1.20:8000/v1', 'http://10.0.0.5:8080/v1', 'http://mypc.local:1234/v1'])
      expect(isLocalUrl(u), u).toBe(true);
    for (const u of ['https://api.groq.com/openai/v1', 'https://swuai.swu.ac.th/swu/api/service']) expect(isLocalUrl(u), u).toBe(false);
  });
  it('local grader needs no key, Groq is added as automatic fallback', () => {
    clear();
    process.env.GRADER_BASE_URL = 'http://localhost:1234/v1';
    process.env.GRADER_MODEL = 'qwen2.5-7b-instruct';
    process.env.GROQ_API_KEY = 'g1';
    const ps = config.graderProviders();
    expect(ps.map((p) => p.label)).toEqual(['local', 'api.groq.com']);
    expect(ps[0].keys).toEqual(['local']);
    expect(ps[0].timeoutMs).toBe(120_000);
    process.env.GRADER_GROQ_FALLBACK = 'false';
    expect(config.graderProviders()).toHaveLength(1);
  });
  it('without GRADER_BASE_URL, Groq keys grade directly', () => {
    clear();
    process.env.GROQ_API_KEY = 'g1';
    expect(config.graderProviders().map((p) => p.label)).toEqual(['api.groq.com']);
    expect(config.sttKeys()).toEqual(['g1']);
  });
  it('chat falls through to the next provider when the local server is down', async () => {
    clear();
    process.env.GRADER_BASE_URL = 'http://localhost:1/v1';
    process.env.GROQ_API_KEY = 'g1';
    const realFetch = globalThis.fetch;
    const hosts: string[] = [];
    globalThis.fetch = (async (url: string) => {
      hosts.push(new URL(url).hostname);
      if (url.includes('localhost')) throw new TypeError('fetch failed');
      return new Response(JSON.stringify({ choices: [{ message: { content: '<think>x</think>{"points":[]}' } }] }), { status: 200 });
    }) as typeof fetch;
    try {
      const r = await chat([{ role: 'user', content: 'hi' }]);
      expect(hosts).toEqual(['localhost', 'api.groq.com']);
      expect(r.ok && r.provider).toBe('api.groq.com');
      expect(r.ok && r.content).toBe('{"points":[]}');
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
