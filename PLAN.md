# CPE310 Exam Practice — โครงร่างโปรเจกต์

> เว็บแอปฝึกตอบข้อสอบ CPE310 ใช้ได้ทั้งมือถือ แท็บเล็ต iPad, PC และ Mac ตอบได้ด้วยเสียงหรือพิมพ์ แล้วตรวจว่าตอบถูกไหมแบบรายประเด็น
> เริ่มจาก `final_Ex/full_Ex_answer.md` (5 ข้อ) ก่อน ส่วน `Just_chose1` (132 ข้อ) ค่อยเพิ่มทีหลัง

**หลักการ:** ทำทีละชิ้น แต่ละชิ้นใช้งานได้และทดสอบได้เอง แล้วค่อยต่อเข้าด้วยกัน
**สถานะ:** ⬜ ยังไม่ทำ · 🟨 กำลังทำ · ✅ เสร็จ · ❓ ยังต้องตัดสินใจ

---

## ภาพรวมระบบ

```
[หน้าแรก: เลือก 🎤 เสียง / ⌨️ พิมพ์] → [เลือกข้อ / โหมดสอบจริง]
        ↓
[หน้าตอบ] → Input (เสียง→ข้อความที่แก้ได้ / พิมพ์ / ช่องตัวเลข / จับคู่ / เรียงลำดับ)
        ↓
[Normalize] → แยกตามชนิดข้อ
   ├─ numeric / matching / ordering → ตรวจด้วยโค้ด (แม่น 100%)
   └─ essay → AI ตรวจ (Claude API ผ่าน server) → โค้ดเช็คว่า quote มีอยู่ในคำตอบจริง
              (เน็ตหลุด/หมดโควตา → keyword fallback + บอกผู้ใช้ว่าตรวจหยาบ)
        ↓
[หน้าผล] ✅/⚠️/❌ รายประเด็น + ไฮไลต์หลักฐาน + hint + เฉลยเต็ม + 📍หน้าสไลด์ + ปุ่มยืนยันเอง
        ↓
[localStorage] ประวัติ + สถิติ + log การยืนยันเอง (ไว้ปรับ rubric)
```

**ชิ้นส่วน (ประกอบร่างทีหลัง):**

| ชิ้น | ทำอะไร | พึ่งชิ้นไหน |
|---|---|---|
| ① Data | `questions.json` + rubric | — |
| ② UI shell | หน้าจอทั้งหมด + responsive | ① |
| ③ Input | พิมพ์ / เสียง / ตัวเลข / จับคู่ / เรียงลำดับ | ② |
| ④ Deterministic grader | ตรวจตัวเลข คู่ ลำดับ | ① |
| ⑤ AI grader | API + prompt + quote check | ① |
| ⑥ Keyword fallback | ตรวจหยาบตอนไม่มีเน็ต | ① |
| ⑦ Result + history | หน้าผล + สถิติ | ④⑤⑥ |
| ⑧ Eval set | ชุดทดสอบวัด precision/recall | ①⑤ |
| ⑨ Deploy + PWA | ขึ้น Vercel + ติดตั้งบนมือถือ | ทั้งหมด |

---

## Phase 0 — ตัดสินใจก่อนเริ่ม ✅

**ข้อบังคับ: งบ 0 บาท** ทุกอย่างต้องใช้ free tier และไม่ต้องผูกบัตร

