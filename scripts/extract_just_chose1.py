"""สร้าง src/data/just_chose1.json จาก final_Ex/Just_chose1.pdf (โจทย์) + final_Ex/Just_chose1_answer.md (เฉลย)

รัน:  python -I scripts/extract_just_chose1.py   (ต้องมี pymupdf)
- โจทย์: ข้อที่มีตาราง (กฎใน KB) ข้อความจาก PDF จะเรียงคอลัมน์ผิด จึงเขียนทับด้วย OVERRIDES
- rubric: สร้างอัตโนมัติจากเฉลย (แถวตาราง / bullet / หัวข้อย่อย ### / ย่อหน้า) — เป็นร่าง ต้อง QC ก่อนเชื่อคะแนน
- ข้อที่เฉลยเขียนว่า "ดูข้อ N" จะดึงเฉลยของข้อ N มาต่อท้ายและใช้ rubric ของข้อนั้น
"""
import json
import pathlib
import re
import sys

import pymupdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT.parent / 'final_Ex' / 'Just_chose1.pdf'
ANSWER = ROOT.parent / 'final_Ex' / 'Just_chose1_answer.md'
OUT = ROOT / 'src' / 'data' / 'just_chose1.data.ts'


def fix_thai(s: str) -> str:
    # ฟอนต์ใน PDF แยก "ำ" เป็น " า" และ "้ำ" เป็น " ้า"
    s = s.replace(' ้า', '้ำ').replace(' า', 'ำ')
    return s


def clean(s: str) -> str:
    """PDF ตัดบรรทัดที่ราว 90–100 ตัวอักษร: ต่อบรรทัดเมื่อบรรทัดก่อนหน้ายาว (ถูกตัดกลางประโยค) ที่เหลือคงการขึ้นบรรทัดไว้"""
    lines = [re.sub(r'[ 	]+', ' ', l).strip() for l in s.splitlines()]
    out: list[str] = []
    prev_raw = 0
    for l in lines:
        if not l:
            if out and out[-1] != '':
                out.append('')
            prev_raw = 0
            continue
        if re.fullmatch(r'[a-f]\)', l):
            out.append(l); prev_raw = 0; continue
        if out and re.fullmatch(r'[a-f]\)', out[-1]):
            out[-1] += ' ' + l; prev_raw = len(l); continue
        is_item = re.match(r'^([a-f]\)|[•▪]|\d+\.\d+|\([a-c]\))', l)
        if out and out[-1] != '' and not is_item and prev_raw >= 70:
            thai_join = re.search(r'[฀-๿]$', out[-1]) and re.match(r'^[฀-๿]', l)
            out[-1] += ('' if thai_join else ' ') + l
        else:
            out.append(l)
        prev_raw = len(l)
    text = '\n'.join(out).strip()
    text = re.sub(r'^[•▪]\s*', '- ', text, flags=re.M)
    return re.sub(r'\n{3,}', '\n\n', text)


