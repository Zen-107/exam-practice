"""สร้าง src/data/cpe320_open.data.ts จาก CPE320 Open Exam (โจทย์ PDF) + เฉลย .md

รัน:  python -I scripts/extract_cpe320.py   (ต้องมี pymupdf)
- ไฟล์ต้นทางอยู่ที่ D:/work/Junior/cpe320 (ตั้งทับได้ด้วย env CPE320_DIR)
- ใช้ตัวช่วยชุดเดียวกับ extract_just_chose1.py (make_point / derive_slots / need_for)
- เฉลย CPE320 แบ่งส่วนด้วยบรรทัดตัวหนาทั้งบรรทัด เช่น **ทำไมต้องใช้ Software Process Model**
  → แต่ละส่วนกลายเป็นช่องคำตอบ 1 ช่อง ประเด็นในส่วน = bullet / ข้อเลข / แถวตาราง / ย่อหน้า "**ป้าย:** ข้อความ"
- ไม่เอาบรรทัด "ที่มา" และ "📚 อ่านเสริม" มาทำ rubric (ยังแสดงในเฉลยเต็ม)
"""
import json
import os
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import pymupdf  # noqa: E402
from cpe320_rubric import RUBRIC  # noqa: E402
from cpe320_recap import RECAP  # noqa: E402
from extract_just_chose1 import bolds, derive_slots, eng_terms, fix_thai, make_point, need_for, strip_md, vocab_from  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(os.environ.get('CPE320_DIR', 'D:/work/Junior/cpe320'))
PDF = SRC / 'CPE320_20_OpenExam.pdf'
ANSWER = SRC / 'CPE320_20_OpenExam_Answers.md'
OUT = ROOT / 'src' / 'data' / 'cpe320_open.data.ts'

FILES = {
    'SE1': 'SE1_Introduction', 'SE2': 'SE2_Software_Process', 'SE3': 'SE3_Software_Process_Model',
    'SE4': 'SE4_Agile_SCRUM', 'SE5': 'SE5_Requirement_Engineering', 'SE6': 'SE6_Testing_Strategies',
    'SE7': 'SE7_Testing_Tactics', 'SE8': 'SE8_Platform_Engineering', 'SPE': 'Software_Process_Engineering',
}

CATEGORIES = [
    (1, 5, 'process', 'Process Model & Requirements'),
    (6, 12, 'testing', 'Software Testing'),
    (13, 20, 'devops', 'Agile · DevOps · Platform'),
    (21, 30, 'trend', 'AI Agents & Trend 2026'),
]

# ป้ายช่องแรก (ส่วนที่อยู่ก่อนหัวข้อตัวหนาแรก) เมื่อเดาจากเฉลยไม่ได้ดี
FIRST_LABEL = {1: 'นิยาม Software Engineering (ตามการทำงานจริง)', 26: 'HITL คืออะไร', 27: 'บทบาทใน SDLC ที่เปลี่ยนไป (อดีต → ยุค Agentic AI)', 29: 'เปรียบเทียบ Monitoring แบบดั้งเดิม vs Observability + AIOps'}
# ย่อหน้า "**ป้าย:** …" ที่ขึ้นส่วนใหม่ (เป็นข้อย่อยที่โจทย์ถาม)
SPLIT_LABELS = {9: ('ช่วงเวลาที่ใช้',)}
# ย่อหน้าเสริม/สรุป → ประเด็นโบนัส (ไม่ตอบไม่หัก)
BONUS_RE = re.compile(r'^\(?\**(เพิ่มเติม|เสริม|สรุป|ตัวอย่างเครื่องมือ|เครื่องมือตัวอย่าง|เชื่อมกับเนื้อหา|ทั้งสองแบบอยู่ภายใต้)')

# ข้อที่ rubric อัตโนมัติไม่ตรงกับสิ่งที่โจทย์ถาม → เขียนเอง
def _pt(pid, text, keys, hint, slot):
    return {'id': pid, 'text': text, 'weight': 1, 'keywords': [keys], 'hint': hint, 'slot': slot}

