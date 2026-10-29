# F1M R58 — แก้เรซหยุดและแคชการเตรียมพิต

เล่น: https://sknnnnnnn.github.io/f1m-game/preview58/

## สิ่งที่พบจากคลิป R57

- Bahrain หยุดที่เวลาแข่ง 13.650 วินาที: จำลองผ่านเมนู Quick / team 4 / dry / balanced / seed ปกติ 7 ได้ตรงกัน รถ id 3 หมุนจน yaw rate เกิน 2 rad/s ระหว่าง REJOIN_WAIT แล้วเข้า ENVELOPE_STOP
- การตรวจ R57 ใช้ seed 19 จึงไม่ครอบคลุมค่าเริ่มต้นที่ผู้เล่นเจอ
- Shanghai ช่วงคลิป 60–175 วินาที: เวลาแข่งเดินประมาณ 99.5% ของเวลาจริง แต่ภาพยัง 12–30 FPS บนเครื่องผู้เล่น ป้าย GPU หมายถึงใช้ WebGL ไม่ใช่หลักฐานว่า GPU เป็นคอขวด
- การเตรียมพิตคำนวณ choreography และจุดสัมผัสล่วงหน้า การแคช GLB อย่างเดียวไม่ข้ามงานนี้

## แก้ใน R58

1. แรงยางอิ่มตัว: R57 ตรึงเวกเตอร์แรงที่ได้จากรอบแก้สมการก่อนหน้า เมื่อแรงล้ออื่นเปลี่ยน เวกเตอร์นั้นอาจไม่สอดคล้องกับความเร็วล้อที่ยอมรับ ทำให้การสไลด์ไม่เสถียร R58 ลด stiffness แล้วแก้ body ใหม่ โดยปรับทิศแรงตาม slip ในแต่ละรอบ ไม่เพิ่มเพดาน yaw หรือซ่อน ENVELOPE_STOP และจำกัด load transfer ไม่ให้ผลรวมแรงกดเพลาเพิ่มขึ้นเมื่อยกล้อ
2. แคชผลคำนวณท่าช่างใน IndexedDB ตาม revision ของ source พิตและ contact geometry ใช้ร่วมข้าม preview บน origin เดียวกัน แยก tyres/combined และตรวจสร้างใหม่เมื่อข้อมูลเปลี่ยน
3. เขียน gzip แบบกลุ่มละ 4 เฟรม ไม่สร้าง JSON ของทั้งแผนในหน่วยความจำพร้อมกัน แผนจริงสองชุดมี JSON ราว 134 MB จึงไม่เก็บ graph ดิบลง storage
4. อ่านกลับแล้วคืน Vector3 / CrewMotion / CrewPresentation; เก็บ Infinity ได้ถูกต้อง จำกัด 4 แผนบนดิสก์ ลบ revision เก่าเมื่อเขียน หาก storage ใช้ไม่ได้กลับไปคำนวณตามเดิม
5. ค่า geometry signature ปัดเศษ 1e-6 ป้องกันเศษ floating point ทำให้สร้างท่าซ้ำ แยกรูปทรง/จุดจับที่ต่างกัน

## หลักฐาน

- `LAP_*.json`: ผ่านเมนูจริงค่าเริ่มต้น seed 7, 22 คัน, หนึ่งรอบต่อสนาม Shanghai 143.400 / Suzuka 132.483 / Bahrain 132.150 วินาทีจำลอง ทุกคันจบ ไม่มี stop, retire หรือ controller rejection
- `MULTIPIT_*.json`: arrivals สังเคราะห์ครบ 22 คัน / 11 shared team stalls ทั้งสามสนาม ออกครบ ไม่ใช้ช่องทีมทับกัน ใช้ crew-clear proof สังเคราะห์ ไม่ใช่หลักฐานภาพช่างบน GPU
- `PHYSICS.json`: 2,220 substep invariant checks, พลังงาน/แรงยาง/การเบรก/การเลี้ยว/ความทำซ้ำได้
- `WET.json`: รถ 22 คัน ฝน 30 วินาที ไม่มี stop/off-track/rejection ใน fixture
- `CACHE.json`: actual GLB, gzip + structured-clone ผ่าน mock IndexedDB, คืน class/vector และตรวจ 40 ตัวอย่างท่า, storage failure fallback
- `PIT_REUSE.json`: actual GLB 22 bays สร้างสองแผน ใช้ร่วมอีก 42 ครั้ง และ inactive branch ไม่อัปเดต world matrices
- ผ่าน menu49 / worker-transport / interface50 / PWA / service-worker / build / diff check

## ข้อจำกัด

การเปิดครั้งแรกยังต้องสร้างและบันทึกแผนพิต การเปิดครั้งถัดไปข้ามการสร้างท่าสำหรับแผนที่ cache hit แต่ยังสร้าง scene nodes/รถ/วัสดุ ไม่อ้างว่าโหลดเป็นศูนย์ Chrome อาจล้าง storage ได้

ยังไม่มีผล FPS หรือเวลาโหลด R58 จาก Android เครื่องผู้เล่น และยังไม่อ้างว่าแก้ภาพกระตุก/จอกระพริบหรือถึง 60 FPS การทดลองปรับ car submission ที่ไม่เร็วขึ้นถูกถอดออก ไม่ลดโมเดล แสง เงา DPR หรือระยะมองเห็น
