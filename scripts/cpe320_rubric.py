"""rubric CPE320 ที่คัดเองทีละข้อ (QC แล้ว) — ใช้แทน rubric อัตโนมัติใน extract_cpe320.py

หลักการ
- เอาเฉพาะประเด็นสำคัญที่ข้อสอบ 2% ควรมี (ข้อละ 2–6 ประเด็น) ไม่ใช่ทุกบรรทัดในเฉลย
- แบ่งช่องตามสิ่งที่โจทย์ถาม; need = ต้องได้กี่ประเด็นถึงเต็มช่อง (ตั้งให้พอดีกับการเขียนตอบในห้องสอบ)
- รายละเอียดเสริม/ตัวอย่างนอกสไลด์ → bonus (ไม่ตอบไม่หัก)
- keywords ใช้ตอนไม่มี AI เท่านั้น: list ของกลุ่ม (AND) แต่ละกลุ่มเป็นคำที่ใช้แทนกันได้ (OR) ตัวพิมพ์เล็ก
"""


def S(sid, label, need, tip, weight=1, short=False):
    d = {'id': sid, 'label': label, 'tip': tip, 'weight': weight, 'need': need}
    if short:
        d['short'] = True
    return d


def P(pid, slot, text, kw, hint, bonus=False, wrong=None):
    groups = kw if kw and isinstance(kw[0], list) else [kw]
    d = {'id': pid, 'slot': slot, 'text': text, 'weight': 1, 'keywords': [[k.lower() for k in g] for g in groups], 'hint': hint}
    if bonus:
        d['bonus'] = True
        d['hint'] = 'โบนัส: ' + hint
    if wrong:
        d['wrongIf'] = wrong
    return d


