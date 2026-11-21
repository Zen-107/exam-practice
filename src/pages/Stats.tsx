import { useState } from 'react';
import { Download, Target, Trash2 } from 'lucide-react';
import { ALL_SETS, SET_BY_ID } from '../data/subjects';
import { Button, Card, Chips, ScoreBadge } from '../components/ui';
import { clearAttempts, exportJson, getAttempts } from '../store/history';
import { getLastSet } from '../store/prefs';
import { go } from '../router';

export default function Stats() {
  const [attempts, setAttempts] = useState(getAttempts);
  const [setId, setSetId] = useState(() => (SET_BY_ID.has(getLastSet() as never) ? getLastSet() : ALL_SETS[0].id));
  const set = SET_BY_ID.get(setId as never) ?? ALL_SETS[0];

  const rows = set.questions.map((q) => {
    const mine = attempts.filter((a) => a.questionId === q.id);
    const last = mine[mine.length - 1];
    const best = mine.reduce((m, a) => Math.max(m, a.result.percent), -1);
    return { q, count: mine.length, last: last?.result.percent, best: best < 0 ? undefined : best };
  });
  const tried = rows.filter((r) => r.count > 0);
  const shown = set.questions.length > 30 ? tried : rows; // ชุดใหญ่ แสดงเฉพาะข้อที่เคยทำ
  const weakest = [...tried].sort((a, b) => (a.last ?? 0) - (b.last ?? 0))[0] ?? rows.find((r) => r.count === 0);

  const download = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cpe310-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold">สถิติการฝึก</h1>
      <Chips items={ALL_SETS.map((s) => ({ id: s.id, label: s.title, count: s.questions.filter((q) => attempts.some((a) => a.questionId === q.id)).length }))}
        value={set.id} onChange={setSetId} />
      {weakest && (
        <Card className="flex flex-wrap items-center gap-3">
          <Target size={20} className="text-blue-600 dark:text-blue-300" aria-hidden />
          <span className="flex-1">ควรฝึกต่อ: <b>ข้อ {weakest.q.part} — {weakest.q.title}</b></span>
          <Button onClick={() => go(`q/${weakest.q.id}`)}>ฝึกข้อนี้</Button>
        </Card>
      )}
      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-[#15253d]/70">
            <tr><th className="p-3">ข้อ</th><th className="p-3">ล่าสุด</th><th className="p-3">ดีที่สุด</th><th className="p-3">ทำไป</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.q.id} className="border-t border-slate-100 dark:border-[#1d2d47]">
                <td className="p-3"><a className="font-medium text-blue-700 dark:text-blue-300" href={`#/q/${r.q.id}`}>ข้อ {r.q.part}</a><div className="text-xs text-slate-500">{r.q.title}</div></td>
                <td className="p-3"><ScoreBadge percent={r.last} /></td>
                <td className="p-3"><ScoreBadge percent={r.best} /></td>
                <td className="p-3">{r.count} ครั้ง</td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={4} className="p-6 text-center text-slate-500">ยังไม่ได้ฝึกชุดนี้ — <a className="text-blue-600 dark:text-blue-300" href={`#/list/${set.id}`}>เริ่มฝึก</a></td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={download}><Download size={18} /> ส่งออกประวัติ (JSON)</Button>
        <Button variant="danger" onClick={() => { if (confirm('ลบประวัติการฝึกทั้งหมดในเครื่องนี้?')) { clearAttempts(); setAttempts([]); } }}><Trash2 size={18} /> ลบประวัติ</Button>
      </div>
      <p className="text-xs text-slate-500">ไฟล์ที่ส่งออกมีการกด "ยืนยันเอง" ด้วย ใช้เป็นข้อมูลปรับ rubric และวัดความแม่นของตัวตรวจได้ (Phase 7)</p>
    </div>
  );
}