MANUAL = {
    20: ([
        _pt('se20_web', 'Web Application: ยกตัวอย่าง tool ได้อย่างน้อย 2 ตัว เช่น Selenium, Katalon Studio, Cypress, Playwright, Cucumber, JMeter (load), Pa11y (accessibility)',
            ['selenium', 'katalon', 'cypress', 'playwright', 'cucumber', 'jmeter', 'pa11y', 'puppeteer', 'webdriver'], 'Web: Selenium, Katalon Studio (อาจารย์แนะนำ) หรือ Cypress / Playwright', 'web'),
        _pt('se20_mobile', 'Mobile Application: ยกตัวอย่าง tool ได้อย่างน้อย 2 ตัว เช่น Appium, Katalon Studio, Espresso (Android), XCUITest (iOS), Cucumber',
            ['appium', 'katalon', 'espresso', 'xcuitest', 'xcui', 'detox', 'maestro', 'cucumber'], 'Mobile: Appium, Katalon Studio หรือ Espresso / XCUITest', 'mobile'),
    ], [
        {'id': 'web', 'label': 'Web Application', 'tip': 'ยกชื่อ tool อย่างน้อย 2 ตัว + ใช้ทำอะไรสั้นๆ', 'weight': 1, 'need': 1, 'short': True},
        {'id': 'mobile', 'label': 'Mobile Application', 'tip': 'ยกชื่อ tool อย่างน้อย 2 ตัว + ใช้ทำอะไรสั้นๆ', 'weight': 1, 'need': 1, 'short': True},
    ]),
}


# ───────────── โจทย์ ─────────────

def extract_prompts() -> dict[int, str]:
    doc = pymupdf.open(PDF)
    raw = fix_thai('\n'.join(p.get_text() for p in doc))
    raw = raw.split('“เมล็ดพันธุ์')[0]
    marks, expect = [], 1
    for m in re.finditer(r'^\s*(\d{1,2})\)', raw, flags=re.M):
        if int(m.group(1)) == expect:
            marks.append((expect, m.start(), m.end()))
            expect += 1
    out = {}
    for i, (n, _, end) in enumerate(marks):
        stop = marks[i + 1][1] if i + 1 < len(marks) else len(raw)
        lines = [re.sub(r'\s+', ' ', l).strip() for l in raw[end:stop].splitlines()]
        text = ''
        for l in lines:
            if not l:
                continue
            thai_join = text and re.search(r'[฀-๿]$', text) and re.match(r'^[฀-๿]', l)
            text += ('' if thai_join or not text else ' ') + l
        if n == 7:  # รายการชนิดการทดสอบ ขึ้นบรรทัดใหม่ให้อ่านง่าย
            text = text.replace('ต่อไปนี้ ', 'ต่อไปนี้\n\n', 1)
        text = text.replace('มาอย่าง 2 Tools', 'มาอย่างน้อย 2 Tools')  # ตามเจตนาโจทย์ (กระดาษพิมพ์ตก "น้อย")
        out[n] = text.strip()
    return out


# ───────────── เฉลย ─────────────

def split_sections(md: str) -> dict[int, dict]:
    out = {}
    for part in re.split(r'^## ข้อ ', md, flags=re.M)[1:]:
        head, _, body = part.partition('\n')
        m = re.match(r'(\d+)\)\s*(.*)$', head.strip())
        if m:
            body = re.sub(r'\n---\s*(\n\*".*)?$', '', body.strip(), flags=re.S).strip()
            out[int(m.group(1))] = {'title': m.group(2).strip(), 'body': body}
    return out


SRC_RE = re.compile(r'^\*\*ที่มา(?:ที่เกี่ยวข้อง)?:\*\*\s*(.+)$', re.M)


def top_split(s: str) -> list[str]:
    out, depth, cur = [], 0, ''
    for ch in s:
        depth += ch == '('
        depth -= ch == ')'
        if depth == 0 and ch in ',;':
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    return [x for x in out + [cur.strip()] if x]


def parse_sources(body: str) -> list[dict]:
    m = SRC_RE.search(body)
    if not m:
        return []
    line = re.split(r'\s+—\s+⚠️', m.group(1))[0]
    refs: list[dict] = []
    for piece in top_split(line):
        piece = re.sub(r'\s*\([^)]*\)\s*$', '', piece).strip()
        fm = re.match(r'^(SE\d|SPE)\b\s*(?:หน้า\s+(.+))?$', piece)
        if fm:
            pages = (fm.group(2) or '').replace(' และ ', ', ').strip()
            file = FILES[fm.group(1)]
            prev = next((r for r in refs if r['file'] == file), None)
            if prev:
                prev['pages'] = ', '.join(x for x in (prev['pages'], pages) if x)
            else:
                refs.append({'file': file, 'pages': pages})
        elif re.fullmatch(r'[\d–\-, ]+', piece) and refs:  # "SE5 หน้า 4–5, 7, 8" → เลขหน้าต่อจากไฟล์ก่อนหน้า
            refs[-1]['pages'] += ', ' + piece
    return refs


