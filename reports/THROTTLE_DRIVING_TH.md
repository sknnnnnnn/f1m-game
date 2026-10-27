# F1M — คันเร่งต่อเนื่อง / ลดอาการเหยียบ–ปล่อย

รุ่น 9b30b0f24b96515d — 27 ตุลาคม 2026
ฐาน: รุ่น 2f0da8eb579c21dd ของเกมเดิม สำรองฐานก่อนแก้ด้วย Git worktree/commit 7aef65c และยังเก็บต้นฉบับ R33 ไว้ครบ

## สิ่งที่แก้

- `speed-envelope.js`: แทนจุดสลับเร่ง/ชะลอแบบทันทีด้วย smoothstep ช่วงความเร็ว 0.3 m/s ก่อนถึงขอบเดิม ลดการสลับคำสั่งเมื่อความเร็วแกว่งใกล้เพดานโค้ง โดยไม่เพิ่มเพดานแรงเกาะ/ย้ายจุดบังคับเบรกให้ช้าลง
- `driver-pedal.js`: เพิ่มตัวจัดจังหวะคันเร่งจริงก่อนเข้า actuator เดิม เพิ่มคันเร่งไม่เกิน 4 ต่อวินาที (8 ช่วง 4 วินาทีแรก) และถอนปกติไม่เกิน 5 ต่อวินาที เฉพาะสถานการณ์ที่เหมาะสม
- คำสั่งเบรก, overspeed, รถข้างหน้าใกล้, แผนถูกปฏิเสธ, เสียการทรงตัว, อุบัติเหตุ, พิต และธงควบคุม จะข้ามการเกลี่ยคันเร่ง ห้ามใช้การเกลี่ยเพื่อหน่วงเบรกฉุกเฉิน
- `vehicle-preset.js`: หลัง traction assist ตัดกำลัง ให้คืนคันเร่งไม่เกิน 2.5 ต่อวินาที แทนกระโดดกลับเต็มทุกครั้งที่ wheel slip ข้ามเส้นแบ่ง ยังคงตัดกำลังทันทีเมื่อมี slip
- เปลี่ยนคำสั่งขับจริง ไม่ได้ปิด/ลดการโยกตัวถังใน renderer ไม่มีการเขียนความเร็ว/ตำแหน่งโดยตรง
- DRS 5 วินาทีและพิตเลน 80 กม./ชม. จากรุ่นก่อนยังอยู่ ไม่แก้ main และไม่ลดกราฟิก ระยะมอง หรือฟิสิกส์ frozen

## เทียบก่อน–หลัง

ใช้ LivingSession26 ค่าเริ่มต้นเหมือนกัน รถ 6 คัน สนามจีน 1 รอบ จนทุกคันจบ ตัดรถที่เข้าเส้นชัยแล้วออกจากตัวชี้วัด

| ตัวชี้วัด | ก่อน | หลัง |
|---|---:|---:|
| คันเร่งเปลี่ยนมากกว่า 50 จุดเปอร์เซ็นต์ใน 0.1 วินาที โดยทั้งสองจุดไม่เบรก | 213 | 41 |
| ผลรวมการเปลี่ยนคันเร่งทุก tick | 1,051.63 | 625.76 |
| สลับทิศทางคันเร่งช่วงสั้นตามเกณฑ์ audit | 1,765 | 1,069 |
| ค่าเฉลี่ย absolute acceleration jerk ของรถที่ยังแข่ง (m/s³) | 34.85 | 30.41 |
| tick ที่สั่งเบรก >1% | 20,367 | 19,308 |
| เวลาทุกคันจบเรซ (วินาที) | 150.60 | 151.68 |
| Controller rejection / guard stop | 0 / 0 | 0 / 0 |

