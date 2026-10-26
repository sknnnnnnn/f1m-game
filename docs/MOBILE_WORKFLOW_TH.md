# พัฒนา F1M โดยใช้มือถือเป็นเครื่องหลัก

1. เปิดเกม Preview ใน Chrome และเลือกสนาม/มุมที่ต้องการทดสอบ
2. ส่งคำขอแก้ พร้อมภาพหรือ JSON จาก **ตั้งค่า → บันทึกผลทดสอบเครื่องนี้** กลับมาในแชท Work
3. งานพัฒนาอยู่บน `develop/f1m-engine-1.0` แยกจาก `main` เก็บต้นฉบับรุ่น 33 ไว้ในประวัติ Git และ `backups/r33/`
4. เมื่อ branch ถูกส่งขึ้น GitHub และตั้งค่า hosting แล้ว ทุก push จะรันชุดทดสอบและประกอบ Preview จาก workflow `.github/workflows/preview.yml`
5. เปิดผลใน GitHub → Actions จากมือถือ ดูรายงาน และเปิดลิงก์ Deployment เมื่อสถานะสำเร็จ
6. เปิด Preview ใหม่หรือกดตรวจอัปเดตในเกม พักและเก็บเซฟก่อนเลือกโหลดเวอร์ชันใหม่

ผู้เล่นไม่ต้องติดตั้ง engine บน Android แยกต่างหาก เกมทำงานผ่าน Chrome/PWA เครื่องมือประกอบและทดสอบทำงานนอกมือถือ

## สถานะการเชื่อมต่อ GitHub

การอ่าน repository/สิทธิ์บัญชีและการสร้าง commit ในพื้นที่ทำงานเป็นคนละเรื่องกับการ push จริง ตรวจ `PROJECT_STATUS.md` ก่อนอ้างว่า branch หรือ Preview ของ GitHub พร้อมแล้ว

Repo ที่ยังไม่มี commit ไม่สามารถสร้าง branch จาก `main` ที่ยังไม่มีอยู่ได้ ในสภาพแวดล้อมนี้ API Git data ตอบ 409 ว่า repo ว่าง และ Git CLI ไม่มี authentication สำหรับ push จึงยังไม่ทำ initial commit บน `main` เพราะผู้ใช้ห้ามไว้

## GitHub Pages ครั้งแรก

เมื่อส่ง branch ได้แล้ว ให้เปิด repository Settings → Pages → Source = GitHub Actions และตรวจว่า environment `github-pages` อนุญาต deploy จาก `develop/f1m-engine-1.0` workflow ที่เตรียมไว้ไม่ได้แก้ `main`

ยังไม่เรียก URL ที่คาดเดาของ GitHub Pages ว่า Preview ที่พร้อมใช้ ต้องตรวจ deployment สำเร็จและ URL จริงก่อน

## Android acceptance ที่ยังต้องใช้เครื่องจริง

- Chrome เปิดทั้งห้าสนามได้ กดเริ่ม/พัก กล้อง เลือกรถ และ BOX ได้ทั้งแนวตั้ง/แนวนอน
- ทดสอบหลายรอบรวม Safety Car และพิตหลายคัน
- วัด FPS/เวลาเฟรมหลังเครื่องอุ่น ใช้ camera/quality เดียวกันก่อน–หลัง
- ติดตั้งจาก Chrome แล้วเปิดจากหน้าจอหลัก
- เมื่อขึ้น “ออฟไลน์พร้อม” ปิดอินเทอร์เน็ต ปิด/เปิด PWA และตรวจทั้งโมเดลกับ worker
- เก็บผล JSON ระบุรุ่นมือถือ/Chrome/renderer ไม่อนุมานผล Android จาก remote Linux browser

## เอกสารอ้างอิง

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