HEAD_RE = re.compile(r'^\*\*([^*]+?)\*\*\s*:?\s*$')          # บรรทัดตัวหนาทั้งบรรทัด = หัวข้อส่วน
LABEL_RE = re.compile(r'^\*\*([^*]+?):?\*\*\s*:?\s*(.+)$')    # "**ป้าย:** ข้อความ" = 1 ประเด็น


def clean_label(s: str) -> str:
    s = strip_md(s).strip(' :：')
    s = re.sub(r'^\d+\.\s*', '', s)
    return s


def rubric_sections(no: int, body: str) -> list[tuple[str, list[dict]]]:
    b = body.split('**ที่มา')[0]
    b = re.sub(r'```.*?```', '', b, flags=re.S)
    sections: list[list] = [['', []]]
    counter = {'r': 0, 'p': 0, 'a': 0}

    def add(kind: str, label_md: str, key_src: str | None = None, bonus: bool = False):
        counter[kind] += 1
        p = make_point(f'se{no}_{kind}{counter[kind]}', label_md.replace('⚠️', '').strip(), key_src)
        if bonus:
            p['bonus'] = True
            p['hint'] = 'โบนัส: ' + p['hint']
        sections[-1][1].append(p)

    def next_line(j: int) -> str:
        while j < len(lines) and not lines[j].strip():
            j += 1
        return lines[j].strip() if j < len(lines) else ''

    lines = [l.rstrip() for l in b.split('\n')]
    i = 0
    while i < len(lines):
        l = lines[i].replace('⚠️', '').strip()
        if not l or l.startswith('>'):
            i += 1; continue
        hm = HEAD_RE.match(l)
        if hm:
            sections.append([clean_label(hm.group(1)), []])
            i += 1; continue
        if l.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append(lines[i].strip()); i += 1
            header = [c.strip() for c in rows[0].strip('|').split('|')]
            for r in rows[2:]:
                cells = [c.strip() for c in r.strip('|').split('|')]
                if not any(cells):
                    continue
                if header and not header[0] and len(header) == len(cells):  # ตารางเปรียบเทียบ: หัวคอลัมน์คือฝั่ง A / B
                    label = cells[0] + ' — ' + ' / '.join(f'{strip_md(h)}: {c}' for h, c in zip(header[1:], cells[1:]))
                else:
                    label = ' — '.join(c for c in cells if c)
                rest = ' '.join(cells[1:])
                add('r', label, cells[0] if bolds(cells[0]) and header[0] else (rest if bolds(rest) or eng_terms(rest) else cells[0]))
            continue
        im = re.match(r'^(?:- |\d+\. )(.+)$', l)
        if im:
            add('p', im.group(1)); i += 1; continue
        lm = LABEL_RE.match(l)
        if not lm and re.match(r'^(?:- |\d+\. )', next_line(i + 1)) and (l.endswith(':') or len(strip_md(l)) < 100):
            i += 1; continue  # ประโยคนำก่อนรายการ เช่น "ตาม ... :" ไม่ใช่ประเด็น
        if lm and clean_label(lm.group(1)) in SPLIT_LABELS.get(no, ()):
            sections.append([clean_label(lm.group(1)), []])
        add('a', l, lm.group(1) + ' ' + lm.group(2) if lm else None, bonus=bool(BONUS_RE.match(l)))
        i += 1
    out = [(lbl, pts) for lbl, pts in sections if pts]
    if len(out) >= 2 and not out[0][0]:
        first = out[0][1][0]
        if no in FIRST_LABEL:
            out[0] = (FIRST_LABEL[no], out[0][1])
        elif all(p['id'].split('_')[-1][0] == 'a' for p in out[0][1]) and ':' not in first['text'][:40]:
            for p in out[0][1]:  # ย่อหน้าบทนำ → โบนัสของส่วนถัดไป
                p['bonus'] = True; p['hint'] = 'โบนัส: ' + p['hint']
            out = [(out[1][0], out[0][1] + out[1][1])] + out[2:]
        else:
            out[0] = (first['text'].split(':')[0] if ':' in first['text'][:40] else 'ประเด็นหลัก', out[0][1])
    return out