# ข้อที่มีตารางกฎ: PDF ดึงข้อความออกมาเรียงคอลัมน์ผิด จึงจัดเป็นตาราง markdown — ข้อความทุกคำตรงตามกระดาษ (รวมคำพิมพ์ผิดในต้นฉบับ)
OVERRIDES = {
    58: """จากความรู้สำหรับใช้แก้ปัญหาเรื่องหนึ่งใน Knowledge Base ของ Expert System ระบบหนึ่ง ตามตารางข้างล่างนี้

| Rule No. | Rule |
|---|---|
| R1 | IF a AND b THEN c |
| R2 | IF q THEN x |
| R3 | IF m THEN y |
| R4 | IF w AND x THEN g AND z |
| R5 | IF d OR z THEN e |
| R6 | IF c AND e THEN f |
| R7 | IF x THEN a |
| R8 | IF y THEN b |
| R9 | IF f THEN s |
| R10 | IF g THEN r |

- จงเขียน Clause-Tree ของ Knowledge Base นี้
- จงแปลงความรู้ใน KB ข้างต้นให้อยู่ในรูปของ RRBM และ RCBM
- จงแสดงขั้นตอนการทำงานของ Backward Chaining Inference เมื่อกำหนดให้ Goal = {s} และ WM = {q, w, m}
- จงแสดงขั้นตอนการทำงานของ Forward Chaining Inference เมื่อกำหนดให้ WM = {q, w}""",
    68: """กำหนดให้ Knowledge Base ของ AI System ระบบหนึ่ง ประกอบด้วย List of rules ดังต่อไปนี้

| Rule No. | Rule |
|---|---|
| 1 | IF K OR Z THEN L |
| 2 | IF H AND I THEN J |
| 3 | IF O THEN V |
| 4 | IF U THEN X |
| 5 | IF J AND L THEN N |
| 6 | IF N THEN T |
| 7 | IF W AND X THEN O AND Z |
| 8 | IF X THEN H |
| 9 | IF Y THEN I |

จาก Knowledge Base ข้างต้น
- a) จงแสดงขั้นตอนการสร้าง Clause-Tree
- b) จงแสดง Reduced Clause Bit-Matrix""",
    84: r"""จาก Knowledge Base ของการแก้ไขปัญหารถยนต์ ดังต่อไปนี้

| Rule No. | Rule |
|---|---|
| R1 | IF Task is begin THEN ASK Car problem |
| R2 | IF Car problem IS won’t start THEN Task IS test cranking system |
| R3 | IF Car problem IS hesitates at high speeds THEN Task IS test fuel system |
| R4 | IF Task IS test cranking system THEN ASK Engine turns |
| R5 | IF Task IS test cranking system AND Engine turns\ slowly or not at all<br>THEN Cranking system IS defective AND Task IS test battery connection |
| R6 | IF Task IS test cranking system AND Engine turns\ normally<br>THEN Cranking system IS good AND Task IS test ignition system |
| R7 | IF Task IS test battery connection THEN ASK Screwdriver test shows that lights |
| R8 | IF Task IS test battery connection<br>AND Screwdriver test shows that lights\ brighten<br>OR Screwdriver test shows that lights\ not on<br>THEN Problem IS bad battery connection |
| R9 | IF Task IS test battery connection<br>AND Screwdriver test shows that lights\ don’t brighten<br>THEN battery connection IS good AND Task IS test battery |

จงแสดงขั้นตอนการอนุมานโดยวิธี Forward chaining inference เพื่อหาคำตอบของปัญหา เมื่อกำหนดให้ Working memory มีข้อเท็จจริงเริ่มต้นคือ “Task IS begin” และ User ได้ให้ข้อเท็จจริงเพิ่มเติมในระหว่างการอนุมานดังนี้ คือ (1) Car problem IS won’t start (2) Engine turns\ slowly or not at all และ (3) Screwdriver test shows that lights\ brighten""",
    88: """จากความรู้สำหรับใช้แก้ปัญหาเรื่องหนึ่งๆ ใน Knowledge Base ของ Expert System ระบบหนึ่งตามตารางข้างล่างนี้

| Rule No. | Rule |
|---|---|
| R1 | IF clause_A AND clause_B THEN clause_C |
| R2 | IF clause_Q THEN cluase_X |
| R3 | IF clause_M THEN clause_Y |
| R4 | IF clause_W AND clause_X THEN clause_G AND clause_Z |
| R5 | IF clause_D OR clause_Z THEN clause_E |
| R6 | IF clause_C AND clause_E THEN clause_F |
| R7 | IF clause_X THEN clause_A |
| R8 | IF clause_Y THEN clause_B |
| R9 | IF clause_F THEN clause_S |
| R10 | IF clause_G THEN clause_R |

- จงแสดงขั้นตอนของ Backward chaining inference เมื่อกำหนดให้ Goal = {clause_S} และ Blackboard = {clause_Q, clause_W, clause_M}
- จงแสดงขั้นตอนของ Forward chaining inference (10 คะแนน) เมื่อกำหนดให้ Blackboard = {clause_Q, clause_W}""",
    117: """จาก Knowledge Base ของ AI System ระบบหนึ่ง ประกอบด้วย List of rules ดังตาราง จงเขียน Clause-Tree Rule-based Knowledge Representation

| Rule No. | Rule |
|---|---|
| 1 | IF K OR Z THEN L |
| 2 | IF H AND I THEN J |
| 3 | IF O THEN V |
| 4 | IF U THEN X |
| 5 | IF J AND L THEN N |
| 6 | IF N THEN T |
| 7 | IF W AND X THEN O AND Z |
| 8 | IF X THEN H |
| 9 | IF Y THEN I |""",
}