| เรื่อง | ที่เลือก | หมายเหตุ |
|---|---|---|
| Framework | **Vite + React + TS + Tailwind v4** | API เป็น Vercel function ใน `api/` (ตอน dev รันผ่าน Vite middleware ได้เลย) |
| Package manager | bun | |
| Hosting | **Vercel Hobby (ฟรี)** | static + serverless function · สำรองได้ด้วย Cloudflare Pages |
| STT หลัก | **Groq `whisper-large-v3` (free tier)** | ส่งศัพท์ของข้อนั้นไปใน `prompt` เป็น vocabulary hint ได้ · ไม่ต้องใช้บัตร · จำกัดราว 20 ครั้ง/นาที, 2,000 ครั้ง/วัน (ต้องเช็คตัวเลขจริงใน console) |
| STT สำรอง | **Web Speech API** (ในเบราว์เซอร์ ฟรี) | ใช้ตอนไม่มี key หรือ Groq ล่ม · Firefox ใช้ไม่ได้ |
| AI ตรวจ | **SWU AI** (`https://swuai.swu.ac.th/swu/api/service`, โมเดล `anthropic/claude-sonnet-5.5`) | ฟรีสำหรับนิสิต · ใช้ endpoint `/chat/completions` แบบ OpenAI ไม่ต้องส่ง User ID · สำรองด้วย Groq / Gemini free tier ผ่าน env |
| โมเดลตรวจ | ตั้งใน `GRADER_MODEL` | เลือกจากผล eval ใน Phase 7 |
| ผู้ใช้ | แชร์เพื่อนได้ | ใช้โควตา free tier ร่วมกัน · โดน 429 → แจ้งผู้ใช้และใช้ keyword fallback |
| API key | **3 ช่อง** (`*_API_KEY`, `_2`, `_3`) | ใช้ช่องแรกเสมอ ขยับไปช่องถัดไปเฉพาะเมื่อโดน 429/401/403 · ช่องสำรองเว้นว่างได้ · **ไม่ใช่ทางหลัก** ทางหลักคือ keyword fallback + ไม่ตรวจซ้ำโดยไม่จำเป็น |

> ⚠️ ถ้าใช้ free tier ข้อมูลที่ส่งไปอาจถูกผู้ให้บริการนำไปใช้ (โดยเฉพาะ Gemini free tier) ต้องแจ้งในแอปว่าเสียงและคำตอบถูกส่งออกไปตรวจนอกเครื่อง

---

## Phase 1 — Data: แปลงเฉลยเป็น `questions.json` 🟨 (ร่างเสร็จใน `src/data/full_Ex.ts` — รอ QC)

**เป้าหมาย:** เฉลยที่เครื่องตรวจได้ ชิ้นนี้สำคัญที่สุด เพราะความแม่นของการตรวจขึ้นกับ rubric

**ขั้นตอน**
1. กำหนด schema (TypeScript type + JSON) ให้เสร็จก่อน
2. แตกข้อสอบเป็นการ์ด:
   - ข้อ 1 → 6 การ์ด (AI, CI, ES, Fuzzy, ANN, NLP)
   - ข้อ 2 → (ก) จับคู่ 4 คู่ (ข) อธิบายการทำงาน (ค) ความเหมือนและความต่าง
   - ข้อ 3 → (ก) เรียงขั้นตอน KE (ข) เรียงขั้นตอน DE (ค) เปรียบเทียบ + ความเหมือน
   - ข้อ 4 → 4.1 essay · 4.2 numeric (ผลรวม 8 ค่า, w₁, w₂, b, MSE)
   - ข้อ 5 → (ก) ฉลาดกว่าไหม (ข) คืออะไร + ขั้นตอน (ค) ความสำคัญ
3. เขียน rubric ทีละการ์ด
4. **ตรวจ 📍slideRef ทุกจุดกับเฉลยและไฟล์สไลด์จริง** (ห้ามเชื่อร่างที่ AI เขียน)

**Schema ร่าง**
```ts
type Question = {
  id: string; exam: "full_Ex" | "Just_chose1"; part: string; topic: string;
  type: "essay" | "numeric" | "matching" | "ordering";
  weight: number;               // % ในข้อสอบจริง
  prompt: string;
  slideRefs: { file: string; pages: string }[];
  rubric?: RubricPoint[];       // essay
  numericFields?: { id: string; label: string; expected: number; tol: number; weight: number }[];
  pairs?: { left: string; right: string }[];   // matching
  order?: string[];                            // ordering (ลำดับที่ถูก)
  fullAnswer: string;           // markdown จากเฉลย
};
type RubricPoint = {
  id: string; text: string; weight: number;
  required?: boolean; bonus?: boolean;
  wrongIf?: string[];           // เกณฑ์ที่ถือว่าผิด เช่น "บอกว่าค่าเป็น 0 หรือ 1 เท่านั้น"
  keywords?: string[][];        // fallback: AND ของ OR
  hint: string;                 // แสดงเมื่อขาดประเด็นนี้
};
```

**เสร็จเมื่อ:** การ์ดครบทุกข้อ + rubric ผ่านการตรวจจากเรา + slideRef ถูกทุกจุด

---

## Phase 2 — UI shell ✅ (ทดสอบที่ 375px และ desktop แล้ว)