def build_slots(no: int, prompt: str, secs: list[tuple[str, list[dict]]]) -> tuple[list[dict], list[dict]]:
    rubric = [p for _, pts in secs for p in pts][:20]
    if len(secs) < 2 or any(not lbl for lbl, _ in secs):
        return rubric, derive_slots(no, prompt, rubric, False)
    slots = []
    ids = {p['id'] for p in rubric}
    for k, (lbl, pts) in enumerate(secs):
        pts = [p for p in pts if p['id'] in ids]
        core = [p for p in pts if not p.get('bonus')]
        if not pts:
            continue
        sid = f'k{k + 1}'
        for p in pts:
            p['slot'] = sid
        n = len(core) or 1
        tip = 'ตอบใจความหลัก 1–2 ประโยค' if n <= 1 else f'ตอบเป็นข้อสั้นๆ ราว {need_for(n)} ข้อก็พอ' + (f' (เฉลยมี {n} ข้อ)' if n > need_for(n) else '')
        slots.append({'id': sid, 'label': lbl if len(lbl) <= 90 else lbl[:88] + '…', 'tip': tip, 'weight': 1, 'need': need_for(n)})
    return rubric, slots


def check(no: int, rubric: list[dict], slots: list[dict]) -> None:
    """rubric ที่เขียนเองต้องสอดคล้องกัน: ทุกประเด็นอยู่ในช่องที่มี, ทุกช่องมีประเด็นหลักพอกับ need"""
    ids = {s['id'] for s in slots}
    assert len({p['id'] for p in rubric}) == len(rubric), f'ข้อ {no}: id ซ้ำ'
    for p in rubric:
        assert p['slot'] in ids, f"ข้อ {no}/{p['id']}: ไม่มีช่อง {p['slot']}"
        assert p['keywords'] and all(p['keywords']), f"ข้อ {no}/{p['id']}: ไม่มี keyword"
    for s in slots:
        core = sum(1 for p in rubric if p['slot'] == s['id'] and not p.get('bonus'))
        assert 1 <= s['need'] <= core, f"ข้อ {no}/{s['id']}: need {s['need']} แต่มีประเด็นหลัก {core}"


def main() -> None:
    prompts = extract_prompts()
    sections = split_sections(ANSWER.read_text(encoding='utf-8'))
    out = []
    for no, prompt in sorted(prompts.items()):
        sec = sections.get(no)
        if not sec:
            print(f'! ข้อ {no}: ไม่มีเฉลย', file=sys.stderr); continue
        secs = rubric_sections(no, sec['body'])
        rubric, slots = MANUAL.get(no) or (RUBRIC[no][1], RUBRIC[no][0]) if no in MANUAL or no in RUBRIC else build_slots(no, prompt, secs)
        check(no, rubric, slots)
        recap = RECAP.get(no, {})
        for s in slots:
            assert recap.get(s['id']), f"ข้อ {no}/{s['id']}: ไม่มีสรุปเฉลย"
            assert not re.search('[—–]', recap[s['id']]), f"ข้อ {no}/{s['id']}: มีขีดยาว"
        cat = next(c for c in CATEGORIES if c[0] <= no <= c[1])
        out.append({
            'no': no, 'title': sec['title'], 'category': cat[2], 'prompt': prompt,
            'slideRefs': parse_sources(sec['body']), 'rubric': rubric, 'slots': slots,
            'vocab': vocab_from(sec['body'].split('**ที่มา')[0]),
            'answerMd': f"## ข้อ {no}) {sec['title']}\n\n{sec['body']}",
            'outsideSlides': '⚠️' in sec['body'],
            'recap': {s['id']: recap[s['id']] for s in slots},
        })
    meta = {'categories': [{'id': c[2], 'label': c[3], 'from': c[0], 'to': c[1]} for c in CATEGORIES]}
    payload = json.dumps({**meta, 'questions': out}, ensure_ascii=False, separators=(',', ':'))
    OUT.write_text('// สร้างอัตโนมัติด้วย scripts/extract_cpe320.py — อย่าแก้ไฟล์นี้ตรงๆ\n'
                   'export default JSON.parse(' + json.dumps(payload, ensure_ascii=False) + ') as unknown;\n', encoding='utf-8')
    for q in out:
        print(f"{q['no']:>2} rubric {len(q['rubric']):>2} · slots " + ' | '.join(f"{s['label'][:28]}({s['need']})" for s in q['slots']), file=sys.stderr)
    print(f'{len(out)} ข้อ → {OUT.relative_to(ROOT)}', file=sys.stderr)


if __name__ == '__main__':
    main()