# รูปประกอบที่ตัดมาจาก PDF (public/jc1/*.png) แทนที่ข้อความใต้รูปที่ดึงออกมาได้
FIGURES = {
    67: ('10 ลิตร 5 ลิตร 3 ลิตร', '![ถังน้ำมัน 10 ลิตร, 5 ลิตร, 3 ลิตร (ตามรูปในกระดาษ)](/jc1/q67.png)'),
    87: ('10 ลิตร 8 ลิตร 3 ลิตร', '![ถังน้ำมัน 10 ลิตร, 8 ลิตร, 3 ลิตร](/jc1/q87.png)'),
    121: ('\n\nเมื่อกำหนดให้', '\n\n![Eight-Puzzle: Initial State และ Goal State](/jc1/q121.png)\n\nเมื่อกำหนดให้'),
}


def finish_prompt(n: int, text: str) -> str:
    if n in FIGURES:
        old, new = FIGURES[n]
        assert old in text, (n, old)
        text = text.replace(old, new, 1)
    if n == 67:  # ตารางเปล่าท้ายโจทย์
        text = text.replace('\nRule number\nState', '\n| Rule number | State |\n|---|---|\n| | |')
    # รายการย่อย a) b) ที่มีบรรทัดว่างคั่น (มาจากการขึ้นหน้าใหม่ใน PDF)
    text = re.sub(r'\n\n(?=[a-f]\) )', '\n', text)
    return text


CATEGORIES = [
    (1, 18, 'basic', 'พื้นฐาน AI'),
    (19, 32, 'search', 'Problem Solving & Search'),
    (33, 50, 'knowledge', 'Knowledge & Inference'),
    (51, 91, 'practice', 'โจทย์ทำ'),
    (92, 132, 'review', 'ทบทวนรวม'),
]


def extract_prompts() -> dict[int, str]:
    doc = pymupdf.open(PDF)
    raw = fix_thai('\n'.join(p.get_text() for p in doc))
    raw = raw.split('“ Direction สำคัญกว่า Speed')[0]
    # หัวข้อ: เลขต้นบรรทัดตามด้วย "." (ข้อ 53 ไม่มีจุด → ตามด้วยช่องว่าง+ภาษาไทย) · ข้อ 72 ไม่มีในกระดาษ
    marks = []
    expect = 1
    for m in re.finditer(r'^\s*(\d{1,3})(?:\s*\.|(?=\s+[฀-๿]))', raw, flags=re.M):
        n = int(m.group(1))
        if n == expect or (n == expect + 1 and expect == 72):
            marks.append((n, m.start(), m.end()))
            expect = n + 1
    prompts = {}
    for i, (n, _, end) in enumerate(marks):
        stop = marks[i + 1][1] if i + 1 < len(marks) else len(raw)
        prompts[n] = OVERRIDES.get(n) or finish_prompt(n, clean(raw[end:stop]))
    return prompts


# ───────────── เฉลย ─────────────

def split_sections(md: str) -> dict[int, dict]:
    out: dict[int, dict] = {}
    parts = re.split(r'^## ข้อ ', md, flags=re.M)[1:]
    for part in parts:
        head, _, body = part.partition('\n')
        m = re.match(r'(\d+)\s*(\([^)]*\))?\s*(?:—\s*(.*))?$', head.strip())
        if not m:
            continue
        n = int(m.group(1))
        note = (m.group(2) or '').strip()
        body = re.sub(r'\n---\s*$', '', body.strip()).strip()
        out[n] = {'no': n, 'title': (m.group(3) or '').strip(), 'opinion': 'ความเห็น' in note, 'body': body}
    return out