# ข้อ -> (ช่องคำตอบ, ประเด็น)
RUBRIC: dict[int, tuple[list[dict], list[dict]]] = {
    1: ([
        S('def', 'นิยาม Software Engineering (ตามการทำงานจริง)', 2, 'นิยาม 1–2 ประโยค: ใช้หลักวิศวกรรม → ได้ซอฟต์แวร์แบบไหน ภายใต้ข้อจำกัดอะไร'),
        S('why', 'ทำไมต้องใช้ Software Process Model', 2, 'ตอบเป็นข้อสั้นๆ 2–3 ข้อ'),
    ], [
        P('se1_eng', 'def', 'กระบวนการพัฒนาโดยประยุกต์ใช้หลักการทางวิศวกรรม (เป็นระบบ มีระเบียบวินัย วัดผลได้)', ['วิศวกรรม', 'engineering', 'เป็นระบบ', 'systematic'], 'บอกว่า SE คือการนำ "หลักวิศวกรรม" มาใช้พัฒนาซอฟต์แวร์อย่างเป็นระบบ'),
        P('se1_goal', 'def', 'เพื่อให้ได้ซอฟต์แวร์ที่ทำงานได้จริงอย่างมีประสิทธิภาพ ตรงความต้องการของลูกค้า', ['ความต้องการ', 'ลูกค้า', 'requirement', 'customer', 'มีประสิทธิภาพ', 'คุณภาพ'], 'ผลลัพธ์: ซอฟต์แวร์ที่ใช้งานได้จริง มีคุณภาพ ตรงความต้องการลูกค้า'),
        P('se1_limit', 'def', 'ภายใต้งบประมาณและระยะเวลาที่สมเหตุสมผล (ทรัพยากรจำกัด)', ['งบ', 'budget', 'cost', 'เวลา', 'time', 'ทรัพยากร'], 'ข้อจำกัด: ภายใต้งบประมาณและเวลาที่กำหนด'),
        P('se1_road', 'why', 'เป็น roadmap กำหนดกิจกรรม/งาน/milestone/work product ว่าใครทำอะไร เมื่อไหร่ อย่างไร', ['roadmap', 'กิจกรรม', 'activity', 'task', 'milestone', 'ใครทำอะไร', 'ขั้นตอน'], 'Process Model เป็น roadmap บอกขั้นตอน/งาน ใครทำอะไร เมื่อไหร่'),
        P('se1_ctrl', 'why', 'ทำให้งานเป็นระเบียบ ควบคุมได้ เสถียร (stability, control, organization) บริหารและคาดการณ์ได้', ['ควบคุม', 'control', 'ระเบียบ', 'เสถียร', 'stability', 'บริหาร', 'คาดการณ์'], 'ทำให้งานควบคุมได้ เป็นระเบียบ คาดการณ์ได้'),
        P('se1_crisis', 'why', 'ลดความเสี่ยง/ป้องกัน Software Crisis (เกินเวลา เกินงบ ไม่ตรงความต้องการ คุณภาพต่ำ)', ['crisis', 'เกินงบ', 'เกินเวลา', 'ความเสี่ยง', 'risk', 'ล้มเหลว'], 'ป้องกันโปรเจกต์เกินเวลา/เกินงบ/ไม่ตรงความต้องการ (Software Crisis)'),
        P('se1_pmt', 'def', 'SE = Process + Methods + Tools โดยมี Quality Focus เป็นฐาน', ['process', 'method', 'tool', 'quality focus'], 'SE = P + M + T บน Quality Focus', bonus=True),
    ]),
    2: ([
        S('fit', 'เหมาะกับระบบงานลักษณะไหน', 1, '1–2 ประโยค'),
        S('lim', 'ข้อจำกัด', 3, 'ตอบเป็นข้อสั้นๆ 3 ข้อ', weight=2),
    ], [
        P('se2_fit', 'fit', 'ระบบที่ requirement ชัดเจน เข้าใจดี และคงที่ ไม่ค่อยเปลี่ยนแปลง', ['ชัดเจน', 'คงที่', 'ไม่เปลี่ยน', 'stable', 'clear', 'well-defined', 'ตายตัว'], 'Waterfall เหมาะกับระบบที่ requirement ชัดเจนและไม่เปลี่ยน',
          wrong=['บอกว่าเหมาะกับระบบที่ requirement เปลี่ยนบ่อย']),
        P('se2_big', 'fit', 'เช่น โปรเจกต์ใหญ่ เน้นเอกสาร ต้องการ resource planning / cost control ชัด', ['เอกสาร', 'document', 'ขนาดใหญ่', 'ใหญ่', 'cost control', 'resource'], 'ตัวอย่าง: โปรเจกต์ใหญ่ เน้นเอกสาร ควบคุมต้นทุนชัด', bonus=True),
        P('se2_change', 'lim', 'รองรับการเปลี่ยนแปลง requirement ได้ยาก ไม่ยืดหยุ่น (ต้องทำแต่ละขั้นให้เสร็จก่อน ย้อนกลับยาก)', ['เปลี่ยน', 'change', 'ยืดหยุ่น', 'flexib', 'ย้อนกลับ'], 'ไม่รองรับ requirement ที่เปลี่ยน / ย้อนกลับไปแก้ขั้นก่อนหน้ายาก'),
        P('se2_upfront', 'lim', 'ลูกค้าต้องระบุ requirement ทั้งหมดให้ครบตั้งแต่ต้น ซึ่งทำได้ยาก', ['ตั้งแต่ต้น', 'ครบ', 'ทั้งหมด', 'upfront', 'ระบุ'], 'ลูกค้าบอก requirement ให้ครบตั้งแต่แรกได้ยาก'),
        P('se2_late', 'lim', 'ลูกค้าเห็น/ใช้งานซอฟต์แวร์ได้ก็ตอนท้ายเมื่อเสร็จทั้งระบบ', ['ตอนท้าย', 'เสร็จทั้งหมด', 'จนกว่า', 'ทั้งระบบ', 'ช่วงท้าย', 'working version'], 'ลูกค้าต้องรอจนเสร็จทั้งระบบถึงได้ใช้งาน'),
        P('se2_cost', 'lim', 'เจอปัญหาตอนท้าย (surprises at the end) แก้แพง ความเสี่ยงโปรเจกต์สูง', ['แพง', 'ความเสี่ยง', 'risk', 'surprise', 'ต้นทุน'], 'ปัญหาที่เจอตอนท้ายแก้แพง ความเสี่ยงสูง'),
        P('se2_linear', 'lim', 'โปรเจกต์จริงไม่ค่อยเป็นลำดับเชิงเส้น / บางทีมต้องรอทีมอื่น (blocking)', ['เชิงเส้น', 'linear', 'sequential', 'รอ', 'blocking'], 'งานจริงไม่เป็นเส้นตรง ทีมต้องรอกัน'),
    ]),
    3: ([
        S('proto', 'ข้อดีที่ได้จาก Prototyping model', 1, '1 ประโยค'),
        S('water', 'ข้อดีที่ได้จาก Waterfall model', 1, '1 ประโยค'),
    ], [
        P('se3_iter', 'proto', 'ลักษณะการวนซ้ำ (iterative) ของ Prototyping ได้เวอร์ชันที่สมบูรณ์ขึ้นเรื่อยๆ และใช้ prototype ลดความเสี่ยง', ['วนซ้ำ', 'iterat', 'วน', 'รอบ', 'prototype', 'ต้นแบบ'], 'จาก Prototyping: การทำงานแบบวนซ้ำ (iterative)'),
        P('se3_sys', 'water', 'การทำงานอย่างเป็นระบบ เป็นขั้นตอน มีการควบคุม (controlled & systematic) ของ Waterfall', ['เป็นระบบ', 'systematic', 'ขั้นตอน', 'ควบคุม', 'control', 'linear', 'sequential'], 'จาก Waterfall: การทำงานเป็นขั้นตอนอย่างเป็นระบบและควบคุมได้'),
        P('se3_risk', 'water', 'ทุกรอบมี Risk Analysis ทำให้ความเสี่ยงลดลงเรื่อยๆ', ['risk', 'ความเสี่ยง'], 'Spiral มี Risk Analysis ทุกรอบ', bonus=True),
    ]),
    4: ([
        S('m', 'Agile Manifesto 4 ข้อ (ให้คุณค่า … มากกว่า …)', 3, 'เขียน 4 ข้อแบบ "A มากกว่า B" ได้ 3 ข้อก็เต็ม'),
    ], [
        P('se4_people', 'm', 'บุคคลและการสื่อสาร (Individuals & Interactions) มากกว่า Process & Tools', ['individual', 'interaction', 'บุคคล', 'คน', 'สื่อสาร'], 'Individuals & Interactions > Process & Tools'),
        P('se4_sw', 'm', 'ซอฟต์แวร์ที่ทำงานได้จริง (Working Software) มากกว่าเอกสารที่ครบถ้วน', ['working software', 'ทำงานได้', 'ใช้งานได้'], 'Working Software > Comprehensive Documentation'),
        P('se4_cust', 'm', 'การร่วมมือกับลูกค้า (Customer Collaboration) มากกว่าการต่อรองตามสัญญา', ['collaboration', 'ร่วมมือ', 'ลูกค้า', 'customer'], 'Customer Collaboration > Contract Negotiation'),
        P('se4_change', 'm', 'การตอบสนองต่อการเปลี่ยนแปลง (Responding to Change) มากกว่าการทำตามแผน', ['change', 'เปลี่ยนแปลง', 'ตอบสนอง', 'response'], 'Responding to Change > Following a Plan'),
    ]),
    5: ([
        S('key', 'ทำไมเป็น Key Success Factor', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
        S('pro', 'ทำไมท้าทายความเป็นมืออาชีพ', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
    ], [
        P('se5_base', 'key', 'requirement เป็นฐานของ design/construction ถ้าเข้าใจผิดตั้งแต่ต้น ระบบจะไม่ตรงความต้องการลูกค้า', ['ฐาน', 'foundation', 'ไม่ตรง', 'ความต้องการ', 'design'], 'RE เป็นฐานของการออกแบบ/พัฒนา ถ้าผิดตั้งแต่ต้นจะได้ระบบที่ไม่ตรงความต้องการ'),
        P('se5_fail', 'key', 'การนิยาม requirement ที่แย่เป็นสาเหตุหลักที่โปรเจกต์ล้มเหลว (เป็นงานที่ยากที่สุดใน SE)', ['ล้มเหลว', 'fail', 'ยากที่สุด', 'สาเหตุหลัก'], 'poor up-front definition = สาเหตุหลักของโปรเจกต์ล้มเหลว'),
        P('se5_cost', 'key', 'ยิ่งแก้ requirement ช้ายิ่งแพง (definition 1x → development 1.5–6x → หลัง release 60–100x)', ['แพง', 'ต้นทุน', 'cost', '60', '100x', '1x'], 'ต้นทุนแก้ไขเพิ่มขึ้นมากตามเวลา 1x → 60–100x'),
        P('se5_stake', 'pro', 'stakeholder ไม่รู้ว่าต้องการอะไรจริง ใช้ภาษาตัวเอง requirement ขัดแย้งกันและเปลี่ยนระหว่างทาง', ['stakeholder', 'ลูกค้าไม่รู้', 'ขัดแย้ง', 'conflict', 'เปลี่ยน', 'ไม่รู้ว่าต้องการ'], 'stakeholder ไม่รู้ความต้องการจริง/ขัดแย้งกัน/เปลี่ยนตลอด'),
        P('se5_3prob', 'pro', 'ปัญหา 3 ด้าน: Scope, Understanding, Volatility', ['scope', 'understanding', 'volatility', 'ขอบเขต'], 'ปัญหา Scope / Understanding / Volatility'),
        P('se5_skill', 'pro', 'ต้องใช้ทั้งทักษะเทคนิคและทักษะคน ทำ RE ครบขั้น (Inception, Elicitation, Elaboration, Negotiation, Specification, Validation, Management)', ['ทักษะ', 'skill', 'elicitation', 'negotiation', 'inception', 'specification', 'เจรจา'], 'ต้องมีทักษะคน+เทคนิค ทำ RE ครบ 7 ขั้น'),
    ]),
    6: ([
        S('ver', 'Verification', 1, '1–2 ประโยค'),
        S('val', 'Validation', 1, '1–2 ประโยค'),
    ], [
        P('se6_ver', 'ver', 'Verification = "Are we building the product right?" ตรวจว่าทำงานถูกต้องตาม specification/หน้าที่ที่กำหนด', ['product right', 'building the product right', 'spec', 'ข้อกำหนด', 'ถูกต้องตาม', 'หน้าที่ที่กำหนด', 'ทำถูก'], 'Verification: Are we building the product right? (ถูกต้องตาม spec)',
          wrong=['สลับความหมาย Verification กับ Validation']),
        P('se6_ver_when', 'ver', 'ทำระหว่างพัฒนาในแต่ละขั้น เช่น review, inspection, unit test', ['review', 'inspection', 'unit', 'ระหว่าง', 'แต่ละขั้น'], 'ทำระหว่างพัฒนา (review/inspection/unit test)', bonus=True),
        P('se6_val', 'val', 'Validation = "Are we building the right product?" ตรวจว่าตรงความต้องการจริงของลูกค้า/ผู้ใช้', ['right product', 'ความต้องการ', 'ลูกค้า', 'ผู้ใช้', 'customer', 'user'], 'Validation: Are we building the right product? (ตรงความต้องการลูกค้า)',
          wrong=['สลับความหมาย Verification กับ Validation']),
        P('se6_val_when', 'val', 'ทำช่วงท้าย เช่น validation/system test, alpha/beta, acceptance test (UAT)', ['acceptance', 'uat', 'alpha', 'beta', 'system test', 'ช่วงท้าย'], 'ทำช่วงท้าย (acceptance/alpha/beta)', bonus=True),
    ]),
    7: ([
        S('unit', 'Unit testing', 1, '1 ประโยค', short=True),
        S('int', 'Integration testing', 1, '1 ประโยค', short=True),
        S('perf', 'Performance Testing', 1, '1 ประโยค', short=True),
        S('sys', 'System testing', 1, '1 ประโยค', short=True),
        S('rec', 'Recovery testing', 1, '1 ประโยค', short=True),
        S('sec', 'Security testing', 1, '1 ประโยค', short=True),
        S('str', 'Stress testing', 1, '1 ประโยค', short=True),
    ], [
        P('se7_unit', 'unit', 'ทดสอบหน่วยย่อยที่สุด (module/component) แยกเดี่ยว ตรวจ interface, data structure, boundary, path, error handling', ['หน่วย', 'unit', 'module', 'component', 'ย่อย', 'function'], 'ทดสอบ module/component เล็กสุดแยกกัน'),
        P('se7_int', 'int', 'นำ module มารวมกันแล้วทดสอบการเชื่อมต่อ/interface ระหว่าง module (top-down, bottom-up, big-bang)', ['รวม', 'เชื่อม', 'interface', 'ระหว่าง', 'combine', 'top-down', 'bottom-up'], 'ทดสอบการทำงานร่วมกัน/interface ระหว่าง module'),
        P('se7_perf', 'perf', 'ทดสอบประสิทธิภาพขณะทำงาน เช่น response time, การใช้หน่วยความจำ, throughput/load', ['ประสิทธิภาพ', 'response', 'เร็ว', 'ความเร็ว', 'memory', 'หน่วยความจำ', 'load', 'performance'], 'วัด response time / การใช้ทรัพยากรขณะรัน'),
        P('se7_sys', 'sys', 'ทดสอบทั้งระบบที่รวมเสร็จแล้ว ว่าทำงานครบตาม requirement ในสภาพแวดล้อมจริง', ['ทั้งระบบ', 'whole', 'entire', 'ระบบทั้งหมด', 'complete system', 'ครบตาม requirement'], 'ทดสอบระบบทั้งหมดที่รวมแล้วเทียบกับ requirement'),
        P('se7_rec', 'rec', 'ทำให้ระบบล้ม/เกิดข้อผิดพลาด แล้วตรวจว่ากู้คืนข้อมูลและกลับมาทำงานต่อได้', ['กู้', 'recover', 'ล้ม', 'fail', 'crash', 'คืน'], 'บังคับให้ระบบล้ม แล้วดูว่ากู้คืนได้'),
        P('se7_sec', 'sec', 'ตรวจว่าระบบป้องกันการเข้าถึง/โจมตีโดยไม่ได้รับอนุญาตได้ (เช่น penetration test)', ['ป้องกัน', 'เข้าถึง', 'โจมตี', 'unauthori', 'penetration', 'attack', 'ปลอดภัย', 'บุกรุก'], 'ตรวจกลไกป้องกันการเข้าถึง/โจมตี'),
        P('se7_str', 'str', 'ทดสอบภายใต้สภาวะผิดปกติ/โหลดเกินปกติ (ข้อมูลมาก ไฟล์ใหญ่ ผู้ใช้มาก) เพื่อหาว่าระบบทนได้แค่ไหนก่อนล้ม', ['เกิน', 'ผิดปกติ', 'ปริมาณมาก', 'ทนได้', 'ขีดจำกัด', 'limit', 'abnormal', 'extreme', 'มากเกิน'], 'ใส่โหลดเกินปกติเพื่อดูว่าทนได้แค่ไหน',
          wrong=['อธิบายเหมือน performance test ปกติ ไม่พูดถึงสภาวะเกินปกติ/จุดที่ระบบล้ม']),
    ]),
    8: ([
        S('done', 'เมื่อไหร่ทดสอบเสร็จสมบูรณ์', 1, '1–2 ประโยค'),
        S('enough', 'รู้ได้อย่างไรว่าทดสอบเพียงพอแล้ว', 1, '1–2 ประโยค'),
    ], [
        P('se8_never', 'done', 'ไม่มีวันทดสอบเสร็จสมบูรณ์ — การทดสอบถูกส่งต่อให้ลูกค้าทุกครั้งที่ใช้งาน จึงต้องมี MA', ['ไม่มีวัน', 'ไม่เคย', 'never', 'ไม่จบ', 'ลูกค้า', 'ma', 'maintenance'], 'ไม่มีวันเสร็จจริง: ลูกค้าใช้งาน = การทดสอบต่อเนื่อง (ต้อง MA)'),
        P('se8_stop', 'enough', 'ในทางปฏิบัติหยุดเมื่อหมดเวลาตามสัญญาหรือหมดงบประมาณ', ['เวลา', 'งบ', 'สัญญา', 'budget', 'deadline', 'time'], 'หยุดเมื่อหมดเวลา/งบตามสัญญา'),
        P('se8_criteria', 'enough', 'ผ่านเกณฑ์ที่วางไว้ เช่น test ครอบคลุม requirement ผ่าน acceptance criteria มี SQA/ITG ตรวจ', ['เกณฑ์', 'criteria', 'ครอบคลุม', 'coverage', 'acceptance', 'sqa', 'itg'], 'ผ่านเกณฑ์: coverage / acceptance criteria / SQA'),
    ]),
    9: ([
        S('wb', 'White-box testing เน้นทดสอบอะไร', 1, '1–2 ประโยค'),
        S('bb', 'Black-box testing เน้นทดสอบอะไร', 1, '1–2 ประโยค'),
        S('when', 'แต่ละวิธีใช้ช่วงไหนของ Testing Process', 1, '1 ประโยค'),
    ], [
        P('se9_wb', 'wb', 'ทดสอบโครงสร้าง/ตรรกะภายในโปรแกรม (path, condition, loop) ต้องรู้โค้ดภายใน', ['ภายใน', 'internal', 'โครงสร้าง', 'structure', 'logic', 'path', 'loop', 'code'], 'White-box: โครงสร้าง/logic ภายใน (path, condition, loop)'),
        P('se9_wb_tech', 'wb', 'เทคนิค: basis path, control flow, data flow, loop testing', ['basis path', 'control flow', 'data flow', 'loop testing'], 'เทคนิค basis path / loop testing', bonus=True),
        P('se9_bb', 'bb', 'ทดสอบฟังก์ชันการทำงานตาม requirement ผ่าน input/output โดยไม่ดูโครงสร้างภายใน', ['ฟังก์ชัน', 'function', 'requirement', 'input', 'output', 'ไม่ดู', 'ไม่สน', 'behavio'], 'Black-box: ฟังก์ชันตาม requirement ดู input/output'),
        P('se9_bb_tech', 'bb', 'เทคนิค: Equivalence Class Partitioning, Boundary Value Analysis', ['equivalence', 'boundary', 'ecp', 'bva'], 'เทคนิค ECP / BVA', bonus=True),
        P('se9_when', 'when', 'White-box ใช้ช่วงแรก (ระดับ unit) ส่วน Black-box ใช้ช่วงหลัง (system/acceptance) และใช้แทนกันไม่ได้', [['white', 'ไวท์'], ['แรก', 'ต้น', 'early', 'unit'], ['หลัง', 'ท้าย', 'late', 'system', 'acceptance']], 'White-box ช่วงแรก (unit) · Black-box ช่วงท้าย (system/acceptance)',
          wrong=['บอกว่า Black-box ใช้ก่อน White-box']),
    ]),
    10: ([
        S('diff', 'Alpha vs Beta Testing', 2, 'เทียบ 2 ประเด็น: ข้อมูลที่ใช้ / สถานการณ์'),
    ], [
        P('se10_data', 'diff', 'Alpha ใช้ข้อมูลสมมติ ส่วน Beta ใช้ข้อมูลจริง', [['สมมติ', 'จำลอง', 'fake', 'mock', 'test data'], ['จริง', 'real']], 'Alpha = ข้อมูลสมมติ · Beta = ข้อมูลจริง'),
        P('se10_env', 'diff', 'Alpha อยู่ในสถานการณ์ที่จำลองว่าอาจเกิดขึ้น (สภาพแวดล้อมที่ผู้พัฒนาควบคุม) ส่วน Beta อยู่ในสถานการณ์จริงที่ไซต์ผู้ใช้', ['สถานการณ์', 'site', 'ไซต์', 'ผู้พัฒนา', 'developer', 'สภาพแวดล้อม', 'ใช้งานจริง'], 'Alpha = สถานการณ์จำลอง (ฝั่งผู้พัฒนา) · Beta = สถานการณ์จริง (ฝั่งผู้ใช้)'),
        P('se10_user', 'diff', 'ทั้งสองแบบผู้ทดสอบคือผู้ใช้ และอยู่ใน Validation/Acceptance testing', ['ผู้ใช้', 'user', 'validation', 'acceptance'], 'ทั้งคู่ทดสอบโดยผู้ใช้ (Validation testing)', bonus=True),
    ]),
    11: ([
        S('why', 'ทำไมต้องทำ Regression Testing', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
    ], [
        P('se11_newbug', 'why', 'การแก้บั๊ก/เพิ่มโค้ดหนึ่งจุด มักทำให้เกิดบั๊กใหม่ในส่วนอื่น', ['บั๊กใหม่', 'bug', 'บั๊ก', 'ข้อผิดพลาดใหม่', 'side effect', 'ผลข้างเคียง'], 'แก้บั๊กหนึ่ง มักเกิดบั๊กใหม่'),
        P('se11_retest', 'why', 'ทดสอบซ้ำหลังแก้ไข เพื่อยืนยันว่าส่วนที่เคยทำงานได้ยังทำงานได้ (ไม่ถูกกระทบ)', ['ซ้ำ', 're-test', 'retest', 'ส่วนอื่น', 'ยังทำงาน', 'กระทบ', 'เคยทำงาน'], 'ทดสอบซ้ำเพื่อยืนยันว่าส่วนเดิมไม่พัง'),
        P('se11_fix', 'why', 'ยืนยันว่าการแก้ไขแก้ปัญหาได้จริง', ['แก้ได้จริง', 'แก้ปัญหา', 'ยืนยัน', 'confirm'], 'ยืนยันว่าแก้ได้จริง'),
        P('se11_ci', 'why', 'ใน DevOps รัน regression test อัตโนมัติทุกครั้งที่ integrate (continuous testing)', ['ci', 'อัตโนมัติ', 'automat', 'devops', 'continuous'], 'รันอัตโนมัติใน CI/CD', bonus=True),
    ]),
    12: ([
        S('crit', 'เกณฑ์การยอมรับระบบของผู้ใช้', 4, 'บอกชื่อเกณฑ์ + ความหมายสั้นๆ อย่างน้อย 4 ข้อ'),
    ], [
        P('se12_learn', 'crit', 'Time to Learn — เวลาที่ใช้เรียนรู้การใช้งาน', ['time to learn', 'เรียนรู้'], 'Time to Learn'),
        P('se12_perf', 'crit', 'Task Performance — ความเร็วในการทำงานแต่ละส่วน', ['task performance', 'ความเร็ว', 'speed'], 'Task Performance'),
        P('se12_err', 'crit', 'Error Rate — อัตราความผิดพลาด', ['error rate', 'ผิดพลาด', 'error'], 'Error Rate'),
        P('se12_sat', 'crit', 'User Satisfaction — ความพึงพอใจของผู้ใช้', ['satisfaction', 'พึงพอใจ'], 'User Satisfaction'),
        P('se12_ret', 'crit', 'User Retention — การจดจำวิธีใช้/คำสั่ง', ['retention', 'จดจำ', 'จำ'], 'User Retention'),
        P('se12_friendly', 'crit', 'User Friendly — ใช้งานง่าย', ['friendly', 'ใช้ง่าย', 'ใช้งานง่าย', 'usability'], 'User Friendly'),
    ]),
    13: ([
        S('steps', 'ขั้นตอน SCRUM (แผนภาพ/ลำดับ)', 4, 'เขียนเป็นลำดับ A → B → C พร้อมอธิบายสั้นๆ', weight=2),
        S('role', 'บทบาท (Roles)', 1, 'บอก 3 roles', short=True),
    ], [
        P('se13_pb', 'steps', 'Product Owner สร้าง/จัดลำดับ Product Backlog (user stories)', ['product backlog', 'user stor'], 'เริ่มจาก Product Backlog (PO จัดลำดับ)'),
        P('se13_plan', 'steps', 'Sprint Planning เลือกงานจาก Product Backlog ลง Sprint Backlog + Sprint Goal', ['sprint planning', 'sprint backlog'], 'Sprint Planning → Sprint Backlog'),
        P('se13_sprint', 'steps', 'Sprint 1–4 สัปดาห์ (ประมาณ 30 วัน) ไม่เปลี่ยน scope ระหว่าง sprint', [['sprint'], ['สัปดาห์', 'week', 'วัน', 'day', 'รอบ']], 'Sprint 2–4 สัปดาห์'),
        P('se13_daily', 'steps', 'Daily Scrum 15 นาทีทุกวัน: ทำอะไรไป จะทำอะไรต่อ ติดปัญหาอะไร', ['daily', 'stand', '15 นาที', 'ทุกวัน'], 'Daily Scrum 15 นาทีทุกวัน'),
        P('se13_inc', 'steps', 'จบ sprint ได้ Potentially Shippable Product Increment', ['increment', 'shippable', 'ชิ้นงาน', 'release'], 'ได้ Product Increment ที่ส่งมอบได้'),
        P('se13_review', 'steps', 'Sprint Review (ตรวจงานกับ PO/stakeholder) และ Sprint Retrospective (ทบทวนกระบวนการ) แล้ววนรอบใหม่', ['review', 'retrospective', 'retro'], 'Sprint Review + Retrospective แล้ววนรอบใหม่'),
        P('se13_roles', 'role', '3 Roles: Product Owner, Scrum Master, Development Team', [['product owner', 'po'], ['scrum master', 'sm'], ['team', 'ทีม']], 'Product Owner / Scrum Master / Dev Team'),
        P('se13_353', 'role', '3-5-3: 3 roles, 5 events, 3 artifacts (Product Backlog, Sprint Backlog, Increment)', ['3-5-3', 'artifact', 'burndown'], 'โครง 3-5-3 / Burndown chart', bonus=True),
    ]),
    14: ([
        S('people', 'คน (People)', 1, 'เทียบ CMMI vs Agile 1–2 ประโยค'),
        S('work', 'งาน (Work/Process)', 1, 'เทียบ CMMI vs Agile 1–2 ประโยค'),
        S('bp', 'Best practice', 1, 'เทียบ CMMI vs Agile 1–2 ประโยค'),
    ], [
        P('se14_people', 'people', 'CMMI: บทบาทกำหนดชัด ฝึกคนให้ทำตาม process มาตรฐานองค์กร ไม่ขึ้นกับตัวบุคคล · Agile: เน้นบุคคลและการสื่อสาร ทีมเล็ก self-organizing ลูกค้ามีส่วนร่วม', [['cmmi'], ['agile', 'อไจล์'], ['คน', 'บุคคล', 'ทีม', 'people', 'individual', 'บทบาท', 'role']], 'CMMI = คนทำตาม process มาตรฐาน · Agile = คน/การสื่อสารสำคัญกว่า process'),
        P('se14_work', 'work', 'CMMI: งานกำหนดเป็นมาตรฐาน มีเอกสาร วัดผลเชิงปริมาณ ยกระดับ Maturity Level 1–5 · Agile: แบ่งเป็น iteration/sprint สั้น ส่งมอบ working software บ่อย รับการเปลี่ยนแปลง เอกสารเท่าที่จำเป็น', [['level', 'ระดับ', 'มาตรฐาน', 'เอกสาร', 'document'], ['sprint', 'iteration', 'รอบสั้น', 'บ่อย', 'เปลี่ยน']], 'CMMI = มาตรฐาน+เอกสาร+Maturity Level · Agile = sprint สั้น ส่งมอบบ่อย'),
        P('se14_bp', 'bp', 'CMMI: best practice อยู่ในรูป Process Areas (Requirements Mgmt, Project Planning, QA, Risk Mgmt …) ปรับปรุงด้วยข้อมูลเชิงปริมาณ · Agile: practice ที่ทีมเลือกใช้ เช่น Scrum, XP (pair programming, CI, test-first) ปรับผ่าน retrospective', [['process area', 'pa', 'specific practice', 'cmmi'], ['scrum', 'xp', 'pair', 'retrospective', 'daily', 'user stor']], 'CMMI = Process Areas · Agile = Scrum/XP practices'),
        P('se14_sum', 'bp', 'ภาพรวม: CMMI = plan-driven ยกระดับวุฒิภาวะองค์กร · Agile = change/value-driven เน้นความเร็วและความพอใจลูกค้า', ['plan-driven', 'วุฒิภาวะ', 'maturity', 'ยืดหยุ่น'], 'CMMI plan-driven vs Agile change-driven', bonus=True),
    ]),
    15: ([
        S('pri', 'หลักการของ Container', 1, '1–2 ประโยค'),
        S('ben', 'ประโยชน์', 3, 'ตอบเป็นข้อสั้นๆ 3 ข้อ'),
    ], [
        P('se15_pack', 'pri', 'แพ็กแอปพร้อม dependencies (library, runtime, config) เป็น image เดียวที่พกพาได้', ['dependenc', 'แพ็ก', 'pack', 'image', 'library', 'portable', 'รวม'], 'แพ็กแอป + dependencies ไว้ใน image เดียว'),
        P('se15_iso', 'pri', 'แยกการทำงาน (isolation) แต่ใช้ OS kernel ร่วมกับ host จึงเบากว่า VM', ['kernel', 'isolat', 'แยก', 'vm', 'virtual machine', 'เบา'], 'isolation + ใช้ kernel ร่วม เบากว่า VM', bonus=True),
        P('se15_orch', 'pri', 'จัดการ container จำนวนมากด้วย orchestration เช่น Kubernetes', ['kubernetes', 'k8s', 'orchestrat'], 'Orchestration ด้วย Kubernetes', bonus=True),
        P('se15_any', 'ben', 'Build once, run anywhere: รันเหมือนกันทุก environment ลดปัญหา "works on my machine"', ['anywhere', 'ทุกที่', 'ทุกเครื่อง', 'environment', 'my machine', 'เหมือนกัน', 'portable', 'พกพา'], 'รันได้เหมือนกันทุกที่'),
        P('se15_light', 'ben', 'เริ่มเร็ว ใช้ทรัพยากรน้อย รันได้หลาย container ต่อเครื่อง', ['เร็ว', 'ทรัพยากรน้อย', 'เบา', 'lightweight', 'fast'], 'เบา เริ่มเร็ว ประหยัดทรัพยากร'),
        P('se15_cicd', 'ben', 'เข้ากับ CI/CD และ Microservices: deploy/scale แต่ละ service ได้อิสระ', ['ci/cd', 'cicd', 'microservice', 'deploy', 'devops'], 'เข้ากับ CI/CD + Microservices'),
        P('se15_scale', 'ben', 'scale อัตโนมัติ, ควบคุม version และ rollback ได้ง่าย', ['scale', 'rollback', 'version', 'ขยาย'], 'scale ง่าย / rollback ได้'),
        P('se15_tools', 'ben', 'ตัวอย่าง: Docker, Kubernetes, OpenShift', ['docker', 'openshift'], 'ยกตัวอย่าง Docker', bonus=True),
    ]),
    16: ([
        S('cd1', 'Continuous Delivery', 1, '1–2 ประโยค'),
        S('cd2', 'Continuous Deployment', 1, '1–2 ประโยค'),
    ], [
        P('se16_del', 'cd1', 'อัตโนมัติจนถึงเตรียม code ให้พร้อม deploy (build/test/package) แต่การขึ้น production ต้องมีการตัดสินใจ/อนุมัติ release', ['พร้อม', 'ready', 'อนุมัติ', 'approval', 'manual', 'ตัดสินใจ', 'กดปุ่ม'], 'Delivery: พร้อม deploy เสมอ แต่ขึ้น production ต้องมีคนตัดสินใจ',
          wrong=['บอกว่า Continuous Delivery ขึ้น production อัตโนมัติทันทีโดยไม่มีจุดตัดสินใจ']),
        P('se16_dep', 'cd2', 'อัตโนมัติทั้ง release cycle: ทุกการเปลี่ยนแปลงที่ผ่าน test ขึ้น production ถึงผู้ใช้เองโดยไม่มีคนเกี่ยว', ['อัตโนมัติ', 'automat', 'ไม่มีคน', 'โดยตรง', 'end user', 'production'], 'Deployment: ผ่าน test แล้วขึ้น production อัตโนมัติ'),
        P('se16_risk', 'cd2', 'Deployment deploy ได้หลายครั้งต่อวัน แต่ความเสี่ยงบั๊กหลุดสูงกว่า เหมาะกับ minor update ที่ rollback ได้', ['หลายครั้ง', 'ความเสี่ยง', 'risk', 'rollback', 'minor'], 'Deployment เร็ว/บ่อยกว่า แต่เสี่ยงกว่า', bonus=True),
    ]),
    17: ([
        S('imp', 'ความสำคัญของ DevSecOps Pipeline', 1, '1–2 ประโยค'),
        S('tools', 'ตัวอย่าง Tools แต่ละขั้น', 4, 'เขียน ขั้น → tool เช่น Build → SonarQube ราว 4 ขั้น', weight=2),
    ], [
        P('se17_imp', 'imp', 'pipeline อัตโนมัติพา code ถึง production และฝัง security ทุกขั้น → ส่งมอบเร็ว คุณภาพดี ปลอดภัย error น้อย ทีม Dev/Sec/Ops ทำงานร่วมกัน', ['อัตโนมัติ', 'automat', 'ความปลอดภัย', 'security', 'ทุกขั้น', 'เร็ว', 'คุณภาพ'], 'pipeline อัตโนมัติ + ฝัง security ทุกขั้น = เร็วและปลอดภัย'),
        P('se17_plan', 'tools', 'Plan: threat modeling — Jira, Confluence, Trello', ['jira', 'confluence', 'trello', 'threat model'], 'Plan → Jira / Confluence'),
        P('se17_code', 'tools', 'Code: code review, pre-commit hooks — Git, GitHub, GitLab, Bitbucket', ['git', 'github', 'gitlab', 'bitbucket'], 'Code → Git / GitHub'),
        P('se17_build', 'tools', 'Build: SAST, SCA — Maven, Gradle, SonarQube, Snyk, Fortify', ['maven', 'gradle', 'sonarqube', 'snyk', 'fortify', 'sast'], 'Build → Maven / SonarQube (SAST)'),
        P('se17_test', 'tools', 'Test: DAST, pen test, automated test — Selenium, JUnit, JMeter, Nessus', ['selenium', 'junit', 'jmeter', 'nessus', 'cucumber', 'dast'], 'Test → Selenium / JUnit'),
        P('se17_ci', 'tools', 'CI/CD: security gate, signing — Jenkins, GitLab CI, GitHub Actions', ['jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis', 'bamboo'], 'CI/CD → Jenkins'),
        P('se17_deploy', 'tools', 'Release/Deploy: IaC, config mgmt — Terraform, Ansible, Docker, Kubernetes', ['terraform', 'ansible', 'docker', 'kubernetes', 'puppet', 'chef'], 'Deploy → Terraform / Docker / Kubernetes'),
        P('se17_mon', 'tools', 'Operate/Monitor: SIEM, RASP, WAF — Prometheus, Grafana, ELK, Datadog, Splunk', ['prometheus', 'grafana', 'elk', 'datadog', 'splunk', 'nagios', 'siem'], 'Monitor → Prometheus / Grafana'),
    ]),
    18: ([
        S('cost', 'ประมาณงบประมาณโดยพิจารณาจากอะไร', 3, 'ตอบเป็นข้อสั้นๆ 3 ข้อ'),
        S('apply', 'นำกระบวนการ SE ไปประยุกต์ใช้กับงานอะไร', 2, 'ยกตัวอย่าง 2 งาน'),
    ], [
        P('se18_scope', 'cost', 'ขอบเขตและความซับซ้อนของ requirement/ขนาดงาน (function point, story point)', ['ขอบเขต', 'scope', 'ความซับซ้อน', 'complex', 'requirement', 'ขนาด', 'function point', 'story point'], 'ขนาด/ความซับซ้อนของ requirement'),
        P('se18_people', 'cost', 'คน ทักษะ และระยะเวลา (person-month)', ['คน', 'บุคลากร', 'ทักษะ', 'person', 'man-month', 'ระยะเวลา', 'ทีม'], 'จำนวนคน ทักษะ ระยะเวลา'),
        P('se18_model', 'cost', 'Process Model ที่เลือก (เช่น Waterfall cost control ชัด, Agile ประเมินตาม sprint/velocity)', ['process model', 'waterfall', 'agile', 'velocity', 'โมเดล'], 'Process Model ที่ใช้'),
        P('se18_ma', 'cost', 'ค่าบำรุงรักษา (MA) ตลอดอายุ — 60–80% ของ effort เกิดหลังส่งมอบ และต้นทุนการเปลี่ยนแปลง/ความเสี่ยง', ['ma', 'maintenance', 'บำรุงรักษา', '60', 'หลังส่งมอบ', 'เปลี่ยนแปลง', 'risk', 'ความเสี่ยง'], 'ค่า MA หลังส่งมอบ / เผื่อความเสี่ยง'),
        P('se18_infra', 'cost', 'โครงสร้างพื้นฐานและเครื่องมือ (cloud, license, tools) + umbrella activities (QA, เอกสาร, training)', ['cloud', 'license', 'tool', 'เครื่องมือ', 'hardware', 'qa', 'เอกสาร', 'training', 'finops'], 'ค่า cloud/license/tools และกิจกรรมสนับสนุน'),
        P('se18_hist', 'cost', 'ใช้ข้อมูลในอดีตและเทคนิคประมาณ เช่น expert judgment, COCOMO', ['cocomo', 'expert', 'historical', 'ข้อมูลในอดีต', 'analogy'], 'เทคนิค COCOMO / expert judgment', bonus=True),
        P('se18_pm', 'apply', 'บริหารโครงการทั่วไป (วางแผน ติดตาม ควบคุมความเสี่ยง/คุณภาพ)', ['บริหารโครงการ', 'project management', 'วางแผน', 'โครงการ'], 'งานบริหารโครงการ'),
        P('se18_domain', 'apply', 'งานพัฒนาระบบอื่นๆ เช่น IoT/Embedded, AI/ML (MLOps), Data pipeline, Web/Mobile, Game', ['iot', 'embedded', 'mlops', 'ai', 'data', 'web', 'mobile', 'game'], 'ระบบ IoT / AI / Web / Mobile'),
        P('se18_ops', 'apply', 'งาน DevOps/Platform/Cloud infrastructure (IaC), DesignOps, FinOps, startup, มาตรฐานองค์กร (CMMI, ISO 29110)', ['devops', 'platform', 'iac', 'infrastructure', 'designops', 'finops', 'startup', 'cmmi', 'iso'], 'DevOps / IaC / มาตรฐานองค์กร'),
    ]),
    19: ([
        S('what', 'Platform Engineering คืออะไร', 1, '1 ประโยค'),
        S('role', 'Platform Engineer มีหน้าที่อะไร', 1, '1–2 ประโยค'),
        S('rel', 'ความสำคัญ/ความเกี่ยวข้องกับ SE ปัจจุบัน', 1, '1–2 ประโยค'),
    ], [
        P('se19_def', 'what', 'ศาสตร์การออกแบบและสร้าง toolchain และ workflow ให้ทีม software engineering ใช้แบบ self-service ในยุค cloud-native', ['toolchain', 'workflow', 'self-service', 'self service', 'cloud-native', 'แพลตฟอร์ม'], 'ออกแบบ toolchain/workflow แบบ self-service ยุค cloud-native'),
        P('se19_idp', 'role', 'สร้างและดูแล Internal Developer Platform (IDP) ที่รวม CI/CD, IaC, container, monitoring, security ให้ dev ใช้เอง', ['idp', 'internal developer platform', 'ci/cd', 'iac', 'kubernetes', 'แพลตฟอร์มภายใน'], 'สร้าง/ดูแล Internal Developer Platform'),
        P('se19_ops', 'role', 'รวม DevOps, DevSecOps, AIOps, DevFinOps, DesignOps, DevSusOps ไว้บนแพลตฟอร์มเดียว', ['devops', 'devsecops', 'aiops', 'finops', 'designops', 'devsusops'], 'รวม DevOps/DevSecOps/AIOps ฯลฯ ไว้ที่เดียว', bonus=True),
        P('se19_se', 'rel', 'ทำ Process + Tools ของ SE ให้เป็นอัตโนมัติและมาตรฐานทั้งองค์กร รองรับ SDLC ครบวงจร → ส่งมอบเร็ว คุณภาพสูง ปลอดภัย', ['อัตโนมัติ', 'automat', 'มาตรฐาน', 'standard', 'sdlc', 'process', 'เร็ว', 'คุณภาพ'], 'ทำ SE process ให้อัตโนมัติ/มาตรฐาน รองรับทั้ง SDLC'),
    ]),
    # 20: เขียนไว้ใน extract_cpe320.MANUAL
    21: ([
        S('single', 'Single Agent System', 1, '1–2 ประโยค: โครงสร้าง + ข้อดี/ข้อจำกัด'),
        S('multi', 'Multi-Agent System', 1, '1–2 ประโยค: โครงสร้าง + ข้อดี/ข้อจำกัด'),
        S('fit', 'เหมาะกับงานแบบไหน', 1, '1 ประโยค'),
    ], [
        P('se21_s', 'single', 'agent ตัวเดียวทำทุกงาน: ออกแบบง่าย ต้นทุน/latency ต่ำ แต่ context จำกัด ไม่มีใครตรวจทาน เป็น single point of failure', [['ตัวเดียว', 'single', 'เดี่ยว'], ['ง่าย', 'จำกัด', 'context', 'ไม่มี', 'failure', 'ต้นทุนต่ำ']], 'Single: agent เดียวทำทุกอย่าง ง่ายแต่จำกัด'),
        P('se21_m', 'multi', 'หลาย agent แบ่งบทบาทเฉพาะทาง (Requirement, Architect, Coder, Tester, Security) มี Orchestrator ประสาน ทำขนานและตรวจทานกันได้', [['หลาย', 'multi'], ['บทบาท', 'role', 'orchestrat', 'แบ่ง', 'ขนาน', 'parallel', 'ตรวจทาน']], 'Multi: หลาย agent แบ่ง role + orchestrator'),
        P('se21_m_cost', 'multi', 'ซับซ้อนกว่า ต้องมี protocol สื่อสาร/shared state, ต้นทุน token สูง error สะสมจากการส่งต่อ', ['ซับซ้อน', 'complex', 'protocol', 'token', 'ต้นทุนสูง', 'สะสม'], 'Multi ซับซ้อนกว่า ต้นทุนสูงกว่า', bonus=True),
        P('se21_fit', 'fit', 'Single เหมาะกับงานเล็กชัดเจน · Multi เหมาะกับระบบใหญ่ทั้ง SDLC ที่ต้องการคุณภาพ/compliance และ scale ได้ดีกว่า', ['งานเล็ก', 'ระบบใหญ่', 'ขนาดใหญ่', 'scale', 'sdlc', 'ซับซ้อน'], 'Single = งานเล็ก · Multi = ระบบใหญ่/scale'),
    ]),
    22: ([
        S('role', 'หน้าที่ของ Security & Compliance Agent', 2, 'ตอบเป็นข้อสั้นๆ 2–3 ข้อ'),
        S('why', 'ทำไมต้องระวัง Data Privacy อย่างเคร่งครัด', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
    ], [
        P('se22_scan', 'role', 'ตรวจโค้ด/สถาปัตยกรรมด้าน security (SAST/DAST/SCA, secrets, dependency) ทำ threat modeling และเป็น security gate ทุก PR', ['sast', 'dast', 'sca', 'ช่องโหว่', 'vulnerab', 'threat', 'security', 'ตรวจโค้ด'], 'ตรวจช่องโหว่ (SAST/DAST) + threat modeling'),
        P('se22_law', 'role', 'ตรวจ compliance กับกฎหมาย/มาตรฐาน เช่น PDPA, HIPAA, GDPR, HL7/FHIR', ['pdpa', 'hipaa', 'gdpr', 'compliance', 'กฎหมาย', 'hl7', 'fhir'], 'ตรวจ compliance PDPA / HIPAA'),
        P('se22_policy', 'role', 'บังคับใช้นโยบายข้อมูล: encryption, access control/least privilege, audit log, data masking', ['encrypt', 'เข้ารหัส', 'access control', 'สิทธิ์', 'audit', 'mask', 'least privilege'], 'เข้ารหัส / ควบคุมสิทธิ์ / audit log'),
        P('se22_sens', 'why', 'ข้อมูลสุขภาพเป็นข้อมูลส่วนบุคคลอ่อนไหว (sensitive) รั่วแล้วมีโทษตามกฎหมายและกระทบผู้ป่วยโดยตรง', ['อ่อนไหว', 'sensitive', 'phi', 'โทษ', 'กฎหมาย', 'ผู้ป่วย', 'ส่วนบุคคล'], 'ข้อมูลสุขภาพ = ข้อมูลอ่อนไหว รั่วแล้วผิดกฎหมาย'),
        P('se22_leak', 'why', 'AI agent อาจส่งข้อมูลไป LLM ภายนอก เก็บไว้ใน log/prompt หรือโดน prompt injection', ['llm', 'ภายนอก', 'external', 'prompt', 'log', 'รั่ว', 'leak'], 'agent อาจทำข้อมูลรั่วไป LLM ภายนอก'),
        P('se22_safety', 'why', 'ระบบการแพทย์เป็น safety-critical และความเชื่อมั่นของโรงพยาบาล', ['safety', 'ชีวิต', 'ความเชื่อมั่น', 'trust'], 'safety-critical / ความเชื่อมั่น', bonus=True),
    ]),
    23: ([
        S('agents', 'AI Agents และบทบาทหน้าที่', 5, 'เขียน "ชื่อ agent — หน้าที่" อย่างน้อย 5 ตัว ให้ครอบคลุม SDLC', weight=2),
        S('human', 'การควบคุมโดยมนุษย์', 1, '1 ประโยค', short=True),
    ], [
        P('se23_orch', 'agents', 'Orchestrator/PM Agent — แตกงาน จัด backlog ประสาน agent อื่น', ['orchestrat', 'manager', 'pm', 'ประสาน', 'scrum master'], 'Orchestrator/PM Agent'),
        P('se23_ba', 'agents', 'Requirement/BA Agent — เก็บ requirement, user story, acceptance criteria, กฎธุรกิจการเงิน (KYC/AML)', ['requirement', 'ba', 'business analyst', 'user stor', 'kyc'], 'Requirement/BA Agent'),
        P('se23_arch', 'agents', 'Architect Agent — ออกแบบ microservices/API/data model, transaction consistency', ['architect', 'design', 'ออกแบบ', 'microservice', 'api'], 'Architect Agent'),
        P('se23_dev', 'agents', 'Developer/Coder Agent — เขียนโค้ด + unit test (และ Code Reviewer Agent ตรวจโค้ด)', ['developer', 'coder', 'เขียนโค้ด', 'code', 'review'], 'Developer + Reviewer Agent'),
        P('se23_qa', 'agents', 'QA/Test Agent — สร้างและรัน automated test (unit, integration, regression, performance)', ['qa', 'test', 'ทดสอบ', 'tester'], 'QA/Test Agent'),
        P('se23_sec', 'agents', 'Security & Compliance Agent — SAST/DAST, PCI-DSS, PDPA, เกณฑ์ ธปท.', ['security', 'compliance', 'pci', 'pdpa', 'ความปลอดภัย'], 'Security & Compliance Agent'),
        P('se23_risk', 'agents', 'Risk & Fraud Agent — วิเคราะห์ความเสี่ยงการเงิน ตรวจ logic ป้องกันทุจริต/anomaly', ['risk', 'fraud', 'ทุจริต', 'ความเสี่ยง', 'anomaly'], 'Risk & Fraud Agent'),
        P('se23_ops', 'agents', 'DevOps/Platform Agent และ SRE/Monitoring (AIOps) Agent — CI/CD, deploy, monitor, incident', ['devops', 'ci/cd', 'deploy', 'sre', 'monitor', 'aiops', 'platform'], 'DevOps / Monitoring Agent'),
        P('se23_doc', 'agents', 'Documentation Agent — SRS, API doc, audit trail สำหรับ regulator', ['document', 'เอกสาร', 'srs', 'audit'], 'Documentation Agent', bonus=True),
        P('se23_hitl', 'human', 'Human-in-the-Loop อนุมัติ requirement, architecture, release และ transaction logic สำคัญ', ['human', 'hitl', 'มนุษย์', 'อนุมัติ', 'approve'], 'มนุษย์ (HITL) อนุมัติจุดสำคัญ'),
    ]),
    24: ([
        S('std', 'ข้อกำหนด/มาตรฐานด้าน Architecture', 4, 'ตอบเป็นข้อสั้นๆ อย่างน้อย 4 ข้อ'),
    ], [
        P('se24_reg', 'std', 'มาตรฐานกฎระเบียบ/ความปลอดภัย: PCI-DSS, ISO/IEC 27001, PDPA/GDPR, เกณฑ์ ธปท., OWASP', ['pci', 'iso', '27001', 'pdpa', 'gdpr', 'ธปท', 'owasp', 'soc'], 'PCI-DSS / ISO 27001 / PDPA'),
        P('se24_tx', 'std', 'Transaction integrity: ACID, idempotency (กันตัดเงินซ้ำ), double-entry ledger, reconciliation', ['acid', 'idempoten', 'transaction', 'ธุรกรรม', 'ledger', 'ตัดเงินซ้ำ'], 'ACID / idempotency กันตัดเงินซ้ำ'),
        P('se24_zero', 'std', 'Zero Trust & Least Privilege: agent มีสิทธิ์เท่าที่จำเป็น เก็บ secret ใน vault, mTLS, MFA', ['zero trust', 'least privilege', 'สิทธิ์', 'vault', 'mtls', 'mfa'], 'Zero Trust / Least Privilege'),
        P('se24_sod', 'std', 'Separation of Duties + HITL: agent ที่เขียนโค้ดห้ามอนุมัติ/deploy เอง ต้องมีมนุษย์อนุมัติ (four-eyes)', ['separation', 'hitl', 'มนุษย์', 'four-eyes', 'อนุมัติ', 'human'], 'Separation of Duties + มนุษย์อนุมัติ'),
        P('se24_audit', 'std', 'Immutable audit trail: log ทุก action ของ agent และทุกธุรกรรม แก้ไขไม่ได้', ['audit', 'log', 'trail', 'ตรวจสอบย้อนหลัง'], 'Audit trail ที่แก้ไขไม่ได้'),
        P('se24_gate', 'std', 'Quality/Security gates ใน CI/CD: coverage ขั้นต่ำ, SAST/DAST/SCA ต้องผ่าน, signing, policy-as-code', ['quality gate', 'gate', 'sast', 'dast', 'coverage', 'ci/cd', 'devsecops'], 'Quality gates ใน CI/CD'),
        P('se24_guard', 'std', 'Guardrails สำหรับ AI: จำกัด scope agent, validate output ด้วย schema, ห้าม AI ตัดสินเรื่องเงินเองโดยไม่ตรวจ', ['guardrail', 'validate', 'schema', 'จำกัด', 'scope'], 'Guardrails จำกัดสิ่งที่ AI ทำได้'),
        P('se24_pattern', 'std', 'Architecture patterns: microservices + API gateway, event sourcing, saga, circuit breaker, HA/DR, encryption', ['microservice', 'api gateway', 'saga', 'circuit', 'event', 'dr', 'backup', 'encrypt', 'เข้ารหัส'], 'Microservices / Saga / Circuit breaker / HA-DR'),
    ]),
    25: ([
        S('group', 'ควรเลือกเครื่องมือกลุ่มใด', 1, '1–2 ประโยค'),
        S('ex', 'ตัวอย่างซอฟต์แวร์', 2, 'ยกชื่ออย่างน้อย 2–3 ตัว'),
    ], [
        P('se25_group', 'group', 'กลุ่ม Self-hosted / On-premise / Private (Local) LLM + open-source agent framework ติดตั้งในองค์กร (หรือ private cloud/VPC) ข้อมูลไม่ออกนอก', ['self-host', 'self host', 'on-prem', 'on prem', 'local', 'private', 'ภายในองค์กร', 'open-source', 'โอเพนซอร์ส'], 'Self-hosted / On-premise / Local LLM',
          wrong=['แนะนำให้ใช้ public cloud LLM API ทั่วไปโดยไม่มีการควบคุมข้อมูล']),
        P('se25_llm', 'ex', 'รัน LLM ในเครื่อง: Ollama, vLLM, llama.cpp, LM Studio + โมเดล open-weight (Llama, Mistral, Qwen)', ['ollama', 'vllm', 'llama', 'lm studio', 'localai', 'mistral', 'qwen', 'gemma', 'deepseek'], 'Ollama / vLLM / Llama'),
        P('se25_fw', 'ex', 'Agent framework แบบ self-host: LangChain/LangGraph, CrewAI, AutoGen, OpenHands, Tabby', ['langchain', 'langgraph', 'crewai', 'autogen', 'openhands', 'metagpt', 'tabby', 'continue'], 'LangGraph / CrewAI / AutoGen'),
        P('se25_ent', 'ex', 'Enterprise private deployment: Azure OpenAI private endpoint, AWS Bedrock ใน VPC (zero data retention)', ['azure', 'bedrock', 'vertex', 'private endpoint', 'vpc'], 'Azure OpenAI / Bedrock แบบ private', bonus=True),
    ]),
    26: ([
        S('what', 'HITL คืออะไร', 1, '1–2 ประโยค'),
        S('hc', 'ความจำเป็นใน Healthcare', 1, '1–2 ประโยค'),
        S('fin', 'ความจำเป็นใน FinTech', 1, '1–2 ประโยค'),
    ], [
        P('se26_def', 'what', 'ให้มนุษย์อยู่ในวงจรการตัดสินใจของ AI: ตรวจ อนุมัติ แก้ไข หรือปฏิเสธผลลัพธ์ของ AI ก่อนใช้จริง และส่ง feedback กลับ', ['มนุษย์', 'human', 'คน'], 'มนุษย์ตรวจ/อนุมัติผลของ AI ก่อนนำไปใช้'),
        P('se26_points', 'what', 'จุด HITL ใน SDLC: sign-off requirement, review architecture, code review, อนุมัติ release', ['sign-off', 'review', 'อนุมัติ release', 'approve'], 'จุด HITL ใน SDLC', bonus=True),
        P('se26_hc', 'hc', 'ระบบ safety-critical วินิจฉัย/ให้ยาผิดอาจถึงชีวิต AI hallucinate/bias ได้ แพทย์ต้องตัดสินสุดท้ายและรับผิดชอบ', ['ชีวิต', 'safety', 'วินิจฉัย', 'แพทย์', 'hallucinat', 'bias', 'รับผิดชอบ'], 'ผิดพลาดถึงชีวิต แพทย์ต้องตัดสินสุดท้าย'),
        P('se26_fin', 'fin', 'ธุรกรรมย้อนกลับไม่ได้ เสียหายเป็นเงินจริง และ regulator กำหนดให้มี explainability, audit trail, ผู้รับผิดชอบ', ['ย้อนกลับไม่ได้', 'เงิน', 'regulator', 'explainab', 'audit', 'ผู้รับผิดชอบ', 'fraud', 'สินเชื่อ'], 'ธุรกรรมย้อนไม่ได้ + regulator ต้องการผู้รับผิดชอบ'),
    ]),
    27: ([
        S('role', 'บทบาทใน SDLC ที่เปลี่ยนไป', 2, 'เทียบ อดีต → ยุค Agentic AI 2 ประเด็น'),
        S('skill', 'ทักษะหลักที่สำคัญขึ้น', 3, 'ตอบเป็นข้อสั้นๆ 3 ข้อ'),
    ], [
        P('se27_curator', 'role', 'จากผู้เขียนโค้ดทุกบรรทัด → ผู้สั่งงาน/ตรวจ/รวมโค้ดจาก AI (orchestrator, reviewer, code curator)', ['orchestrat', 'review', 'ตรวจ', 'curator', 'สั่งงาน', 'กำกับ'], 'จาก code writer → orchestrator/reviewer'),
        P('se27_arch', 'role', 'เป็น architect/system thinker กำหนด architecture และ guardrail ให้ AI ทำตาม', ['architect', 'system think', 'ออกแบบ', 'guardrail', 'สถาปัตยกรรม'], 'เป็นผู้ออกแบบระบบ/วาง guardrail'),
        P('se27_req', 'role', 'เป็นผู้ตั้งโจทย์และ validate requirement เข้าใจโดเมน/stakeholder; กำหนด test strategy/acceptance criteria และอนุมัติ release', ['requirement', 'validate', 'stakeholder', 'โดเมน', 'acceptance', 'test strategy', 'อนุมัติ'], 'ตั้งโจทย์/validate requirement และเกณฑ์ทดสอบ'),
        P('se27_quality', 'role', 'เป้าหมายคือรับประกันคุณภาพของระบบ ไม่ใช่แค่ผลิตโค้ด', ['คุณภาพ', 'quality', 'รับประกัน'], 'จาก "ผู้เขียนโค้ด" → "ผู้รับประกันคุณภาพ"', bonus=True),
        P('se27_s_arch', 'skill', 'Systems thinking & software architecture', ['system', 'architecture', 'สถาปัตยกรรม'], 'Systems thinking / Architecture'),
        P('se27_s_re', 'skill', 'Requirements engineering / domain knowledge / communication', ['requirement', 'domain', 'โดเมน', 'communicat', 'สื่อสาร'], 'RE / domain / communication'),
        P('se27_s_prompt', 'skill', 'Prompt/Context engineering และออกแบบ multi-agent workflow', ['prompt', 'context engineering', 'agent', 'workflow'], 'Prompt/Context engineering'),
        P('se27_s_review', 'skill', 'Code review, testing, verification (จับผิด AI ได้)', ['review', 'testing', 'verification', 'ทดสอบ', 'ตรวจ'], 'Code review / Testing'),
        P('se27_s_sec', 'skill', 'Security (DevSecOps, shift-left), privacy, compliance, AI governance/ethics', ['security', 'devsecops', 'privacy', 'compliance', 'ethic', 'จริยธรรม', 'governance'], 'Security / Ethics / Governance'),
        P('se27_s_cloud', 'skill', 'Cloud-native / Platform engineering / Observability', ['cloud', 'platform', 'observab', 'devops'], 'Cloud-native / Platform engineering'),
    ]),
    28: ([
        S('why', 'เหตุผลที่ Shift-Left Security สำคัญในยุค AI', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
        S('prac', 'แนวปฏิบัติ DevSecOps', 3, 'บอก practice ราว 3 ขั้น เช่น Code → pre-commit, Build → SAST'),
    ], [
        P('se28_volume', 'why', 'AI สร้างโค้ดเร็วและปริมาณมาก ช่องโหว่เพิ่มตาม ถ้ารอตรวจตอนท้ายจะตามไม่ทัน', ['ปริมาณ', 'เร็ว', 'มาก', 'volume', 'ตามไม่ทัน'], 'AI สร้างโค้ดเร็ว/มาก ตรวจท้ายไม่ทัน'),
        P('se28_insecure', 'why', 'โค้ดจาก AI อาจมี insecure pattern (SQL injection, hard-coded secret), dependency มีช่องโหว่หรือไม่มีจริง (package hallucination)', ['injection', 'secret', 'ช่องโหว่', 'vulnerab', 'hallucinat', 'insecure', 'library', 'dependency'], 'โค้ด AI มีช่องโหว่/dependency ปลอม'),
        P('se28_cost', 'why', 'ยิ่งเจอช้ายิ่งแก้แพง (1x → 60–100x) ต้องสร้าง security เข้าไปตั้งแต่ต้น', ['แพง', 'ต้นทุน', 'cost', 'ตั้งแต่ต้น', 'early', '100'], 'แก้ตั้งแต่ต้นถูกกว่ามาก'),
        P('se28_plan', 'prac', 'Plan: threat modeling, security requirement/policy, security training', ['threat', 'policy', 'training', 'requirement'], 'Plan → Threat modeling'),
        P('se28_code', 'prac', 'Code: IDE security plugin, pre-commit hook (secret scanning), มนุษย์ review โค้ดจาก AI', ['ide', 'pre-commit', 'secret', 'code review', 'review'], 'Code → pre-commit hook / code review'),
        P('se28_build', 'prac', 'Build: SAST, SCA (dependency/license/SBOM), container scanning', ['sast', 'sca', 'sbom', 'static', 'dependency', 'container scan', 'sonarqube', 'snyk'], 'Build → SAST / SCA'),
        P('se28_test', 'prac', 'Test: DAST, IAST, fuzzing, penetration test', ['dast', 'iast', 'fuzz', 'penetration', 'pen test'], 'Test → DAST / Pen test'),
        P('se28_rel', 'prac', 'Release/Deploy/Monitor: software signing, quality gate, RASP, WAF, SIEM', ['signing', 'gate', 'rasp', 'waf', 'siem', 'monitor'], 'Release → signing · Operate → RASP/WAF · Monitor → SIEM'),
    ]),
    29: ([
        S('diff', 'ความแตกต่างจาก Monitoring แบบดั้งเดิม', 2, 'เทียบ 2 ประเด็น'),
        S('ben', 'ประโยชน์ที่เหนือกว่า', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
    ], [
        P('se29_why', 'diff', 'Monitoring ตอบแค่ "พังไหม" จาก metric/threshold ที่ตั้งไว้ · Observability ตอบ "ทำไม/พังตรงไหน" แม้ปัญหาที่ไม่เคยคาดไว้', ['ทำไม', 'why', 'unknown', 'ตรงไหน', 'สาเหตุ'], 'Monitoring = พังไหม · Observability = ทำไมพัง'),
        P('se29_pillars', 'diff', 'ใช้ 3 pillars: Metrics + Logs + Traces (distributed tracing ข้าม microservices)', ['trace', 'log', 'metric', 'pillar'], '3 pillars: metrics / logs / traces'),
        P('se29_aiops', 'diff', 'AIOps = Big Data + Machine Learning: anomaly detection, correlate event, ลด alert noise, หา root cause อัตโนมัติ (แทนคนดู dashboard)', ['aiops', 'machine learning', 'ml', 'anomaly', 'big data', 'correlat', 'อัตโนมัติ'], 'AIOps ใช้ ML ตรวจ anomaly/หา root cause'),
        P('se29_pro', 'diff', 'จาก reactive (แจ้งเตือนหลังพัง) → proactive/predictive + auto-remediation', ['proactive', 'predict', 'ทำนาย', 'ล่วงหน้า', 'reactive', 'auto'], 'reactive → proactive/predictive'),
        P('se29_mttr', 'ben', 'ลด MTTD/MTTR และ downtime (continuous operations)', ['mttr', 'mttd', 'downtime', 'ลดเวลา', 'เร็วขึ้น'], 'ลด MTTR / downtime'),
        P('se29_rca', 'ben', 'หา root cause และตอบสนอง incident ได้เร็วในระบบ microservices ที่ซับซ้อน/เปลี่ยนบ่อย', ['root cause', 'incident', 'สาเหตุ', 'microservice', 'ซับซ้อน'], 'หา root cause / ตอบ incident เร็ว'),
        P('se29_loop', 'ben', 'closed-loop feedback จาก Monitor กลับไป Plan / เชื่อม DevOps กับ Operations', ['feedback', 'closed-loop', 'loop', 'plan'], 'feedback loop กลับไป Plan', bonus=True),
    ]),
    30: ([
        S('design', 'แนวทางในขั้นออกแบบ (Design)', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
        S('dev', 'แนวทางในขั้นพัฒนา/ดำเนินงาน', 2, 'ตอบเป็นข้อสั้นๆ 2 ข้อ'),
    ], [
        P('se30_arch', 'design', 'เลือก architecture ประหยัดพลังงาน เหมาะกับขนาดงาน เช่น serverless/event-driven ไม่เปิดเครื่องทิ้งไว้', ['architecture', 'serverless', 'event', 'พลังงาน', 'energy'], 'architecture ประหยัดพลังงาน / serverless'),
        P('se30_carbon', 'design', 'Carbon-aware: รันงานใน region/เวลาที่ใช้พลังงานสะอาด', ['carbon-aware', 'region', 'พลังงานสะอาด', 'renewable', 'หมุนเวียน'], 'carbon-aware scheduling'),
        P('se30_data', 'design', 'ลดการรับส่ง/เก็บข้อมูล: caching, CDN, compression, data minimization/retention', ['cache', 'cdn', 'compress', 'บีบอัด', 'ข้อมูล', 'retention', 'minimi'], 'ลดข้อมูล: cache / CDN / เก็บเท่าที่จำเป็น'),
        P('se30_simple', 'design', 'ออกแบบให้เรียบง่าย (KIS) และ reuse component', ['simple', 'เรียบง่าย', 'kis', 'reuse', 'ใช้ซ้ำ'], 'Keep it simple / reuse'),
        P('se30_code', 'dev', 'เขียนโค้ดมีประสิทธิภาพ (algorithm ดี เลี่ยง polling/loop เปล่า, profiling)', ['algorithm', 'อัลกอริทึม', 'ประสิทธิภาพ', 'efficient', 'polling', 'profil', 'optimi'], 'โค้ดมีประสิทธิภาพ'),
        P('se30_right', 'dev', 'Right-sizing & Autoscaling (FinOps) ปิด environment ที่ไม่ใช้ ใช้ hardware ประหยัดพลังงาน', ['right-siz', 'right siz', 'autoscal', 'scale', 'ปิด', 'finops', 'graviton', 'arm'], 'Right-sizing / Autoscaling / ปิดเครื่องที่ไม่ใช้'),
        P('se30_measure', 'dev', 'วัดผลพลังงาน/คาร์บอน เช่น SCI, Cloud Carbon Footprint, carbon dashboard ของ cloud', ['sci', 'carbon footprint', 'วัด', 'measure', 'dashboard'], 'วัด carbon (SCI / Cloud Carbon Footprint)'),
        P('se30_k8s', 'dev', 'ใช้ container/Kubernetes เพิ่ม utilization, CI/CD ไม่ build ซ้ำโดยไม่จำเป็น', ['container', 'kubernetes', 'utiliz', 'ci/cd', 'cache build'], 'container เพิ่ม utilization / CI ประหยัด', bonus=True),
        P('se30_devsus', 'design', 'แนวคิด DevSusOps: นำ sustainability เข้ามาใน Dev และ Ops', ['devsusops', 'sustainab', 'ยั่งยืน'], 'DevSusOps', bonus=True),
    ]),
}
