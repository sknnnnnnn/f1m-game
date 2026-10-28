# F1M RACECRAFT 48 — Suzuka wake and finite ERS

Build `cb33e4d091da5ea9` · 29 ตุลาคม 2026 · source `work/draft48` · ไม่แก้ main

## สิ่งที่แก้

Suzuka: คำสั่ง DRAFT บนทางตรงยาวส่งไปถึง reference path ที่รถขับจริง แทนการย้อนกลับไลน์ปกติ และ AUTO ใช้พลังงาน ERS ที่มีอยู่เมื่อมีลมดูด ระยะปิดและทางตรงเพียงพอ แม้อยู่นอก DRS เพื่อสะสมความเร็วก่อนเบี่ยงแซง

ยังให้คำสั่ง SAVE / CONSERVE / ABORT มาก่อน งดใน caution, pit, recovery, ช่วงออกตัว และจังหวะถอนแผน เก็บ reserve และขีดจำกัดแบตเตอรี่เดิม ไม่เติมพลังงาน ไม่ย้ายตำแหน่ง ไม่เพิ่มแรงตามอันดับ ไม่สั่งคันนำรอ ไม่ลด CONTACT_GUARD และไม่เปลี่ยน frozen physics, รถ, กราฟิก หรือการจูนฟีลขับ

แพตช์ไลน์ลมดูดรุ่นกว้างทำให้ Shanghai/Bahrain seed7 แซงหลังรอบแรกลดลง จึงจำกัดทั้งไลน์และการใช้ ERS ใหม่นี้เฉพาะ Suzuka ผลทดลองเดิมเก็บไว้ที่ `draft48/broad-candidate` ไม่ใช่ผลรุ่นเผยแพร่

## ผลตรวจจริง

หกรถ ใช้ grid / ยาง / seed / จำนวนรอบเดียวกับฐาน R47 นับหลังรถคันแรกจบรอบแรก ตัด event ที่ decision เป็น YELLOW/VSC ตามวิธีเทียบ R47

| ชุด | R47 | R48 |
|---|---:|---:|
| Suzuka seed7 · 4 รอบ | 1 | 6 |
| Suzuka seed19 · 4 รอบ | หยุดที่ 321.27 วินาที; 1 ครั้งก่อนหยุด | จบครบ; 7 |
| Shanghai seed7 · 3 รอบ | 2 | 2 |
| Bahrain seed7 · 5 รอบ | 11 | 11 |

Suzuka seed19 ในช่วงเวลาเท่ากันถึง 321.27 วินาที: 1 → 6 ครั้ง ไม่ใช้จำนวนบางส่วนของ R47 อ้างเป็นผลเรซเต็ม R47 หยุดด้วย CONTACT_GUARD ระหว่างรถ 1/3 ส่วน R48 จบทั้งสอง seed โดยไม่หยุด แซงกลับคู่เดิมภายใน 150 วินาทีพบ 1 ครั้งในแต่ละ seed ของ R48

R48 สี่เรซแห้งและ Bahrain ฝนเริ่มตกอีกหนึ่งเรซจบครบ ไม่มี guard stop, controller rejection, retirement หรือ off-track ในจุดที่สุ่มตรวจ Shanghai/Bahrain final finish time, pass history และ lap timings ตรง R47 ทุกค่า

67 engine jobs, build, PWA/service-worker และชุดออกตัว 22 กรณี 35 วินาที ผ่าน รวม seed7/19, grid ปกติ/กลับลำดับ, ยางผสม/medium และคำสั่ง ATTACK/DEPLOY ทั้งสามทีม

## ขอบเขตและหลักฐาน

- `draft48/RELEASE_SUMMARY.json`, `LAUNCH_MATRIX.json`, `UNIT.json` และ `ENGINE_TESTS.txt`
- `draft48/NOOP_COVERAGE.json`: Suzuka สองเรซเก็บจาก build4867e98b852f2b02 ก่อนเพิ่มเงื่อนไขเฉพาะสนาม เงื่อนไขที่เพิ่มเป็น true เสมอใน Suzuka และไม่เปลี่ยนการคำนวณ จึงเก็บผลนั้นไว้ ส่วน Shanghai/Bahrain/ฝน/launch ทดสอบใหม่ด้วย source สุดท้าย
- Baseline R47 Suzuka7/Shanghai7 ใช้ checkpoint300s เดิมที่เก็บ event history ทั้งเรซ การสุ่ม off-track ของ baseline สองชุดนี้ครอบคลุมหลัง checkpoint; R48 เก็บตั้งแต่กริด
- Off-track ตรวจ centre + ครึ่งความกว้างรถทุก0.5s ไม่ใช่ swept body-corner audit ทั้งเรซ Event ไม่มี flag แยกอิสระ จึงระบุวิธีกรองจาก decision โดยตรง
- ไม่รับประกันจำนวนแซงทุก seed หรือว่า CONTACT_GUARD ไม่มีทางเกิดอีก ยังไม่ได้ยืนยัน Android FPS / เสียง / สัมผัสจริง

สร้างสรุปซ้ำ: `node tools/report-draft48.mjs`
