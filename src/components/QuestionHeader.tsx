import type { Question } from '../data/types';
import { Card, Dataset, Markdown } from './ui';

export function QuestionHeader({ q }: { q: Question }) {
  const separateCard = q.prompt !== q.examPrompt;
  // โจทย์ที่มีตาราง/รูปจากกระดาษ → แสดงเป็น markdown
  const rich = /^\|.*\|$/m.test(q.prompt) || /!\[/.test(q.prompt);
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">ข้อ {q.part}</span>
        {q.weight > 0 && <span className="text-slate-500">{Math.round(q.weight * 100) / 100}% ของคะแนนสอบ</span>}
        {q.opinion && <span className="rounded-md bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">ถามความเห็น</span>}
      </div>
      {separateCard && (
        <details className="mt-2 text-sm text-slate-500">
          <summary className="cursor-pointer">โจทย์ข้อ {q.examNo} ในข้อสอบ</summary>
          <p className="mt-1">{q.examPrompt}</p>
        </details>
      )}
      {rich
        ? <div className="mt-3 font-semibold"><Markdown md={q.prompt} /></div>
        : <h1 className="mt-3 whitespace-pre-line text-lg font-bold leading-snug sm:text-xl">{q.prompt}</h1>}
      {q.exam === 'full_Ex' && (q.examNo === 4 || q.examNo === 5) && <div className="mt-3"><Dataset /></div>}
    </Card>
  );
}
