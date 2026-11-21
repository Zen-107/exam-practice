# CPE310 ฝึกสอบ AI

เว็บแอปฝึกตอบข้อสอบ CPE310 (เริ่มจาก Final Exam `full_Ex`) ใช้ได้บนมือถือ แท็บเล็ต และคอม พูดหรือพิมพ์ตอบได้ ตรวจทีละประเด็นตาม rubric ในเฉลย
ดูแผนงานทั้งหมดใน [PLAN.md](PLAN.md)

## รันในเครื่อง

```powershell
bun install
copy .env.example .env   # แล้วใส่ GROQ_API_KEY (ไม่ใส่ก็ใช้ได้ แต่ตรวจด้วยคำสำคัญอย่างเดียว)
bun run dev
```

- **ใช้ AI ในเครื่องตัวเอง** (LM Studio / Ollama / vLLM) ไม่เปลืองโควตา cloud — เพื่อนที่เปิดเว็บที่ deploy ไว้ตั้งเองได้ในหน้า **ตั้งค่าตัวตรวจ** (ไอคอนเฟือง) ดู [docs/LOCAL_AI.md](docs/LOCAL_AI.md)
- `bun run test` เทสต์ตัวตรวจ (ตัวเลข/จับคู่/เรียงลำดับ/keyword/quote check)
- `bun run build` typecheck + build

## Deploy ฟรี (งบ 0 บาท)

| บริการ | ใช้ทำอะไร | ค่าใช้จ่าย |
|---|---|---|
| Vercel Hobby | เว็บ + `api/*` serverless | ฟรี ไม่ต้องใช้บัตร |
| SWU AI | AI ตรวจคำตอบ (`anthropic/claude-sonnet-5.5`) | ฟรีสำหรับนิสิต มศว — ขอ key ที่ swuai.swu.ac.th |
| Groq free tier | ถอดเสียง (`whisper-large-v3`) + ตัวตรวจสำรอง | ฟรี ไม่ต้องใช้บัตร (มีโควตาต่อนาที/วัน) |
| Gemini free tier (ทางเลือก) | AI ตรวจคำตอบแทน Groq | ฟรี — แต่ข้อมูลอาจถูกใช้ปรับปรุงโมเดล |

1. สมัคร Groq แล้วสร้าง key ที่ https://console.groq.com/keys
2. เอาโฟลเดอร์ `exam-practice` ขึ้น GitHub แล้ว Import บน https://vercel.com/new (Framework: Vite, Root: `exam-practice` ถ้า repo มีหลายโฟลเดอร์)
3. ใน Vercel → Settings → Environment Variables ใส่ค่าตาม `.env.example` (อย่างน้อย `GROQ_API_KEY`)
   - มีช่องสำรอง `_2` … `_9` ให้ใส่ key เพิ่มได้ ระบบจะใช้ช่องสำรองเฉพาะตอนช่องก่อนหน้าโดน 429/401/403 ไม่ได้สลับ key ไปมา
   - ⚠️ ผู้ให้บริการส่วนใหญ่นับโควตาต่อบัญชีหรือองค์กร key หลายตัวในบัญชีเดียวกันจึงใช้โควตาก้อนเดียวกัน และการเปิดหลายบัญชีเพื่อเลี่ยงโควตาอาจผิดเงื่อนไขการใช้งาน จึงไม่ควรพึ่งวิธีนี้เป็นทางหลัก
4. Deploy แล้วเปิดลิงก์บนมือถือ → "เพิ่มลงหน้าจอโฮม"

> เช็คชื่อโมเดลใน `GRADER_MODEL` / `STT_MODEL` กับหน้า Models ของผู้ให้บริการก่อน deploy เพราะรายชื่อโมเดลฟรีเปลี่ยนบ่อย

## โครงสร้าง

```
api/                 Vercel functions: grade (AI ตรวจ), transcribe (STT), health
api/_lib/            env + prompt ของตัวตรวจ
src/data/            ข้อสอบ + rubric (full_Ex.ts) และเฉลยเต็ม (.md)
src/grading/         normalize, ตรวจแบบตรงตัว, keyword fallback, quote check, คะแนน
src/input/           ช่องตอบ: พิมพ์, เสียง, ตัวเลข, จับคู่, เรียงลำดับ
src/pages/           Home, รายข้อ, ฝึก, สอบจริง, สถิติ
```

## เว็บที่ deploy แล้ว

- ลิงก์: <https://cpe310-exam-practice.vercel.app> (Vercel project `cpe310-exam-practice`, region สิงคโปร์)
- **รหัสเข้าเว็บ:** ตั้งใน Vercel → Settings → Environment Variables → `ACCESS_CODE` (หลายรหัสคั่นด้วย `,`) แล้ว redeploy — เปลี่ยนรหัสแล้วทุกคนต้องใส่ใหม่ · ลบตัวแปรนี้ = เปิดเว็บให้ทุกคน
- deploy ใหม่หลังแก้โค้ด: `bun x vercel@48.1.0 deploy --prod`
- ตัวตรวจบน Vercel ใช้ Groq (`GROQ_API_KEY` … `_5`) — **SWU AI ตอบ 403 เมื่อเรียกจาก server นอกเครือข่าย** จึงไม่ได้ตั้งไว้บน Vercel
  นิสิต มศว ใส่ SWU AI key ของตัวเองได้ในหน้า **ตั้งค่าตัวตรวจ → API key ของฉัน → SWU AI** (เบราว์เซอร์เรียกตรง ใช้ได้)
