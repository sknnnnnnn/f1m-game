# F1M RACECRAFT 46

## งานที่แก้
- Bahrain: ทำซ้ำ R45 seed7 กริดปกติ ระยะ5รอบ หยุด CONTACT_GUARD ที่13.833333s tick830 คู่4/5 ตรงกับภาพผู้ใช้. Raw baselineอยู่reports/race46/baseline/0.json
- ขยาย body forecast0.35→1วินาที/ระยะ28→45m และเพิ่มระยะเผื่อจาก closing energy/reaction ขณะรถหน้าเบรกหรือเข้าโค้ง เผื่อช่องที่กำลังบีบเข้าหากัน ปรับแป้นเหยียบของรถหลังเท่านั้น ไม่ขยายallowanceหรือปิดswept collision guard และไม่เขียนตำแหน่ง/ความเร็ว
- Suzuka: ยังไม่อ้างว่าทำซ้ำเวลา15.783sตามภาพได้ตรง ทดสอบทางคำนวณbatchเดียวกับworkerและเพิ่มกริดกลับด้าน/ยางต่างชุด/คำสั่งATTACK+DEPLOYเพื่อครอบคลุมความต่างจากเซฟหรือคำสั่งผู้เล่น
- แผนเกาะลมดูด: เก็บERSในwakeจนถึงdeadlineเบี่ยงออกตามclosing speedและเวลาย้ายไลน์ เลือกเฉพาะcorridorที่safeLaneอนุมัติ จากนั้นใช้ERSจริงที่เหลือ และคงความต้องการความเร็วขณะจบแซงเมื่อwakeหายตอนขึ้นคู่. เพดาน103m/sและpower/แบตเตอรี่เดิม ไม่มีเพิ่มแรงให้รถตามหรือผ่อนคันนำ
- เปิดcorner planner/duel tacticsในช่วงก่อนถึงโค้งและตลอดแผนที่commitแล้ว ให้ดวลเบรก/late apex/ตัดกลับออกโค้งได้จริง โดยข้อจำกัดแรงเกาะ เบรก entrycommit และพื้นที่คู่แข่งยังมาก่อน
- เพิ่มประวัติtelemetryรถแบบจำกัด40จุด/3.5s แล้วแนบปัจจัยที่สังเกตได้กับOVERTAKE: wakeจริง,พลังงานdeployActualจากฟิสิกส์,คู่แข่งคืนแรงเกาะหลังล็อก,การเบรก/เร่งออกโค้ง. ข้อความไม่ใช่การพิสูจน์เหตุเชิงcounterfactual ไม่สุ่มเหตุผลหรือสร้างแซง
- ป้ายหลังแซงเฉพาะรถที่ติดตาม5s,แยกแซงสำเร็จ/เสียตำแหน่ง ไม่ฉลองswapธงเหลืองหรือVSC

## ตรวจสอบ
ดู RELEASE_SUMMARY.json/LAUNCH_MATRIX.json/DEPLOYMENT.json เมื่อครบ. Unit fixtures ตรวจBANK→pullout→ERS,คำสั่งSAVE/ABORT,พื้นที่ปิด,คงdemandจนจบpass,late-apex→EXIT_DRIVE,รับ/ปฏิเสธBRAKE_DUELตามcorridor,ประวัติจำกัดและข้อความตามหลักฐานจริง
Node/batchไม่ใช่การวัดAndroidFPS/เสียงหรือการรับรองทุกเซฟ/ทุกseed. ตัวเกมยังหยุดก่อนcommitเมื่อswept guardพบความเสี่ยงชน

ผลสุดท้าย:65engine jobs,22launch cases,production/PWAผ่าน;เรซเต็มBahrain5รอบ,Suzuka4รอบ,Shanghai3รอบและฝนกำลังก่อตัวBahrain1รอบจบครบ ไม่มีguard/rejection/retirement/offtrackที่สุ่มตรวจทุก0.5s. จำนวนแซงGREEN=4/7/0/0 ตามลำดับ การเผื่อความปลอดภัยอาจลดจำนวนแซง ไม่อ้างว่าเพิ่มทุกสนาม
