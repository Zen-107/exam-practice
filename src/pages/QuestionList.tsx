import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Dices, MessageSquareQuote, Search, Timer } from 'lucide-react';
import { Button, Card, Chips, ScoreBadge } from '../components/ui';
import { lastAttempt } from '../store/history';
import { SET_BY_ID, ALL_SETS, randomQuestion, subjectOfSet } from '../data/subjects';
import type { Question } from '../data/types';
import { compact } from '../grading/normalize';
import { setLastSet } from '../store/prefs';
import { go } from '../router';

const TYPE_LABEL = { essay: 'อธิบาย', numeric: 'คำนวณ', matching: 'จับคู่', ordering: 'เรียงลำดับ' } as const;

export default function QuestionList({ setId }: { setId: string }) {
  const set = SET_BY_ID.get(setId as never) ?? ALL_SETS[0];
  useEffect(() => { setLastSet(set.id); }, [set.id]);
  const subject = subjectOfSet(set.id);
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'todo' | 'weak'>('all');

  const filtered = useMemo(() => {
    const q = compact(query);
    return set.questions.filter((x) => {
      if (cat !== 'all' && x.category !== cat) return false;
      const last = lastAttempt(x.id)?.result.percent;
      if (status === 'todo' && last !== undefined) return false;
      if (status === 'weak' && (last === undefined || last >= 60)) return false;
      if (q && !compact(`${x.examNo} ${x.title} ${x.prompt}`).includes(q)) return false;
      return true;
    });
  }, [set, cat, query, status]);

  return (
    <div className="flex flex-col gap-5">
      <a href="#/" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-300"><ArrowLeft size={16} /> {subject?.code ?? 'หน้าแรก'}</a>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">{set.title}</h1>
          <p className="text-slate-500">{set.id} · {set.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {set.categories && <Button variant="ghost" onClick={() => go(`q/${randomQuestion(set.id).id}`)}><Dices size={18} /> สุ่ม 1 ข้อ</Button>}
          {subject?.exam && <Button variant="ghost" onClick={() => go(`exam/${subject.id}`)}><Timer size={18} /> สอบจริง</Button>}
        </div>
      </div>

      {/* เปลี่ยนชุด */}
      {subject && subject.sets.length > 1 && (
        <Chips items={subject.sets.map((s) => ({ id: s.id, label: s.title, count: s.questions.length }))} value={set.id} onChange={(id) => go(`list/${id}`)} />
      )}

      {set.categories && (
        <Card className="flex flex-col gap-3 !p-4">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-[#26385a] dark:bg-[#081322]">
            <Search size={18} className="text-slate-400" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาเลขข้อหรือคำในโจทย์ เช่น 58, Frame, Turing"
              className="min-h-11 flex-1 bg-transparent outline-none" />
          </label>
          <Chips items={[{ id: 'all', label: 'ทุกหมวด', count: set.questions.length }, ...set.categories.map((c) => ({ id: c.id, label: c.label, count: set.questions.filter((q) => q.category === c.id).length }))]}
            value={cat} onChange={setCat} />
          <Chips items={[{ id: 'all' as const, label: 'ทั้งหมด' }, { id: 'todo' as const, label: 'ยังไม่ทำ' }, { id: 'weak' as const, label: 'ต่ำกว่า 60%' }]} value={status} onChange={setStatus} />
        </Card>
      )}

      {set.groupByExamNo ? <Grouped qs={filtered} /> : (
        <>
          <p className="-mb-2 text-sm text-slate-500">แสดง {filtered.length} ข้อ</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((q) => <QCard key={q.id} q={q} />)}</div>
          {!filtered.length && <Card className="text-center text-slate-500">ไม่พบข้อที่ตรงกับตัวกรอง</Card>}
        </>
      )}
    </div>
  );
}

function Grouped({ qs }: { qs: Question[] }) {
  const groups = new Map<number, Question[]>();
  for (const q of qs) groups.set(q.examNo, [...(groups.get(q.examNo) ?? []), q]);
  return (
    <>
      {[...groups].map(([no, g]) => {
        const total = g.reduce((s, q) => s + q.weight, 0);
        return (
          <section key={no}>
            <h2 className="mb-1 text-lg font-bold">ข้อ {no} <span className="font-normal text-slate-500">({Math.round(total * 10) / 10}%)</span></h2>
            <p className="mb-3 line-clamp-2 text-sm text-slate-500">{g[0].examPrompt}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{g.map((q) => <QCard key={q.id} q={q} />)}</div>
          </section>
        );
      })}
    </>
  );
}

function QCard({ q }: { q: Question }) {
  const last = lastAttempt(q.id);
  return (
    <a href={`#/q/${q.id}`}>
      <Card className="h-full transition hover:border-blue-400">
        <div className="flex items-start gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold dark:bg-[#15253d]">ข้อ {q.part}</span>
          {q.opinion && <span className="flex items-center gap-1 rounded-md bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><MessageSquareQuote size={12} /> ความเห็น</span>}
          <span className="ml-auto"><ScoreBadge percent={last?.result.percent} /></span>
        </div>
        <div className="mt-2 font-semibold leading-snug">{q.title}</div>
        <div className="mt-1 text-xs text-slate-500">
          {TYPE_LABEL[q.type]}{q.weight ? ` · ${Math.round(q.weight * 100) / 100}%` : ` · ${q.rubric?.length ?? 0} ประเด็น`}
        </div>
      </Card>
    </a>
  );
}