**เป้าหมาย:** เดินครบทุกหน้าได้ด้วยข้อมูลจริง ส่วนการตรวจใช้ผลปลอมไปก่อน

**หน้าจอ**
1. **Home** — เลือกโหมด 🎤/⌨️ (จำค่าไว้) + เลือก "ฝึกรายข้อ" หรือ "สอบจริง (5 ข้อ จับเวลา)"
2. **Question list** — การ์ดทุกข้อ พร้อมคะแนนล่าสุด
3. **Answer** — โจทย์ + น้ำหนักคะแนน + ช่องตอบตามชนิดข้อ + ปุ่มส่ง
4. **Result** — รายประเด็น + เฉลย + 📍 + ถัดไป
5. **Stats** — ข้อที่อ่อน + ปุ่มฝึกเฉพาะข้อที่ได้คะแนนต่ำ

**Responsive:** มือถือ (เต็มจอ ปุ่มใหญ่ กดง่ายด้วยนิ้วโป้ง) · แท็บเล็ต/iPad (โจทย์กับคำตอบอยู่คู่กัน) · PC/Mac (แสดง 2 คอลัมน์ + คีย์ลัด) · มี dark mode

**เสร็จเมื่อ:** ทดสอบใน browser ที่ 375px, 768px และ 1280px แล้วไม่มี horizontal scroll และเดินครบทุก flow

---

## Phase 3 — Input ✅ (โค้ดเสร็จ — โหมดเสียงยังไม่ได้ลองกับไมค์จริง)

| ชนิด | วิธี | หมายเหตุ |
|---|---|---|
| พิมพ์ | textarea ปรับความสูงอัตโนมัติ + autosave draft | — |
| เสียง (หลัก) | อัดด้วย MediaRecorder → `/api/transcribe` → Groq Whisper (`language=th`, `prompt` = ศัพท์ใน rubric ของข้อนั้น) | ข้อความที่ถอดได้ **แก้ไขได้ก่อนส่ง** · Safari ได้ไฟล์ mp4 ส่วน Chrome ได้ webm ซึ่ง Groq รับได้ทั้งคู่ |
| เสียง (สำรอง) | Web Speech API `th-TH` | ใช้ตอน server ไม่มี key · Firefox ไม่รองรับ จะแสดงให้ใช้โหมดพิมพ์แทน |
| ตัวเลข | ช่อง input แบบ `inputmode="decimal"` | ใช้กับข้อ 4.2 ในทุกโหมด |
| จับคู่ | แตะซ้ายแล้วแตะขวา (ใช้นิ้วได้ ไม่ต้องลาก) | ข้อ 2(ก) |
| เรียงลำดับ | ลากเรียง + ปุ่ม ↑↓ สำรอง | ข้อ 3 |

### Phase 3b — ทดลอง STT ด้วยเสียงจริง (ต้องใช้เสียงของเรา) ⬜

1. อัดเสียงตอบข้อสอบจริงประมาณ 20 คลิป ทั้งพูดคล่องและพูดตะกุกตะกัก ไทยปนอังกฤษ
2. ถอดคลิปชุดเดียวกันด้วย 3 แบบ: Web Speech · Whisper ไม่ใส่ hint · Whisper ใส่ hint
3. วัด **term recall** คือศัพท์ใน rubric ถอดออกมาถูกกี่ %
4. เอาข้อความที่ถอดได้เข้าตัวตรวจ เทียบคะแนนกับตอนพิมพ์คำตอบเดียวกัน
5. คำที่ยังเพี้ยน → เพิ่มลงตาราง `ASR_FIX` และรายการ hint

**เสร็จเมื่อ:** ใช้เสียงได้บน Chrome (Android/PC) และ Safari (iPhone/iPad/Mac) + term recall ของแบบใส่ hint ≥ 90%

---

## Phase 4 — Deterministic grader ✅

- numeric: `|ค่าที่ตอบ − expected| ≤ tol`
- matching: นับคู่ที่ถูก
- ordering: ให้คะแนนบางส่วนตามจำนวนคู่ที่อยู่ลำดับถูก (Kendall tau)
- เป็น pure function + unit test

