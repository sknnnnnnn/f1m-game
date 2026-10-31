# F1M RACE 61

เกมหลัก: https://sknnnnnnn.github.io/f1m-game/

R61 เพิ่มการแซงในรอบแรกของ Shanghai/Bahrain หลังเวลาแข่ง 30 วินาที เก็บพลังงานส่วนหนึ่งไว้สะสมความเร็วในลมดูดก่อนเบี่ยง และถือแผนแซงที่กำลังดำเนินอยู่ใน Shanghai เลือกแผนเปิดเรซของ Suzuka จากผลทดสอบเดิม

รายละเอียด: [reports/race61/README_TH.md](reports/race61/README_TH.md)

ลิงก์ติดตั้งเดิม /preview54/ ต้องเผยแพร่ build ชุดเดียวกับ root ทุกครั้ง ป้ายรุ่นอ่าน BUILD.edition อัตโนมัติ

---

# F1M RACE 60

เล่นเกมหลัก: https://sknnnnnnn.github.io/f1m-game/

ลิงก์ติดตั้งเดิม `/preview54/` เป็น compatibility alias ของเกมหลัก ต้องอัปเดตทั้งชุดพร้อม root ทุกครั้ง เพื่อให้ PWA ที่ติดตั้งจาก R54 ตรวจพบรุ่นใหม่

รอบ 2 เป็นต้นไปใช้แผนแซงต่อเนื่องและ ERS สำหรับดวล ตรวจเรซ 22 คัน 3 รอบครบ Shanghai / Suzuka / Bahrain รายละเอียดและข้อจำกัด: [รายงาน R60](reports/race60/README_TH.md)

# F1M Attack 1.1

F1 Manager R33 reorganized into a mobile-oriented engine. This is the existing game, retaining all five circuits, six race cars, AI, physics, pit service, DRS, Safety Car, replay and team management.

- [Attack 1.1 results and limitations](reports/ATTACK_1_1_TH.md)
- [Previous mobile repair report](reports/MOBILE_FIX_REPORT_TH.md)
- [คู่มือภาษาไทย](README_TH.md)
- [Architecture and module boundaries](docs/ARCHITECTURE.md)
- [Mobile development workflow](docs/MOBILE_WORKFLOW_TH.md)
- [Performance and test report](reports/PERFORMANCE_TH.md)
- [Original R33 backup hashes](backups/r33/SHA256.json)

```sh
npm ci
npm test
npm run build
npm run test:pwa
npm run preview
```

`npm run test:race` performs the physical driving checks. `npm run test:e2e` runs the prepared Playwright mobile/offline checks after installing its Chromium dependency. See the report for which checks were actually run in this environment.

The requested GitHub branch is `develop/f1m-engine-1.0`. No commit has been made to `main`. See PROJECT_STATUS.md for the verified remote publication state; a local commit is not proof of a GitHub push.
