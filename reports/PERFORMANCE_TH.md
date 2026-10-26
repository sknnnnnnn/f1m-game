# ผลประสิทธิภาพ F1M Engine 1.0

Build `f1034b7394d3c0aa` เปรียบเทียบกับต้นฉบับ R33 ที่สำรองไว้ ไม่ลดจำนวนรถ สนาม โมเดล รายละเอียดหรือระยะมองเห็นเป็นวิธีหลัก

| สิ่งที่วัด | ก่อน | หลัง | ขอบเขต |
|---|---:|---:|---|
| HTML เริ่มโหลด | 12,681,004 bytes | 16,958 bytes | แยก JS/GLB เพื่อใช้ cache ไม่ได้หมายความว่าข้อมูลทั้งเกมเหลือเท่านี้ |
| ขนาด production รวม | — | 9,513,107 bytes | ไม่รวมหน้า QA |
| ข้อความ worker สำหรับรถ 6 คัน | 6 | 2 | คงผล state/trace ตรงกันทุกค่า 180 ticks |
| Geometry ร่วมของทีมช่าง 7 ชุด | 210 | 72 | Node construction |
| Texture ร่วมของทีมช่าง | 14 | 2 | Node construction |
| Instance ของทีมช่าง | 5,550 | 5,550 | เท่าเดิม |
| Instanced vertices | 5,422,950 | 5,422,950 | เท่าเดิม |
| เวลาสร้างทีมช่างตัวอย่าง | 123.76 ms | 28.19 ms | ตัวอย่าง Node ครั้งเดียว ไม่ใช่ FPS มือถือ |
| Geometry ในฉากจริง | 3,752 | 3,440 | Shanghai GRID |
| Texture ในฉากจริง | 106 | 100 | Shanghai GRID |
| FPS ตัวอย่าง 5 วินาที | 1.793 | 1.796 | CPU fallback; ไม่พบความต่างที่มีนัยสำคัญ |

การวัด browser ใช้ remote Linux Chrome 155, viewport CSS 390 × 780, Settings เปิด, Shanghai GRID, buffer CPU เดิม 150 × 300, AUTO factor 1, detail distance 32 และ shadows false เท่ากันทั้งสองฝั่ง เป็น fallback ของเกมเดิมเนื่องจากเครื่องนี้ไม่มี WebGL ไม่ได้ใช้ผลนี้แทน Android GPU

จุดที่แก้: ส่งฟิสิกส์เป็น batch แต่ commit ทุกคันพร้อมกัน, reuse geometry/atlas ที่ไม่เปลี่ยน, รวม static garage ตาม material โดยรักษา UV/normal/bounds/shadows และ camera obstruction proxies, cache การนับทรัพยากร, แยก binary assets ให้อ่านและ cache โดยไม่ถอด base64 ซ้ำ

ข้อสรุป: ลดงานซ้ำและทรัพยากรได้จริง แต่เป้าหมาย FPS บน Android ยังต้องทดสอบบนเครื่องจริง ไม่อ้างว่าแก้ FPS สำเร็จแล้ว ตัวจับเวลาการวัดและผล JSON อยู่ใน Settings → วัดประสิทธิภาพ 5 วินาที / บันทึกผลทดสอบเครื่องนี้

หลักฐาน: RESOURCE_BENCHMARK.json, BROWSER_BASELINE.json, BROWSER_AFTER.json, CORE_TESTS.json, WORKER_TRANSPORT.json และ BUILD.json
