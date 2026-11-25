"""สร้างหน้าตรวจ rubric CPE320 (HTML) จาก src/data/cpe320_open.data.ts

รัน:  python -I scripts/cpe320_review.py   → D:/work/Junior/cpe320/rubric_review.html
"""
import html
import json
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'src' / 'data' / 'cpe320_open.data.ts'
OUT = pathlib.Path(os.environ.get('CPE320_DIR', 'D:/work/Junior/cpe320')) / 'rubric_review.html'

# บันทึกการแก้จาก rubric อัตโนมัติ → rubric ที่คัดเอง (สั้นๆ ต่อข้อ)
CHANGES = {
    1: 'แยกนิยามเป็น 3 องค์ประกอบ (หลักวิศวกรรม / ตรงความต้องการลูกค้า / ภายใต้งบและเวลา) · เหตุผลเหลือ 3 ข้อหลัก · SE=P+M+T เป็นโบนัส',
    2: 'ข้อจำกัดเหลือ 5 ข้อสำคัญ ต้องได้ 3 · ช่องข้อจำกัดน้ำหนัก 2 เท่า · เพิ่มเกณฑ์ผิดถ้าบอกว่าเหมาะกับ requirement ที่เปลี่ยนบ่อย',
    3: 'ตัดประโยคนำที่ถูกนับเป็นประเด็น · แยกช่อง Prototyping (วนซ้ำ) / Waterfall (เป็นระบบ) · Risk Analysis เป็นโบนัส',
    4: 'เดิม keyword ไปจับฝั่ง "มากกว่า" (Process & Tools) แทนฝั่งที่ให้คุณค่า → แก้แล้ว · ตัด 12 rules ออก',
    5: 'เหลือ 6 ประเด็นหลัก แบ่ง Key Success Factor / ท้าทายความเป็นมืออาชีพ ช่องละ 2',
    6: 'แยกช่อง Verification / Validation · เพิ่มเกณฑ์ผิดถ้าสลับความหมาย · ช่วงเวลาที่ทำเป็นโบนัส',
    7: 'ช่องละการทดสอบ 1 ประเด็น (เหมือนเดิม) · เขียนความหมายให้กระชับ · Stress test ต้องพูดถึงสภาวะเกินปกติ',
    8: 'ตัดประโยคนำ "ตาม Criteria…" · แยกช่อง เสร็จเมื่อไหร่ / รู้ได้อย่างไรว่าพอ',
    9: 'แยก 3 ช่องตามโจทย์ (White-box / Black-box / ช่วงเวลา) · เทคนิคเป็นโบนัส · เกณฑ์ผิดถ้าลำดับสลับ',
    10: 'เหลือ 2 ประเด็นหลัก (ข้อมูลสมมติ vs จริง / สถานการณ์จำลอง vs จริง) · "ผู้ใช้ทดสอบทั้งคู่" เป็นโบนัส',
    11: 'keyword เดิม "เพราะ" ใช้ไม่ได้ → แก้ · ต้องได้ 2 จาก 3 · CI อัตโนมัติเป็นโบนัส',
    12: 'คง 6 เกณฑ์ ต้องได้ 4',
    13: 'ขั้นตอนเหลือ 6 ขั้นหลัก ต้องได้ 4 (น้ำหนัก 2) · แยกช่อง 3 Roles · 3-5-3 เป็นโบนัส',
    14: 'แยก 3 ช่องตามโจทย์ (คน / งาน / Best practice) แต่ละช่องต้องเทียบทั้ง CMMI และ Agile · ภาพรวมเป็นโบนัส',
    15: 'หลักการต้องได้ 1 (แพ็กแอป+dependencies) · ประโยชน์ต้องได้ 3 จาก 4 · VM/Kubernetes/Docker เป็นโบนัส',
    16: 'แยกช่อง Delivery / Deployment · เกณฑ์ผิดถ้าบอกว่า Delivery ขึ้น production เองทันที · ความถี่/ความเสี่ยงเป็นโบนัส',
    17: 'เพิ่มช่องความสำคัญ · tools แต่ละขั้นต้องได้ 4 จาก 7 (น้ำหนัก 2) · keyword เป็นชื่อ tool จริง',
    18: 'ปัจจัยงบเหลือ 5 ต้องได้ 3 · การประยุกต์รวมเป็น 3 กลุ่ม ต้องได้ 2 · COCOMO เป็นโบนัส',
    19: 'แยก 3 ช่องตามโจทย์ ช่องละ 1 ประเด็นหลัก',
    20: 'เขียนใหม่ทั้งข้อ: ช่อง Web / Mobile ยกชื่อ tool ได้ก็ผ่าน (เดิมต้องตอบ 6 จาก 10 แถวตาราง)',
    21: 'แยก Single / Multi / ความเหมาะสม · ตัดแถวตารางย่อยๆ ออก · ความซับซ้อนของ MAS เป็นโบนัส',
    22: 'หน้าที่เหลือ 3 ต้องได้ 2 · Privacy เหลือ 2 หลัก + โบนัส',
    23: 'รวม agent ที่ซ้ำ (Dev+Reviewer, DevOps+SRE) → 8 ตัวหลัก ต้องได้ 5 · แยกช่องมนุษย์อนุมัติ (HITL)',
    24: 'รวม 10 ข้อเป็น 8 ประเด็น ต้องได้ 4',
    25: 'ช่องกลุ่มเครื่องมือ (self-hosted/local) + เกณฑ์ผิดถ้าแนะนำ public API · ตัวอย่างต้องได้ 2 กลุ่ม',
    26: 'แยก 3 ช่องตามโจทย์ (คืออะไร / Healthcare / FinTech) ช่องละ 1 ประเด็นหลัก',
    27: 'บทบาทเหลือ 3 (curator / architect / ตั้งโจทย์+validate) ต้องได้ 2 · ทักษะเหลือ 6 ต้องได้ 3',
    28: 'เหตุผลเหลือ 3 ต้องได้ 2 · แนวปฏิบัติ 5 ขั้น ต้องได้ 3',
    29: 'เดิมช่องแรกชื่อเพี้ยน (เอามาจากแถวตาราง) → แก้ · ความแตกต่าง 4 ต้องได้ 2 · ประโยชน์ 2 + โบนัส',
    30: 'แบ่ง Design / Develop ช่องละ 4 ต้องได้ 2 · DevSusOps และ container เป็นโบนัส',
}

