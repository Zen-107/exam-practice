import type { Question } from './types';

/**
 * full_Ex — แตกจาก final_Ex/full_Ex.pdf + final_Ex/full_Ex_answer.md
 * น้ำหนักของการ์ดในข้อเดียวกันรวมแล้วเท่ากับคะแนนข้อนั้นในข้อสอบจริง
 * ⚠️ rubric ทุกข้อต้องผ่านการ QC เทียบกับเฉลยและสไลด์ก่อนใช้จริง
 */

const Q1 = 'จงให้คำจำกัดความ (Definition) ที่ครบถ้วนและสมบูรณ์ของศาสตร์ต่อไปนี้ (2%): Artificial Intelligence (AI), Computational Intelligence (CI), Expert Systems, Fuzzy Logic, Artificial Neural Network, Natural Language Processing (NLP)';
const Q2 = 'จงอธิบายสรุปและแสดงให้เห็นถึงกระบวนการแก้ปัญหาของ Human Problem Solving เปรียบเทียบกับ Expert System Problem Solving (3%)';
const Q3 = 'จงอธิบายและแสดงสถาปัตยกรรมให้เห็นว่า กระบวนการออกแบบ AI System ตามแนวทาง Knowledge Engineering เหมือนหรือแตกต่างจากกระบวนการออกแบบ AI System ตามแนวทางของ Data Engineering อย่างไร (3%)';
const Q4 = 'จาก Model y = w₁x₁ + w₂x₂ + b และ Dataset (x₁, x₂, y) = (1, 1, 2), (2, 3, 4), (4, 2, 6) (8%)';
const Q5 = 'จากปัญหาข้อ 4 ถ้าเราใช้ Gradient Descent Algorithm หาค่า w₁, w₂ และ b จะช่วยทำให้ AI Model ที่ได้ฉลาดกว่าหรือมีข้อดีกว่าวิธีในข้อ 4 หรือไม่ อย่างไร และจงอธิบายว่า Gradient Descent Algorithm คือ Algorithm อะไร มีความสำคัญต่อการพัฒนา AI System อย่างไร (4%)';

const BBB = { file: 'BBB_of_AI_Knowledge', pages: '1–2' };

