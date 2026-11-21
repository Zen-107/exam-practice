/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

/**
 * Dev-only: serve files in /api (Vercel function style: `export async function POST(req: Request)`)
 * through Vite, so `bun run dev` works without the Vercel CLI.
 */
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const name = url.pathname.replace(/^\//, '').split('/')[0];
          if (!/^[a-z-]+$/.test(name)) { res.statusCode = 404; return res.end('not found'); }
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod[req.method ?? 'GET'];
          if (typeof handler !== 'function') { res.statusCode = 405; return res.end('method not allowed'); }
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const request = new Request(`http://localhost/api${url.pathname}${url.search}`, {
            method: req.method, headers, body: body && req.method !== 'GET' ? body : undefined,
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // expose .env to the dev API handlers (process.env), never to the client bundle
  const root = fileURLToPath(new URL('.', import.meta.url));
  Object.assign(process.env, loadEnv(mode, root, ''));
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    server: { host: true, fs: { allow: ['..'] } },
    test: { include: ['src/**/*.test.ts', 'api/**/*.test.ts', 'middleware.test.ts'] },
  };
});
