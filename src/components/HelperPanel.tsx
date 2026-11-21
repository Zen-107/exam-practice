import { useState } from 'react';
import type { Question } from '../data/types';
import type { InputMode } from '../store/history';
import { lastAttempt } from '../store/history';
import { Lightbulb, MapPin, PenLine, Target } from 'lucide-react';
import { Card, CardTitle, IconTile, ScoreBadge, SlideChips } from './ui';

/** แผงตัวช่วยฝั่งขวา ระหว่างที่ยังไม่ได้ส่งตรวจ — แทนพื้นที่ว่าง */
export function HelperPanel({ q, mode }: { q: Question; mode: InputMode }) {
  const [shown, setShown] = useState(0);
  const last = lastAttempt(q.id);
  const main = q.rubric?.filter((p) => !p.bonus) ?? [];
  const bonus = q.rubric?.filter((p) => p.bonus) ?? [];
  const hints = main.map((p) => p.hint);

  const what =
    q.type === 'essay' && (q.slots?.length ?? 0) > 1 ? `${q.slots!.length} ช่อง (ตอบสั้นๆ ทีละช่อง)`
    : q.type === 'essay' && q.slots?.length ? `ราว ${Math.max(1, Math.round(q.slots[0].need))} ประเด็นก็ได้เต็ม`
    : q.type === 'essay' ? `${main.length} ประเด็นหลัก${bonus.length ? ` + โบนัส ${bonus.length}` : ''}`
    : q.type === 'numeric' ? `${q.numericFields?.length ?? 0} ช่องตัวเลข`
    : q.type === 'matching' ? `${q.pairs?.length ?? 0} คู่`
    : `${q.order?.length ?? 0} ขั้นตอน`;

  const tips: string[] =
    q.type === 'essay'
      ? [
          'ตอบเป็นข้อๆ สั้นๆ ทีละประเด็น เครื่องตรวจทีละประเด็น',
          'ใช้ศัพท์อังกฤษตามสไลด์ เช่น Knowledge Base, Inference Engine',
          ...(q.autoRubric ? ['ประเด็นของชุดนี้สร้างอัตโนมัติจากเฉลย ถ้าคิดว่าตอบแล้วแต่เครื่องไม่นับ กด "ฉันตอบประเด็นนี้แล้ว" ได้'] : []),
          ...(q.opinion ? ['ข้อนี้ถามความเห็น: บอกจุดยืนให้ชัด แล้วให้เหตุผลประกอบ'] : []),
          ...(mode === 'voice' ? ['พูดศัพท์อังกฤษช้าๆ ชัดๆ แล้วแก้คำที่ถอดผิดก่อนกดส่ง'] : []),
        ]
      : q.type === 'numeric'
        ? ['ตอบเป็นทศนิยมหรือเศษส่วนก็ได้ เช่น 0.4 หรือ 2/5', 'คิดผลรวมทีละคอลัมน์จากตาราง Dataset ก่อน แล้วค่อยแก้ 3 สมการ']
        : q.type === 'matching'
          ? ['นึกถึงภาพ Human Expert เทียบกับ Expert System ที่ทำหน้าที่เดียวกันแบบ 1:1']
          : ['ลากเพื่อเรียง หรือกดปุ่มลูกศรขึ้น/ลง', 'คะแนนนับจากจำนวนคู่ขั้นตอนที่อยู่ลำดับถูก ผิดบางตำแหน่งยังได้คะแนนบางส่วน'];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <IconTile icon={Target} />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-slate-500">ข้อนี้ต้องตอบ</div>
            <div className="text-lg font-bold">{what}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">ครั้งก่อน</div>
            <ScoreBadge percent={last?.result.percent} />
          </div>
        </div>
      </Card>

      {hints.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <CardTitle icon={Lightbulb}>คำใบ้</CardTitle>
            <span className="text-xs text-slate-500">{shown}/{hints.length}</span>
            {shown < hints.length && (
              <button type="button" onClick={() => setShown(shown + 1)}
                className="ml-auto rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10">
                {shown === 0 ? 'ขอคำใบ้' : 'คำใบ้ถัดไป'}
              </button>
            )}
          </div>
          {shown === 0 ? (
            <p className="mt-2 text-sm text-slate-500">ลองตอบเองก่อน ถ้านึกไม่ออกค่อยเปิดทีละข้อ</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2">
              {hints.slice(0, shown).map((h, i) => (
                <li key={i} className="flex gap-2 rounded-lg bg-blue-50 p-2.5 text-sm dark:bg-blue-500/10">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      <Card>
        <CardTitle icon={PenLine}>เคล็ดลับ</CardTitle>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          {tips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">•</span><span>{t}</span></li>)}
        </ul>
      </Card>

      <Card>
        <CardTitle icon={MapPin}>สไลด์ที่ควรทบทวน</CardTitle>
        <div className="mt-2"><SlideChips refs={q.slideRefs} /></div>
      </Card>
    </div>
  );
}