export const fullEx: Question[] = [
  // ───────────── ข้อ 1 Definition (2%) → 6 การ์ด ─────────────
  {
    id: 'fx1_ai', exam: 'full_Ex', examNo: 1, part: '1 · AI', title: 'Artificial Intelligence (AI)',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Artificial Intelligence (AI)',
    slideRefs: [BBB, { file: 'AI_1', pages: '4–5' }],
    vocab: ['Artificial Intelligence', 'explain', 'emulate', 'human intelligent behaviors', 'computational processes', 'representations', 'procedures', 'autonomously'],
    rubric: [
      {
        id: 'ai_explain_emulate', weight: 1, required: true,
        text: 'เป็นศาสตร์ที่ศึกษาเพื่ออธิบาย (explain) และเลียนแบบ (emulate) พฤติกรรมความชาญฉลาดของมนุษย์',
        keywords: [['อธิบาย', 'explain', 'เลียนแบบ', 'emulate', 'จำลอง'], ['มนุษย์', 'human', 'คน']],
        hint: 'ยังไม่ได้บอกว่า AI "อธิบายและเลียนแบบพฤติกรรมความชาญฉลาดของมนุษย์"',
      },
      {
        id: 'ai_computational', weight: 1, required: true,
        text: 'ในรูปของกระบวนการคำนวณทางคอมพิวเตอร์ (computational processes)',
        keywords: [['คำนวณ', 'computational', 'computation', 'คอมพิวเตอร์', 'computer']],
        hint: 'ขาดวลี "in terms of computational processes" (ในรูปกระบวนการคำนวณ)',
      },
      {
        id: 'ai_engineering', weight: 0.5, bonus: true,
        text: 'Engineering Definition: สร้าง representations และ procedures ที่แก้ปัญหาได้เอง (autonomously) แทนปัญหาที่เคยต้องให้มนุษย์แก้',
        keywords: [['representation', 'procedure', 'autonomous', 'แก้ปัญหาได้เอง', 'แก้ปัญหาด้วยตัวเอง']],
        hint: 'โบนัส: Engineering Definition — generating representations and procedures that autonomously solve problems heretofore solved by humans',
      },
    ],
  },
  {
    id: 'fx1_ci', exam: 'full_Ex', examNo: 1, part: '1 · CI', title: 'Computational Intelligence (CI)',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Computational Intelligence (CI)',
    slideRefs: [BBB, { file: 'AI2025', pages: '4–6, 24' }],
    vocab: ['Computational Intelligence', 'natural intelligent behaviors', 'Genetic Algorithm', 'Swarm Intelligence', 'ACO', 'PSO', 'Simulated Annealing', 'Evolution Computation'],
    rubric: [
      {
        id: 'ci_human_and_natural', weight: 1, required: true,
        text: 'อธิบายและเลียนแบบพฤติกรรมความชาญฉลาดของมนุษย์ "และของธรรมชาติ" (natural intelligent behaviors)',
        wrongIf: ['บอกว่าเลียนแบบเฉพาะมนุษย์อย่างเดียว ไม่พูดถึงธรรมชาติ'],
        keywords: [['ธรรมชาติ', 'natural', 'nature']],
        hint: 'จุดที่ต่างจาก AI คือ CI เลียนแบบความฉลาดของ "ธรรมชาติ" ด้วย ไม่ใช่แค่มนุษย์',
      },
      {
        id: 'ci_computational', weight: 1,
        text: 'ในรูปของกระบวนการคำนวณ (computational processes)',
        keywords: [['คำนวณ', 'computational', 'computation']],
        hint: 'ขาด "in terms of computational processes"',
      },
      {
        id: 'ci_examples', weight: 1,
        text: 'ยกตัวอย่าง/ขอบเขต: Biological Intelligence (GA, Evolution Computation), Swarm Intelligence (ACO, PSO, ABC, AIS), Physical Intelligence (Simulated Annealing)',
        keywords: [['genetic', 'ga', 'evolution', 'วิวัฒนาการ', 'swarm', 'ฝูง', 'aco', 'pso', 'มด', 'ผึ้ง', 'annealing', 'อบเหนียว', 'ภูมิคุ้มกัน', 'immune']],
        hint: 'ยกตัวอย่างความฉลาดจากธรรมชาติ เช่น GA/วิวัฒนาการ, ฝูงมด ฝูงผึ้ง (ACO, PSO), Simulated Annealing',
      },
    ],
  },
  {
    id: 'fx1_es', exam: 'full_Ex', examNo: 1, part: '1 · Expert Systems', title: 'Expert Systems',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Expert Systems',
    slideRefs: [BBB, { file: 'AI_1', pages: '19' }],
    vocab: ['Expert System', 'Problem Solving', 'human expert', 'Knowledge Base', 'Inference Engine', 'Working Memory', 'Explanation Facility', 'User Interface'],
    rubric: [
      {
        id: 'es_problem_solving', weight: 1, required: true,
        text: 'ศาสตร์ย่อยของ AI ที่เลียนแบบความชาญฉลาดของมนุษย์ในเรื่อง "การแก้ปัญหา" (Problem Solving)',
        keywords: [['แก้ปัญหา', 'problem solving', 'problem-solving']],
        hint: 'Expert System เน้นเลียนแบบ "การแก้ปัญหา (Problem Solving)"',
      },
      {
        id: 'es_human_expert', weight: 1,
        text: 'โปรแกรมคอมพิวเตอร์ที่จำลองความสามารถในการแก้ปัญหาของผู้เชี่ยวชาญมนุษย์ (human expert)',
        keywords: [['ผู้เชี่ยวชาญ', 'human expert', 'เชี่ยวชาญ']],
        hint: 'ขาด "model the problem-solving ability of a human expert"',
      },
      {
        id: 'es_components', weight: 1,
        text: 'องค์ประกอบหลัก: Knowledge Base + Inference Engine (และ Working Memory, User Interface, Explanation Facility)',
        keywords: [['knowledge base', 'ฐานความรู้'], ['inference', 'อนุมาน']],
        hint: 'บอกองค์ประกอบหลัก Knowledge Base + Inference Engine',
      },
    ],
  },
  {
    id: 'fx1_fuzzy', exam: 'full_Ex', examNo: 1, part: '1 · Fuzzy Logic', title: 'Fuzzy Logic',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Fuzzy Logic',
    slideRefs: [BBB],
    vocab: ['Fuzzy Logic', 'Decision Making', 'membership grade', 'membership function', 'Zadeh', 'uncertain', 'vague'],
    rubric: [
      {
        id: 'fuzzy_decision', weight: 1, required: true,
        text: 'ศาสตร์ย่อยของ AI ที่เลียนแบบความชาญฉลาดของมนุษย์ในเรื่อง "การตัดสินใจ" (Decision Making)',
        keywords: [['ตัดสินใจ', 'decision']],
        hint: 'Fuzzy Logic เน้นเลียนแบบ "การตัดสินใจ (Decision Making)"',
      },
      {
        id: 'fuzzy_uncertain', weight: 1,
        text: 'ใช้กับข้อมูลที่คลุมเครือ / ไม่แน่นอน / ไม่ชัดเจน',
        keywords: [['คลุมเครือ', 'ไม่แน่นอน', 'ไม่ชัดเจน', 'กำกวม', 'uncertain', 'vague', 'ambiguous', 'imprecise', 'fuzzy']],
        hint: 'ยังไม่ได้บอกว่าใช้กับข้อมูลที่คลุมเครือหรือไม่แน่นอน',
      },
      {
        id: 'fuzzy_membership', weight: 1,
        text: 'ใช้ค่าความเป็นสมาชิก (membership grade) ในช่วง [0, 1] แทนค่าจริง/เท็จ',
        wrongIf: ['บอกว่าค่าเป็นได้แค่ 0 หรือ 1 (นั่นคือ crisp/boolean logic)'],
        keywords: [['สมาชิก', 'membership'], ['0ถึง1', '0-1', '[0,1]', '0–1', '0 ถึง 1', 'ศูนย์ถึงหนึ่ง', 'ระหว่าง0', 'ระหว่าง 0']],
        hint: 'ขาด "ค่าความเป็นสมาชิกอยู่ในช่วง [0, 1]" (ไม่ใช่แค่ 0 หรือ 1)',
      },
      {
        id: 'fuzzy_zadeh', weight: 0.5, bonus: true,
        text: 'ผู้คิดค้น Lotfi Zadeh ปี 1965',
        keywords: [['zadeh', 'ซาเดห์', 'ซาเด', '1965']],
        hint: 'โบนัส: Zadeh, 1965',
      },
    ],
  },
  {
    id: 'fx1_ann', exam: 'full_Ex', examNo: 1, part: '1 · ANN', title: 'Artificial Neural Network (ANN)',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Artificial Neural Network (ANN)',
    slideRefs: [BBB, { file: 'AI_ANN_2026', pages: '9–11' }],
    vocab: ['Artificial Neural Network', 'Learning', 'biological neural networks', 'neuron', 'node', 'edge', 'weight', 'Machine Learning'],
    rubric: [
      {
        id: 'ann_learning', weight: 1, required: true,
        text: 'ศาสตร์ย่อยของ AI/ML ที่เลียนแบบความชาญฉลาดของมนุษย์ในเรื่อง "การเรียนรู้" (Learning)',
        keywords: [['เรียนรู้', 'learning', 'learn']],
        hint: 'ANN เน้นเลียนแบบ "การเรียนรู้ (Learning)"',
      },
      {
        id: 'ann_bio', weight: 1,
        text: 'ได้แรงบันดาลใจจากโครงข่ายประสาทชีวภาพในสมองสัตว์/มนุษย์ (biological neural networks)',
        keywords: [['สมอง', 'brain', 'ประสาท', 'neural', 'biological', 'ชีวภาพ']],
        hint: 'ขาด "inspired by the biological neural networks that constitute animal brains"',
      },
      {
        id: 'ann_examples', weight: 1,
        text: 'เรียนรู้จากตัวอย่าง (examples) โดยไม่ต้องเขียนกฎเฉพาะงาน (without task-specific rules)',
        keywords: [['ตัวอย่าง', 'example', 'ข้อมูล', 'data'], ['กฎ', 'rule', 'โปรแกรม', 'program']],
        hint: 'ขาด "learn by considering examples, generally without being programmed with task-specific rules"',
      },
      {
        id: 'ann_structure', weight: 0.5, bonus: true,
        text: 'โครงสร้าง: neuron (node) เชื่อมกันด้วย edge ที่มี weight ซึ่งปรับค่าระหว่างเรียนรู้',
        keywords: [['neuron', 'นิวรอน', 'node', 'โหนด'], ['weight', 'น้ำหนัก']],
        hint: 'โบนัส: neuron/node, edge และ weight ที่ปรับค่าได้',
      },
    ],
  },
  {
    id: 'fx1_nlp', exam: 'full_Ex', examNo: 1, part: '1 · NLP', title: 'Natural Language Processing (NLP)',
    type: 'essay', weight: 2 / 6, examPrompt: Q1,
    prompt: 'ให้คำจำกัดความของ Natural Language Processing (NLP)',
    slideRefs: [BBB],
    vocab: ['Natural Language Processing', 'Human Language Understanding', 'Communication', 'Machine Translation', 'Chatbot', 'Speech'],
    rubric: [
      {
        id: 'nlp_language', weight: 1, required: true,
        text: 'ศาสตร์ย่อยของ AI ที่เลียนแบบความชาญฉลาดของมนุษย์ในเรื่อง "การเข้าใจภาษามนุษย์" (Human Language Understanding)',
        keywords: [['ภาษา', 'language'], ['เข้าใจ', 'understand', 'ประมวลผล', 'process']],
        hint: 'NLP เน้นเลียนแบบ "การเข้าใจภาษามนุษย์"',
      },
      {
        id: 'nlp_communication', weight: 1,
        text: 'และการสื่อสารด้วยภาษามนุษย์ (Communication)',
        keywords: [['สื่อสาร', 'communicat', 'โต้ตอบ', 'สนทนา']],
        hint: 'ขาด "การสื่อสาร (Communication)" ด้วยภาษามนุษย์',
      },
      {
        id: 'nlp_examples', weight: 0.5, bonus: true,
        text: 'ตัวอย่าง: Machine Translation, Chatbot, Speech Understanding',
        keywords: [['translation', 'แปลภาษา', 'chatbot', 'แชทบอท', 'speech', 'เสียงพูด']],
        hint: 'โบนัส: ยกตัวอย่าง เช่น Machine Translation, Chatbot',
      },
    ],
  },

  // ───────────── ข้อ 2 Human vs ES (3%) → 3 การ์ด ─────────────
  {
    id: 'fx2_match', exam: 'full_Ex', examNo: 2, part: '2 · จับคู่', title: 'จับคู่องค์ประกอบ Human ↔ Expert System',
    type: 'matching', weight: 1, examPrompt: Q2,
    prompt: 'จับคู่องค์ประกอบของ Human Expert Problem-Solving กับ Expert System Problem-Solving ที่ทำหน้าที่เดียวกัน',
    slideRefs: [{ file: 'AI_1', pages: '29–30' }],
    vocab: [],
    pairs: [
      { left: 'Long-Term Memory', right: 'Knowledge Base' },
      { left: 'Short-Term Memory', right: 'Working Memory' },
      { left: 'Reasoning', right: 'Inference Engine' },
      { left: 'Advisee', right: 'User' },
    ],
  },
  {
    id: 'fx2_process', exam: 'full_Ex', examNo: 2, part: '2 · กระบวนการ', title: 'กระบวนการแก้ปัญหาของมนุษย์และ Expert System',
    type: 'essay', weight: 1, examPrompt: Q2,
    prompt: 'อธิบายขั้นตอนการแก้ปัญหาของ Human Expert และของ Expert System ว่าทำงานอย่างไร',
    slideRefs: [{ file: 'AI_1', pages: '29–37' }],
    vocab: ['Long-Term Memory', 'Short-Term Memory', 'Reasoning', 'Advisee', 'Knowledge Base', 'Working Memory', 'Inference Engine', 'rule', 'fire', 'Explanation Facility', 'HOW', 'WHY'],
    rubric: [
      {
        id: 'p2_human', weight: 1, required: true,
        text: 'มนุษย์: รับข้อเท็จจริงจากผู้ขอคำปรึกษา → เก็บในความจำระยะสั้น → ใช้เหตุผลร่วมกับความรู้ในความจำระยะยาว → ได้ข้อสรุป/คำแนะนำ',
        keywords: [['ระยะสั้น', 'short-term', 'short term'], ['ระยะยาว', 'long-term', 'long term'], ['เหตุผล', 'reasoning']],
        hint: 'อธิบายฝั่งมนุษย์: Short-Term Memory ↔ Reasoning ↔ Long-Term Memory → ข้อสรุป',
      },
      {
        id: 'p2_es', weight: 1, required: true,
        text: 'Expert System: ผู้ใช้ป้อนข้อเท็จจริงลง Working Memory → Inference Engine จับคู่ (match) กับ rule ใน Knowledge Base → rule ที่ตรงถูก fire เพิ่มข้อเท็จจริงใหม่ → วนซ้ำจนได้ข้อสรุป',
        keywords: [['working memory', 'หน่วยความจำทำงาน'], ['inference', 'อนุมาน'], ['knowledge base', 'ฐานความรู้', 'rule', 'กฎ']],
        hint: 'อธิบายฝั่ง ES: Working Memory → Inference Engine match กับ rule ใน KB → fire → วนจนได้ข้อสรุป',
      },
      {
        id: 'p2_loop', weight: 0.5,
        text: 'กระบวนการวนซ้ำ: ข้อเท็จจริงใหม่ที่อนุมานได้ถูกเพิ่มกลับไปแล้วใช้ต่อจนถึงข้อสรุป',
        keywords: [['วนซ้ำ', 'ซ้ำ', 'loop', 'จนกว่า', 'จนได้', 'จนไม่มี', 'iterat']],
        hint: 'บอกว่าเป็นการวนซ้ำ: inferred facts ถูกเพิ่มแล้วใช้ต่อจนได้ข้อสรุป',
      },
      {
        id: 'p2_explain', weight: 0.5, bonus: true,
        text: 'Explanation Facility อธิบายเหตุผลได้ (HOW / WHY)',
        keywords: [['explanation', 'how', 'why', 'อธิบายเหตุผล']],
        hint: 'โบนัส: ES ใช้ Explanation Facility อธิบาย HOW/WHY ได้',
      },
    ],
  },
  {
    id: 'fx2_compare', exam: 'full_Ex', examNo: 2, part: '2 · เปรียบเทียบ', title: 'ความเหมือนและความต่าง Human vs Expert System',
    type: 'essay', weight: 1, examPrompt: Q2,
    prompt: 'เปรียบเทียบความเหมือนและความต่างระหว่างการแก้ปัญหาของมนุษย์กับ Expert System',
    slideRefs: [{ file: 'AI_1', pages: '29–30, 40–41' }],
    vocab: ['Knowledge', 'Control', 'domain', 'common sense', 'consistent', 'Explanation'],
    rubric: [
      {
        id: 'c2_same', weight: 1, required: true,
        text: 'เหมือน: โครงสร้างตรงกันแบบ 1:1 — แยกความรู้ (ระยะยาว/KB) ออกจากข้อมูลของปัญหา (ระยะสั้น/WM) และมีตัวประมวลผลเหตุผลอยู่ตรงกลาง',
        keywords: [['เหมือน', 'คล้าย', 'same', 'similar', 'ตรงกัน', '1:1']],
        hint: 'บอกความเหมือน: โครงสร้าง 1:1 แยกความรู้ออกจากข้อมูลปัญหา และมีตัวใช้เหตุผลตรงกลาง',
      },
      {
        id: 'c2_es_pros', weight: 1,
        text: 'ES ได้เปรียบ: ไม่เหนื่อย/ไม่ลืม ทำงานได้ตลอดทุกที่ ผลสม่ำเสมอ อธิบายเหตุผลเป็นขั้นตอนได้ แยก Knowledge ออกจาก Control',
        keywords: [['ไม่เหนื่อย', 'ไม่ลืม', 'ตลอดเวลา', '24', 'สม่ำเสมอ', 'consistent', 'อธิบาย', 'ทุกที่', 'ไม่มีอารมณ์']],
        hint: 'บอกข้อดีของ ES เช่น ไม่เหนื่อย ไม่ลืม ใช้ได้ตลอด อธิบายเหตุผลได้',
      },
      {
        id: 'c2_es_cons', weight: 1,
        text: 'ES ด้อยกว่า: ใช้ได้เฉพาะโดเมนแคบ ไม่มี common sense ไม่เรียนรู้เองถ้าไม่ปรับ KB ผิดถ้าความรู้ใน KB ผิด — มนุษย์ยืดหยุ่น สร้างสรรค์ ปรับตัวได้ดีกว่า',
        keywords: [['แคบ', 'เฉพาะ', 'narrow', 'common sense', 'สามัญสำนึก', 'ยืดหยุ่น', 'สร้างสรรค์', 'ปรับตัว', 'ไม่เรียนรู้']],
        hint: 'บอกข้อจำกัดของ ES เช่น โดเมนแคบ ไม่มี common sense ส่วนมนุษย์ยืดหยุ่นและสร้างสรรค์กว่า',
      },
    ],
  },

  // ───────────── ข้อ 3 KE vs DE (3%) → 3 การ์ด ─────────────
  {
    id: 'fx3_ke_order', exam: 'full_Ex', examNo: 3, part: '3 · ขั้นตอน KE', title: 'เรียงขั้นตอน Knowledge Engineering Process',
    type: 'ordering', weight: 0.75, examPrompt: Q3,
    prompt: 'เรียงลำดับขั้นตอนของ Knowledge Engineering Process ให้ถูกต้อง',
    slideRefs: [{ file: 'AI_1', pages: '16' }, { file: 'AI_ANN_2026', pages: '4' }],
    vocab: [],
    order: ['Problem Assessment', 'Knowledge Acquisition', 'System Design', 'System Development', 'Testing', 'Documentation', 'Maintenance'],
  },
  {
    id: 'fx3_de_order', exam: 'full_Ex', examNo: 3, part: '3 · ขั้นตอน DE', title: 'เรียงขั้นตอน Data Engineering pipeline',
    type: 'ordering', weight: 0.75, examPrompt: Q3,
    prompt: 'เรียงลำดับขั้นตอนการออกแบบ AI System แบบ Data Engineering ให้ถูกต้อง',
    slideRefs: [{ file: 'AI_DataEngineering_2025', pages: '6, 52+' }, { file: 'AI_ANN_2026', pages: '5' }],
    vocab: [],
    order: [
      'ศึกษา goal / ตั้งคำถาม',
      'หาและนำเข้าข้อมูล (IDS)',
      'เตรียมข้อมูล (ETL, Cleansing, EDA)',
      'เก็บใน Analytic Data Store',
      'สร้าง / ปรับ / ประเมิน Model (train, validate, test)',
      'Deployment',
      'Visualization & Reporting',
    ],
  },
  {
    id: 'fx3_compare', exam: 'full_Ex', examNo: 3, part: '3 · เปรียบเทียบ', title: 'Knowledge Engineering vs Data Engineering',
    type: 'essay', weight: 1.5, examPrompt: Q3,
    prompt: 'อธิบายสถาปัตยกรรมและเปรียบเทียบว่าการออกแบบ AI System แบบ Knowledge Engineering กับ Data Engineering เหมือนและต่างกันอย่างไร',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '2–6' }, { file: 'AI_1', pages: '16, 44–46' }, { file: 'AI_DataEngineering_2025', pages: '4, 14' }],
    vocab: ['Knowledge Engineering', 'Data Engineering', 'Human Expert', 'Knowledge Engineer', 'Knowledge Acquisition', 'Knowledge Base', 'Inference Engine', 'Training Dataset', 'Validation', 'Testing', 'Model', 'Pre-processing mode', 'Processing mode', 'Hybrid', 'black box', 'Data Scientist'],
    rubric: [
      {
        id: 'k3_ke', weight: 1, required: true,
        text: 'KE: นำความรู้จาก Human Expert ผ่าน Knowledge Engineer (Knowledge Acquisition) มาสร้าง Knowledge Base แล้วใช้ Inference Engine อนุมาน เช่น Expert System, Fuzzy Logic',
        keywords: [['ผู้เชี่ยวชาญ', 'expert'], ['knowledge base', 'ฐานความรู้', 'knowledge acquisition', 'ความรู้']],
        hint: 'อธิบาย KE: Human Expert → Knowledge Engineer → Knowledge Base → Inference Engine',
      },
      {
        id: 'k3_de', weight: 1, required: true,
        text: 'DE: นำ Data จากโลกจริงมา train Model (Training/Validation/Testing Dataset) แล้วใช้ Trained Model ทำนาย เช่น ML, ANN, Deep Learning',
        keywords: [['data', 'ข้อมูล'], ['train', 'เทรน', 'สอน', 'model', 'โมเดล']],
        hint: 'อธิบาย DE: Data → Train Model (train/validate/test) → Trained Model ทำนาย',
      },
      {
        id: 'k3_modes', weight: 1,
        text: 'ทั้งคู่แบ่ง Pre-processing mode (KE สร้าง KB / DE train model) กับ Processing mode (KE อนุมาน / DE ทำนาย)',
        keywords: [['pre-processing', 'preprocessing', 'processing', 'โหมด', 'mode']],
        hint: 'แสดงสถาปัตยกรรม 2 โหมด: Pre-processing (สร้าง KB/Train) และ Processing (ใช้งานจริง)',
      },
      {
        id: 'k3_diff', weight: 1,
        text: 'ต่าง: แหล่งความฉลาด (ความรู้ผู้เชี่ยวชาญ vs รูปแบบในข้อมูล), บทบาท (Domain Expert/Knowledge Engineer vs Data Engineer/Data Scientist), อธิบายผลได้ (HOW/WHY) vs black box, เหมาะกับงานกฎชัด/ข้อมูลน้อย vs ข้อมูลมาก',
        keywords: [['อธิบาย', 'black box', 'แบล็กบ็อกซ์', 'โปร่งใส', 'data scientist', 'knowledge engineer', 'ข้อมูลมาก', 'ข้อมูลน้อย']],
        hint: 'บอกความต่าง เช่น KE อธิบายผลได้ ส่วน DE มักเป็น black box หรือบทบาทคนต่างกัน',
      },
      {
        id: 'k3_same', weight: 1,
        text: 'เหมือน: เป็นกระบวนการทางวิศวกรรมแบบวนซ้ำ มีเป้าหมายเลียนแบบความฉลาดของมนุษย์ ต้องทดสอบ/ประเมิน/บำรุงรักษา',
        keywords: [['เหมือน', 'คล้าย', 'ทั้งสอง', 'ทั้งคู่', 'วนซ้ำ', 'iterative']],
        hint: 'บอกความเหมือน: วนซ้ำ (iterative), เป้าหมายเดียวกัน, ต้องทดสอบและบำรุงรักษา',
      },
      {
        id: 'k3_hybrid', weight: 0.5, bonus: true,
        text: 'ใช้ร่วมกันได้เป็น Hybrid AI System',
        keywords: [['hybrid', 'ไฮบริด']],
        hint: 'โบนัส: ใช้ทั้งสองแบบร่วมกัน = Hybrid AI System',
      },
    ],
  },

  // ───────────── ข้อ 4 Model & Dataset (8%) → 3 การ์ด ─────────────
  {
    id: 'fx4_1', exam: 'full_Ex', examNo: 4, part: '4.1', title: 'ทำให้ Model เป็น AI Model ที่ชาญฉลาด + เงื่อนไขและขอบเขต',
    type: 'essay', weight: 3, examPrompt: Q4,
    prompt: '4.1 จงอธิบายว่า จะทำให้ Model นี้เป็น AI Model ที่ชาญฉลาดได้อย่างไร และ AI Model ที่ชาญฉลาดนี้ สามารถชาญฉลาดได้โดยมีเงื่อนไขและขอบเขตหรือไม่ อย่างไร',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '6, 19–21, 43–54' }, { file: 'AI_DataEngineering_2025', pages: '15' }],
    vocab: ['Supervised Learning', 'labeled data', 'Training', 'Testing', 'Validation', 'Mean Square Error', 'MSE', 'weight', 'bias', 'Gradient Descent', 'linear', 'XOR', 'activation function', 'hidden layer', 'overfitting', 'interpolation', 'extrapolation', 'Narrow AI'],
    rubric: [
      {
        id: 'm41_supervised', weight: 1, required: true,
        text: 'ทำให้ฉลาดด้วยการเรียนรู้แบบ Supervised Learning จาก Dataset ที่มีคำตอบกำกับ (x₁, x₂ → y)',
        keywords: [['เรียนรู้', 'learn', 'train', 'เทรน', 'สอน', 'supervised']],
        hint: 'บอกว่าต้องให้ Model "เรียนรู้" จาก dataset ที่มีคำตอบ (Supervised Learning)',
      },
      {
        id: 'm41_minimize', weight: 1, required: true,
        text: 'กำหนด Error function (MSE) แล้วปรับ w₁, w₂, b ให้ error ต่ำที่สุด',
        keywords: [['error', 'mse', 'ผิดพลาด', 'คลาดเคลื่อน'], ['w', 'weight', 'น้ำหนัก', 'bias', 'ปรับ']],
        hint: 'บอกว่าต้องหา w₁, w₂, b ที่ทำให้ MSE น้อยที่สุด',
      },
      {
        id: 'm41_test', weight: 0.5,
        text: 'ทดสอบด้วย Testing/Validation Dataset แล้วนำ Trained Model ไปทำนาย input ใหม่',
        keywords: [['test', 'ทดสอบ', 'validat', 'ทำนาย', 'predict']],
        hint: 'บอกว่าต้องทดสอบกับ test set แล้วนำไปทำนายข้อมูลใหม่',
      },
      {
        id: 'm41_yes_conditions', weight: 0.5, required: true,
        text: 'ตอบว่า "มี" เงื่อนไขและขอบเขต',
        wrongIf: ['ตอบว่าไม่มีเงื่อนไขหรือขอบเขต / ฉลาดได้ทุกกรณี'],
        keywords: [['เงื่อนไข', 'ขอบเขต', 'จำกัด', 'limit']],
        hint: 'ต้องตอบว่า "มี" เงื่อนไขและขอบเขต แล้วอธิบาย',
      },
      {
        id: 'm41_data', weight: 1,
        text: 'ขึ้นกับข้อมูล: ฉลาดได้เท่าที่ข้อมูลสอน ข้อมูลต้องมากพอ ถูกต้อง เป็นตัวแทนปัญหาจริง (garbage in, garbage out)',
        keywords: [['มากพอ', 'ถูกต้อง', 'garbage', 'ตัวแทน', 'คุณภาพ', 'representative', 'เท่าที่ข้อมูล', 'ข้อมูลผิด']],
        hint: 'เงื่อนไขเรื่องข้อมูล: ต้องมากพอ ถูกต้อง เป็นตัวแทน (garbage in, garbage out)',
      },
      {
        id: 'm41_linear', weight: 1,
        text: 'ขึ้นกับรูปแบบ Model: เป็นเชิงเส้น (hyperplane) ใช้ได้กับปัญหาเชิงเส้นเท่านั้น ถ้า non-linear (เช่น XOR) ต้องเพิ่ม activation function / hidden layer',
        keywords: [['เชิงเส้น', 'linear', 'xor', 'hyperplane', 'activation', 'hidden']],
        hint: 'ขอบเขตของ Model: linear ใช้ได้เฉพาะปัญหาเชิงเส้น (XOR ต้องใช้ MLP/activation)',
      },
      {
        id: 'm41_range_overfit', weight: 1,
        text: 'ขอบเขตอื่น: ทำนายดีในช่วงที่เคยเรียน (interpolation) แต่นอกช่วงอาจผิด (extrapolation) / Overfitting — 3 ข้อมูล 3 ตัวแปรได้ perfect fit แต่อาจ generalize ไม่ดี / ฉลาดเฉพาะงาน (Narrow AI)',
        keywords: [['ช่วง', 'range', 'extrapolat', 'interpolat', 'overfit', 'โอเวอร์ฟิต', 'generaliz', 'narrow', 'เฉพาะงาน']],
        hint: 'บอกขอบเขตเพิ่ม เช่น นอกช่วงข้อมูล (extrapolation), overfitting, Narrow AI',
      },
    ],
  },
  {
    id: 'fx4_2_concept', exam: 'full_Ex', examNo: 4, part: '4.2 · แนวคิด', title: 'w₁, w₂, b เกี่ยวข้องไหม และหาด้วย MSE อย่างไร',
    type: 'essay', weight: 1.5, examPrompt: Q4,
    prompt: '4.2 (ส่วนอธิบาย) ค่า w₁, w₂ และ b เกี่ยวข้องกับการทำ Model ให้เป็น AI Model หรือไม่ และมีวิธีหาค่าที่ทำให้ฉลาดที่สุดด้วย Mean Square Error อย่างไร',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '49, 56, 61, 73–77' }],
    vocab: ['weight', 'bias', 'Mean Square Error', 'MSE', 'partial derivative', 'derivative', 'chain rule', 'minimum'],
    rubric: [
      {
        id: 'm42_related', weight: 1, required: true,
        text: 'เกี่ยวข้องโดยตรง: w₁, w₂ (weights) และ b (bias) คือ "ความรู้" ที่ Model ได้จากการเรียนรู้',
        wrongIf: ['ตอบว่าไม่เกี่ยวข้อง'],
        keywords: [['เกี่ยว', 'related', 'สำคัญ', 'ความรู้', 'knowledge']],
        hint: 'ตอบว่า "เกี่ยวข้องโดยตรง" เพราะ w, b คือความรู้ที่ Model เรียนรู้',
      },
      {
        id: 'm42_mse', weight: 1,
        text: 'เขียน MSE = (1/n)Σ(yᵢ − w₁x₁ᵢ − w₂x₂ᵢ − b)² เป็น error function',
        keywords: [['mse', 'mean square', 'error']],
        hint: 'เขียน MSE ในรูปของ w₁, w₂, b',
      },
      {
        id: 'm42_partial', weight: 1, required: true,
        text: 'หา partial derivative 3 ตัว (∂MSE/∂w₁, ∂MSE/∂w₂, ∂MSE/∂b) แล้วให้เท่ากับ 0 (จุดต่ำสุด slope = 0) ได้ระบบ 3 สมการ แล้วแก้สมการ',
        keywords: [['partial', 'อนุพันธ์', 'ดิฟ', 'derivative', 'diff'], ['0', 'ศูนย์', 'zero']],
        hint: 'บอกว่าต้องหา partial derivative 3 ตัวแล้วให้ = 0 ได้ 3 สมการ',
      },
    ],
  },
  {
    id: 'fx4_2_calc', exam: 'full_Ex', examNo: 4, part: '4.2 · คำนวณ', title: 'คำนวณ w₁, w₂, b และ MSE',
    type: 'numeric', weight: 3.5, examPrompt: Q4,
    prompt: '4.2 (ส่วนคำนวณ) คำนวณผลรวมจาก Dataset แล้วแก้ระบบ 3 สมการ หาค่า w₁, w₂, b และ MSE ของ Model ที่ได้',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '78–85' }],
    vocab: [],
    numericFields: [
      { id: 's_x1x1', label: 'Σx₁²', expected: 21, tol: 0.001, weight: 0.25 },
      { id: 's_x2x2', label: 'Σx₂²', expected: 14, tol: 0.001, weight: 0.25 },
      { id: 's_x1', label: 'Σx₁', expected: 7, tol: 0.001, weight: 0.25 },
      { id: 's_x2', label: 'Σx₂', expected: 6, tol: 0.001, weight: 0.25 },
      { id: 's_y', label: 'Σy', expected: 12, tol: 0.001, weight: 0.25 },
      { id: 's_x1y', label: 'Σx₁y', expected: 34, tol: 0.001, weight: 0.25 },
      { id: 's_x2y', label: 'Σx₂y', expected: 26, tol: 0.001, weight: 0.25 },
      { id: 's_x1x2', label: 'Σx₁x₂', expected: 15, tol: 0.001, weight: 0.25 },
      { id: 'w1', label: 'w₁', expected: 1.2, tol: 0.01, weight: 2 },
      { id: 'w2', label: 'w₂', expected: 0.4, tol: 0.01, weight: 2 },
      { id: 'b', label: 'b', expected: 0.4, tol: 0.01, weight: 2 },
      { id: 'mse', label: 'MSE', expected: 0, tol: 0.001, weight: 1 },
    ],
  },

  // ───────────── ข้อ 5 Gradient Descent (4%) → 3 การ์ด ─────────────
  {
    id: 'fx5_better', exam: 'full_Ex', examNo: 5, part: '5 · ฉลาดกว่าไหม', title: 'GD ฉลาดกว่าหรือมีข้อดีกว่าวิธีในข้อ 4 ไหม',
    type: 'essay', weight: 1.5, examPrompt: Q5,
    prompt: 'ถ้าใช้ Gradient Descent หาค่า w₁, w₂, b จะทำให้ AI Model ฉลาดกว่าหรือมีข้อดีกว่าวิธีในข้อ 4 หรือไม่ อย่างไร',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '66–67, 86–90, 136–144' }],
    vocab: ['Gradient Descent', 'closed form', 'activation function', 'Sigmoid', 'Multilayer', 'Deep Learning', 'Backpropagation', 'online learning'],
    rubric: [
      {
        id: 'g5_not_smarter', weight: 1, required: true,
        text: 'สำหรับ Dataset นี้ "ไม่ได้ฉลาดกว่า" เพราะวิธีข้อ 4 ได้คำตอบแม่นตรง (MSE = 0) อยู่แล้ว GD ลู่เข้าค่าเดิม (≈1.2, 0.4, 0.4) เป็นค่าประมาณ',
        wrongIf: ['บอกว่า GD ได้คำตอบที่ดีกว่า/แม่นกว่าวิธีข้อ 4 สำหรับ dataset นี้'],
        keywords: [['ไม่ได้ฉลาดกว่า', 'ไม่ฉลาดกว่า', 'เท่าเดิม', 'ค่าเดิม', 'เหมือนเดิม', 'ไม่ต่าง', 'เท่ากัน', 'ประมาณ']],
        hint: 'สำหรับ dataset นี้ GD "ไม่ได้ฉลาดกว่า" — ข้อ 4 ได้คำตอบแม่นตรง GD ได้ค่าประมาณเดิม',
      },
      {
        id: 'g5_scale', weight: 1,
        text: 'ข้อดี: ถ้ามี input/ข้อมูลมาก (เช่น 1M inputs) การกระจายและแก้ระบบสมการจะหนักมาก GD แค่คำนวณ gradient แล้วปรับทีละก้าว',
        keywords: [['input มาก', 'ข้อมูลมาก', 'ข้อมูลเยอะ', 'ตัวแปรมาก', 'ขนาดใหญ่', 'large', 'million', 'ล้าน', '1m', 'exhaust', 'แก้สมการ']],
        hint: 'ข้อดี: เมื่อ input หรือข้อมูลมาก แก้สมการตรงๆ ไม่ไหว แต่ GD ทำได้',
      },
      {
        id: 'g5_nonlinear', weight: 1,
        text: 'ข้อดี: ใช้กับ activation function ที่ไม่เป็นเชิงเส้น (Sigmoid, ReLU) และหลาย layer (MLP/Deep Learning) ที่แก้แบบ closed form ไม่ได้',
        keywords: [['activation', 'sigmoid', 'relu', 'non-linear', 'nonlinear', 'ไม่เป็นเชิงเส้น', 'ไม่เชิงเส้น', 'layer', 'deep', 'mlp']],
        hint: 'ข้อดี: ใช้กับ model ไม่เชิงเส้น/หลาย layer ที่แก้สมการตรงๆ ไม่ได้',
      },
      {
        id: 'g5_program', weight: 0.5, bonus: true,
        text: 'เขียนโปรแกรมง่าย (loop) และ train ต่อเนื่องเมื่อมีข้อมูลใหม่ได้ (online learning)',
        keywords: [['โปรแกรม', 'program', 'python', 'loop', 'online', 'ข้อมูลใหม่']],
        hint: 'โบนัส: เขียนโปรแกรมง่ายและ train ต่อเมื่อมีข้อมูลใหม่',
      },
    ],
  },
  {
    id: 'fx5_what', exam: 'full_Ex', examNo: 5, part: '5 · คืออะไร', title: 'Gradient Descent คือ Algorithm อะไร + ขั้นตอน',
    type: 'essay', weight: 1.5, examPrompt: Q5,
    prompt: 'Gradient Descent Algorithm คือ Algorithm อะไร ทำงานอย่างไร (บอกขั้นตอน)',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '91–111' }],
    vocab: ['Gradient Descent', 'first-order', 'iterative', 'optimization', 'local minimum', 'differentiable', 'gradient', 'slope', 'learning rate', 'alpha', 'update', 'converge'],
    rubric: [
      {
        id: 'w5_def', weight: 1, required: true,
        text: 'นิยาม: first-order iterative optimization algorithm สำหรับหา local minimum ของ function ที่หาอนุพันธ์ได้ (error function)',
        keywords: [['optimiz', 'minimum', 'ต่ำสุด', 'น้อยที่สุด', 'minimi']],
        hint: 'นิยาม: iterative optimization algorithm หา (local) minimum ของ error function',
      },
      {
        id: 'w5_opposite', weight: 1, required: true,
        text: 'เดินในทิศ "ตรงข้าม" กับ gradient: w_new = w_old − α∇w',
        wrongIf: ['บอกว่าเดินไปทิศเดียวกับ gradient (บวก gradient)'],
        keywords: [['ตรงข้าม', 'opposite', 'negative gradient', '-α', '−α', '- α', '− α', 'ลบด้วย']],
        hint: 'ต้องปรับค่าไปในทิศ "ตรงข้าม" กับ gradient: w = w − α∇w',
      },
      {
        id: 'w5_lr', weight: 1,
        text: 'Learning rate (α): ใหญ่เกินจะกระโดดข้ามจุดต่ำสุด/ลู่ออก เล็กเกินจะช้ามาก',
        keywords: [['learning rate', 'อัตราการเรียนรู้', 'alpha', 'อัลฟา', 'α', 'step size']],
        hint: 'อธิบาย learning rate: ใหญ่เกินลู่ออก เล็กเกินช้า',
      },
      {
        id: 'w5_steps', weight: 1,
        text: 'ขั้นตอน: เริ่มค่า (เช่น 0) → หา gradient → update → ทำซ้ำจน gradient ใกล้ 0',
        keywords: [['เริ่ม', 'initial', 'สุ่ม', 'random'], ['ซ้ำ', 'repeat', 'วน', 'iterat', 'จน']],
        hint: 'บอกขั้นตอน: เริ่มค่า → คำนวณ gradient → update → วนจน gradient ≈ 0',
      },
    ],
  },
  {
    id: 'fx5_importance', exam: 'full_Ex', examNo: 5, part: '5 · ความสำคัญ', title: 'ความสำคัญของ Gradient Descent ต่อ AI System',
    type: 'essay', weight: 1, examPrompt: Q5,
    prompt: 'Gradient Descent มีความสำคัญต่อการพัฒนา AI System อย่างไร',
    slideRefs: [{ file: 'AI_ANN_2026', pages: '23, 145–157' }],
    vocab: ['Learning', 'Data Engineering', 'Machine Learning', 'Deep Learning', 'LLM', 'Backpropagation', 'differentiable', 'Sigmoid', 'local minimum', 'Direction', 'Speed'],
    rubric: [
      {
        id: 'i5_core', weight: 1, required: true,
        text: 'เป็นหัวใจของ Learning ในแนว Data Engineering ใช้ train ML, ANN, Deep Learning, LLM แทบทุกตัว (ร่วมกับ Backpropagation)',
        keywords: [['ml', 'machine learning', 'ann', 'neural', 'deep', 'llm', 'backprop', 'แบ็คพรอพ', 'train', 'เทรน', 'เรียนรู้']],
        hint: 'บอกว่าเป็นหัวใจของการ train ML/ANN/Deep Learning (ร่วมกับ Backpropagation)',
      },
      {
        id: 'i5_scale', weight: 1,
        text: 'ทำให้ train Model ที่มีพารามิเตอร์มหาศาล ข้อมูลมาก และไม่เป็นเชิงเส้นได้จริง (ขอแค่ differentiable)',
        keywords: [['มหาศาล', 'มาก', 'เยอะ', 'large', 'พารามิเตอร์', 'parameter', 'differentiab', 'หาอนุพันธ์', 'ไม่เป็นเชิงเส้น', 'non-linear']],
        hint: 'บอกว่าทำให้ train model ใหญ่/ข้อมูลมาก/ไม่เชิงเส้นได้',
      },
      {
        id: 'i5_caveat', weight: 0.5,
        text: 'ข้อควรระวัง: ต้องเลือก learning rate ให้เหมาะ อาจติด local minimum — "Direction สำคัญกว่า Speed"',
        keywords: [['local minimum', 'local', 'learning rate', 'direction', 'ทิศทาง', 'speed']],
        hint: 'บอกข้อควรระวัง: learning rate, local minimum — Direction สำคัญกว่า Speed',
      },
    ],
  },
];