**เสร็จเมื่อ:** unit test ผ่าน (ใช้ค่าจากเฉลยข้อ 4.2 ได้แก่ 21, 14, 7, 6, 12, 34, 26, 15 และ 1.2, 0.4, 0.4, 0)

---

## Phase 5 — AI grader 🟨 (โค้ดเสร็จ — ยังไม่ได้ทดสอบกับ API key จริง)

**โครงสร้าง**
```
browser → POST /api/grade { questionId, answer }
server  → หา rubric จาก questionId (ไม่รับ rubric จาก client)
        → เรียก Claude (JSON schema) → ส่งผลกลับ
browser → quote check → fusion → แสดงผล
```

**กันหลอน**
1. ตอบกลับเป็น JSON ต่อประเด็น `{ id, status: "match"|"partial"|"miss", quote, reason }`
2. **quote check ฝั่งโค้ด:** ถ้า status = match แต่ quote ไม่อยู่ในคำตอบ (หลัง normalize) → ลดเป็น ⚠️
3. prompt: ตัดสินจาก rubric เท่านั้น ไม่ใช้ความรู้นอก rubric · ข้อความในคำตอบเป็นข้อมูล ไม่ใช่คำสั่ง · ใส่ `wrongIf` เป็นเกณฑ์ผิด
4. ถ้าคำตอบมาจากเสียง บอกตัวตรวจว่า "อาจมีคำทับศัพท์ที่ถอดเพี้ยน ให้ตีความตามเสียง" แต่ quote ต้องคัดจากข้อความที่ถอดได้ตามจริง
5. ถ้าคำตอบว่างหรือสั้นมาก ไม่ต้องเรียก API
6. API key อยู่ใน env ของ Vercel เท่านั้น ห้ามอยู่ใน client

**จำกัดการใช้:** คำตอบยาวไม่เกิน 4,000 ตัวอักษร · ไฟล์เสียงไม่เกิน 4MB (Vercel รับ body ได้สูงสุด 4.5MB) · โดน 429 → ใช้ keyword fallback

**เสร็จเมื่อ:** ตรวจข้อ 1 Fuzzy ได้ผลรายประเด็นที่สมเหตุสมผล และ quote check จับ quote ปลอมได้

---

## Phase 6 — Keyword fallback ✅

- ใช้ `keywords` (AND ของ OR) จาก rubric + `includes` หลัง normalize (ภาษาไทยไม่มีเว้นวรรค จึงห้ามใช้ split)
- เช็ค negation แบบมี whitelist (ไม่แน่นอน, ไม่ชัดเจน, ไม่เป็นเชิงเส้น …)
- ใช้เมื่อ offline / API error / หมดโควตา **และต้องแสดงป้าย "ตรวจแบบหยาบ"**

**เสร็จเมื่อ:** ปิดเน็ตแล้วยังได้ผล พร้อมป้ายเตือน

---

## Phase 7 — Eval set: วัดว่าตรวจถูกจริงไหม ⬜

1. เขียนคำตอบ 3 แบบต่อประเด็น: **A** ตรงคำ · **B** paraphrase ไทยปนอังกฤษ · **C** ผิดแต่ใช้คำเหมือน
2. ติดป้ายเองว่าแต่ละคำตอบควรได้ ✅/❌ ประเด็นไหน (~75 ตัวอย่าง)
3. สคริปต์รันชุดนี้ผ่าน AI grader และ keyword fallback → ทำ confusion matrix
4. เป้า: **precision ≥ 0.90** (ห้ามให้คะแนนคำตอบผิด) · **recall ≥ 0.85**
5. ไม่ผ่านเป้า → แก้ rubric / `wrongIf` / prompt แล้ววัดซ้ำ (ถ้า haiku ไม่ผ่านค่อยลอง sonnet)

**เสร็จเมื่อ:** มีตัวเลขจริงของทั้ง 2 วิธี และผ่านเป้า

> Phase นี้เริ่มได้พร้อม Phase 5 เพราะใช้ข้อมูลจาก Phase 1 อย่างเดียว

---

## Phase 8 — Result + history ✅

- คะแนน % (โบนัสไม่เกิน 100) + ✅/⚠️/❌ + ไฮไลต์ quote ในคำตอบ + hint + เฉลยเต็ม + 📍
- ปุ่ม "ฉันตอบประเด็นนี้แล้ว / ยังไม่ตอบ" → แก้คะแนน + log ไว้ปรับ rubric
- โหมดฝึก: ⚠️ ได้ครึ่งคะแนน · โหมดสอบ: ⚠️ ได้ 0 แล้วให้ review ตอนจบ
- localStorage (ครอบด้วย try/catch) + ปุ่ม export JSON

