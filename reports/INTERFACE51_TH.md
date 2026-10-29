# R51

Build 29e6736a98fbc580. แก้เฟสเส้นลมที่กระโดดเมื่อแรงดูดเปลี่ยนเป็นการสะสมระยะตาม dt พร้อม smoothing 0.3s ลดเส้น40เป็น24 เอาพื้น gradient ที่เปลี่ยนทั้งจอออก ถอดเสียงเพิ่มจาก tow แต่คงเสียงลมความเร็วปกติ

ปุ่มแผงแข่งมีลายเฉียง ขอบและเงา จังหวะกด ส่วน CORNER เปลี่ยน bias .61→.5625, steering rate ×1.15, lag ×.85 เพื่อให้ตอบสนองไวขึ้น ไม่เพิ่ม steering lock หรือแก้ frozen integrator

ทดสอบ build/PWA/menu/tow/presentation ผ่าน และ CORNER หนึ่งรอบ Bahrain/Suzuka ทั้ง6คันจบ ไม่มี stop/off/rejections ในสองตัวอย่าง รายงาน reports/interface51/ ไม่ใช่การรับรอง Android FPS หรือความรู้สึกการขับบนเครื่องจริง