def parse_slides(body: str) -> tuple[list[dict], str]:
    refs: list[dict] = []
    rest = []
    for l in body.split('\n'):
        if l.startswith('📍'):
            for piece in l.lstrip('📍').strip().split(' · '):
                piece = piece.strip()
                m = re.match(r'(.+?)\s+หน้า\s+(.+)$', piece)
                if m:
                    refs.append({'file': m.group(1).strip(), 'pages': m.group(2).strip()})
                elif piece:
                    f, _, note = piece.partition(' (')
                    refs.append({'file': f.strip(), 'pages': ('(' + note) if note else ''})
        else:
            rest.append(l)
    return refs, '\n'.join(rest).strip()


REF_RE = re.compile(r'(?:ดูข้อ|เหมือนข้อ)\s*(\d+)(?:\s*[–-]\s*(\d+))?(?:\s*(?:และ|,)\s*(\d+))?')


def refs_in(body: str) -> list[int]:
    out: list[int] = []
    for m in REF_RE.finditer(body):
        a = int(m.group(1))
        b = int(m.group(2)) if m.group(2) else a
        out += list(range(a, b + 1))
        if m.group(3):
            out.append(int(m.group(3)))
    seen: list[int] = []
    for n in out:
        if n not in seen:
            seen.append(n)
    return seen


def strip_md(s: str) -> str:
    s = re.sub(r'\*\*(.+?)\*\*', r'\1', s)
    s = re.sub(r'(?<![\w*])\*(.+?)\*(?!\w)', r'\1', s)
    s = re.sub(r'\$([^$]+)\$', r'\1', s)
    s = s.replace('<br>', ' ').replace('<br/>', ' ').replace('`', '').replace('\\*', '*')
    return re.sub(r'\s+', ' ', s).strip()


def bolds(s: str) -> list[str]:
    out = []
    for b in re.findall(r'\*\*(.+?)\*\*', s):
        b = strip_md(b).strip(' :：')
        b = re.sub(r'^[a-f]\)\s*', '', b)
        if 2 <= len(b) <= 40 and b not in out:
            out.append(b)
    return out


STOP = {'that', 'with', 'from', 'this', 'there', 'which', 'when', 'what', 'into', 'about', 'their', 'than',
        'used', 'using', 'some', 'other', 'have', 'been', 'such', 'they', 'then', 'each', 'will', 'also'}


def eng_terms(s: str) -> list[str]:
    words = re.findall(r'[A-Za-z][A-Za-z\-*]{3,}(?:\s+[A-Z][A-Za-z\-]{2,})?', strip_md(s))
    out = []
    for w in words:
        if w.lower() not in STOP and w not in out:
            out.append(w)
    return out


def thai_token(s: str) -> str | None:
    for t in strip_md(s).split():
        t = t.strip('()[]:,.')
        if re.match(r'^[฀-๿]{3,}$', t):
            return t[:6]
    return None


def make_point(pid: str, label_md: str, key_src: str | None = None) -> dict:
    label = strip_md(label_md)
    src = key_src if key_src is not None else label_md
    keys = bolds(src)[:4] or eng_terms(src)[:4]
    if not keys:
        keys = eng_terms(label_md)[:4]
    if not keys:
        t = thai_token(src) or thai_token(label_md)
        keys = [t] if t else []
    if not keys:  # แถวตารางที่เป็นตัวเลข/สถานะ เช่น 8-puzzle "254 / 761 / 83_" — ใช้ค่าในเซลล์เป็นคำสำคัญ
        cells = [c.strip() for c in strip_md(label_md).split(' — ')]
        keys = [c for c in cells if len(re.sub(r'[\s/_]', '', c)) >= 3][:3] or [c for c in cells if len(c) >= 2][:3]
    if len(label) > 180:
        label = label[:177].rstrip() + '…'
    hint = f'นึกถึง: {", ".join(keys[:2])}' if keys else f'ประเด็น: {label[:40]}…'
    return {'id': pid, 'text': label, 'weight': 1, 'keywords': [[k.lower() for k in keys]] if keys else [], 'hint': hint}


