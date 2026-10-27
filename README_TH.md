Current: Pit continuity, build `b1da04136309c013`. [Changes and verification](reports/PIT_CONTINUITY_TH.md). Rolling pit exit at approximately 80 km/h, smooth pit-exit curve and service model handoff. Android visual/FPS verification pending.

Current: Race story, build `4e4419b64bc34852`. [Usage, verified behaviour and limits](reports/RACE_STORY_TH.md). Focused team radio, responsive selected-car Cinema and per-driver race digest. Driving, AI, six-car grid, track geometry and graphics unchanged. Android UI/listening/FPS verification pending.

Historical milestone notes follow.

Current: Race package, build `932ad21a4fbc03fd`. See [changes, measured racing/pit results and limits](reports/RACE_PACKAGE_TH.md). F125 driving base, crew/terrain fix, frozen physics and models retained. Main unchanged; Android listening/visual/FPS validation remains pending.

Historical milestone notes follow.

# F1M Attack 1.1

เวอร์ชันล่าสุด `ba525293537c4435`: ปรับการขับตามฐาน F1 25 ทั้ง 49 โค้ง ถนนและไลน์ขับใหม่ การคุมแรงเกาะพวงมาลัย แผนเบรกที่คำนวณตามความเร็วจริง และยางที่คงสมรรถนะได้นานขึ้น ดู [ผลเทียบครบ 49 โค้งและผลทดสอบ](reports/F125_DRIVING_TH.md) คง DRS 5 วินาที และยังรอยืนยันสัมผัสการขับ/FPS บน Android

# F1M Engine 1.0 — Mobile Development

เกมฐาน: **F1M_China_Suzuka_33.html** เก็บต้นฉบับพร้อมซอร์สและ SHA-256 ใน `backups/r33/` ก่อนปรับโครงสร้าง

## เล่นและทดสอบบน Android

เปิดลิงก์ Preview ที่ส่งให้ใน **Chrome** ไม่ต้องติดตั้ง Node.js, Git หรือเครื่องมือวาดภาพบนมือถือ

- เริ่มที่ China / Shanghai เปลี่ยนสนามที่ **ตั้งค่า → สนาม / Championship**
- คง Bahrain, Canal Park, Ridge, Shanghai, Suzuka และรถแข่งหกคัน
- เลือกรถ กล้อง เรียกพิต คุมทีม และตั้งค่าจากปุ่มเดิม
- ลากภาพเพื่อหมุนกล้อง ใช้สองนิ้วเพื่อซูม รองรับแนวตั้งและแนวนอน
- **ตั้งค่า → วัดประสิทธิภาพ 5 วินาที** แสดงผลของเครื่องที่เปิดจริง พร้อมชนิด renderer
- **ตั้งค่า → บันทึกผลทดสอบเครื่องนี้** ดาวน์โหลด JSON เพื่อส่งกลับในแชท ไม่มีการส่งข้อมูลอัตโนมัติ
- ถ้า Chrome เสนอปุ่มติดตั้ง กด **ติดตั้ง F1M** หรือใช้เมนู Chrome → เพิ่มลงในหน้าจอหลัก / ติดตั้งแอป
- รอให้หน้าตั้งค่าแสดง **ออฟไลน์พร้อม** ก่อนทดลองปิดอินเทอร์เน็ต
- การอัปเดตจะไม่แทนเกมที่กำลังแข่งอัตโนมัติ ต้องพักเกมก่อนกดอัปเดต ควรเก็บเซฟปัจจุบันก่อนโหลดเวอร์ชันใหม่

PWA ต้องใช้ URL แบบ HTTPS การเปิด `dist/index.html` ด้วย `file://` ไม่ใช่เส้นทางทดสอบของ Engine รุ่นแยก assets นี้ ต้นฉบับ HTML เดี่ยวรุ่น 33 ยังเก็บไว้ครบ

## สิ่งที่ทำใน Milestone นี้

1. ย้ายโมดูลเดิม 127 ไฟล์เข้า `engine/` แบ่งตามระบบ พร้อมตารางเทียบเส้นทางไฟล์เดิม
2. เปิด API `engine/index.js` สำหรับ RaceSession, RaceSimulation, AI, สนาม, พิต และงานฟิสิกส์
3. แยก HTML, script, worker, CSS และ GLB ให้โหลด/เก็บแคชได้เป็นไฟล์ ไม่แปลงโมเดลผ่าน Base64 ทุกครั้ง
4. ใช้ Three.js ชุดเดียวร่วมกับงานแสดงผล ไม่รวม runtime ซ้ำใน app bundle
5. รวมงานฟิสิกส์หลายคันในข้อความเดียวต่อ worker รอทุกคันครบก่อน commit ด้วย solver/timestep เดิม
6. ใช้รูปทรงและ texture atlas ช่างร่วมกัน จำนวนคนและจำนวนจุดโมเดลเท่าเดิม
7. เพิ่มการควบคุมและรายงานทดสอบบนมือถือ พร้อม manifest, icons, service worker และการอัปเดตแบบผู้เล่นเลือก
8. เตรียม GitHub Actions สำหรับทดสอบ ประกอบ และเผยแพร่ Preview จาก branch พัฒนาเท่านั้น

ไม่ได้ลด DPR, รายละเอียดโมเดล, เงา หรือระยะมองเป็นวิธีหลักในการปรับประสิทธิภาพ คง LOW/HIGH/AUTO และ CPU fallback ที่มีในรุ่นเดิมไว้

## โครงสร้าง

ดู [ARCHITECTURE.md](docs/ARCHITECTURE.md) และ [MOBILE_WORKFLOW_TH.md](docs/MOBILE_WORKFLOW_TH.md)

- `engine/` ซอร์สเกมแบ่งระบบ
- `racing/runtime/`, `frozen/` solver/controller/config ต้นฉบับที่ตรึงไว้
- `models/` รถแข่งและ Safety Car เดิม
- `public/` ส่วน PWA และการควบคุมมือถือ
- `tests/`, `reports/`, `evidence/` ชุดทดสอบ ผลที่รันจริง และหลักฐานเดิม
- `backups/r33/` ต้นฉบับก่อนปรับ
- `dist/` ผลประกอบสำหรับ Preview/PWA สร้างใหม่ด้วย `npm run build`

## ประกอบและทดสอบสำหรับผู้พัฒนา

ใช้ Node.js 22 ขึ้นไป

```sh
npm ci
npm test
npm run build
npm run test:pwa
npm run preview
```

ทดสอบขับจริงในระบบจำลอง: `npm run test:race` / ทดสอบเว็บมือถือที่เตรียมไว้: `npx playwright install chromium` แล้ว `npm run test:e2e`

การเพิ่มไฟล์ workflow ไม่ได้แปลว่า GitHub Actions รันแล้ว โปรดดูสถานะจริงใน `PROJECT_STATUS.md` และรายงานผล ข้อจำกัด Android จริง การติดตั้ง PWA และผล FPS แยกจากผลจำลอง/เบราว์เซอร์ระยะไกลเสมอ
