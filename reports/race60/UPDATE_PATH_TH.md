# Installed R54 update path

ภาพจากเครื่องแสดง F1M RACE 54 / cce8161ff1180e34 ซึ่งตรงกับ build.json ที่ยังเสิร์ฟใต้ /preview54/ หลัง root เผยแพร่ R60 แล้ว

แก้ gh-pages โดยนำ static tree ครบชุดจาก root R60 (afb606ca17aae0a2) ไปไว้ใต้ preview54 ด้วย รวม app, worker, models, build.json, sw.js, icons และ manifest โดยใช้ Git blob เดียวกับเกมหลัก

URL ภายในเป็น relative paths และ service worker ใช้ BASE จาก URL ของตัวเอง จึงคง scope /preview54/ สำหรับแอปที่ติดตั้งเดิม การอัปเดตใช้ ACTIVATE_UPDATE หลังพักเกมตามระบบเดิม

กฎเผยแพร่ต่อไป: root และ preview54 ต้องชี้ไฟล์ build เดียวกันทั้งชุด อย่าอัปเดตเฉพาะป้ายเลขรุ่นหรือ build.json

ไม่ได้อ่านหรือแก้ข้อมูลเซฟบนเครื่องผู้เล่น