จังหวะเปลี่ยนคันเร่งแรงลดลง 80.8% และ variation ลดลง 40.5% ใน fixture นี้ แต่เรซจบช้าลง 1.08 วินาที (0.72%) และคันเร่งเฉลี่ยลดจาก 50.41% เป็น 48.15% จึงไม่อ้างว่าเร็วขึ้นหรือกดเต็มตลอดทุกโค้ง ตัวชี้วัดความเรียบและความเร็วต้องอ่านร่วมกัน

หลักฐาน: THROTTLE_BEFORE.json, THROTTLE_AFTER.json, THROTTLE_COMPARISON.json เก็บ samples 0.1 วินาทีและ metrics 60 Hz; THROTTLE_TUNING.json บันทึกการจูนชุดแรกที่นุ่มขึ้นแต่ช้าลงมากกว่า ก่อนลดช่วง blend และเพิ่มอัตราเติมคันเร่ง

## วิธีทดสอบซ้ำ

```sh
npm test
npm run build
npm run test:pwa
node tests/throttle-audit.mjs
AUDIT_LAPS=2 AUDIT_OUT=reports/THROTTLE_GRID_FINAL.json node tests/path-grid-drive.mjs
F1M_TRACK23=suzuka AUDIT_OUT=reports/THROTTLE_SUZUKA.json node tests/path-grid-drive.mjs
F1M_TRACK23=bahrain AUDIT_OUT=reports/THROTTLE_BAHRAIN.json node tests/path-grid-drive.mjs
node tests/attack2-launch-guard.mjs
node tests/pit-limit-cycle.mjs
```

การเทียบฐานให้ใช้ checkout ของ release ก่อนหน้า แล้วส่ง AUDIT_ROOT ให้ throttle-audit.mjs ใน checkout ใหม่นี้ ชุด pit cycle จำลอง crew-ready proof เพื่อทดสอบเส้นทาง/ความเร็ว/merge ไม่ใช่การทดสอบแอนิเมชันช่าง

## ผลตรวจรุ่นสุดท้าย

- npm test (รวม driver-pedal guards), build, PWA tests และ git diff --check ผ่าน
- Shanghai รถ 6 คัน 2 รอบ seed 19: จบทุกคัน 290.733 วินาที, แซง 13 ครั้ง, controller rejection 0, guard stop 0, retirement 0; ตรวจมุมตัวรถทุก 0.1 วินาที max offset 6.940 m ภายในครึ่งความกว้างถนน 7.7 m (เป็น sampled check ไม่ใช่ continuous proof)
- Suzuka 6 คัน 1 รอบ seed 19: จบทุกคัน 177.867 วินาที, rejection/stop/retirement 0
- Bahrain 6 คัน 1 รอบ seed 19: จบทุกคัน 137.133 วินาที, rejection/stop/retirement 0
- สั่งคันหน้าเบรกเต็มระหว่างออกตัว: คันหลังเบรกตอบสนอง ไม่มี guard stop/rejection, ระยะตัวรถต่ำสุด 1.584 m
- Shanghai pit cycle: SERVICE → RELEASE → PIT_OUT → MERGE → RACING สำเร็จ, จำกัดความเร็วสูงสุดในช่วง limiter 78.379 กม./ชม., ไม่มี stop/rejection
- ทดสอบทางตรงเดิม: 0–300 = 8.567 วินาที, 300–0 = 2.883 วินาที (fixture ทางตรง ไม่ใช่ lap time)
- main ยังเป็น afabdb56cd47ac8137a8c16da481b4415fea0ef3

## ข้อจำกัด

ผลนี้เป็นการจำลอง Node ของระบบจริง ไม่ใช่ FPS Android หรือการยืนยันด้วยวิดีโอบนเครื่องผู้ใช้ การโยกจากการเปลี่ยนเกียร์ เบรกจริง และน้ำหนักถ่ายยังคงอยู่ โค้งที่ติดแรงเกาะ/ความเร็ว/รถขวางยังต้องผ่อนหรือเบรก ไม่มีการรับรอง 100% throttle ทุกโค้ง
