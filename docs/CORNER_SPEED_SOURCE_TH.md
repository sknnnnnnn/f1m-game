# F1M — Corner Speed Reference: Bahrain, Suzuka, Shanghai

**จัดทำ:** 27 ตุลาคม 2026
**วัตถุประสงค์:** ใช้เป็นข้อมูลตั้งต้นในการออกแบบเส้นทาง ความเร็วโค้ง และพฤติกรรม AI ของเกม F1M
**หน่วยความเร็ว:** km/h

> [!IMPORTANT]
> **ระดับความน่าเชื่อถือของข้อมูล:** เวลาต่อรอบ Pole Position ด้านล่างตรวจสอบกับผล F1/FIA แล้ว แต่ตัวเลขความเร็ว *รายโค้ง* เป็นชุดตัวเลขอ้างอิงที่คุยกันก่อนหน้านี้ **ยังไม่สามารถยืนยันว่าเป็น Telemetry จริงของนักแข่งที่ระบุได้** จึงใช้เป็น `PROVISIONAL_GAME_REFERENCE` (เป้าหมายทดลองสำหรับเกม) เท่านั้น **ไม่ใช่สถิติความเร็วสูงสุดรายโค้ง และไม่ใช่ข้อมูลของ Max Verstappen** หากต้องการความเร็วของ Max Verstappen โดยเฉพาะ ต้องวิเคราะห์ Telemetry ของรอบและปีที่กำหนดต่างหาก
>
> ค่าเดียวต่อโค้งในตารางยังไม่ได้กำหนดอย่างสม่ำเสมอว่าเป็น *apex speed*, *minimum corner speed*, หรือ *speed at exit* จึงห้ามนำไปใช้เป็นหลักฐานการแข่งขันจริงโดยไม่มีการตรวจสอบซ้ำ

## 1. Bahrain International Circuit (Sakhir)

- **สนาม:** Bahrain Grand Prix layout
- **ความยาว:** 5.412 km
- **รอบอ้างอิงเพื่อระบุบริบท:** Oscar Piastri, Pole Position 2025 — **1:29.841** (ยืนยันจาก F1)
- **โค้งที่ต้องการ:** T3, T5, T6, T7, T12

| Corner | Speed reference (km/h) | การใช้คันเร่ง / เบรกจากข้อมูลเดิม | ข้อเสนอสำหรับ AI F1M | Data status |
|---|---:|---|---|---|
| T3 | **211** | เร่งเต็มเกือบทั้งหมด | เร่งออกจาก T2 อย่างต่อเนื่อง หลีกเลี่ยงการเบรกซ้ำ | Provisional |
| T5 | **243** | ผ่อนคันเร่ง | เข้าโค้งเร็ว เลือกระดับคันเร่งตาม grip | Provisional |
| T6 | **209** | เบรกสั้น | ตรวจสอบรัศมีโค้งก่อนบังคับเบรก | Provisional |
| T7 | **228** | รักษาคันเร่งค่อนข้างสูง | เชื่อมไลน์ T5–T7 ให้ลื่นไหล | Provisional |
| T12 | **264** | เร่งเต็มเกือบทั้งหมด | หลีกเลี่ยงการเบรกหนักหาก grip เพียงพอ | Provisional |

## 2. Suzuka International Racing Course (Japan)

- **สนาม:** Suzuka Grand Prix layout
- **ความยาว:** 5.807 km
- **รอบอ้างอิงเพื่อระบุบริบท:** Kimi Antonelli, Pole Position 2026 — **1:28.778** (ยืนยันจาก F1)
- **โค้งที่ต้องการ:** T1, T3, T4, T5, T6, T7, T8, T12, T15

| Corner | Speed reference (km/h) | การใช้คันเร่ง / เบรกจากข้อมูลเดิม | ข้อเสนอสำหรับ AI F1M | Data status |
|---|---:|---|---|---|
| T1 | **229** | ถอนคันเร่ง / เบรกเข้าสู่ T1–T2 | เบรกเป็นเฟสต่อเนื่อง ไม่กระชาก | Provisional |
| T3 | **234** | เร่งสูง | วางไลน์ S Curves ล่วงหน้า | Provisional |
| T4 | **217** | ผ่อนคันเร่ง | ใช้ความเร็วต่อเนื่องจาก T3 | Provisional |
| T5 | **211** | ผ่อนคันเร่ง | คุมสมดุลรถไม่ให้โยกจากการสลับเบรก | Provisional |
| T6 | **184** | เบรกสั้นตามสภาพรถ | ชะลอเท่าที่จำเป็นเพื่อออกจาก Esses | Provisional |
| T7 | **244** | เร่งสูง | เร่งขึ้น Dunlop แบบต่อเนื่อง | Provisional |
| T8 | **243** | ผ่อน/เบรกก่อน Degner | เตรียมตำแหน่งรถสำหรับ T9 | Provisional |
| T12 | **223–225** | ความเร็วสูงต่อเนื่อง | ไม่เบรกโดยอัตโนมัติเพราะถนนโค้ง | Provisional; เดิมอ้างอีกชุดข้อมูล |
| T15 (130R) | **≈295** | เร่งเต็มหรือถอนเล็กน้อยขึ้นกับ grip | รักษาความเร็วสูง หาก downforce เพียงพอ | Provisional; เดิมอ้างอีกชุดข้อมูล |

