import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Check, CircleAlert, CircleCheck, ClipboardList, Dices, FilePlus2, GraduationCap, Keyboard, ListChecks, Lock, Mic, Timer } from 'lucide-react';
import { Button, Card, IconTile } from '../components/ui';
import { getAttempts, getMode, setMode, type InputMode } from '../store/history';
import { getHealth, type Health } from '../grading/client';
import { examSummary, randomQuestion, SUBJECTS, type ExamSet, type Subject } from '../data/subjects';
import { setLastSet } from '../store/prefs';
import { getAiSettings, usesOwnAi } from '../store/aiSettings';
import { go } from '../router';

function progressOf(set: ExamSet, last: Map<string, number>) {
  const done = set.questions.filter((q) => last.has(q.id));
  const avg = done.length ? Math.round(done.reduce((s, q) => s + last.get(q.id)!, 0) / done.length) : null;
  const weak = done.filter((q) => last.get(q.id)! < 60).length;
  return { done: done.length, total: set.questions.length, avg, weak };
}

export default function Home() {
  const [mode, setM] = useState<InputMode>(getMode());
  const [health, setHealth] = useState<Health | null>(null);
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  useEffect(() => { getHealth().then(setHealth); }, []);
  const choose = (m: InputMode) => { setM(m); setMode(m); };

  const last = new Map<string, number>();
  for (const a of getAttempts()) last.set(a.questionId, a.result.percent);

  const subject = SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0];
  const all = subject.sets.map((s) => progressOf(s, last));
  const done = all.reduce((s, p) => s + p.done, 0);
  const total = all.reduce((s, p) => s + p.total, 0);
  const scored = all.filter((p) => p.avg !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, p) => s + p.avg! * p.done, 0) / done) : null;
  const weak = all.reduce((s, p) => s + p.weak, 0);

  const openList = (set: ExamSet) => { setLastSet(set.id); go(`list/${set.id}`); };
  const openRandom = (set: ExamSet) => { setLastSet(set.id); go(`q/${randomQuestion(set.id).id}`); };

  return (
    <div className="flex flex-col gap-6">
      {/* เลือกวิชา */}
      <section>
        <h2 className="mb-3 text-lg font-bold">วิชา</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBJECTS.map((s) => <SubjectButton key={s.id} s={s} active={s.id === subject.id} onClick={() => setSubjectId(s.id)} />)}
        </div>
      </section>

      {subject.placeholder ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <IconTile icon={FilePlus2} tone="slate" size="lg" />
          <h1 className="text-xl font-extrabold">{subject.code} · ยังไม่มีข้อสอบ</h1>
          <p className="max-w-md text-slate-500">จองที่ไว้สำหรับวิชาถัดไป เพิ่มชุดข้อสอบได้ใน <code className="rounded bg-slate-100 px-1.5 dark:bg-[#15253d]">src/data/subjects.ts</code> (ใช้ชนิดคำถามเดียวกับ CPE310: อธิบาย คำนวณ จับคู่ เรียงลำดับ)</p>
        </Card>
      ) : (
        <>
          {/* hero */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg shadow-blue-900/20 sm:p-8 dark:from-[#123566] dark:to-[#0b1f3d]">
            <p className="flex items-center gap-2 text-blue-100"><GraduationCap size={18} aria-hidden /> {subject.code} {subject.name}</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">ฝึกตอบข้อสอบ</h1>
            <p className="mt-1 text-blue-100">ตอบแล้วตรวจทีละประเด็นตามเฉลย พร้อมบอกว่าขาดอะไร</p>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <Stat label="ทำแล้ว" value={`${done}/${total}`} />
              <Stat label="คะแนนเฉลี่ย" value={avg === null ? '–' : `${avg}%`} />
              <Stat label="ต้องทบทวน" value={String(weak)} />
            </div>
          </section>

          {/* วิธีตอบ */}
          <section>
            <h2 className="mb-3 text-lg font-bold">วิธีตอบ</h2>
            <div className="grid grid-cols-2 gap-3">
              {([['voice', Mic, 'พูดตอบ', 'แก้คำที่ถอดผิดได้ก่อนส่ง'], ['typed', Keyboard, 'พิมพ์ตอบ', 'พิมพ์ไทยปนอังกฤษได้']] as const).map(([m, Icon, title, desc]) => (
                <button key={m} type="button" onClick={() => choose(m)} aria-pressed={mode === m}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition sm:p-5 ${mode === m ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/15' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-[#1d2d47] dark:bg-[#0d1a2d]'}`}>
                  {mode === m && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white"><Check size={13} strokeWidth={3} /></span>}
                  <Icon size={34} className="text-blue-600 dark:text-blue-300" aria-hidden />
                  <span className="text-lg font-bold">{title}</span>
                  <span className="text-sm text-slate-500">{desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* สอบจริง (ตามรูปแบบข้อสอบจริงของวิชา) */}
          {subject.exam && (
            <Card className="flex flex-col gap-3 border-blue-300 sm:flex-row sm:items-center dark:border-blue-500/40">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <IconTile icon={Timer} />
                <div>
                  <div className="text-lg font-bold">สอบจริง (จับเวลา)</div>
                  <div className="text-sm text-slate-500">{examSummary(subject)} — เหมือนรูปแบบข้อสอบจริง</div>
                </div>
              </div>
              <Button onClick={() => go(`exam/${subject.id}`)}><Timer size={18} /> เริ่มสอบจริง</Button>
            </Card>
          )}

          {/* ชุดข้อสอบ — เลือกแยกได้ทีละชุด */}
          <section>
            <h2 className="mb-3 text-lg font-bold">ฝึกแยกตามชุด</h2>
            <div className="flex flex-col gap-3">
              {subject.sets.map((set, k) => {
                const p = all[k];
                return (
                  <TestCard key={set.id}
                    icon={set.categories ? ListChecks : ClipboardList}
                    title={set.title} code={set.id} sub={set.subtitle}
                    status={p.done === p.total ? 'ทำครบแล้ว' : p.done ? `ทำแล้ว ${p.done}` : 'ยังไม่เริ่ม'}
                    progress={p.done / p.total}
                    actions={<>
                      <Button onClick={() => openList(set)} className="flex-1 sm:flex-none"><BookOpen size={18} /> ฝึกรายข้อ</Button>
                      {set.categories && <Button onClick={() => openRandom(set)} variant="ghost" className="flex-1 sm:flex-none"><Dices size={18} /> สุ่ม 1 ข้อ</Button>}
                    </>}
                  />
                );
              })}
            </div>
          </section>
        </>
      )}

      <Card className="text-sm text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {usesOwnAi(getAiSettings())
            ? <Status ok loading={false} text={`ตัวตรวจ: ${getAiSettings().mode === 'local' ? 'AI ในเครื่องคุณ' : 'API ของคุณ'} (${getAiSettings().model})`} />
            : <Status ok={health?.grader} loading={health === null}
                text={health?.grader ? `ตัวตรวจ AI พร้อม${health.graderModel ? ` (${health.graderModel})` : ''}` : 'ตัวตรวจ AI ไม่พร้อม (ใช้คำสำคัญแทน)'} />}
          <a href="#/settings" className="text-blue-600 underline dark:text-blue-300">ใช้ AI ในเครื่องตัวเอง / เปลี่ยนตัวตรวจ</a>
          <Status ok={health?.stt} loading={health === null} text={health?.stt ? 'ถอดเสียง: Whisper' : 'ถอดเสียง: ของเบราว์เซอร์'} />
        </div>
        <p className="mt-2 text-xs">เสียงและคำตอบจะถูกส่งไปถอดเสียง/ตรวจที่บริการภายนอก ห้ามใส่ข้อมูลส่วนตัว · ประวัติการฝึกเก็บในเครื่องนี้เท่านั้น</p>
      </Card>
    </div>
  );
}

function SubjectButton({ s, active, onClick }: { s: Subject; active: boolean; onClick: () => void }) {
  const count = s.sets.reduce((n, x) => n + x.questions.length, 0);
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${active ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/15' : 'border-slate-200 bg-white hover:border-blue-300 dark:border-[#1d2d47] dark:bg-[#0d1a2d]'} ${s.placeholder ? 'border-dashed' : ''}`}>
      <IconTile icon={s.placeholder ? Lock : GraduationCap} tone={s.placeholder ? 'slate' : 'blue'} />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{s.code}</span>
        <span className="block truncate text-sm text-slate-500">{s.name}</span>
      </span>
      <span className="text-xs text-slate-500">{s.placeholder ? 'เร็วๆ นี้' : `${s.sets.length} ชุด · ${count} ข้อ`}</span>
    </button>
  );
}

function Status({ ok, loading, text }: { ok?: boolean; loading: boolean; text: string }) {
  if (loading) return <span>กำลังเช็ค…</span>;
  const Icon = ok ? CircleCheck : CircleAlert;
  return <span className="flex items-center gap-1.5"><Icon size={16} className={ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} aria-hidden />{text}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
      <div className="text-2xl font-extrabold sm:text-3xl">{value}</div>
      <div className="text-sm text-blue-100">{label}</div>
    </div>
  );
}

function TestCard({ icon, title, code, sub, status, progress, actions }: { icon: typeof BookOpen; title: string; code: string; sub: string; status: string; progress: number; actions?: ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile icon={icon} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold">{title}</span>
              <span className="text-sm text-slate-500">({code})</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{status}</span>
            </div>
            <div className="text-sm text-slate-500">{sub}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#15253d]">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </Card>
  );
}