CSS = """
:root{--bg:#f6f7f9;--card:#fff;--fg:#1c2430;--mut:#5d6b7c;--line:#dde3ea;--acc:#2457d6;--bonus:#8a5a00;--bonusbg:#fff4dc;--wrong:#b4232c;--chip:#eef2f8}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0f141b;--card:#171e28;--fg:#e4e9f0;--mut:#9aa7b8;--line:#2a3442;--acc:#7aa2ff;--bonus:#f0c060;--bonusbg:#3a2d10;--wrong:#ff8a8a;--chip:#222c3a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 'Sarabun',system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px 64px}h1{font-size:24px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 16px}
nav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 20px}nav a{background:var(--chip);color:var(--fg);text-decoration:none;border-radius:8px;padding:2px 9px;font-size:13px}
.legend{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--mut);margin-bottom:18px}
.q{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:0 0 14px}
.q h2{font-size:17px;margin:0 0 6px}.no{color:var(--acc)}.prompt{color:var(--mut);font-size:14px;margin:0 0 8px;white-space:pre-wrap}
.chg{font-size:13px;background:var(--chip);border-radius:8px;padding:6px 10px;margin:0 0 10px}
.slot{border-top:1px dashed var(--line);padding-top:8px;margin-top:8px}.slot h3{font-size:14px;margin:0 0 4px}
.need{font-weight:400;color:var(--mut);font-size:13px}ul{margin:4px 0 0;padding-left:20px}li{margin:3px 0}
.b{background:var(--bonusbg);color:var(--bonus);border-radius:6px;padding:0 6px;font-size:12px;margin-right:4px}
.w{color:var(--wrong);font-size:13px;display:block}.kw{color:var(--mut);font-size:12px;display:block}
.recap{background:var(--chip);border-left:3px solid var(--acc);border-radius:6px;padding:6px 10px;margin:6px 0 2px;font-size:14px}
"""


def main() -> None:
    t = DATA.read_text(encoding='utf-8')
    d = json.loads(json.loads(t[t.index('JSON.parse(') + 11:t.rindex(') as unknown')]))
    e = html.escape
    out = [f'<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>CPE320 Rubric Review</title><style>{CSS}</style></head><body><main>',
           '<h1>CPE320 Open Exam · ตรวจ rubric</h1>',
           f'<p class="sub">{len(d["questions"])} ข้อ · สอบจริงสุ่ม 10 ข้อ ข้อละ 2% · rubric คัดเองเฉพาะประเด็นสำคัญ</p>',
           '<div class="legend"><span>ต้องได้ N = ตอบถูกกี่ประเด็นถึงเต็มช่อง</span><span><span class="b">โบนัส</span> ไม่ตอบไม่หัก</span><span style="color:var(--wrong)">✗ = ตอบแบบนี้ถือว่าผิด</span></div>',
           '<nav>' + ''.join(f'<a href="#q{q["no"]}">{q["no"]}</a>' for q in d['questions']) + '</nav>']
    for q in d['questions']:
        out.append(f'<section class="q" id="q{q["no"]}"><h2><span class="no">ข้อ {q["no"]}</span> {e(q["title"])}</h2>')
        out.append(f'<p class="prompt">{e(q["prompt"])}</p>')
        if q['no'] in CHANGES:
            out.append(f'<div class="chg"><b>ที่ปรับ:</b> {e(CHANGES[q["no"]])}</div>')
        for s in q['slots']:
            pts = [p for p in q['rubric'] if p.get('slot') == s['id']]
            core = sum(1 for p in pts if not p.get('bonus'))
            wt = f' · น้ำหนัก ×{s["weight"]}' if s['weight'] != 1 else ''
            out.append(f'<div class="slot"><h3>{e(s["label"])} <span class="need">ต้องได้ {s["need"]}/{core}{wt}</span></h3><ul>')
            for p in pts:
                tag = '<span class="b">โบนัส</span>' if p.get('bonus') else ''
                wrong = ''.join(f'<span class="w">✗ {e(w)}</span>' for w in p.get('wrongIf', []))
                kw = ' + '.join('(' + ' / '.join(g) + ')' for g in p['keywords'])
                out.append(f'<li>{tag}{e(p["text"])}{wrong}<span class="kw">keyword: {e(kw)}</span></li>')
            out.append('</ul>')
            if q.get('recap', {}).get(s['id']):
                out.append(f'<div class="recap"><b>สรุปเฉลย (แสดงหลังตรวจ):</b> {e(q["recap"][s["id"]])}</div>')
            out.append('</div>')
        out.append('</section>')
    out.append('</main></body></html>')
    OUT.write_text('\n'.join(out), encoding='utf-8')
    print(f'→ {OUT}')


if __name__ == '__main__':
    main()
