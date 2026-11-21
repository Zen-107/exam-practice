import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Keyboard, Mic, RotateCcw, Send } from 'lucide-react';
import { QUESTION_BY_ID } from '../data';
import { SET_BY_ID } from '../data/subjects';
import { AnswerInput, draftOf, emptyAnswer, isAnswered } from '../input/AnswerInput';
import { QuestionHeader } from '../components/QuestionHeader';
import { ResultView } from '../components/ResultView';
import { HelperPanel } from '../components/HelperPanel';
import { Button, Card } from '../components/ui';
import { gradeAnswer } from '../grading/client';
import type { Answer, GradeResult } from '../grading/types';
import { addAttempt, getDraft, getMode, setDraft, updateAttempt, type InputMode } from '../store/history';
import { setLastSet } from '../store/prefs';
import { go } from '../router';

export default function Practice({ id }: { id: string }) {
  const q = QUESTION_BY_ID.get(id);
  const [mode, setModeState] = useState<InputMode>(getMode());
  const [answer, setAnswer] = useState<Answer | null>(q ? emptyAnswer(q, mode, getDraft(q.id)) : null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [attemptAt, setAttemptAt] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (q && answer?.kind === 'text') setDraft(q.id, draftOf(answer)); }, [q, answer]);
  useEffect(() => { if (q) setLastSet(q.exam); }, [q]);

  if (!q || !answer) return <Card>ไม่พบข้อนี้ <a className="text-blue-600" href="#/list">กลับไปรายการ</a></Card>;

  const list = SET_BY_ID.get(q.exam)?.questions ?? [q];
  const idx = list.findIndex((x) => x.id === q.id);
  const next = list[idx + 1];
  const prev = list[idx - 1];

  const submit = async () => {
    setBusy(true);
    const r = await gradeAnswer(q, answer);
    const at = Date.now();
    addAttempt({ questionId: q.id, at, answer, result: r });
    setAttemptAt(at);
    setResult(r);
    setBusy(false);
    setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const retry = () => { setResult(null); setAnswer(emptyAnswer(q, mode, '')); setDraft(q.id, ''); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <a href={`#/list/${q.exam}`} className="flex items-center gap-1 text-blue-600 dark:text-blue-300"><ArrowLeft size={16} /> {SET_BY_ID.get(q.exam)?.title ?? 'รายข้อ'}</a>
        <span className="ml-auto font-semibold">คำถาม {idx + 1} / {list.length}</span>
      </div>
      <div className="-mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#15253d]">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((idx + 1) / list.length) * 100}%` }} />
      </div>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <QuestionHeader q={q} />
          <Card>
            {answer.kind === 'text' && (
              <div className="mb-3 flex justify-end gap-1 text-sm">
                {(['voice', 'typed'] as const).map((m) => {
                  const Icon = m === 'voice' ? Mic : Keyboard;
                  return (
                    <button key={m} type="button" onClick={() => setModeState(m)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${mode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#15253d]'}`}>
                      <Icon size={15} aria-hidden /> {m === 'voice' ? 'พูด' : 'พิมพ์'}
                    </button>
                  );
                })}
              </div>
            )}
            <AnswerInput q={q} mode={mode} value={answer} onChange={setAnswer} disabled={busy || !!result} />
            <div className="mt-4 flex flex-wrap gap-2">
              {!result ? (
                <Button onClick={submit} disabled={busy || !isAnswered(answer)} className="flex-1"><Send size={18} /> {busy ? 'กำลังตรวจ…' : 'ส่งตรวจ'}</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={retry} className="flex-1"><RotateCcw size={18} /> ทำใหม่</Button>
                  {next && <Button onClick={() => go(`q/${next.id}`)} className="flex-1">ข้อต่อไป <ArrowRight size={18} /></Button>}
                </>
              )}
            </div>
          </Card>
          <div className="flex justify-between text-sm">
            {prev ? <a className="flex items-center gap-1 text-blue-600 dark:text-blue-300" href={`#/q/${prev.id}`}><ArrowLeft size={15} /> ข้อ {prev.part}</a> : <span />}
            {next ? <a className="flex items-center gap-1 text-blue-600 dark:text-blue-300" href={`#/q/${next.id}`}>ข้อ {next.part} <ArrowRight size={15} /></a> : <span />}
          </div>
        </div>
        <div id="result">
          {!busy && !result && <HelperPanel q={q} mode={mode} />}
          {busy && <Card className="animate-pulse text-center text-slate-500">กำลังตรวจทีละประเด็น…</Card>}
          {result && <ResultView q={q} result={result} onChange={(r) => { setResult(r); updateAttempt(attemptAt, q.id, r); }} />}
        </div>
      </div>
    </div>
  );
}