def rubric_from(no: int, body: str) -> list[dict]:
    # ไม่เอา code/mermaid และ blockquote มาทำ rubric (ยังแสดงในเฉลยเต็ม)
    b = re.sub(r'```.*?```', '', body, flags=re.S)
    b = '\n'.join(l for l in b.split('\n') if not l.startswith('>'))
    pts: list[dict] = []
    subs = re.findall(r'^###\s+(.+)$', b, flags=re.M)
    if subs:  # โจทย์ทำที่แบ่งเป็นหัวข้อย่อย
        return [make_point(f'jc{no}_s{i + 1}', h) for i, h in enumerate(subs)]
    rows = [l for l in b.split('\n') if l.startswith('|')]
    body_rows = [r for r in rows[2:] if not re.match(r'^\|[\s\-:|]+\|$', r)] if len(rows) >= 3 else []
    items = re.findall(r'^(?:- |\d+\. )(.+)$', b, flags=re.M)
    if body_rows and len(body_rows) >= len(items):
        for i, r in enumerate(body_rows):
            cells = [c.strip() for c in r.strip('|').split('|')]
            label = ' — '.join(c for c in cells if c)
            rest = ' '.join(cells[1:])
            key_src = rest if bolds(rest) else (cells[0] if bolds(cells[0]) or not eng_terms(rest) else rest)
            pts.append(make_point(f'jc{no}_r{i + 1}', label, key_src))
    elif items:
        pts = [make_point(f'jc{no}_p{i + 1}', it) for i, it in enumerate(items)]
    else:
        paras = [p.strip() for p in re.split(r'\n\s*\n', b) if p.strip() and not p.strip().startswith('|')]
        pts = [make_point(f'jc{no}_a{i + 1}', para) for i, para in enumerate(paras[:3])]
    if not pts:  # เฉลยเป็นแผนภาพล้วน (mermaid)
        code = ' '.join(re.findall(r'```.*?```', body, flags=re.S))
        labels = re.findall(r'[\[({]+([^\])}]+)[\])}]+', code)
        pts = [make_point(f'jc{no}_d1', 'แสดงแผนภาพ/ขั้นตอนให้ครบตามเฉลย', ' '.join(labels))]
    return pts[:16]


def vocab_from(body: str) -> list[str]:
    out: list[str] = []
    for w in bolds(body) + eng_terms(body):
        if re.search(r'[A-Za-z]', w) and w not in out:
            out.append(w)
    return out[:30]


def short_title(prompt: str) -> str:
    t = re.sub(r'\s+', ' ', prompt.split('\n')[0]).strip()
    t = re.sub(r'^(จง)', '', t)
    return t if len(t) <= 70 else t[:68].rstrip() + '…'


# ───────── ช่องคำตอบ (แบ่งคำตอบเป็นช่องๆ ให้เขียนง่าย) + เกณฑ์ผ่อนปรน ─────────

ITEM_RE = re.compile(r'^(?:- )?([a-f]\)|\d\.\d)\s*(.+)$')


def prompt_items(prompt: str) -> list[tuple[str, str]]:
    """รายการย่อยในโจทย์: a) b) … หรือ 3.1 3.2 … หรือ bullet "- จง…" """
    items = [(m.group(1), m.group(2).strip()) for m in (ITEM_RE.match(l.strip()) for l in prompt.split('\n')) if m]
    if not items:
        items = [('•', l[2:].strip()) for l in prompt.split('\n') if l.startswith('- ') and l[2:].strip().startswith('จง')]
    return items if len(items) >= 2 else []


def need_for(n: int, frac: float = 0.6) -> int:
    """ต้องตอบได้กี่ประเด็นถึงได้เต็ม — คนสอบเขียนสั้นกว่าเฉลย จึงไม่ต้องครบทุกข้อ"""
    return n if n <= 1 else max(1, round(n * frac))


def first_cell(text: str) -> str:
    """ชื่อเทอมของประเด็น: ช่องแรกของแถวตาราง หรือข้อความก่อน ':' ของ bullet"""
    return re.split(r' — |:', text)[0].strip()


