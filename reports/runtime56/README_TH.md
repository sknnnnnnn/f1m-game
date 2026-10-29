# F1M RACE 56 — ลดงานระหว่างแข่ง

เปิดเล่น: https://sknnnnnnn.github.io/f1m-game/preview56/

## สาเหตุและขอบเขต

ผู้ใช้ยืนยันว่า R55 ยังกระตุกเท่าเดิม การแคชไฟล์ช่วยโหลดครั้งถัดไป แต่ไม่ลดภาระฟิสิกส์และการวาดภาพที่ต้องทำตลอดเรซ รุ่นนี้จึงแก้งาน runtime ที่ตรวจพบจริง โดยไม่ได้อ้างว่าแก้ FPS บน Android สำเร็จแล้ว

CPU profile ของเส้นทาง live 22 คันพบเวลา self ของ evaluate แรงล้อประมาณ 42% และการ project ลงสนามประมาณ 9% บน host นี้ ผลนี้ไม่ใช่ profiler ของมือถือผู้ใช้ และเส้นทางวัดใช้ physics batch ในโปรเซสเดียว ไม่มีการอ้างว่าเท่ากับ parallel workers/GPU ของ Android

## เปลี่ยนอะไร

- `solver56`: ระหว่าง Newton residual เก็บเฉพาะอนุพันธ์ตัวเลข ไม่สร้าง object รายงานแรงล้อทุกครั้งที่วนแก้สมการ สร้างรายงานเต็มเมื่อยอมรับคำตอบแล้ว สมการ ลำดับคำนวณ timestep และ tolerance เดิมถูกคงไว้ frozen solver และ solver53 ไม่ถูกแก้
- Worker ส่งบันทึก substep เฉพาะค่าที่ระบบแข่งใช้งานจริง: สุขภาพล้อ โหลดล้อ ล้อล็อก การหมุนล้อ ERS และ diagnostic extrema สถานะฟิสิกส์ตัวเต็มยังเหมือนเดิม การเรียก solver แบบปกติยังได้รายงานตัวเต็ม
- สนาม Shanghai/Suzuka เก็บรายการ segment รอบ spatial cell และค่ารูปทรง segment ที่ไม่เปลี่ยนไว้ใช้ซ้ำ รักษาลำดับค้นหาและการเลือกชั้นถนนตาม heading ที่ Suzuka
- ช่างกริด 66 คนหยุด hide/flush/upload ซ้ำหลังออกจากกริด และกลับมาทำงานเมื่อเริ่มกริดใหม่
- พิตที่ว่างพักการเดินคำนวณ world matrix ทั้งกิ่ง เปิดกลับก่อนทำงานพิตจริง อาคารยังวาดได้ด้วยเมทริกซ์เดิม ไม่มีการลดระยะมองเห็นหรือคุณภาพภาพ
- แสดงจำนวนไฟล์ที่เก็บในเครื่องจริง เช่น 18/18 และแจ้งความคืบหน้าตอนติดตั้งแคช ไม่มีแถบโหลดปลอมหรือคำรับรอง FPS จากแคช

## ผลตรวจ

- `SOLVER.json`: เทียบ solver53 กับ solver56 ใน 8 สถานการณ์ ความเร็ว/พื้นเปียก ผ่าน 245 steps; state และรายงานตัวเต็มตรงกันทุกค่า กรณี synthetic เริ่มหยุดนิ่งหนึ่งกรณีไม่ converge เหมือนกันทั้งสองตัว เป็นปัญหาที่มีอยู่เดิม ไม่ใช่กรณีที่รุ่นใหม่แก้แล้ว
- `RACE_<track>.json`: เทียบเส้นทาง live รถ 22 คัน × 180 ticks (3 วินาทีจำลอง) ในแต่ละสนาม Shanghai, Suzuka, Bahrain สถานะรถ trace การหมุนล้อ สุขภาพ ยาง พิต diagnostic และ events ตรงเดิมทุกค่า ไม่มี stop/controller rejection
- เวลา CPU ของสองเส้นทางในตัวทดสอบเดียวกัน: Shanghai 4107 → 2767 ms, Suzuka 5354 → 4026 ms, Bahrain 5678 → 4357 ms ลดประมาณ 23–33% ตัว baseline นี้ใช้การ project ใหม่ร่วมกันเพื่อแยกผล solver/record transport จึงไม่ใช่ FPS comparison ของ release ทั้งรุ่น
- ข้อมูล physics batch fixture 22 คัน: ประมาณ 175 KB → 54 KB (ลดประมาณ 69%) เป็น JSON serialization fixture ไม่ใช่การวัด memory ของ structured clone โดยตรง
- `PROJECTION.json`: 2,603 queries Shanghai และ 3,203 queries Suzuka รวม off-track/heading ตรงรุ่นเดิมทุกค่า
- `IDLE_CREW.json`: 120 เฟรม RACE ที่ช่างกริดไม่ทำงาน มี hide/flush/upload เพิ่ม 0 ครั้ง; กลับกริดได้ครบ 66 คน
- `PIT_IDLE.json`: ใช้ GLB จริง 2 bay รวม 1,040 โหนด; 30 เฟรมจาก world-matrix visits 31,200 เหลือ 0 เมื่อพิตว่าง และปลุกกิ่งกลับมาทำงานเมื่อมี pit call
- ผ่าน engine-core (20 pinned files, 5 tracks, 6 cars × 180 ticks exact state/trace), pit-runtime37 (deploy/service/return และขอบเขตช่าง), worker-transport, release54, menu49, interface50, PWA/cache และ build

## ข้อจำกัด

ยังไม่รับรอง Android 60 FPS หรือแก้อาการกระพริบดำครบ ไม่มี GPU ให้ใช้ใน browser ทดสอบนี้ ผล CPU/ข้อมูลฟิสิกส์ไม่สามารถแทนการวัดภาพจริงบนมือถือได้

ไม่แก้นาฬิกาให้กระโดดเพื่อให้ดูเหมือน simulation ตามเวลาจริง และไม่ลดจำนวนรถหรือเปลี่ยน AI ให้รถนำผ่อน ความเร็วเรซเทียบเวลาจริงยังต้องวัดบนมือถือหลังอัปเดต

ไม่ได้รันเต็ม lap ซ้ำในรุ่นนี้ เพราะตรวจ deterministic equivalence ของสมการและ state/trace โดยตรง แยกจากการตรวจเต็ม lap ทั้งสามสนามที่ทำใน R54
