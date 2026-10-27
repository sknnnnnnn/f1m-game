# F1M — ใช้ Speed ref ปรับความเร็วโค้ง

รุ่นส่งมอบ: `7cfce508201fcfd0`

ฐาน: `28bd58c92403e54cbc14821157bd014ba7e9f993` / รุ่นเดิม `d916a138a44e8e76`

ใช้ค่าความเร็วทั้ง 18 โค้งจากไฟล์ที่ผู้ใช้ส่ง โดยเก็บต้นฉบับไว้ที่ `docs/CORNER_SPEED_SOURCE_TH.md` ไม่ยืนยันเพิ่มว่าเป็น telemetry ของ Max หรือเป็น apex speed ที่วัดอย่างสม่ำเสมอ เพราะต้นฉบับไม่ได้มีข้อมูล trace สำหรับตรวจยืนยัน

## สิ่งที่เปลี่ยน

- เชื่อมหมายเลขโค้งเข้ากับ station ของสนามจริงในเกมทั้งสามสนาม
- คำนวณแรงเกาะที่ต้องการสำหรับ Speed ref จากรัศมีของไลน์ขับและ downforce แล้วเพิ่มการใช้แรงเกาะที่ตัววางแผนเดิมเผื่อไว้มากเกินไป เฉพาะโค้งที่มีอ้างอิงและช่วงเชื่อม
- เชื่อม Speed ref ของโค้งต่อเนื่องด้วย quintic easing ไม่มีช่องว่างที่กลับไปใช้ค่าเผื่อมากระหว่าง Esses ส่วนโค้งที่ไม่มีอ้างอิงคงค่าเดิม โดยไม่ยกความเร็วเข้า hairpin ตามโค้งข้างเคียง
- คงงบแรงเกาะต่ำกว่า validator (.78 เทียบ .8 ของ mu) และลดตามยางเย็น/สึก/เสียหาย ใช้ mu/downforce ปัจจุบันของรถ รวมผลสภาพแวดล้อมที่ส่งเข้าสู่ planner
- ไม่ใช้ Speed ref เป็น hard cap: หากไลน์เดิมผ่านได้เร็วกว่า ไม่สั่งเบรกให้ลงมาตรงตัวเลข และไม่เขียนความเร็ว/ตำแหน่งรถข้ามฟิสิกส์
- แผนรถ safety car, yellow/VSC และ recovery ไม่รับการเพิ่มความเร็วนี้; traffic cap, pit-entry cap และ braking envelope เดิมยังทำงาน
- Shanghai เพิ่ม fallback จาก spline แคบกลับไปเส้นทางเดิมเมื่อออกนอก corridor
- ค้นหาช่วงโค้งด้วยตาราง cache และ binary search; ไม่มีการลดกราฟิก ความละเอียด หรือระยะมอง

## รถเดี่ยวก่อน–หลัง

Seed 19, รถหมายเลข 1, ยางเริ่มต้นเดิม, 1 รอบ; brake application คือการเปลี่ยนจาก brake <= .03 เป็น > .03 ในตัวอย่างทุก 0.1 วินาที ไม่ใช่การนับทุกเฟรมและไม่ใช่การยืนยันความรู้สึกบน Android

| สนาม | เวลาเดิม → ใหม่ (วินาที) | จังหวะเริ่มเบรกเดิม → ใหม่ |
|---|---:|---:|
| bahrain | 118.90 → 115.23 | 19 → 19 |
| suzuka | 153.58 → 138.82 | 80 → 62 |
| shanghai | 117.40 → 116.20 | 24 → 22 |

| สนาม / โค้ง | Speed ref | ความเร็วใกล้ marker เดิม → ใหม่ (กม./ชม.) |
|---|---:|---:|
| bahrain T3 | 211 | 180 → 180 |
| bahrain T5 | 243 | 188 → 188 |
| bahrain T6 | 209 | 99 → 137 |
| bahrain T7 | 228 | 113 → 148 |
| bahrain T12 | 264 | 148 → 211 |
| suzuka T1 | 229 | 156 → 173 |
| suzuka T3 | 234 | 122 → 157 |
| suzuka T4 | 217 | 77 → 119 |
| suzuka T5 | 211 | 85 → 130 |
| suzuka T6 | 184 | 77 → 124 |
| suzuka T7 | 244 | 148 → 194 |
| suzuka T8 | 243 | 75 → 95 |
| suzuka T12 | 224 | 162 → 199 |
| suzuka T15 | 295 | 87 → 123 |
| shanghai T4 | 181 | 153 → 153 |
| shanghai T5 | 286 | 257 → 257 |
| shanghai T7 | 258 | 176 → 198 |
| shanghai T8 | 182 | 141 → 162 |

