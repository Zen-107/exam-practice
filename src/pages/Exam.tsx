import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Keyboard, Mic, Send, Shuffle, Timer, TriangleAlert } from 'lucide-react';
import { buildExam, examSummary, SET_BY_ID, SUBJECT_BY_ID, SUBJECTS, subjectOfSet } from '../data/subjects';
import type { Question } from '../data/types';
import { AnswerInput, emptyAnswer } from '../input/AnswerInput';
import { QuestionHeader } from '../components/QuestionHeader';
import { ResultView } from '../components/ResultView';
import { Button, Card, ScoreBadge } from '../components/ui';
import { gradeAnswer } from '../grading/client';
import { scorePercent } from '../grading/grade';
import type { Answer, GradeResult } from '../grading/types';
import { addAttempt, getMode, updateAttempt } from '../store/history';
import { setLastSet } from '../store/prefs';

type Phase = 'intro' | 'answer' | 'grading' | 'summary';

/** สอบจริงเป็นรายวิชา: route รับได้ทั้ง id วิชา (cpe310) และ id ชุด (full_Ex) */
export default function Exam({ setId }: { setId: string }) {
  const subject = SUBJECT_BY_ID.get(setId) ?? subjectOfSet(setId) ?? SUBJECTS[0];
  useEffect(() => { if (SET_BY_ID.has(setId as never)) setLastSet(setId); }, [setId]);
  const mode = getMode();
  const [parts, setParts] = useState(() => buildExam(subject));
  const ALL_QUESTIONS: Question[] = parts.flatMap((p) => p.questions);
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => ALL_QUESTIONS.map((q) => emptyAnswer(q, mode)));
  const [results, setResults] = useState<(GradeResult | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [tEnd, setTEnd] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [stamp] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'answer') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const q = ALL_QUESTIONS[i];
  const elapsed = Math.floor(((tEnd || now) - t0) / 1000);

  const finish = async () => {
    setTEnd(Date.now());
    setPhase('grading');
    const out: (GradeResult | null)[] = ALL_QUESTIONS.map(() => null);
    let done = 0;
    // ตรวจพร้อมกันทีละ 2 ข้อ เพื่อไม่ให้ชนโควตา free tier
    const queue = ALL_QUESTIONS.map((_, k) => k);
    const worker = async () => {
      for (let k = queue.shift(); k !== undefined; k = queue.shift()) {
        const r = await gradeAnswer(ALL_QUESTIONS[k], answers[k]);
        // โหมดสอบ: ⚠️ ไม่นับคะแนนจนกว่าจะยืนยันเอง
        const res = { ...r, percent: scorePercent(r.points, true, r.slots) };
        out[k] = res;
        addAttempt({ questionId: ALL_QUESTIONS[k].id, at: stamp + k, answer: answers[k], result: res, exam: true });
        setProgress(++done);
      }
    };
    await Promise.all([worker(), worker()]);
    setResults(out);
    setPhase('summary');
  };

  if (phase === 'intro')
    return (
      <Card className="mx-auto max-w-xl">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Timer className="text-blue-600 dark:text-blue-300" /> โหมดสอบจริง</h1>
        <p className="mt-1 text-slate-500">{subject.code} · {examSummary(subject)}</p>
        <ul className="mt-3 list-disc pl-5 text-slate-600 dark:text-slate-400">
          {parts.map((p) => {
            const st = SET_BY_ID.get(p.setId)!;
            return p.random
              ? <li key={p.setId}>{st.title} ({st.id}): สุ่มได้ <b>ข้อ {p.questions.map((x) => x.part).join(', ')}</b> — {p.questions.map((x) => x.title).join(', ')}</li>
              : <li key={p.setId}>{st.title} ({st.id}): ออกทั้งหมด {p.questions.length} ข้อ</li>;
          })}
          <li>รวม {ALL_QUESTIONS.length} ข้อ จับเวลา</li>
          <li>ยังไม่เฉลยระหว่างทำ — ตรวจทั้งหมดตอนกดส่ง</li>
          <li className="[&>svg]:inline">ประเด็นที่เครื่องไม่แน่ใจ (<TriangleAlert size={15} className="text-amber-600" />) จะไม่นับคะแนน จนกว่าคุณจะยืนยันเองตอนดูผล</li>
          <li className="[&>svg]:inline">วิธีตอบ: {mode === 'voice' ? <><Mic size={15} /> พูด</> : <><Keyboard size={15} /> พิมพ์</>} (เปลี่ยนได้ที่หน้าแรก)</li>
        </ul>
        <div className="mt-5 flex gap-2">
          {parts.some((p) => p.random) && <Button variant="ghost" onClick={() => setParts(buildExam(subject))}><Shuffle size={18} /> สุ่มข้อใหม่</Button>}
          <Button className="flex-1" onClick={() => { setAnswers(ALL_QUESTIONS.map((q) => emptyAnswer(q, mode))); setT0(Date.now()); setNow(Date.now()); setPhase('answer'); }}>เริ่มสอบ</Button>
        </div>
      </Card>
    );

  if (phase === 'grading')
    return (
      <Card className="mx-auto max-w-xl text-center">
        <div className="text-lg font-bold">กำลังตรวจ {progress}/{ALL_QUESTIONS.length}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#15253d]">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${(progress / ALL_QUESTIONS.length) * 100}%` }} />
        </div>
      </Card>
    );

  if (phase === 'summary') {
    const total = ALL_QUESTIONS.reduce((s, qq, k) => s + qq.weight * ((results[k]?.percent ?? 0) / 100), 0);
    const max = ALL_QUESTIONS.reduce((s, qq) => s + qq.weight, 0);
    // ข้อที่ไม่มีน้ำหนักในข้อสอบ (ข้อสุ่มจาก Just_chose1) แสดงเป็น % แยก — ยังไม่รู้สัดส่วนคะแนนจริง
    const extra = ALL_QUESTIONS.map((qq, k) => ({ qq, k })).filter(({ qq }) => qq.weight === 0);
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-sm text-slate-500">คะแนนรวม · ใช้เวลา {fmt(elapsed)}</div>
          <div className="mt-1 flex flex-wrap gap-x-8 gap-y-2">
            {max > 0 && (
              <div>
                <div className="text-4xl font-extrabold">{total.toFixed(2)} <span className="text-xl text-slate-400">/ {Math.round(max)}%</span></div>
                <div className="text-sm text-slate-500">{subject.code} · {[...new Set(ALL_QUESTIONS.filter((x) => x.weight > 0).map((x) => SET_BY_ID.get(x.exam)?.title))].join(' + ')}</div>
              </div>
            )}
            {extra.map(({ qq, k }) => (
              <div key={qq.id}>
                <div className="text-4xl font-extrabold">{Math.round(results[k]?.percent ?? 0)}%</div>
                <div className="text-sm text-slate-500">ข้อสุ่ม {SET_BY_ID.get(qq.exam)?.id} ข้อ {qq.part}</div>
              </div>
            ))}
          </div>
        </Card>
        {ALL_QUESTIONS.map((qq, k) => {
          const a = answers[k];
          return (
            <Card key={qq.id} className="!p-0">
              <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(open === k ? null : k)}>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold dark:bg-[#15253d]">{parts.some((p) => p.random && p.setId === qq.exam) ? `สุ่ม · ${qq.part}` : qq.part}</span>
                <span className="flex-1 font-medium">{qq.title}</span>
                <ScoreBadge percent={results[k]?.percent} />
              </button>
              {open === k && results[k] && (
                <div className="border-t border-slate-200 p-4 dark:border-[#1d2d47]">
                  {a.kind === 'text' && <p className="mb-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm dark:bg-[#15253d]/70">{a.text || '(ไม่ได้ตอบ)'}</p>}
                  <ResultView q={qq} result={results[k]!} examMode onChange={(r) => {
                    const nr = [...results]; nr[k] = r; setResults(nr); updateAttempt(stamp + k, qq.id, r);
                  }} />
                </div>
              )}
            </Card>
          );
        })}
        <Button variant="ghost" onClick={() => location.reload()}><Shuffle size={18} /> สอบใหม่</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold">ข้อที่ {i + 1}/{ALL_QUESTIONS.length}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#15253d]">
          <div className="h-full bg-blue-600" style={{ width: `${((i + 1) / ALL_QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="font-mono">{fmt(elapsed)}</span>
      </div>
      <QuestionHeader q={q} />
      <Card>
        <AnswerInput key={q.id} q={q} mode={mode} value={answers[i]} onChange={(a) => setAnswers(answers.map((x, k) => (k === i ? a : x)))} />
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)} className="flex-1"><ArrowLeft size={18} /> ก่อนหน้า</Button>
          {i < ALL_QUESTIONS.length - 1
            ? <Button onClick={() => setI(i + 1)} className="flex-1">ถัดไป <ArrowRight size={18} /></Button>
            : <Button onClick={finish} className="flex-1"><Send size={18} /> ส่งตรวจทั้งหมด</Button>}
        </div>
      </Card>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
