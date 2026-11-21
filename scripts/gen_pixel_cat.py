"""สร้างสไปรต์แมวส้มพิกเซล → src/components/pixelCat.ts (+ ภาพตัวอย่าง ถ้าส่ง path PNG มาเป็นอาร์กิวเมนต์)

รัน:  python -I scripts/gen_pixel_cat.py [preview.png]
แต่ละท่าประกอบจากรูปทรงง่ายๆ (วงรี/หลายเหลี่ยม/เส้นหนา) แล้วลงเส้นขอบสีเข้มรอบตัวอัตโนมัติ
ทุกท่าหันขวา (ฝั่งเว็บกลับด้านด้วย scaleX(-1))
"""
import math
import pathlib
import sys

W, H = 36, 26
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'components' / 'pixelCat.ts'

PALETTE = {
    'o': '#2b1a12',  # เส้นขอบ
    'b': '#f08a24',  # ส้ม
    'd': '#c25a12',  # ลายส้มเข้ม / เงา
    'l': '#ffb257',  # ไฮไลต์
    'w': '#fff4e6',  # ขาวครีม (อก ปาก อุ้งเท้า)
    'g': '#e6d3bd',  # เงาของสีขาว
    'p': '#f59aa8',  # ชมพู (จมูก หูใน แก้ม)
    'k': '#1b0f08',  # ตา
    'z': '#7aa7ff',  # Zz
}


class Canvas:
    def __init__(self):
        self.px = [['.'] * W for _ in range(H)]

    def put(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H:
            self.px[y][x] = c

    def get(self, x, y):
        return self.px[y][x] if 0 <= x < W and 0 <= y < H else '.'

    def ellipse(self, cx, cy, rx, ry, c, only=None):
        for y in range(H):
            for x in range(W):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    if only is None or self.px[y][x] in only:
                        self.px[y][x] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, c)

    def poly(self, pts, c):
        for y in range(H):
            for x in range(W):
                if inside(x + 0.5, y + 0.5, pts):
                    self.px[y][x] = c

    def line(self, pts, c, r=1.0):
        """เส้นหนา (รัศมี r) ผ่านจุดต่างๆ"""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
            for i in range(n + 1):
                t = i / n
                cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                for y in range(int(cy - r - 1), int(cy + r + 2)):
                    for x in range(int(cx - r - 1), int(cx + r + 2)):
                        if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r:
                            self.put(x, y, c)

    def stripes(self, xs, y0, y1, c='d', on='b'):
        for x in xs:
            for y in range(y0, y1 + 1):
                if self.get(x, y) == on:
                    self.put(x, y, c)

    def outline(self):
        src = [row[:] for row in self.px]
        for y in range(H):
            for x in range(W):
                if src[y][x] == '.' and any(
                    0 <= x + dx < W and 0 <= y + dy < H and src[y + dy][x + dx] not in '.oz'
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                ):
                    self.px[y][x] = 'o'

    def rows(self):
        return [''.join(r) for r in self.px]


def inside(x, y, pts):
    c = False
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0:
            c = not c
    return c


# ───────── ชิ้นส่วนร่วม ─────────

def head(cv, cx, cy, face='open', ears='up'):
    """หัวมองเฉียงมาทางขวา (เห็นสองตา)"""
    if ears == 'up':
        cv.poly([(cx - 5.4, cy - 1), (cx - 4.2, cy - 7), (cx - 0.6, cy - 3)], 'b')
        cv.poly([(cx + 0.6, cy - 3), (cx + 4.2, cy - 7), (cx + 5.4, cy - 1)], 'b')
        for dy in (4, 5):
            cv.put(cx - 3.6, cy - dy, 'p'); cv.put(cx + 3.4, cy - dy, 'p')
    else:  # หูลู่ (งอแง)
        cv.poly([(cx - 3.5, cy - 3.8), (cx - 7.6, cy - 2.4), (cx - 4.5, cy - 0.6)], 'b')
        cv.poly([(cx + 3.5, cy - 3.8), (cx + 7.6, cy - 2.4), (cx + 4.5, cy - 0.6)], 'b')
    cv.ellipse(cx, cy, 5.2, 4.3, 'b')
    cv.rect(int(cx) - 1, int(cy) - 4, int(cx) - 1, int(cy) - 3, 'd')   # ลายหน้าผาก
    cv.rect(int(cx) + 1, int(cy) - 4, int(cx) + 1, int(cy) - 3, 'd')
    cv.ellipse(cx + 0.2, cy + 2.0, 2.8, 1.8, 'w')                         # ปาก/คาง
    ex = [int(cx) - 2, int(cx) + 2]
    ey = int(cy)
    if face == 'open':
        for x in ex:
            cv.put(x, ey - 1, 'k'); cv.put(x, ey, 'k')
    elif face == 'closed':
        for x in ex:
            cv.put(x - 1, ey, 'k'); cv.put(x, ey, 'k')
    elif face == 'happy':
        for x in ex:
            cv.put(x - 1, ey, 'k'); cv.put(x, ey - 1, 'k'); cv.put(x + 1, ey, 'k')
        cv.put(int(cx) - 4, ey + 1, 'p'); cv.put(int(cx) + 4, ey + 1, 'p')
    elif face == 'grumpy':
        for x in ex:
            cv.put(x - 1, ey - 1, 'k'); cv.put(x, ey, 'k'); cv.put(x + 1, ey, 'k')
    cv.put(int(cx), ey + 1, 'p')                                           # จมูก