def item_tip(item: str, prompt: str = '') -> str:
    for text in (item, prompt):
        if re.search(r'นิยาม|definition|คืออะไร', text, re.I):
            return 'นิยามสั้นๆ 1–2 ประโยค'
        if re.search(r'Flowchart|Diagram|สถาปัตยกรรม|โครงสร้าง', text, re.I):
            return 'เขียนเป็นกล่อง/ขั้นตอนต่อกัน เช่น A → B → C'
        if re.search(r'แสดงขั้นตอน|แสดงการ|เขียน Algorithm', text, re.I):
            return 'แสดงขั้นตอนสำคัญและผลลัพธ์'
        if re.search(r'เลียนแบบ', text):
            return 'บอกว่าเลียนแบบอะไร + กลไกหลัก 1–2 ประโยค'
        if re.search(r'แนวคิด|อธิบาย', text):
            return 'อธิบายแนวคิดสั้นๆ 1–2 ประโยค (+ ตัวอย่างถ้าโจทย์ขอ)'
    return 'ตอบสั้นๆ ตรงประเด็น'


def derive_slots(no: int, prompt: str, rubric: list[dict], opinion: bool) -> list[dict]:
    """กำหนด slot ให้ rubric (แก้ rubric ในที่) แล้วคืนรายการช่อง"""
    kinds = {p['id'].split('_')[-1][0] for p in rubric}   # s=หัวข้อย่อย r=แถวตาราง p=bullet a=ย่อหน้า d=แผนภาพ
    items = prompt_items(prompt)
    slots: list[dict] = []

    def single(tip: str, frac: float = 0.6, need: int | None = None):
        for p in rubric:
            p['slot'] = 'main'
        n = len(rubric)
        slots.append({'id': 'main', 'label': 'คำตอบ', 'tip': tip, 'weight': 1, 'need': need if need is not None else need_for(n, frac)})

    # 1) โจทย์ "นิยามเทอมต่อไปนี้" + เฉลยเป็นตารางเทอม → ช่องละเทอม
    if kinds in ({'r'}, {'p'}) and len(rubric) >= 3 and not items and all(len(first_cell(p['text'])) <= 40 for p in rubric) and all(any(part.strip().lower()[:12] in prompt.lower() for part in first_cell(p['text']).split('/')) for p in rubric):
        for i, p in enumerate(rubric):
            sid = f's{i + 1}'
            p['slot'] = sid
            slots.append({'id': sid, 'label': first_cell(p['text']), 'tip': 'นิยามสั้นๆ 1 ประโยค', 'weight': 1, 'need': 1, 'short': True})
        return slots

    # 2) โจทย์มีข้อย่อย → ช่องละข้อย่อย
    if items:
        assign: list[int] = []
        if len(items) == len(rubric):
            assign = list(range(len(rubric)))
        else:
            cur = 0
            for p in rubric:
                t = p['text'].lower()
                hit = None
                for k, (key, it) in enumerate(items):
                    term = re.sub(r'^(จง\S*\s*)', '', it).lower()
                    if t.startswith(key.lower()) or (len(term) >= 4 and term[:20] in t):
                        hit = k
                        break
                cur = hit if hit is not None else cur
                assign.append(cur)
        used = sorted(set(assign))
        if len(used) >= 2:
            for k in used:
                key, it = items[k]
                pts = [p for p, a in zip(rubric, assign) if a == k]
                for p in pts:
                    p['slot'] = f'i{k + 1}'
                n = len(pts)
                label = (key + ' ' if key != '•' else '') + it
                slots.append({'id': f'i{k + 1}', 'label': label if len(label) <= 90 else label[:88] + '…',
                              'tip': item_tip(it, prompt) if n <= 1 else f'{item_tip(it, prompt)} · ตอบได้ราว {need_for(n)} ประเด็นก็พอ',
                              'weight': 1, 'need': need_for(n)})
            return slots

    # 3) โจทย์ทำที่เฉลยแบ่งหัวข้อย่อย ### → ช่องละหัวข้อ
    if kinds == {'s'} and len(rubric) >= 2:
        for i, p in enumerate(rubric):
            sid = f's{i + 1}'
            p['slot'] = sid
            slots.append({'id': sid, 'label': p['text'], 'tip': 'แสดงขั้นตอนสำคัญและผลลัพธ์', 'weight': 1, 'need': 1})
        return slots

    # 4) ช่องเดียว
    n = len(rubric)
    if opinion:
        single('บอกจุดยืนให้ชัด (ใช่/ไม่ใช่, เห็นด้วยไหม) + เหตุผล 1–2 ข้อ', need=1)
    elif kinds <= {'a'} or kinds == {'d'}:
        single('เขียนเป็นกล่อง/ขั้นตอนต่อกัน เช่น A → B → C' if kinds == {'d'} else 'ตอบใจความหลัก 1–3 ประโยค', need=1)
    elif kinds == {'r'} and re.search(r'แสดง|Transition|จงหา', prompt):
        single(f'แสดงขั้นตอนหลัก ราว {need_for(n, 0.4)} ขั้นก็พอ (ไม่ต้องครบทุกบรรทัดในเฉลย)', frac=0.4)
    elif re.search(r'แตกต่าง|ต่างจาก|เปรียบเทียบ|เหมือนหรือ', prompt):
        single(f'เขียนเป็นข้อ: ฝั่ง A … / ฝั่ง B … ราว {need_for(n)} ประเด็น')
    else:
        single(f'ตอบเป็นข้อสั้นๆ ราว {need_for(n)} ข้อก็พอ' + (f' (เฉลยมี {n} ข้อ)' if n > need_for(n) else ''))
    return slots


