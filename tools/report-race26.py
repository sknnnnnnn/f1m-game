import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
load=lambda p:json.loads((root/p).read_text())
version=load('dist/build.json')['version']
rows=[];gaps=[];pits=[]
for key,name in [('bahrain','Bahrain'),('shanghai','Shanghai'),('suzuka','Suzuka')]:
 before=load(f'reports/race26/BEFORE_{key}.json');after=load(f'reports/race26/FIVE_LAPS_{key}.json');default=load(f'reports/race26/DEFAULT_{key}.json');pit=load(f'reports/race26/PIT_{key}.json')
 for result in [after,default]:
  assert result['finished'] and not result['stop'] and result['rejections']==0 and not result['roadViolation'] and not result['retired']
 rows.append(f"| {name} | {before['overtakes']} → {after['overtakes']} | {after['boundary']:.2f} / {after['roadHalfWidth']:.1f} m | ผ่าน |")
 gaps.append(f"| {name} | {max(r['gap'] or 0 for r in before['results']):.2f} | {max(r['gap'] or 0 for r in after['results']):.2f} |")
 pits.append(f"| {name} | {pit['forecastTransit']:.2f} | {pit['actualTransit']:.2f} | {pit['forecastError']:+.2f} | {pit['maxLimited']:.2f} |")