def whiskers(cv, cx, cy):
    """หนวด (หลังลงเส้นขอบ) ยื่นออกนอกหัว"""
    y = int(cy) + 1
    for sgn in (1, -1):
        for dx, dy in ((7, -1), (8, -1), (7, 1), (8, 2)):
            if cv.get(int(cx) + sgn * dx, y + dy) == '.':
                cv.put(int(cx) + sgn * dx, y + dy, 'o')


def leg(cv, x, y0, y1, slant=0):
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        xx = x + slant * t
        cv.put(xx, y, 'b'); cv.put(xx + 1, y, 'b')
    cv.put(x + slant, y1, 'w'); cv.put(x + slant + 1, y1, 'w')


# ───────── ท่าต่างๆ ─────────

def walk(frame):
    cv = Canvas()
    # หาง ชี้ขึ้นโค้ง
    cv.line([(9, 13), (6, 10), (5, 6), (6.5, 3)], 'b', 1.1)
    cv.stripes([5, 6], 7, 8)
    # ขาฝั่งไกล (เข้ม)
    a, b = (0.0, 1.5) if frame == 0 else (1.5, -1.0)
    for x, s in ((10, -a), (22, -b)):
        for y in range(17, 22):
            t = (y - 17) / 4
            cv.put(x + s * t, y, 'd'); cv.put(x + 1 + s * t, y, 'd')
    # ตัว
    cv.ellipse(17, 14.5, 9.6, 4.6, 'b')
    cv.ellipse(18, 18.2, 6, 1.4, 'w', only='b')                             # ท้องขาว
    cv.stripes([12, 15, 18], 10, 13)
    cv.ellipse(23.5, 15, 3.2, 3.2, 'w', only='b')                           # อกขาว
    # ขาฝั่งใกล้
    leg(cv, 12, 17, 21, a)
    leg(cv, 24, 17, 21, b)
    head(cv, 27.5, 9)
    cv.outline()
    whiskers(cv, 27.5, 9)
    return cv.rows()


def sit(face='open', ears='up'):
    cv = Canvas()
    # หางวางพื้นแล้วม้วนขึ้น
    cv.line([(13, 22.5), (6, 22.5), (3, 21), (2.5, 17.5)], 'b', 1.1)
    cv.stripes([4, 7, 10], 21, 23)
    cv.ellipse(15, 17, 6.2, 6.2, 'b')                                        # ลำตัว/สะโพก
    cv.ellipse(12.5, 19.5, 4.6, 3.4, 'b')
    cv.stripes([11, 14], 13, 18)
    cv.ellipse(19.5, 15.5, 2.8, 4.2, 'w', only='b')                         # อกขาว
    for x in (18, 21):                                                       # ขาหน้า
        cv.rect(x, 17, x + 1, 22, 'b')
        cv.rect(x, 22, x + 1, 22, 'w')
    cv.rect(10, 22, 12, 22, 'w')                                             # อุ้งเท้าหลัง
    head(cv, 19.5, 8, face, ears)
    cv.outline()
    whiskers(cv, 19.5, 8)
    return cv.rows()


def loaf():
    cv = Canvas()
    cv.ellipse(17, 18.5, 10.5, 5, 'b')
    cv.stripes([10, 13, 16, 19], 14, 17)
    cv.line([(8, 22.3), (16, 22.6), (23, 22.3)], 'b', 0.9)                   # หางพันหน้า
    cv.stripes([11, 15, 19], 22, 23)
    head(cv, 25, 13.5, 'closed')
    cv.outline()
    whiskers(cv, 25, 13.5)
    return cv.rows()