def main() -> None:
    prompts = extract_prompts()
    sections = split_sections(ANSWER.read_text(encoding='utf-8'))
    out = []
    for no, prompt in sorted(prompts.items()):
        sec = sections.get(no)
        if not sec:
            print(f'! ข้อ {no}: ไม่มีเฉลย', file=sys.stderr)
            continue
        slides, body = parse_slides(sec['body'])
        refs = [r for r in refs_in(body) if r != no and r in sections]
        own_len = len(REF_RE.sub('', body).strip())
        head = lambda n: f"## ข้อ {n}{' — ' + sections[n]['title'] if sections[n]['title'] else ''}"
        answer_md = f'{head(no)}\n\n{body}'
        for r in refs:
            rs, rb = parse_slides(sections[r]['body'])
            answer_md += f'\n\n---\n\n{head(r)}\n\n{rb}'
            if not slides:
                slides = rs
        rubric_src = '\n\n'.join(parse_slides(sections[r]['body'])[1] for r in refs) if refs and own_len < 200 else body
        rubric = rubric_from(no, rubric_src)
        if not rubric:
            print(f'! ข้อ {no}: สร้าง rubric ไม่ได้', file=sys.stderr)
        slots = derive_slots(no, prompt, rubric, sec['opinion'])
        cat = next(c for c in CATEGORIES if c[0] <= no <= c[1])
        out.append({
            'no': no,
            'title': sec['title'] or short_title(prompt),
            'category': cat[2],
            'opinion': sec['opinion'],
            'prompt': prompt,
            'slideRefs': slides,
            'rubric': rubric,
            'slots': slots,
            'vocab': vocab_from(rubric_src),
            'answerMd': answer_md.strip(),
            'seeAlso': refs,
        })
    meta = {'categories': [{'id': c[2], 'label': c[3], 'from': c[0], 'to': c[1]} for c in CATEGORIES]}
    payload = json.dumps({**meta, 'questions': out}, ensure_ascii=False, separators=(',', ':'))
    # เป็น .ts (ไม่ใช่ .json) เพราะ Node ESM บน Vercel import .json ตรงๆ ไม่ได้ · JSON.parse เร็วกว่า object literal ใหญ่ๆ
    OUT.write_text('// สร้างอัตโนมัติด้วย scripts/extract_just_chose1.py — อย่าแก้ไฟล์นี้ตรงๆ\n'
                   'export default JSON.parse(' + json.dumps(payload, ensure_ascii=False) + ') as unknown;\n', encoding='utf-8')
    sizes = [len(q['rubric']) for q in out]
    print(f'{len(out)} ข้อ → {OUT.relative_to(ROOT)} · rubric {min(sizes)}–{max(sizes)} ประเด็น/ข้อ', file=sys.stderr)


if __name__ == '__main__':
    main()
