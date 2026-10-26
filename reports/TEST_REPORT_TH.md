# รายงานทดสอบ F1M Engine 1.0

## ทดสอบแล้ว

- `npm test`: static batching รักษา triangle/UV/normal/bounds และ camera proxies, frozen checksum 20 ไฟล์, 5 สนาม, ผลฟิสิกส์ serial/batch รถ 6 คัน 180 ticks ตรงกันทุกค่า, worker transport, DRS 8 เคส, championship 10 เคส, grid crew และ Suzuka bridge collision ผ่าน
- China และ Suzuka: รถ 6 คันวิ่งจบ 1 รอบด้วย seed 7, ไม่มี guard stop / controller rejection / retirement (`DRIVE-*.json`)
- Pit ทั้งสองสนาม: รถ 1 คันเข้าและหยุดถึง SERVICE จริง ไม่มี rejection; ระยะหยุดคลาด 0.121 m / 0.153 m (`PIT-*.json`) ยังไม่ครอบคลุม service/release/merge เต็มวงจร
- Safety Car: ต้นฉบับ R33 หยุดที่ tick 3581 ด้วย ENVELOPE_STOP; หลังปรับ planning margin ช่วง yellow/SC และให้ SC รอท้ายขบวน ผ่าน DEPLOY → LEAD → IN_LAP → RETURN → PARKED, กลับ GREEN, ไม่มี controller/SC rejection ไม่มีการเขียน pose/velocity ระหว่างการทดสอบ (`SAFETY_CAR_TEST.json`) ไม่แก้ frozen solver
- `npm run build`: ผ่าน; SHA และขนาดไฟล์อยู่ BUILD.json
- `npm run test:pwa`: manifest/icons/relative paths และ service worker mock ผ่าน; precache 17 assets, offline navigation/binary/nested-worker, explicit update และเก็บ cache แอปอื่นไว้ ผ่าน (`SERVICE_WORKER_TESTS.json`)
- Remote Chrome: China โหลดและวาดจริงใน viewport CSS 390 × 780 ด้วย CPU fallback; ผลก่อน/หลังอยู่ BROWSER_*.json ไม่มี error ใน diagnostics ณ ตัวอย่าง; การเริ่มแข่งใน remote browser ถูก guard เดิมพักเมื่อ heartbeat เกิน 250 ms จึงยังไม่ยืนยัน nested-worker progression จาก browser รอบนี้ ใช้ผล integration ใน Node แยกต่างหาก

## ยังไม่ทดสอบ / ยังติดข้อจำกัด

ยังไม่มี Android เครื่องจริง, ไม่ยืนยัน Android GPU FPS, อุณหภูมิ, การติดตั้ง PWA หรือ offline/update flow จริง Playwright Pixel 7 tests และ GitHub Actions เตรียมไว้แต่ยังไม่ได้รัน CI เพราะ push GitHub ติด authentication และ repository ยังว่าง GitHub Pages ยังไม่ได้เปิดใช้งาน

ไม่อ้างว่าทุก legacy test ผ่าน บางชุดต้องใช้ fixture เก่าที่ไม่มีอยู่ใน checkpoint ไม่ได้สร้างผลทดแทนขึ้นมา ยังไม่ครอบคลุมทุก seed, หลายรอบ/ทั้งฤดูกาล หรือ pit release/merge เต็มวงจรในสนามนำเข้า

ต้นฉบับอยู่ backups/r33 พร้อม SHA256.json และ commit สำรองก่อนแก้ ไม่มีการเปลี่ยน main