def lie():
    cv = Canvas()
    cv.line([(6, 18.5), (2.5, 16.5), (1.5, 13.5)], 'b', 1.0)                # หาง
    cv.rect(3, 21, 7, 22, 'b'); cv.rect(3, 22, 4, 22, 'w')                   # ขาหลังเหยียด
    cv.ellipse(17, 18.6, 12, 3.8, 'b')
    cv.ellipse(18, 20.8, 9, 1.4, 'w', only='b')
    cv.stripes([9, 12, 15, 18], 15, 17)
    cv.rect(25, 21, 33, 22, 'b'); cv.rect(32, 21, 33, 22, 'w')               # ขาหน้าเหยียด
    head(cv, 29.5, 16, 'closed')
    cv.outline()
    whiskers(cv, 29.5, 16)
    cv.put(33, 6, 'z'); cv.put(34, 6, 'z'); cv.put(33, 8, 'z')               # Zz
    cv.put(30, 9, 'z'); cv.put(31, 9, 'z')
    return cv.rows()


def curl():
    cv = Canvas()
    cv.ellipse(16, 18.5, 9.5, 5.5, 'b')
    cv.stripes([9, 12, 15], 13, 17)
    head(cv, 22, 18, 'closed')
    cv.line([(8, 23), (15, 23.4), (23, 22.8), (27, 21)], 'b', 0.9)          # หางพันรอบตัว
    cv.stripes([11, 16, 21], 22, 24)
    cv.outline()
    cv.put(29, 10, 'z'); cv.put(30, 10, 'z'); cv.put(31, 12, 'z'); cv.put(32, 12, 'z')
    return cv.rows()


SPRITES = {
    'walk1': walk(0),
    'walk2': walk(1),
    'sit': sit(),
    'pet': sit('happy'),
    'grumpy': sit('grumpy', 'flat'),
    'loaf': loaf(),
    'lie': lie(),
    'curl': curl(),
}


def write_ts():
    body = ',\n'.join(
        f"  {k}: [\n" + ''.join(f"    '{r}',\n" for r in rows) + '  ]' for k, rows in SPRITES.items()
    )
    pal = ', '.join(f"{k}: '{v}'" for k, v in PALETTE.items())
    OUT.write_text(f"""// สร้างอัตโนมัติด้วย scripts/gen_pixel_cat.py — แก้ท่าทางที่สคริปต์แล้วรันใหม่ อย่าแก้ไฟล์นี้ตรงๆ
/** สไปรต์แมวส้มพิกเซล (หันขวา) 1 ตัวอักษร = 1 พิกเซล · . = โปร่งใส */
export const PALETTE: Record<string, string> = {{ {pal} }};

export const SPRITES = {{
{body},
}} satisfies Record<string, string[]>;

export type Pose = keyof typeof SPRITES;
export const SPRITE_W = {W};
export const SPRITE_H = {H};

/** รวมพิกเซลสีเดียวกันที่ติดกันในแถวเป็นสี่เหลี่ยมเดียว (SVG เบาลง) */
export function spriteRects(rows: string[]): {{ x: number; y: number; w: number; c: string }}[] {{
  const out: {{ x: number; y: number; w: number; c: string }}[] = [];
  rows.forEach((row, y) => {{
    let x = 0;
    while (x < row.length) {{
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== '.' && PALETTE[ch]) out.push({{ x, y, w: end - x, c: PALETTE[ch] }});
      x = end;
    }}
  }});
  return out;
}}
""", encoding='utf-8')


def preview(path):
    import pymupdf  # ใช้วาด PNG ตัวอย่าง (มีอยู่แล้วสำหรับสคริปต์ดึงโจทย์)
    S = 6
    names = list(SPRITES)
    cols = 4
    doc = pymupdf.open()
    page = doc.new_page(width=cols * (W + 4) * S, height=((len(names) + cols - 1) // cols) * (H + 6) * S)
    page.draw_rect(page.rect, color=None, fill=(0.93, 0.95, 0.99))
    for i, n in enumerate(names):
        ox, oy = (i % cols) * (W + 4) * S + 2 * S, (i // cols) * (H + 6) * S + 4 * S
        page.insert_text((ox, oy - S), n, fontsize=12)
        for y, row in enumerate(SPRITES[n]):
            for x, ch in enumerate(row):
                if ch != '.':
                    h = PALETTE[ch].lstrip('#')
                    rgb = tuple(int(h[j:j + 2], 16) / 255 for j in (0, 2, 4))
                    page.draw_rect(pymupdf.Rect(ox + x * S, oy + y * S, ox + (x + 1) * S, oy + (y + 1) * S), color=None, fill=rgb)
    page.get_pixmap().save(path)


if __name__ == '__main__':
    write_ts()
    if len(sys.argv) > 1:
        preview(sys.argv[1])
    print(f'{len(SPRITES)} ท่า → {OUT.relative_to(ROOT)}', file=sys.stderr)
