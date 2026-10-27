# พื้นที่ภาพเกมเหนือ UI

Build `93f5e627f88c8d5e`

แบ่งพื้นที่เรนเดอร์ให้ขอบล่างอยู่เหนือ HUD และปุ่มเดิม 5px โดยวัดความสูงของ UI จริง ใช้ทุกมุมกล้องรวม FPS จึงเห็นห้องคนขับโดย UI ไม่ทับ พื้นที่ canvas และ camera aspect เปลี่ยนพร้อมกัน ไม่ใช้การเลื่อน canvas แล้วตัดภาพ และไม่ย่อขนาดปุ่ม/ข้อความ

รองรับ resize/หมุนเครื่อง/safe area ผ่านขนาด UI จริง เปิดแผงเมนูแล้วคงขนาดภาพเดิม โหมดซ่อน UI คืนพื้นที่ภาพเต็มจอ แก้ top ของ HUD แนวนอนไม่ให้ยืดการ์ดจนกินพื้นที่จอ

Validation: build, PWA และ deterministic DOM harness ผ่าน (กันพื้นที่ HUD, เปิดแผงไม่กระโดด, ซ่อน UI แล้วคืนเต็มจอ, คืนโหมดปกติ) ไม่มีการเปลี่ยน simulation, AI, pit, models หรือ render quality policy. Local cloud browser เปิด preview ไม่ได้; ยังต้องตรวจ Android จริง

ตรวจลิงก์จริงหลังอัปเดต: มุม FPS, viewport 1363×936, canvas จบที่ y=780, HUD เริ่ม y=785.5 (ช่องว่าง 5.5px), ปุ่มขนาดเดิม 43–45px การตรวจใช้ Chrome CPU fallback; Android/GPU ไม่ได้ทดสอบ แก้ height:100dvh เดิมด้วย height:auto!important ให้ inset ทำงานจริง