ความเร็วในตารางเป็นตัวอย่างใกล้ station marker ของโมเดล ไม่อ้างว่าเป็น apex เดียวกับข้อมูลนักแข่ง ค่า min/max และสัดส่วนเบรกในช่วง ±35 เมตรอยู่ใน JSON ครบ โดย Shanghai T4/T5 และ Bahrain T3 ยังอยู่ระหว่างเร่งเต็มอยู่แล้ว จึงไม่ได้เพิ่มขึ้นทุกโค้ง

## ข้อจำกัดและตัวทดลองที่ไม่ใช้

บางโค้งของโมเดลสนามแคบกว่าที่ Speed ref ต้องการ โดยเฉพาะ Suzuka T15 มีรัศมี centerline ใกล้ marker ประมาณ 55 เมตร ใน config รถปัจจุบันให้ค่าขีดจำกัด planner ประมาณ 140 กม./ชม. แม้ยางอุ่นเต็ม จึงยังไม่ถึง 295 กม./ชม. การทำให้ใกล้ครบต้องแก้รูปทรงสนาม/ไลน์ขับและตรวจภาพให้สอดคล้องกัน ไม่ใช่ปิดเบรกอย่างเดียว

ลอง spline กับ Suzuka/Bahrain แล้วรถเดี่ยวเบรกน้อยลงมากกว่า แต่ทดสอบหลายคันเกิด INVALID_RECOVERY / UNREACHABLE_LATERAL_ACCELERATION จึงยกเลิกการเปลี่ยนเส้นทางนั้น คืนเส้นทางเดิมของสองสนามนี้ รุ่นส่งมอบใช้ผล Suzuka 62 จังหวะ ไม่ใช้ตัวทดลอง 38 จังหวะ หลักฐานตัวทดลองที่ยกเลิก: `CORNER_TRIAL_SMOOTH_suzuka.json`

ยังไม่ได้ทดสอบ GPU/FPS หรือการเล่นจริงบน Android ของผู้ใช้ การติดตั้ง Chromium สำหรับ Playwright ในสภาพแวดล้อมนี้ไม่สำเร็จ จึงไม่รายงาน browser QA ของรุ่นนี้ว่าผ่าน

## ตรวจซ้ำ

```sh
npm test
npm run build
npm run test:pwa
F1M_TRACK23=suzuka AUDIT_SOLO=1 AUDIT_OUT=reports/CORNER_AFTER_suzuka.json node tests/corner-speed-audit.mjs
F1M_TRACK23=suzuka AUDIT_OUT=reports/CORNER_GRID_suzuka.json node tests/corner-speed-audit.mjs
F1M_TRACK23=bahrain AUDIT_OUT=reports/CORNER_GRID_bahrain.json node tests/corner-speed-audit.mjs
F1M_TRACK23=shanghai AUDIT_LAPS=2 AUDIT_OUT=reports/CORNER_GRID_shanghai.json node tests/corner-speed-audit.mjs
```

## ผลแข่งหลายคันของรุ่นส่งมอบ

Seed 19, รถ 6 คัน: ทุกคันจบ ไม่มี retirement, guard stop หรือ controller rejection ตรวจ footprint รถทุก 0.1 วินาที เป็น sampled check ไม่ใช่ continuous proof

| สนาม | รอบ | ทุกคันจบใน (วินาที) | footprint ห่าง centerline สูงสุด / ครึ่งถนน (เมตร) |
|---|---:|---:|---:|
| bahrain | 1 | 132.42 | 5.330 / 6.0 |
| suzuka | 1 | 159.25 | 5.064 / 7.0 |
| shanghai | 2 | 264.47 | 6.804 / 7.7 |

npm test (25 jobs), build, PWA static/service-worker tests และ git diff --check ผ่าน; path-transition 1,980 แผน, ตอบสนองเบรกคันหน้าขณะออกตัว และ pit cycle ผ่าน ขีดจำกัดพิตสูงสุด 78.38 กม./ชม. ใน fixture ที่ตรวจ ชุดตรวจไม่ได้ยืนยัน animation ช่าง

Warm planning benchmark 1,000 แผน: 0.401 ms/plan ใน Node ของเครื่องทดสอบ ไม่อ้างว่าเป็น Android FPS