---

## Phase 9 — PWA + Deploy 🟨 (manifest + service worker เสร็จ — ยังไม่ได้ deploy, ไอคอนยังเป็น SVG ซึ่ง iOS อาจไม่แสดง)

- manifest + service worker (cache หน้าจอและ `questions.json` ไว้ใช้ offline)
- deploy Vercel + ตั้ง env `ANTHROPIC_API_KEY`
- ทดสอบบนเครื่องจริง: iPhone Safari, iPad, Android Chrome, PC Chrome/Edge, Mac Safari

**เสร็จเมื่อ:** เพิ่มลงหน้าจอโฮมได้ และใช้ครบ flow บนทุกเครื่องในรายการ

---

## Phase 10 — Just_chose1 🟨 (ใช้งานได้ — rubric ยังเป็นร่างอัตโนมัติ รอ QC)

- ✅ แยกเป็นชุดที่ 2 เลือกได้จากหน้าแรก (`src/data/subjects.ts`) · กระดาษมี 131 ข้อ (ไม่มีข้อ 72)
- ✅ `scripts/extract_just_chose1.py` ดึงโจทย์จาก PDF + เฉลยจาก md → `src/data/just_chose1.json` (ข้อที่มีตารางกฎเขียนโจทย์ทับเองใน `OVERRIDES`)
- ✅ rubric สร้างอัตโนมัติจากเฉลย (แถวตาราง / bullet / หัวข้อ ###) และส่งเฉลยเต็มให้ AI ตรวจประกอบ · ข้อ "ดูข้อ N" ดึงเฉลยข้อนั้นมาต่อ
- ✅ ตัวกรองตามหมวด (พื้นฐาน AI / Search / Knowledge & Inference / โจทย์ทำ / ทบทวนรวม) + ค้นหา + โหมดสุ่มสอบ 10 ข้อ
- ⬜ QC rubric ทีละหมวด โดยเฉพาะโจทย์ทำ (ข้อ 51–91) ที่แถวตารางขั้นตอนถูกนับเป็นประเด็น

## UI (เพิ่ม)

- ✅ ฟอนต์ Sarabun (TH Sarabun) ฝังในแอปผ่าน @fontsource ใช้ offline ได้
- ✅ โหมดสว่าง / มืด / ตามเครื่อง (ปุ่มบนแถบบน)
- ✅ ไอคอน lucide แทนอีโมจิทั้งหมด (รวม 📍 ✓ ✗ ในเฉลย)
- ✅ แมวส้มเดินรอบขอบหน้าต่าง (ปิดได้ที่ปุ่มแมว)
- ✅ จองที่วิชาที่ 2 (`CPE3XX` placeholder ใน `subjects.ts`)

---

## ลำดับที่แนะนำ

```
Phase 0 → 1 → 2 → 4 → 3 → 5 ┬→ 7 → 8 → 6 → 9 → 10
                            └ (7 เริ่มพร้อม 5 ได้)
```
เหตุผล: ข้อมูลต้องมาก่อนทุกอย่าง · ตัวตรวจแบบ deterministic ง่ายและแม่น ทำก่อนได้กำลังใจ · โหมดเสียงต้องทดลองบนเครื่องจริง · AI grader ต้องวัดด้วย eval ก่อนเชื่อผล · fallback ทำทีหลังเพราะเป็นทางสำรอง

## โครงสร้างโฟลเดอร์ (ร่าง)

```
exam-practice/
├─ PLAN.md
├─ data/full_Ex.questions.json
├─ eval/full_Ex.cases.json, run-eval.ts
├─ api/grade.ts                 # Vercel function
├─ src/
│  ├─ pages/ Home, QuestionList, Answer, Result, Stats
│  ├─ input/ TextInput, VoiceInput, NumericInput, MatchingInput, OrderingInput
│  ├─ grading/ normalize.ts, deterministic.ts, aiClient.ts, quoteCheck.ts, keyword.ts, fusion.ts
│  └─ store/ history.ts
└─ public/ manifest.webmanifest, icons
```