## 3. Shanghai International Circuit (China)

- **สนาม:** Shanghai Grand Prix layout
- **ความยาว:** 5.451 km
- **รอบอ้างอิงเพื่อระบุบริบท:** Kimi Antonelli, Pole Position 2026 — **1:32.064** (ยืนยันจาก FIA/F1)
- **โค้งที่ต้องการ:** T4, T5, T7, T8

| Corner | Speed reference (km/h) | การใช้คันเร่ง / เบรกจากข้อมูลเดิม | ข้อเสนอสำหรับ AI F1M | Data status |
|---|---:|---|---|---|
| T4 | **181** | เร่งออกจากชุด T1–T3 | เพิ่มคันเร่งนุ่มนวลตามรัศมีเปิด | Provisional |
| T5 | **286** | เร่งเต็ม | อย่าสั่งเบรกถ้าเส้นโค้งและ grip รองรับ | Provisional |
| T7 | **258** | เร่งเต็ม | วางไลน์ก่อน T8 ให้เหมาะสม | Provisional |
| T8 | **182** | ผ่อนคันเร่งมาก | ลดความเร็วอย่างต่อเนื่อง ไม่สลับเบรก/คันเร่งเร็ว | Provisional |

## 4. ตารางรวม — สำหรับคัดลอกเข้าระบบเกม

| Track ID | Turn | Target reference (km/h) | Status |
|---|---|---:|---|
| BAHRAIN | T3 | 211 | PROVISIONAL_GAME_REFERENCE |
| BAHRAIN | T5 | 243 | PROVISIONAL_GAME_REFERENCE |
| BAHRAIN | T6 | 209 | PROVISIONAL_GAME_REFERENCE |
| BAHRAIN | T7 | 228 | PROVISIONAL_GAME_REFERENCE |
| BAHRAIN | T12 | 264 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T1 | 229 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T3 | 234 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T4 | 217 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T5 | 211 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T6 | 184 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T7 | 244 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T8 | 243 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T12 | 223–225 | PROVISIONAL_GAME_REFERENCE |
| SUZUKA | T15 | ≈295 | PROVISIONAL_GAME_REFERENCE |
| SHANGHAI | T4 | 181 | PROVISIONAL_GAME_REFERENCE |
| SHANGHAI | T5 | 286 | PROVISIONAL_GAME_REFERENCE |
| SHANGHAI | T7 | 258 | PROVISIONAL_GAME_REFERENCE |
| SHANGHAI | T8 | 182 | PROVISIONAL_GAME_REFERENCE |

## 5. วิธีใช้ใน F1M

1. ใช้ตัวเลขเป็น **ค่าเป้าหมายทดลอง** ไม่ใช่ `hard_speed_cap` หรือคำสั่งให้เบรกทันที
2. ให้ AI ประเมินความเร็วจาก curvature, lateral grip, tyre state, downforce และ available braking distance
3. มองล่วงหน้าหลายโค้งสำหรับโค้งต่อเนื่อง เช่น Suzuka T3–T7 และ Shanghai T1–T5
4. สร้าง Smooth Throttle/Brake เพื่อป้องกันคันเร่งแกว่ง (`throttle hunting`) และเบรกซ้ำถี่
5. ก่อนเปลี่ยนสถานะเป็น `VERIFIED_TELEMETRY` ต้องบันทึก `driver`, `year`, `session`, `lap`, `corner point (entry/apex/exit)`, `speed trace` และ `source`

## 6. แหล่งอ้างอิงที่ตรวจสอบได้

**อ้างอิงได้เฉพาะเวลา Pole Position และบริบทของรอบ** (ไม่ใช่หลักฐานยืนยันตัวเลขความเร็วโค้งในตาราง):

- Bahrain 2025 — F1 qualifying report: https://www.formula1.com/en/latest/article/piastri-beats-russell-and-leclerc-to-pole-position-during-bahrain-grand-prix.4yw7fVrWBvxYZunZUU0KuX
- Japan / Suzuka 2026 — F1 qualifying results: https://www.formula1.com/en/results/2026/races/1281/japan/qualifying
- China / Shanghai 2026 — FIA qualifying classification: https://www.fia.com/events/fia-formula-one-world-championship/season-2026/grand-prix-china/qualifying-classification

**หมายเหตุ:** ตัวเลขรายโค้งในไฟล์นี้สืบทอดจากการสรุปก่อนหน้า ยังไม่ได้ยืนยันด้วยไฟล์ข้อมูล Telemetry ต้นทาง จึงควรถือเป็นข้อมูลชั่วคราวสำหรับพัฒนาเกมเท่านั้น
