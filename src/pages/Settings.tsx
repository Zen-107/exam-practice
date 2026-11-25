import { useEffect, useState, type ReactNode } from 'react';
import { Check, CircleAlert, CircleCheck, Cloud, Copy, Cpu, Eye, EyeOff, Globe, KeyRound, ListRestart, LoaderCircle, PlugZap, Server } from 'lucide-react';
import { Button, Card, CardTitle, Chips } from '../components/ui';
import { DEFAULT_SETTINGS, PRESETS, getAiSettings, saveAiSettings, type AiMode, type AiSettings } from '../store/aiSettings';
import { directChat, listModels } from '../grading/browserLlm';
import { describeDirectError, getHealth, type Health } from '../grading/client';

type Step = { label: string; state: 'wait' | 'run' | 'ok' | 'fail'; detail?: string };

export default function Settings() {
  const [s, setS] = useState<AiSettings>(getAiSettings);
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [modelsErr, setModelsErr] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => { getHealth().then(setHealth); }, []);

  const update = (patch: Partial<AiSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    saveAiSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };
  const setMode = (mode: AiMode) => {
    if (mode === 'server') return update({ mode });
    const keep = PRESETS.find((p) => p.id === s.preset && p.mode === mode);
    const p = keep ?? PRESETS.find((x) => x.mode === mode)!;
    applyPreset(p.id, mode);
  };
  const applyPreset = (id: string, mode = s.mode) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setModels([]); setModelsErr(''); setSteps(null);
    update({
      mode, preset: id, baseUrl: p.baseUrl || s.baseUrl, model: p.model ?? '',
      answerKeyChars: p.answerKeyChars ?? DEFAULT_SETTINGS.answerKeyChars,
      jsonMode: p.jsonMode ?? true,
      // AI ในเครื่อง (CPU) อ่าน prompt ช้า — ให้เวลา 300 วิ และไม่รีเซ็ตค่าที่ผู้ใช้ตั้งเองถ้ายังอยู่โหมดเดิม
      timeoutMs: mode === s.mode && s.timeoutMs ? s.timeoutMs : p.mode === 'local' ? 300_000 : 40_000,
      apiKey: p.mode === 'local' ? '' : s.apiKey,
    });
  };

  const fetchModels = async () => {
    setLoadingModels(true); setModelsErr('');
    try {
      const list = await listModels(s);
      setModels(list);
      if (!list.length) setModelsErr('server ยังไม่ได้โหลดโมเดลไว้');
      else if (!s.model || !list.includes(s.model)) update({ model: list[0] });
    } catch (e) {
      setModelsErr(describeDirectError(e));
    }
    setLoadingModels(false);
  };

  const test = async () => {
    const st: Step[] = [
      { label: 'ต่อ server ได้ (GET /models)', state: 'run' },
      { label: `โมเดล ${s.model || '(ยังไม่ได้เลือก)'} ตอบได้`, state: 'wait' },
    ];
    setSteps([...st]);
    try {
      const list = await listModels(s);
      st[0] = { ...st[0], state: 'ok', detail: list.length ? `พบ ${list.length} โมเดล` : 'ไม่พบโมเดล (บางผู้ให้บริการไม่แสดงรายชื่อ — ข้ามได้)' };
    } catch (e) {
      st[0] = { ...st[0], state: 'fail', detail: describeDirectError(e) };
      st[1] = { ...st[1], state: 'fail', detail: 'ข้ามเพราะข้อแรกไม่ผ่าน' };
      return setSteps([...st]);
    }
    st[1] = { ...st[1], state: 'run' };
    setSteps([...st]);
    const t0 = performance.now();
    try {
      const out = await directChat(s, [{ role: 'user', content: 'ตอบกลับด้วยคำว่า OK เท่านั้น' }], { timeoutMs: s.timeoutMs });
      st[1] = { ...st[1], state: 'ok', detail: `ตอบว่า "${out.slice(0, 40)}" ใน ${((performance.now() - t0) / 1000).toFixed(1)} วินาที` };
    } catch (e) {
      st[1] = { ...st[1], state: 'fail', detail: describeDirectError(e) };
    }
    setSteps([...st]);
  };

  const preset = PRESETS.find((p) => p.id === s.preset);
  const presetsForMode = PRESETS.filter((p) => p.mode === s.mode);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">ตั้งค่าตัวตรวจ AI</h1>
        <p className="text-slate-500">เลือกได้ว่าจะให้ใครตรวจคำตอบ — ค่าที่ตั้งเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น {saved && <span className="ml-1 inline-flex items-center gap-1 text-emerald-600"><Check size={14} /> บันทึกแล้ว</span>}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard active={s.mode === 'server'} onClick={() => setMode('server')} icon={Globe} title="ตัวตรวจของเว็บ"
          desc={health?.grader ? `พร้อม · ${health.graderModel ?? ''}` : 'ใช้โควตาร่วมกันของเว็บ'} badge="ค่าเริ่มต้น" />
        <ModeCard active={s.mode === 'local'} onClick={() => setMode('local')} icon={Cpu} title="AI ในเครื่องของฉัน"
          desc="LM Studio, Ollama, vLLM … ฟรี ไม่จำกัด ไม่ส่งคำตอบออกนอกเครื่อง" />
        <ModeCard active={s.mode === 'custom'} onClick={() => setMode('custom')} icon={KeyRound} title="API key ของฉัน"
          desc="Groq, Gemini, OpenRouter … ใช้โควตาของตัวเอง" />
      </div>

      {s.mode !== 'server' && (
        <>
          <Card className="flex flex-col gap-4">
            <CardTitle icon={s.mode === 'local' ? Server : Cloud}>{s.mode === 'local' ? 'โปรแกรมที่ใช้รัน AI' : 'ผู้ให้บริการ'}</CardTitle>
            <Chips items={presetsForMode.map((p) => ({ id: p.id, label: p.name }))} value={s.preset} onChange={(id) => applyPreset(id)} />

            <Field label="Base URL" hint="ต้องลงท้ายด้วย /v1 (หรือ path ของ OpenAI-compatible API)">
              <input value={s.baseUrl} onChange={(e) => update({ baseUrl: e.target.value.trim() })} className={inputCls} placeholder="http://localhost:1234/v1" />
            </Field>

            <Field label={s.mode === 'local' ? 'API key (ไม่ต้องใส่ ถ้าไม่ได้ตั้งไว้)' : 'API key'}
              hint={s.mode === 'custom' ? <>เก็บไว้ในเบราว์เซอร์นี้เท่านั้น ส่งตรงไปที่ผู้ให้บริการ ไม่ผ่าน server ของเว็บ · อย่าตั้งบนเครื่องสาธารณะ{preset?.link && <> · <a className="text-blue-600 underline dark:text-blue-300" href={preset.link} target="_blank" rel="noreferrer">ขอ key ที่นี่</a></>}</> : undefined}>
              <div className="flex gap-2">
                <input type={showKey ? 'text' : 'password'} autoComplete="off" value={s.apiKey} onChange={(e) => update({ apiKey: e.target.value.trim() })} className={inputCls} placeholder={s.mode === 'local' ? '(เว้นว่างได้)' : 'วาง key ที่นี่'} />
                <button type="button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? 'ซ่อน key' : 'แสดง key'} className="grid w-11 shrink-0 place-items-center rounded-lg border border-slate-300 dark:border-[#26385a]">{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </Field>

            <Field label="โมเดล" hint="กดดึงรายชื่อจาก server แล้วเลือก หรือพิมพ์ชื่อเองก็ได้">
              <div className="flex flex-col gap-2 sm:flex-row">
                {models.length > 0 ? (
                  <select value={s.model} onChange={(e) => update({ model: e.target.value })} className={inputCls}>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <input value={s.model} onChange={(e) => update({ model: e.target.value.trim() })} className={inputCls} placeholder="เช่น qwen2.5-7b-instruct" />
                )}
                <Button variant="ghost" onClick={fetchModels} disabled={loadingModels || !s.baseUrl} className="shrink-0">
                  {loadingModels ? <LoaderCircle size={18} className="animate-spin" /> : <ListRestart size={18} />} ดึงรายชื่อโมเดล
                </Button>
              </div>
              {modelsErr && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{modelsErr}</p>}
            </Field>

            <details className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-[#15253d]/60">
              <summary className="cursor-pointer font-semibold">ตั้งค่าขั้นสูง</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="รอคำตอบนานสุด (วินาที)">
                  <input type="number" min={10} value={Math.round(s.timeoutMs / 1000)} onChange={(e) => update({ timeoutMs: Math.max(10, Number(e.target.value) || 120) * 1000 })} className={inputCls} />
                </Field>
                <Field label="ส่งเฉลยให้ตัวตรวจ (ตัวอักษร)" hint="โมเดลเล็ก/context สั้น ใช้ 0–2000">
                  <input type="number" min={0} step={500} value={s.answerKeyChars} onChange={(e) => update({ answerKeyChars: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} />
                </Field>
                <Toggle checked={s.jsonMode} onChange={(v) => update({ jsonMode: v })} label="ขอผลเป็น JSON (response_format)" />
                <Toggle checked={s.fallbackToServer} onChange={(v) => update({ fallbackToServer: v })} label="ถ้า AI ของฉันใช้ไม่ได้ ใช้ตัวตรวจของเว็บแทน" />
              </div>
            </details>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={test} disabled={!s.baseUrl}><PlugZap size={18} /> ทดสอบการเชื่อมต่อ</Button>
              {!s.model && <span className="text-sm text-amber-600">ยังไม่ได้เลือกโมเดล — ตัวตรวจจะยังใช้ของเว็บ</span>}
            </div>
            {steps && (
              <ol className="flex flex-col gap-2">
                {steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {st.state === 'ok' ? <CircleCheck size={18} className="shrink-0 text-emerald-600" />
                      : st.state === 'fail' ? <CircleAlert size={18} className="shrink-0 text-rose-600" />
                      : st.state === 'run' ? <LoaderCircle size={18} className="shrink-0 animate-spin text-blue-600" />
                      : <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-slate-300" />}
                    <span><b>{st.label}</b>{st.detail && <span className="text-slate-500"> — {st.detail}</span>}</span>
                  </li>
                ))}
                {steps.every((x) => x.state === 'ok') && <li className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">พร้อมใช้! ต่อจากนี้คำตอบจะตรวจด้วย {s.model}</li>}
              </ol>
            )}
          </Card>

          {s.mode === 'local' && <LocalHowTo preset={s.preset} />}
          {s.mode === 'custom' && (
            <Card className="text-sm text-slate-600 dark:text-slate-300">
              <CardTitle icon={KeyRound}>หมายเหตุ</CardTitle>
              <ul className="mt-2 list-disc pl-5">
                <li>ผู้ให้บริการบางเจ้าไม่อนุญาตให้เว็บเรียกตรงจากเบราว์เซอร์ ถ้าทดสอบแล้วขึ้น "ต่อไม่ติด" ทั้งที่ key ถูก แปลว่าเจ้านั้นใช้กับวิธีนี้ไม่ได้ ให้ใช้ AI ในเครื่องหรือตัวตรวจของเว็บแทน</li>
                <li>ค่าใช้จ่าย/โควตาเป็นของบัญชีคุณเอง</li>
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const inputCls = 'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-[#26385a] dark:bg-[#081322]';

function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-blue-600" />
      <span>{label}</span>
    </label>
  );
}

function ModeCard({ active, onClick, icon: Icon, title, desc, badge }: { active: boolean; onClick: () => void; icon: typeof Globe; title: string; desc: string; badge?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition ${active ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/15' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-[#1d2d47] dark:bg-[#0d1a2d]'}`}>
      {active && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white"><Check size={13} strokeWidth={3} /></span>}
      <Icon size={26} className="text-blue-600 dark:text-blue-300" aria-hidden />
      <span className="font-bold">{title}</span>
      <span className="text-xs text-slate-500">{desc}</span>
      {badge && <span className="mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-[#15253d]">{badge}</span>}
    </button>
  );
}

function Cmd({ children }: { children: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="mt-1 flex items-start gap-2 rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-100">
      <code className="flex-1 whitespace-pre-wrap break-all">{children}</code>
      <button type="button" aria-label="คัดลอกคำสั่ง" onClick={() => { navigator.clipboard?.writeText(children).then(() => { setOk(true); setTimeout(() => setOk(false), 1200); }); }}
        className="shrink-0 rounded p-1 hover:bg-white/10">{ok ? <Check size={14} /> : <Copy size={14} />}</button>
    </div>
  );
}

/** วิธีเปิด AI ในเครื่อง + เปิดสิทธิ์ให้เว็บนี้เรียกได้ (CORS) — เติม origin ของเว็บนี้ให้อัตโนมัติ */
function LocalHowTo({ preset }: { preset: string }) {
  const origin = location.origin;
  const steps: Record<string, ReactNode[]> = {
    lmstudio: [
      <>ดาวน์โหลดและติดตั้ง <a className="text-blue-600 underline dark:text-blue-300" href="https://lmstudio.ai" target="_blank" rel="noreferrer">LM Studio</a></>,
      <>กดแท็บ <b>Discover</b> (รูปแว่นขยาย) ค้นหา <code>qwen2.5 7b instruct</code> เลือกไฟล์ <b>Q4_K_M</b> แล้วกด <b>Download</b></>,
      <>กดแท็บ <b>Developer</b> (ไอคอน <code>&gt;_</code>) → ด้านบนกด <b>Select a model to load</b> เลือกโมเดล (ตั้ง Context Length ≥ 8192)</>,
      <>ในหน้า Developer เปิด <b>Settings</b> แล้วเปิด <b>Enable CORS</b> ✱ สำคัญ ไม่งั้นเว็บเรียกไม่ได้</>,
      <>เปิดสวิตช์ <b>Status: Running</b> (Start Server)</>,
      <>กลับมาหน้านี้ กด <b>ดึงรายชื่อโมเดล</b> → <b>ทดสอบการเชื่อมต่อ</b></>,
    ],
    ollama: [
      <>ดาวน์โหลดและติดตั้ง <a className="text-blue-600 underline dark:text-blue-300" href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a></>,
      <>เปิด PowerShell / Terminal แล้วโหลดโมเดล <Cmd>ollama pull qwen2.5:7b</Cmd></>,
      <>อนุญาตให้เว็บนี้เรียก Ollama ได้ (ทำครั้งเดียว) — Windows (PowerShell):<Cmd>{`setx OLLAMA_ORIGINS "${origin}"\nsetx OLLAMA_CONTEXT_LENGTH 8192`}</Cmd>
        Mac:<Cmd>{`launchctl setenv OLLAMA_ORIGINS "${origin}"\nlaunchctl setenv OLLAMA_CONTEXT_LENGTH 8192`}</Cmd></>,
      <><b>ปิด Ollama ให้สนิท</b> (คลิกขวาไอคอนที่มุมจอ → Quit) แล้วเปิดใหม่ เพื่อให้ค่าใหม่มีผล</>,
      <>กลับมาหน้านี้ กด <b>ดึงรายชื่อโมเดล</b> → <b>ทดสอบการเชื่อมต่อ</b></>,
    ],
    vllm: [
      <>ต้องมีการ์ดจอ NVIDIA บน Linux หรือ Windows ผ่าน WSL2 — ติดตั้ง <Cmd>pip install vllm</Cmd></>,
      <>เปิด server (อนุญาตเว็บนี้แล้ว)<Cmd>{`vllm serve Qwen/Qwen2.5-7B-Instruct --port 8000 --max-model-len 8192 --allowed-origins '["${origin}"]'`}</Cmd></>,
      <>กลับมาหน้านี้ กด <b>ดึงรายชื่อโมเดล</b> → <b>ทดสอบการเชื่อมต่อ</b></>,
    ],
    llamacpp: [
      <>ดาวน์โหลด llama.cpp และไฟล์โมเดล <code>.gguf</code> (เช่น Qwen2.5 7B Instruct Q4_K_M)</>,
      <>เปิด server (llama-server อนุญาต CORS อยู่แล้ว)<Cmd>llama-server -m model.gguf --port 8080 -c 8192</Cmd></>,
      <>กลับมาหน้านี้ กด <b>ดึงรายชื่อโมเดล</b> → <b>ทดสอบการเชื่อมต่อ</b></>,
    ],
    jan: [
      <>ดาวน์โหลด <a className="text-blue-600 underline dark:text-blue-300" href="https://jan.ai" target="_blank" rel="noreferrer">Jan</a> แล้วโหลดโมเดลในแอป</>,
      <>ไปที่ Settings → <b>Local API Server</b> → เปิด CORS (ถ้ามีตัวเลือก) แล้วกด <b>Start Server</b></>,
      <>กลับมาหน้านี้ กด <b>ดึงรายชื่อโมเดล</b> → <b>ทดสอบการเชื่อมต่อ</b></>,
    ],
  };
  return (
    <Card className="flex flex-col gap-3">
      <CardTitle icon={Cpu}>วิธีเปิด AI ในเครื่อง</CardTitle>
      <ol className="flex flex-col gap-2.5">
        {(steps[preset] ?? steps.lmstudio).map((x, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
            <div className="min-w-0 flex-1 pt-0.5">{x}</div>
          </li>
        ))}
      </ol>
      <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
        <b>เบราว์เซอร์:</b> ใช้ Chrome หรือ Edge — ถ้าเบราว์เซอร์ถามว่าให้เว็บนี้ <b>เข้าถึงอุปกรณ์/แอปในเครือข่ายท้องถิ่น</b> ให้กด <b>อนุญาต (Allow)</b> ·
        Safari มักบล็อกการเรียก <code>http://localhost</code> จากเว็บ https
        <br />เครื่องแรงไม่พอ? ลองโมเดลเล็กลง (เช่น 3B–4B) และตั้ง "ส่งเฉลยให้ตัวตรวจ" เป็น 1000–2000 ในตั้งค่าขั้นสูง
      </div>
    </Card>
  );
}
