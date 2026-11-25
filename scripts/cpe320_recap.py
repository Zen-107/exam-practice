"""สรุปเฉลย CPE320 แบบความเรียง (ต่อช่องคำตอบ) แสดงหลังตรวจในโหมดฝึก

เขียนให้อ่านแล้วจำได้ว่าพลาดตรงไหน ทุกประโยคมาจาก CPE320_20_OpenExam_Answers.md
key = เลขข้อ → id ช่องคำตอบ (ตรงกับ cpe320_rubric.RUBRIC / extract_cpe320.MANUAL)
ห้ามใช้ขีดยาว (— –) ช่วงตัวเลขเขียนว่า "ถึง"
"""

RECAP: dict[int, dict[str, str]] = {
    1: {
        'def': 'ตามการทำงานจริง Software Engineering คือการนำหลักวิศวกรรมที่เหมาะสมมาใช้พัฒนาซอฟต์แวร์อย่างเป็นระบบ เพื่อให้ได้ซอฟต์แวร์ที่ทำงานได้จริง มีประสิทธิภาพ และตรงกับความต้องการของลูกค้า ภายใต้งบประมาณและเวลาที่สมเหตุสมผล นิยามที่ครบต้องมีสามส่วนนี้ คือหลักวิศวกรรม ผลลัพธ์ที่ลูกค้าต้องการ และข้อจำกัดเรื่องงบกับเวลา',
        'why': 'Process Model เป็น roadmap ของงาน บอกว่ามีกิจกรรม งาน milestone และ work product อะไร ใครทำอะไร เมื่อไหร่ งานพัฒนาซอฟต์แวร์ที่โดยธรรมชาติวุ่นวายจึงเป็นระเบียบและควบคุมได้ ถ้าไม่มี โปรเจกต์มักเกินเวลา เกินงบ และไม่ตรงความต้องการ ซึ่งก็คืออาการ Software Crisis',
    },
    2: {
        'fit': 'Waterfall เหมาะกับระบบที่ requirement ชัดเจน เข้าใจดี และแทบไม่เปลี่ยนระหว่างทาง เช่น โปรเจกต์ใหญ่ที่สเปกตายตัว เน้นเอกสาร และต้องคุมต้นทุนชัด ถ้าตอบว่าเหมาะกับงานที่ requirement เปลี่ยนบ่อยจะถูกนับผิด',
        'lim': 'ข้อจำกัดหลักคือมันรับการเปลี่ยน requirement ได้ยาก เพราะต้องทำให้เสร็จทีละขั้นก่อนไปขั้นถัดไป ลูกค้าต้องบอก requirement ให้ครบตั้งแต่แรก ซึ่งทำได้ยากมาก และต้องรอจนเสร็จทั้งระบบถึงได้ใช้งาน ถ้าเจอปัญหาตอนท้ายก็แก้แพงและความเสี่ยงของโปรเจกต์สูง',
    },
    3: {
        'proto': 'จาก Prototyping model Spiral เอาลักษณะการวนซ้ำ (iterative) มาใช้ แต่ละรอบได้เวอร์ชันที่สมบูรณ์ขึ้น และใช้ prototype เป็นตัวลดความเสี่ยง',
        'water': 'จาก Waterfall model Spiral เอาการทำงานอย่างเป็นระบบ เป็นขั้นตอน และควบคุมได้มาใช้ ทุกรอบของวงก้นหอยยังมี Risk Analysis ความเสี่ยงจึงลดลงเรื่อยๆ',
    },
    4: {
        'm': 'Agile Manifesto มีสี่ข้อ ให้คุณค่ากับบุคคลและการสื่อสารมากกว่า process และ tools ให้คุณค่ากับซอฟต์แวร์ที่ทำงานได้จริงมากกว่าเอกสารที่ครบถ้วน ให้คุณค่ากับการร่วมมือกับลูกค้ามากกว่าการต่อรองตามสัญญา และให้คุณค่ากับการตอบสนองต่อการเปลี่ยนแปลงมากกว่าการทำตามแผน ระวังเขียนสลับฝั่ง เพราะฝั่งขวาไม่ได้ผิด แค่สำคัญน้อยกว่า',
    },
    5: {
        'key': 'requirement เป็นฐานของการออกแบบและการสร้าง ถ้าเข้าใจผิดตั้งแต่ต้น ระบบที่ได้ก็ไม่ตรงความต้องการลูกค้า การนิยาม requirement ที่แย่เป็นสาเหตุหลักที่โปรเจกต์ล้มเหลว และยิ่งแก้ช้าก็ยิ่งแพง ช่วง definition คิดเป็น 1x ช่วงพัฒนา 1.5 ถึง 6x และหลัง release สูงถึง 60 ถึง 100x',
        'pro': 'ที่ท้าทายเพราะ stakeholder มักไม่รู้ว่าตัวเองต้องการอะไรจริง ใช้ภาษาของตัวเอง ความต้องการของแต่ละกลุ่มขัดกัน และเปลี่ยนระหว่างทาง ปัญหาแบ่งได้เป็น Scope, Understanding และ Volatility วิศวกรต้องใช้ทั้งทักษะเทคนิคและทักษะคน ทำ RE ให้ครบตั้งแต่ Inception, Elicitation, Elaboration, Negotiation, Specification, Validation จนถึง Requirements Management',
    },
    6: {
        'ver': 'Verification ถามว่า "Are we building the product right?" คือตรวจว่าเราสร้างได้ถูกต้องตาม specification และหน้าที่ที่กำหนดไว้ ทำระหว่างพัฒนาในแต่ละขั้น เช่น review, inspection และ unit test',
        'val': 'Validation ถามว่า "Are we building the right product?" คือตรวจว่าสิ่งที่สร้างตรงกับความต้องการจริงของลูกค้า ทำช่วงท้าย เช่น validation test, alpha และ beta test และ acceptance test จำง่ายๆ ว่า Verification เทียบกับสเปก Validation เทียบกับลูกค้า ถ้าสลับกันจะถูกนับผิด',
    },
    7: {
        'unit': 'Unit testing ทดสอบหน่วยที่เล็กที่สุด เช่น module หรือ component แยกทีละตัว ดู interface, data structure, boundary, path และการจัดการ error',
        'int': 'Integration testing เอา module มารวมกันแล้วทดสอบว่าเชื่อมต่อกันได้ถูกต้อง ทำได้ทั้งแบบ top-down, bottom-up และ big-bang',
        'perf': 'Performance testing วัดประสิทธิภาพขณะระบบทำงาน เช่น response time การใช้หน่วยความจำ และความเร็วในการประมวลผล',
        'sys': 'System testing ทดสอบทั้งระบบหลังรวมเสร็จแล้ว ว่าทำงานครบตาม requirement ในสภาพแวดล้อมจริง',
        'rec': 'Recovery testing บังคับให้ระบบล้มหรือเกิดข้อผิดพลาด แล้วดูว่ากู้ข้อมูลคืนและกลับมาทำงานต่อได้หรือไม่',
        'sec': 'Security testing ตรวจว่ากลไกป้องกันของระบบกันการเข้าถึงหรือการโจมตีที่ไม่ได้รับอนุญาตได้ เช่น ทำ penetration test',
        'str': 'Stress testing ใส่ภาระเกินปกติ เช่น ข้อมูลจำนวนมาก ไฟล์ใหญ่มาก หรือใช้หน่วยความจำมาก เพื่อดูว่าระบบทนได้แค่ไหนก่อนล้ม ต่างจาก performance test ตรงที่ตั้งใจดันระบบให้เกินขีดปกติ',
    },
    8: {
        'done': 'คำตอบตามสไลด์คือการทดสอบไม่มีวันเสร็จสมบูรณ์ หน้าที่ทดสอบถูกส่งต่อให้ลูกค้า ทุกครั้งที่ลูกค้าใช้งานก็คือการทดสอบไปด้วย การทำ MA จึงจำเป็น',
        'enough': 'ในทางปฏิบัติทีมจะหยุดทดสอบเมื่อหมดเวลาตามสัญญาหรือหมดงบประมาณ ส่วนการรู้ว่าทดสอบพอแล้วดูจากเกณฑ์ที่วางไว้ เช่น test case ครอบคลุม requirement ผ่าน acceptance criteria ของผู้ใช้ และมี SQA หรือ ITG ตรวจซ้ำ',
    },
    9: {
        'wb': 'White-box testing ทดสอบโครงสร้างและตรรกะภายในโปรแกรม ผู้ทดสอบต้องรู้โค้ด สร้าง test case ให้ทุก path ถูกรันอย่างน้อยหนึ่งครั้ง ทุกเงื่อนไขถูกทดสอบทั้ง true และ false และทุก loop ถูกทดสอบที่ขอบ',
        'bb': 'Black-box testing ทดสอบฟังก์ชันการทำงานตาม requirement ผ่าน input และ output โดยไม่สนโครงสร้างภายใน หาข้อผิดพลาดอย่างฟังก์ชันผิดหรือขาด และ interface error เทคนิคที่ใช้คือ Equivalence Class Partitioning และ Boundary Value Analysis',
        'when': 'White-box ใช้ช่วงแรกของการทดสอบ (ระดับ unit) ส่วน Black-box ใช้ช่วงหลัง (system และ acceptance) สองวิธีนี้ใช้แทนกันไม่ได้ เพราะจับข้อผิดพลาดคนละชนิด',
    },
    10: {
        'diff': 'ทั้งสองแบบผู้ใช้เป็นคนทดสอบ ต่างกันสองเรื่อง Alpha ใช้ข้อมูลสมมติในสถานการณ์ที่จำลองว่าอาจเกิดขึ้น ซึ่งมักทำในสภาพแวดล้อมที่ผู้พัฒนาควบคุม Beta ใช้ข้อมูลจริงในสถานการณ์จริงที่ไซต์ของผู้ใช้',
    },
    11: {
        'why': 'เวลาแก้บั๊กหนึ่งตัว มักเกิดบั๊กใหม่ขึ้นที่อื่นอีกหลายตัว Regression testing คือการทดสอบซ้ำหลังเพิ่มหรือแก้โค้ด เพื่อยืนยันว่าการแก้ไขได้ผลจริง และส่วนที่เคยทำงานได้ยังทำงานได้เหมือนเดิม ใน DevOps จะรันอัตโนมัติทุกครั้งที่ integrate โค้ด',
    },
    12: {
        'crit': 'เกณฑ์ที่ผู้ใช้ใช้ตัดสินมีหกข้อ Time to Learn คือใช้เวลาเรียนรู้นานแค่ไหน Task Performance คือทำงานได้เร็วแค่ไหน Error Rate คือผิดพลาดบ่อยแค่ไหน User Satisfaction คือพอใจแค่ไหน User Retention คือจำวิธีใช้ได้แค่ไหน และ User Friendly คือใช้ง่ายแค่ไหน',
    },
    13: {
        'steps': 'SCRUM เริ่มจาก Product Owner รวบรวม requirement เป็น user story ลง Product Backlog แล้วจัดลำดับ จากนั้นทีมทำ Sprint Planning เลือกงานลง Sprint Backlog และเข้า Sprint ยาว 2 ถึง 4 สัปดาห์ ระหว่างนั้นมี Daily Scrum วันละ 15 นาที จบ sprint ได้ Product Increment ที่ส่งมอบได้ แล้วทำ Sprint Review ตรวจงานกับ PO และ Sprint Retrospective ทบทวนวิธีทำงาน ก่อนวนเข้า sprint ถัดไป',
        'role': 'Scrum มีสามบทบาท Product Owner เป็นตัวแทนลูกค้าและจัดลำดับ backlog Scrum Master ช่วยให้ทีมทำงานได้ราบรื่น และ Development Team เป็นทีม cross-functional ที่จัดการตัวเอง',
    },
    14: {
        'people': 'เรื่องคน CMMI กำหนดบทบาทชัดและฝึกคนให้ทำตาม process มาตรฐานขององค์กร เพื่อให้ความสำเร็จไม่ขึ้นกับตัวบุคคล ส่วน Agile ให้ความสำคัญกับคนและการสื่อสารมากกว่า process ทีมเล็ก จัดการตัวเอง และลูกค้ามีส่วนร่วมตลอด',
        'work': 'เรื่องงาน CMMI ทำงานตาม process ที่เป็นมาตรฐาน มีเอกสาร วัดผลเชิงปริมาณ และไต่ระดับ Maturity Level จาก 1 ถึง 5 ส่วน Agile แบ่งงานเป็น sprint สั้นๆ ส่งมอบซอฟต์แวร์ที่ใช้งานได้บ่อย รับการเปลี่ยนแปลงได้ และทำเอกสารเท่าที่จำเป็น',
        'bp': 'เรื่อง best practice CMMI รวบรวมไว้เป็น Process Areas เช่น Requirements Management, Project Planning และ Risk Management แล้วปรับปรุงด้วยข้อมูลเชิงปริมาณ ส่วน Agile ใช้ practice ที่ทีมเลือกเอง เช่น Scrum และ XP (pair programming, continuous integration, test-first) แล้วปรับผ่าน retrospective',
    },
    15: {
        'pri': 'หลักการของ container คือแพ็กแอปพร้อม dependencies ทั้งหมด (library, runtime, config) ไว้ใน image เดียวที่ย้ายไปรันที่ไหนก็ได้ แต่ละ container แยกกันแต่ใช้ kernel ของ host ร่วมกัน จึงเบากว่า VM และใช้ Kubernetes จัดการเมื่อมีจำนวนมาก',
        'ben': 'ประโยชน์ข้อแรกคือรันเหมือนกันทุก environment ตั้งแต่เครื่อง dev ถึง production ปัญหา "works on my machine" จึงหายไป นอกจากนั้นมันเริ่มเร็ว ใช้ทรัพยากรน้อย เข้ากับ CI/CD และ microservices ที่ deploy แยกกันได้ scale ง่าย และ rollback กลับ image เวอร์ชันเก่าได้ ตัวอย่างเครื่องมือคือ Docker และ Kubernetes',
    },
    16: {
        'cd1': 'Continuous Delivery ทำอัตโนมัติจนโค้ดพร้อม deploy เสมอ (build, test, package) แต่การขึ้น production ยังต้องมีการตัดสินใจหรืออนุมัติ release ก่อน ถ้าเขียนว่าขึ้น production เองทันทีจะถูกนับผิด',
        'cd2': 'Continuous Deployment ทำอัตโนมัติทั้งรอบ ทุกการเปลี่ยนแปลงที่ผ่าน test ขึ้น production ถึงผู้ใช้เองโดยไม่มีคนกด deploy ได้หลายครั้งต่อวัน แต่บั๊กที่ test จับไม่ได้ก็หลุดขึ้นไปได้ จึงเหมาะกับ update เล็กๆ ที่ rollback ได้',
    },
    17: {
        'imp': 'DevSecOps pipeline เป็นสายพานอัตโนมัติที่พาโค้ดตั้งแต่เริ่มเขียนจนถึง production และฝังการตรวจความปลอดภัยไว้ทุกขั้น ผลคือส่งมอบเร็วขึ้น คุณภาพดีขึ้น error น้อยลง และทีม Dev, Sec, Ops ทำงานร่วมกัน',
        'tools': 'จำเป็นคู่ขั้นกับ tool ได้แบบนี้ Plan ใช้ Jira หรือ Confluence, Code ใช้ Git หรือ GitHub, Build ใช้ Maven กับ SonarQube ทำ SAST, Test ใช้ Selenium หรือ JUnit, CI/CD ใช้ Jenkins, Deploy ใช้ Terraform, Ansible, Docker และ Kubernetes ส่วน Monitor ใช้ Prometheus กับ Grafana',
    },
    18: {
        'cost': 'การประมาณงบดูจากขนาดและความซับซ้อนของ requirement จำนวนคน ทักษะ และระยะเวลา Process Model ที่เลือกใช้ ค่าโครงสร้างพื้นฐานและเครื่องมือ และต้องเผื่อค่า MA ด้วย เพราะ effort 60 ถึง 80% เกิดหลังส่งมอบ รวมถึงต้นทุนเมื่อ requirement เปลี่ยน',
        'apply': 'กระบวนการ SE ใช้ได้กับการบริหารโครงการทั่วไป กับการพัฒนาระบบประเภทอื่น เช่น IoT, AI/ML (MLOps), Web และ Mobile และกับงาน DevOps หรือการดูแล cloud infrastructure ด้วย IaC',
    },
    19: {
        'what': 'Platform Engineering คือการออกแบบและสร้าง toolchain และ workflow ให้ทีม software engineering ใช้งานได้เองแบบ self-service ในยุค cloud-native',
        'role': 'Platform Engineer สร้างและดูแล Internal Developer Platform (IDP) ที่รวม CI/CD, IaC, container, monitoring และ security ไว้ให้ทีม dev เรียกใช้เอง รวม DevOps, DevSecOps, AIOps, DevFinOps, DesignOps และ DevSusOps ไว้บนแพลตฟอร์มเดียว',
        'rel': 'มันเอา Process และ Tools ของ SE มาทำให้เป็นอัตโนมัติและเป็นมาตรฐานเดียวทั้งองค์กร รองรับ SDLC ตั้งแต่ Plan จนถึง Monitor ทีมจึงส่งมอบได้เร็ว คุณภาพสูง และปลอดภัย',
    },
    20: {
        'web': 'ฝั่ง Web ที่อาจารย์แนะนำคือ Selenium กับ Katalon Studio นอกจากนี้ยังมี Cypress และ Playwright สำหรับ E2E, JMeter สำหรับ load test และ Pa11y สำหรับ accessibility โจทย์ขออย่างน้อย 2 tools',
        'mobile': 'ฝั่ง Mobile ตอบ Appium กับ Katalon Studio ได้เลย หรือ framework ของแต่ละแพลตฟอร์ม คือ Espresso สำหรับ Android และ XCUITest สำหรับ iOS',
    },
    21: {
        'single': 'Single Agent System มี AI agent ตัวเดียวทำทุกอย่าง ทั้งวิเคราะห์ เขียนโค้ด และทดสอบ ออกแบบง่าย debug ง่าย ต้นทุนต่ำ แต่ context จำกัด ไม่มีใครตรวจทาน และถ้าตัวนั้นพลาดก็พลาดทั้งระบบ',
        'multi': 'Multi-Agent System มีหลาย agent แบ่งบทบาทเฉพาะทาง เช่น Requirement, Architect, Coder, Tester และ Security โดยมี Orchestrator คอยประสาน ทำงานขนานกันได้และตรวจทานกันเองได้ แลกกับความซับซ้อน ต้นทุน token ที่สูงกว่า และ error ที่สะสมจากการส่งต่อ',
        'fit': 'Single agent เหมาะกับงานเล็กที่ชัดเจน เช่น เขียน script หรือแก้บั๊กเดียว Multi-agent เหมาะกับระบบใหญ่ที่ครอบคลุมทั้ง SDLC และต้องการคุณภาพหรือ compliance สูง',
    },
    22: {
        'role': 'Security & Compliance Agent ตรวจช่องโหว่ในโค้ดและสถาปัตยกรรม (SAST, DAST, SCA, secrets) ทำ threat modeling และเป็นด่านตรวจทุก PR ตรวจว่าระบบทำตามกฎหมายและมาตรฐาน เช่น PDPA, HIPAA และ HL7/FHIR และบังคับใช้นโยบายข้อมูล เช่น การเข้ารหัส การจำกัดสิทธิ์ และ audit log',
        'why': 'ข้อมูลสุขภาพเป็นข้อมูลส่วนบุคคลที่อ่อนไหว รั่วแล้วมีโทษตามกฎหมายและกระทบผู้ป่วยโดยตรง ตัว AI agent เองก็อาจทำข้อมูลรั่วได้ เช่น ส่งไปให้ LLM ภายนอก เก็บไว้ใน log หรือ prompt หรือโดน prompt injection',
    },
    23: {
        'agents': 'วาง agent ให้ครอบคลุม SDLC เช่น Orchestrator คอยแตกงานและประสาน, Requirement Agent เก็บ requirement และกฎธุรกิจการเงิน, Architect Agent ออกแบบ microservices และ API, Developer Agent เขียนโค้ดคู่กับ Reviewer Agent, QA Agent ทดสอบ, Security & Compliance Agent ตรวจ PCI-DSS และ PDPA, Risk & Fraud Agent ตรวจความเสี่ยงและการทุจริต และ DevOps กับ Monitoring Agent ดูแลการ deploy และระบบหลังขึ้นจริง',
        'human': 'ต้องมีมนุษย์ (Human-in-the-Loop) อนุมัติจุดสำคัญ คือ requirement, architecture, การ release และ logic ของธุรกรรม',
    },
    24: {
        'std': 'สิ่งที่ต้องบังคับใช้มีหลายชั้น ชั้นมาตรฐานมี PCI-DSS, ISO/IEC 27001, PDPA และเกณฑ์ของ ธปท. ชั้นธุรกรรมใช้ ACID และ idempotency กันการตัดเงินซ้ำ ชั้นสิทธิ์ใช้ Zero Trust กับ Least Privilege และแยกหน้าที่ให้ agent ที่เขียนโค้ดอนุมัติหรือ deploy เองไม่ได้ มีมนุษย์อนุมัติ ทุก action ต้องมี audit trail ที่แก้ไม่ได้ และ CI/CD ต้องมี quality gate กับ guardrail ที่จำกัดสิ่งที่ AI ทำได้',
    },
    25: {
        'group': 'ควรเลือกกลุ่ม self-hosted หรือ on-premise คือรัน LLM และ agent framework ในโครงสร้างพื้นฐานขององค์กรเอง หรือใน private cloud ข้อมูลจึงไม่ออกนอกองค์กร ถ้าแนะนำให้ใช้ public API ทั่วไปจะถูกนับผิด',
        'ex': 'ตัวรัน LLM ในเครื่อง เช่น Ollama, vLLM และ llama.cpp คู่กับโมเดล open-weight อย่าง Llama, Mistral หรือ Qwen ส่วน agent framework ที่ self-host ได้ เช่น LangGraph, CrewAI, AutoGen และ OpenHands',
    },
    26: {
        'what': 'HITL คือการให้มนุษย์อยู่ในวงจรการตัดสินใจของ AI มนุษย์ตรวจ อนุมัติ แก้ไข หรือปฏิเสธผลของ AI ก่อนนำไปใช้จริง แล้วส่ง feedback กลับไปปรับปรุง',
        'hc': 'ใน Healthcare ระบบเป็นแบบ safety-critical การวินิจฉัยหรือให้ยาผิดอาจถึงชีวิต AI ก็ hallucinate หรือมี bias ได้ แพทย์จึงต้องเป็นผู้ตัดสินสุดท้ายและเป็นผู้รับผิดชอบ',
        'fin': 'ใน FinTech ธุรกรรมมักย้อนกลับไม่ได้ ความผิดพลาดเสียหายเป็นเงินจริง และ regulator กำหนดให้มี explainability, audit trail และคนรับผิดชอบ เช่น ในการอนุมัติสินเชื่อหรือการตรวจ fraud',
    },
    27: {
        'role': 'บทบาทเปลี่ยนจากคนเขียนโค้ดทุกบรรทัดไปเป็นคนสั่งงาน ตรวจ และรวมโค้ดจาก AI วิศวกรกลายเป็น architect ที่วางโครงและ guardrail ให้ AI ทำตาม เป็นคนตั้งโจทย์ validate requirement กำหนด acceptance criteria และอนุมัติ release',
        'skill': 'ทักษะที่สำคัญขึ้นคือ systems thinking กับ architecture, requirements engineering และความเข้าใจโดเมน, prompt หรือ context engineering สำหรับออกแบบงานของ agent, การ review และทดสอบเพื่อจับผิด AI, ความรู้ security กับ compliance และ cloud-native หรือ platform engineering',
    },
    28: {
        'why': 'AI สร้างโค้ดได้เร็วและเยอะ ช่องโหว่จึงเพิ่มตาม ถ้ารอตรวจตอนท้ายจะตามไม่ทัน โค้ดจาก AI ยังอาจมี pattern ที่ไม่ปลอดภัย เช่น SQL injection หรือ secret ที่ฝังในโค้ด หรือเรียก library ที่มีช่องโหว่หรือไม่มีอยู่จริง และยิ่งเจอช้าก็ยิ่งแก้แพง',
        'prac': 'ใส่การตรวจไว้ทุกขั้นของ pipeline ขั้น Plan ทำ threat modeling ขั้น Code ใช้ IDE security plugin, pre-commit hook ที่สแกน secret และให้คนรีวิวโค้ดจาก AI ขั้น Build ใช้ SAST กับ SCA ขั้น Test ใช้ DAST และ penetration test ขั้น Release ทำ software signing และ quality gate ส่วนขั้น Operate กับ Monitor ใช้ RASP, WAF และ SIEM',
    },
    29: {
        'diff': 'Monitoring แบบเดิมตอบได้แค่ว่าระบบพังหรือไม่ จาก metric และ threshold ที่ตั้งไว้ Observability ตอบได้ว่าพังเพราะอะไรและพังตรงไหน โดยใช้ metrics, logs และ traces ที่เชื่อมกันข้าม microservices AIOps เอา Big Data กับ Machine Learning มาตรวจความผิดปกติ หา root cause และทำนายปัญหาล่วงหน้า ระบบจึงเปลี่ยนจากรอแจ้งเตือนหลังพังมาเป็นป้องกันก่อน',
        'ben': 'ผลคือหาเจอและแก้ได้เร็วขึ้น (MTTD และ MTTR ลดลง) downtime น้อยลง และหา root cause ได้แม้ระบบมี service หลายร้อยตัวที่เปลี่ยนตลอด',
    },
    30: {
        'design': 'ขั้นออกแบบให้เลือก architecture ที่พอดีกับงานและไม่เปิดเครื่องทิ้งไว้ เช่น serverless หรือ event-driven ให้งานไปรันในเวลาหรือ region ที่ใช้พลังงานสะอาด ลดการรับส่งและเก็บข้อมูลด้วย cache, CDN, compression และเก็บเท่าที่จำเป็น และออกแบบให้เรียบง่ายและ reuse ได้',
        'dev': 'ขั้นพัฒนาและดำเนินงานให้เขียนโค้ดที่มีประสิทธิภาพ เลี่ยง polling และ loop ที่ไม่จำเป็น ใช้ right-sizing กับ autoscaling และปิด environment ที่ไม่ใช้ แล้ววัดผลจริงด้วยเครื่องมืออย่าง SCI หรือ Cloud Carbon Footprint',
    },
}