text=f'''# Race package — การต่อสู้ กลยุทธ์ ภาพและเสียง

Build `{version}` ต่อจาก crew/terrain build `580e30aa28a364a9` (source baseline `87f47a1fc1083577298ad5f0b936abf741452393`)

## การเปลี่ยนแปลง

- การแซง: ใช้พื้นที่ได้จริงของแต่ละสนามร่วมกันทุกชั้นวางแผน โดยเฉพาะ Bahrain ที่เคยเสนอไลน์ 3.5–3.8 m แต่ตัวตรวจยอมรับเพียง 3.3 m ทำให้หลายแผนถูกปฏิเสธก่อนลงมือ
- รักษาแผนแซงตราบที่กำลังไล่ขึ้นจริง สูงสุด 18 วินาที แทนตัดแผนที่ 8 วินาทีทุกกรณี หากห่างกว่า 18 m และไม่คืบหน้า 4.5 วินาทีจะเลิกแผน รอช่องใหม่ ทุกแผนยังผ่านตัวตรวจช่องและระยะเบรกเดิม
- คำสั่งเบรกหลบรถหน้าเร่งด่วนมีลำดับเหนือแผนบุก การขึ้นคู่ยังต้องเว้นที่ให้คู่แข่ง ไม่มีการย้ายรถหรือกำหนดผลแซง
- บาลานซ์: แก้การจัดกริดหลังควอลิฟายที่คืนค่านักขับไปใช้ raw traits ชุดเก่า ตอนนี้ใช้ closeFieldTraits ชุดเดียวกับเรซปกติ คงบุคลิกบุก/ป้องกัน/ถนอมยาง ไม่เพิ่มแรงให้รถตามอันดับ
- ยาง: เลือก S/M/H ด้วยอัตราสึกที่วัดได้ ระยะที่เหลือ แรงเกาะและต้นทุนยางสึก ไม่มีการบังคับเข้าพิทให้เกิดดราม่า ทดสอบยางสภาพดีอยู่ต่อ ยางวิกฤตเรียกพิท ยางนุ่มสำหรับช่วงสั้น และยางแข็งเมื่ออัตราสึกสูง
- พิท: ประเมินจากรูปทรงทางเข้า–ช่องจอด–ทางออกของแต่ละสนาม รวมเขตจำกัดความเร็ว การหยุดและเร่งออก งานบริการ ซ่อมและคิว เปลี่ยนระยะตายตัว 980 m / loss 52 s ในการตัดสินใจหลัก แผนเปรียบเทียบ undercut/overcut ใช้ชนิดยางที่ระบบแนะนำตรงกัน
- เสียง: ปรับฮาร์มอนิกเครื่องยนต์ตาม RPM และโหลด แยกเสียงลมความเร็วสูงจากเสียงพื้น เพิ่มเสียงเทอร์โบเบา ๆ คงเสียงเปลี่ยนเกียร์ ล้อยาง ขอบสนาม ฝน และรถใกล้เคียงแบบ stereo/Doppler กราฟเสียงสร้างครั้งเดียว ไม่สร้าง node ต่อเฟรม
- ภาพ: กล้องเพิ่มมุมมองตามความเร็วไม่เกิน 5° เอียงตามแรงโค้งไม่เกิน 0.012 rad และขยับจุดมองตามการเร่ง–เบรกอย่างนุ่ม ไม่มี camera shake จังหวะประกายใต้ท้องแปรตามเวลา แต่ยังต้องมี telemetry ของความเร็ว/โหลดรองรับ ควันยังผูกกับการล็อกล้อ

ฟีลขับพื้นฐานเดิม: ไม่เปลี่ยน vehicle preset, แรงเครื่อง, การควบคุมคันเร่ง, ตัวแก้แรงเกาะ, ชนิด/ค่า wear ของยาง, เส้นทาง, reference ความเร็ว 49 โค้ง, frozen solver/controller/C0 หรือโมเดล ไม่ลดความละเอียด คุณภาพเงาหรือระยะมอง แก้เจ้าหน้าที่และพื้น Suzuka ชุดก่อนหน้ายังคงอยู่

## เรซจริงในแบบจำลอง

รถ 6 คัน 5 รอบ seed 19 ก่อนและหลัง ปล่อยให้ AI กับฟิสิกส์ขับจริงทั้งหมด ตรวจมุมตัวถังทุก 0.1 s การแซงนับจากเหตุการณ์ตำแหน่งที่ engine ยืนยัน รวมช่วงออกตัว ไม่ใช่จำนวนแซงกลางเรซอย่างเดียว

| สนาม | จำนวนแซง ก่อน → หลัง | ตัวถังไกลกลางถนนสูงสุด / ครึ่งถนน | ผล |
|---|---:|---:|---|
{chr(10).join(rows)}

ตรวจ seed เริ่มต้น 7 เพิ่มอีกสนามละ 2 รอบ: จบครบทุกคันทั้งสามสนาม ไม่มีเรซหยุด controller rejection หรือ retirement และไม่พบมุมตัวถังออกนอกขอบถนนในการสุ่มตรวจ

ระยะห่างท้ายขบวน 5 รอบ (วินาที):

| สนาม | ก่อน | หลัง |
|---|---:|---:|
{chr(10).join(gaps)}

ระยะห่างไม่ได้ลดลงทุกสนาม จึงไม่อ้างว่าแพตช์ทำให้ทุกเรซติดกันตลอด ส่วนที่แก้ตรงจุดคือการใช้ค่านักขับชุดปัจจุบันอย่างสม่ำเสมอหลังควอลิฟาย และเปิดแผนแซงที่เคยถูกปฏิเสธผิดเพราะเกินขอบไลน์

## ตรวจเวลาพิท

Fixture ให้หลักฐานช่างพร้อมเพื่อแยกทดสอบการวิ่งพิท การหยุด บริการและออกกลับสนาม ไม่ใช่การยืนยัน animation ช่างทั้งวงจร เวลาคาดการณ์เป็นค่าประมาณ ไม่รับประกันเวลารอ traffic จริง

| สนาม | ประเมิน (s) | วิ่งจริง (s) | ประเมิน−จริง (s) | สูงสุดในเขตจำกัด (km/h) |
|---|---:|---:|---:|---:|
{chr(10).join(pits)}

## การตรวจและข้อจำกัด

- npm test: 34 งานผ่าน รวม worker parity และ checksum ไฟล์แกน/โมเดลเดิม 20 ไฟล์
- npm run build และ npm run test:pwa ผ่าน
- Fixture แผน: สั่งเบรกเร่งด่วนไม่ถูกแผนแซงทับ รักษาที่ตอนขึ้นคู่ รักษาค่า pace หลังจัดกริด เลือกยาง/คาดการณ์ตรงกัน และการเคลื่อนกล้องมีขอบเขต
- กราฟ Web Audio แบบ mock: 2,162 parameter updates ไม่มี NaN ไม่มีการสร้าง node ต่อเฟรม เปลี่ยนเกียร์และ mute ผ่าน ไม่ใช่การทดสอบคุณภาพการฟัง
- Fixture รถสองคันทำให้เกิดการจ่อ/หลอก/เปลี่ยนไลน์/ขึ้นคู่โดยไม่หยุดระบบ แต่ไม่ได้แซงสำเร็จทุกสนามภายใน 20 วินาที จึงไม่อ้างผลแซงที่ไม่เกิด
- ยังไม่ได้ฟังเสียงหรือยืนยันภาพกล้อง/ประกายและ FPS บน Android หลังแพตช์ เสียงเป็นสังเคราะห์ ไม่ใช่เสียงบันทึกหรือระบบเสียงจาก F1 25
- ผลเรซเป็น seed ที่ระบุ ไม่รับประกันทุก seed / ทุกสภาพฝน / ทุกคำสั่งทีม

หลักฐานอยู่ใน `reports/race26/` และสคริปต์ตรวจใน `tests/race-package*.mjs`, `tests/duel26-drive.mjs`, `tests/pit-estimate26-drive.mjs`
'''
(root/'reports/RACE_PACKAGE_TH.md').write_text(text)
for filename in ['PROJECT_STATUS.md','README_TH.md']:
 p=root/filename;s=p.read_text();prefix=f'Current: Race package, build `{version}`. See [changes, measured racing/pit results and limits](reports/RACE_PACKAGE_TH.md). F125 driving base, crew/terrain fix, frozen physics and models retained. Main unchanged; Android listening/visual/FPS validation remains pending.\n\nHistorical milestone notes follow.\n\n'
 if not s.startswith(prefix):p.write_text(prefix+s)
print(version)
