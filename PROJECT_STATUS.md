# F1M RACE 61 — Earlier overtaking

เกมหลักและ preview54 ใช้รุ่นเดียวกัน แผนใหม่เปิดในรอบแรกสำหรับ Shanghai/Bahrain หลังเวลาแข่ง 30 วินาที Suzuka รักษาแผนเปิดเรซเดิม แล้วใช้แผนใหม่หลังรอบแรก

ตรวจ dry 22 คัน 1 รอบต่อสนาม เปรียบเทียบ R60 กับ R61 โดยนับเฉพาะการแซงธงเขียวหลังเวลาแข่ง 60 วินาที รวมการแซงคืน รายงาน: [reports/race61/README_TH.md](reports/race61/README_TH.md)

---

# F1M RACE 60 — Continuous overtaking

เกมหลัก: https://sknnnnnnn.github.io/f1m-game/

แผนดวลเริ่มในรอบ 2: ถือช่องแซงต่อเนื่อง แยกรถข้าง ๆ ออกจากคิวเบรกตาม และเก็บ ERS ไว้ใช้ตอนบุก/ป้องกัน พร้อม motor map สั้นบนทางตรงที่มีระยะเบรกเพียงพอ ใช้แบตเตอรี่จริง

ผลเปรียบเทียบ 22 คัน / 3 รอบ / dry seed 7: การแซงธงเขียวหลังรอบแรก Shanghai 5→19, Suzuka 24→30, Bahrain 8→13 ทุกคันจบ ไม่มี stop/retire/controller rejection ในชุดที่รับเข้ารุ่นนี้

รายละเอียดและขอบเขต: [reports/race60/README_TH.md](reports/race60/README_TH.md)

---

# F1M RACE 59 — Pack performance, passing and livery

เปิดเล่น: https://sknnnnnnn.github.io/f1m-game/preview59/

ลดงาน IK ของรถรวมกลุ่มด้วย shared driver poses และข้ามการส่งรถนอกมุมกล้อง เพิ่มลายรถ 11 ทีมจาก atlas เดียว ปรับ early pull-out / braking duel / เกียร์ตอนล้อล็อก และแก้ขอบเขตธงเหลืองเฉพาะจุด ผ่านหนึ่งรอบครบ 22 คันทั้งสามสนาม ยังไม่ยืนยัน FPS หรือภาพ WebGL บน Android

รายละเอียด: [reports/pack59/README_TH.md](reports/pack59/README_TH.md)

---

# F1M RACE 58 — Race recovery and prepared pit cache

เปิดเล่น: https://sknnnnnnn.github.io/f1m-game/preview58/

แก้แรงยางอิ่มตัวที่ทำให้ Bahrain seed ปกติหยุดตรง 13.650 วินาที และเก็บผลคำนวณท่าช่างแบบ gzip ใน IndexedDB เพื่อใช้ซ้ำหลังเปิดเกมใหม่ ผ่าน 22 คันหนึ่งรอบทั้งสามสนาม / multi-pit ทั้งสามสนาม / wet drive และ cache round trip ยังไม่ยืนยัน FPS/เวลาโหลดบน Android

รายละเอียด: [reports/recovery58/README_TH.md](reports/recovery58/README_TH.md)

---

# F1M RACE 57 — Mobile vehicle model experiment

เปิดเล่น: https://sknnnnnnn.github.io/f1m-game/preview57/

เปลี่ยน production เป็นแบบจำลองรถสี่ล้อ semi-implicit ที่เบากว่า พร้อมทำ physics ใน race worker เดียว และกล้องหลัก MANAGER ใหม่ คง reference56/frozen ไว้เทียบ ไม่อ้าง exact parity ของแบบจำลองใหม่

ตรวจหนึ่งรอบต่อสนามครบ 22 คันทั้ง Shanghai/Suzuka/Bahrain, พิตครบ 22 ทั้งสามสนาม และ wet drive 30 วินาที ผ่าน CPU fixture ฟิสิกส์เร็วขึ้น ~14.3× / simulation รวม ~2.8× บน host ไม่ใช่ Android FPS

รายละเอียด: [reports/mobile57/README_TH.md](reports/mobile57/README_TH.md)

ยังไม่รับรอง 60 FPS/จอกระพริบ/การขับที่สอบเทียบจริงบนมือถือ

---

# F1M RACE 56 — Runtime CPU work

เปิดเล่น: https://sknnnnnnn.github.io/f1m-game/preview56/

ลดการสร้างข้อมูลใน Newton solver, physics worker records, การ project ถนนซ้ำ และงานช่างกริด/กิ่งพิตที่ไม่ active พร้อมแสดงสถานะแคชจริง ผ่าน exact state/trace comparison รถ 22 คันในทั้งสามสนาม ผล CPU บน host ลด 23–33% ในตัวทดสอบ ไม่ใช่ Android FPS

รายละเอียดและข้อจำกัด: [reports/runtime56/README_TH.md](reports/runtime56/README_TH.md)

ยังไม่รับรอง 60 FPS/จอกระพริบหรือความเร็ว simulation เทียบเวลาจริงบน Android

---

# R55 — Asset cache and static transforms

- Completed: content-addressed immutable cache with SHA-256 validation and four concurrent install tasks; GLB source decoding shared by garage/race; authored static scenery transforms frozen while wheel/flags remain animated.
- Verified: exact static geometry/world matrices on Shanghai, Suzuka, Bahrain; offline shell/model; unchanged assets reuse across scopes; corrupt update rejected; independent model clones and retry after failed loading.
- Existing: race renderer/scene initialization was already retained within one page in R54. R55 does not claim to eliminate previously continuous network loads; there were no per-frame model fetches.
- Pending: Android FPS/frame pacing, wall-clock simulation throughput and black flicker. User R54 clip showed 8–16 FPS and about 42% real-time simulation; these are not fixed by cache alone.

---

# R54 — Release Candidate · 2026-10-29

- ผ่าน: 22 คันครบหนึ่งรอบทั้ง Bahrain/Shanghai/Suzuka, พิต 22 คันทั้งสามสนาม, regression 67 คู่ test/สนาม, แผงคุม Cadillac และคำสั่ง Bottas
- รอยืนยัน: 60 FPS/จอดำ/ภาพ GPU ในฝนและกลางคืนบน Android จริง
- ดู `reports/release54/ACCEPTANCE.json` และ `reports/release54/README_TH.md`

# R53 — 2026-10-29

- ผ่าน: Shanghai 22 คันครบหนึ่งรอบ; ทีมครบ 11 ทีม; instancing scene buffers; solver parity; การเลือกกล้องสองคันของ Cadillac ใน browser
- ยังไม่ยืนยัน: Android FPS, ภาพ WebGL จริง และจอดำบนอุปกรณ์ผู้ใช้ (cloud browser ปิด WebGL)
- รายงาน: `reports/grid53/README_TH.md`

# R52 — F1 2026 / 22-car grid

11 teams,22 real driver names,2026 team palettes,SC id23,shared team pit bays,22-car saves/standings and continuous contact response. Play/update at https://sknnnnnnn.github.io/f1m-game/ . Start a new 22-car session; previous six-car save files are preserved but incompatible. Details/validation limits: reports/GRID52_TH.md and reports/grid52/. Source branch work/grid52; main unchanged.

---

# R50 — Main-link interface release

- Build: `d57dcf642818c8db` (`F1M RACE 50`)
- Source: `work/interface50` (main unchanged)
- Release: `gh-pages`, root `https://sknnnnnnn.github.io/f1m-game/`
- `/preview49/` remains a compatible R50 mirror for existing preview installations.
- Details/evidence: `reports/INTERFACE50_TH.md`, `reports/interface50/`.
- Local presentation/session/PWA checks passed. Cloud browser: R49 in-game update, desktop/390×780 layout, cross-track one-click launch and Bahrain racing HUD verified. Root R48 → R50 in-game update passed on the unchanged main URL. Bahrain selected car completed one lap (CHEQUERED FLAG / P1 / 01:55.116).
- Android GPU/FPS and perception of graphics/animation remain user-device checks. No physics, AI, vehicle assets or race pit-system changes in R50.

---

# GARAGE MAIN MENU 49 — 2026-10-29 (isolated preview)

- Build `8cd0fd02ba97254c`; source work/main-menu49; preview /preview49/; R48 root retained.
- User design: Start/Settings/Exit → loading → 3D garage/mechanics → Quick Race or Weekend → circuit/session setup → pre-session → track/session.
- Existing car and CrewBatch; skippable cameras, portrait layout, separate settings/saves/system, direct live team/pit/results actions, paused garage return.
- Actual session configuration and Practice→Qualifying→Race progression; selected race laps survive save/load and stage changes. Invalid inputs and running resets rejected.
- Final67 engine jobs,3track entry tests,CrewBatch leg/path tests,build/PWA PASS. Browser UI and actual entry checked; no full browser Weekend or Android GPU/FPS acceptance.
- See reports/MAIN_MENU49_TH.md and reports/menu49/VALIDATION.json. Preview limitations/cross-track reload documented.

# RACECRAFT 48 — 2026-10-29

- Build `cb33e4d091da5ea9`; work/draft48; main untouched.
- Suzuka-only actual wake reference lane and finite ERS outside DRS. Preserved player overrides, launch geometry, physical limits and guard policy.
- Suzuka7 four-lap late passes1→6; Suzuka19 R48 finishes with7, while R47 stops at321.27s CONTACT_GUARD (common-window late passes1→6).
- Final Shanghai7 three laps and Bahrain7 five laps exactly match R47 finish time/pass history/lap timings:2/11 late passes. Broad candidate regressions retained and rejected.
- Four dry races plus one rain-developing race complete without stop/rejection/retirement/sampled offtrack;67 engine jobs,22 launch cases,build/PWA PASS.
- Suzuka evidence retained under explicit always-true track-guard no-op proof; other tracks/launch retested on final source. Android FPS/audio/touch still pending.
- See reports/DRAFT48_TH.md and reports/draft48/RELEASE_SUMMARY.json.

# RACECRAFT 47 — 2026-10-28

- Build `6ca6ee76c69b2af3`; work/battles47; main untouched.
- Fixed road-relative passing corridor, realistic braking planning, timed attack reset/counterattack and finite ERS recovery/deployment. No leader waiting or gap/rank power injection.
- Matched post-first-lap GREEN passes: Shanghai seeds7/19/42 0/0/0 → 2/2/0; Bahrain7 2 → 11; Suzuka7 1 → 1.
- Six race completions without guard stop/rejection/retirement; 66 engine jobs and22 launch cases PASS. Four runs resumed at300s with event history retained; sampling scope documented.
- Physical regenerative recovery conserves braking motion; torque taper below unchanged106m/s envelope. R46 grid-save compatibility PASS.
- See reports/BATTLES47_TH.md and reports/battles47/RELEASE_SUMMARY.json. Android FPS/audio/touch acceptance remains pending.

# RACECRAFT 46 — 2026-10-28

- Build933a5fc2fd344706; work/race46; main untouched.
- Exact R45 Bahrain13.833s CONTACT_GUARD repro fixed by earlier braking/convergence reserve. Swept guard/footprint/allowance unchanged; no position/velocity writes.
- Suzuka exact15.783s prior state not reproduced;22-case35s batched launch matrix includes both tracks,grids,tyres andATTACK/DEPLOY orders;all PASS.
-65engine jobs,standalone corner/caption checks,build andPWA PASS. Full default Bahrain5laps,Suzuka4laps,Shanghai3laps and rain-developing Bahrain1lap finished without stop/rejection/retirement/sampled offtrack.
-Tow bank→pullout→finiteERS;passing demand retained alongside;corner planner/late-apex sequence activated;bounded measured evidence and pass captions.
-Not a guarantee of more overtakes:Shanghai dry sample0passes.Safety comes before forcing an overtake.AndroidFPS/audio/touch unverified.
-See reports/RACE46_TH.md,reports/race46/RELEASE_SUMMARY.json,LAUNCH_MATRIX.json andDEPLOYMENT.json.

# TOW 45 — 2026-10-28

- Build700ce64d792778e5; source work/tow45; main untouched.
- Fixed mirrored minimap Y and added selected-car heading arrow. Same map transform for road/pit/cars/hit selection.
- Telemetry-driven slipstream badge, strength meter, peripheral rays and wind audio; reduced motion, pause/pit/finish/flag/car-switch visual gating.
- Dry max tow relief90%,range450m,full core130m. Wet physical relief kept at R44 fallback56%. No regrouping.
- 64 engine jobs, standalone actual overlay DOM/canvas adapter, build and PWA checks PASS. Three3lap dry races and one rain-developing lap finished without guards/rejections/retirements/sampled offtrack.
- Shanghai one YELLOW-labelled position swap excluded from green passes; caution limitation retained in evidence. Android FPS/audio/touch still unverified.
- See reports/TOW45_TH.md and reports/tow45/RELEASE_SUMMARY.json.

# TOW RACING 44 — 2026-10-28

- Build b5e0562028d38c4b. Source work/tow44, main untouched.
- Strong physical tow (dry max82%,400m), no regrouping; corner/straight tradeoffs and stronger measured-lock consequences.
- 63 engine jobs, production build and PWA/service-worker checks PASS.
- Dry Suzuka/Shanghai/Bahrain: six cars,3laps,7/6/11 GREEN passes; post-lap1=1/1/6. All finished,zero stop/rejection/retirement/sampled offtrack.
- Rain-developing Bahrain1lap PASS after conservative wet wake; initial failed run retained. Saturated-wet full race and Android performance/audio/touch unverified.
- See reports/TOW44_TH.md and reports/tow44/RELEASE_SUMMARY.json. No universal overtake-count guarantee; no claims of more late passes than regrouping R43.

Current: Battle Racing 43, build `4b257882ade22e5d`. [Changes and comparison](reports/BATTLE43_TH.md). Dry six-car 3-lap late overtakes 5 / 4 / 7 (Suzuka / Shanghai / Bahrain), versus 2 / 1 / 0 in R42. All finish without guard stop, rejection, retirement or sampled off-track. Deliberate arcade conserving/regrouping strategy; player ATTACK/DEPLOY overrides. Android acceptance pending.

Current: Action Racing 42, build `b2fd652bdc8e5aba`. [Changes and measured limits](reports/ACTION42_TH.md). Doubled DRS/draft drag relief and ERS power; all three six-car three-lap integrations finish with no guard stop/rejection/sampled off-track. Late overtakes Suzuka 2, Shanghai 1, Bahrain 0; frequent late overtaking remains incomplete. Android validation pending.

Current: Race Racing 40, build `f8eb25cbb410e92f`. [Changes, physical race evidence and limitations](reports/RACE_RACING_TH.md). Real late passes verified in Shanghai and Bahrain; six-car pit convoy clears. Suzuka late overtaking remains open. Android wet FPS/listening unverified.

Current: Race Reliability 39, build `196b3d129a406ec9`. [Verified fixes and open AI issue](reports/RACE_RELIABILITY_TH.md). Multipit/hitch handling, batched wet effects, stable weather and tyres, nose camera clearance and radio chime. Late-race overtaking remains open; Android wet FPS/listening unverified.

Current: Race Experience 38, build `60c921dd61b1beba`. [Features and validation](reports/RACE_EXPERIENCE_TH.md). Driver-rig CPU optimization, safe attack reset, compound conditioning, measured intervals, strategy comparison, event clips and local race journal. Radio chime only; phone 60 FPS remains unverified.

Current: Radio chime only, build `51ebd4a8e57dec00`. Voice synthesis and voice controls removed; existing radio alert and text retained. [Change and device findings](reports/RADIO_CHIME_TH.md).

Current: Race polish, build `bacf02672a85af4c`. [Features, measured results and limits](reports/RACE_POLISH_TH.md). Calmer chassis, voiced radio, richer audio, FPS camera, 60Hz pacing and crew optimizations. Android 60FPS/listening validation pending.

Current: Race viewport, build `93f5e627f88c8d5e`. [Viewport and validation](reports/RACE_VIEWPORT_TH.md). Game image ends above the unchanged HUD/buttons, including FPS.

Current: Pit continuity, build `b1da04136309c013`. [Changes and verification](reports/PIT_CONTINUITY_TH.md). Rolling pit exit at approximately 80 km/h, smooth pit-exit curve and service model handoff. Android visual/FPS verification pending.

Current: Race story, build `4e4419b64bc34852`. [Usage, verified behaviour and limits](reports/RACE_STORY_TH.md). Focused team radio, responsive selected-car Cinema and per-driver race digest. Driving, AI, six-car grid, track geometry and graphics unchanged. Android UI/listening/FPS verification pending.

Historical milestone notes follow.

Current: Race package, build `932ad21a4fbc03fd`. See [changes, measured racing/pit results and limits](reports/RACE_PACKAGE_TH.md). F125 driving base, crew/terrain fix, frozen physics and models retained. Main unchanged; Android listening/visual/FPS validation remains pending.

Historical milestone notes follow.

Current: F1 25 driving calibration, build `ba525293537c4435`. [49-corner comparison and measured limits](reports/F125_DRIVING_TH.md). Solo lap-two speeds within ±20% in 46/49 corners versus 11/49 before. Six-car two-lap integrations pass all three circuits with zero retirement, guard stop or controller rejection and sampled body corners inside the road. Six-car Suzuka five-lap integration also passes. Frozen core/assets preserved; Android GPU/FPS remains unverified.

Historical milestone notes follow.

Current: Speed ref applied to 18 corners, build `7cfce508201fcfd0` (2026-10-27). See [corner speed results and model limits](reports/CORNER_SPEED_TH.md). Frozen physics/controller, models and graphics retained. Android validation pending.

Historical milestone notes below retain their original statements and do not override the current report.

Latest milestone: flow racing, stronger DRS, balanced standing field and animated grid crew (d916a138a44e8e76). See [measured changes and remaining limits](reports/FLOW_RACING_TH.md). Six-car China two-lap and Suzuka/Bahrain one-lap integrations pass; Android and five-lap validation pending.

Latest milestone: progressive throttle, continuous envelope transition and traction recovery (9b30b0f24b96515d). See [measured results](reports/THROTTLE_DRIVING_TH.md). Six-car China two-lap and Suzuka/Bahrain one-lap integrations pass; actual Android visual/FPS validation pending.

Latest milestone: sustained driving, pit-lane 80 km/h and 5-second DRS (2f0da8eb579c21dd). See [results](reports/ATTACK2_DRIVING_TH.md). Android validation pending.

Latest milestone: Shanghai spatial racing path (7d46953990b00bbd), 2026-10-27.

See [measured results and limits](reports/SHANGHAI_RACING_PATH_TH.md). Android validation remains pending.

# Current milestone: F1M Attack 1.1

Build 0b48ecee592c1915. Current report: reports/ATTACK_1_1_TH.md. All three six-car one-lap integrations finish with zero retirement, guard stop or controller rejection. Physical straight 0–300 8.57 s; 300–0 2.88 s. DRS 3 seconds. Three circuit finish passes implemented and browser grid rendering inspected. Android GPU/FPS and multi-lap season remain unverified. Main unchanged; GitHub publication still blocked.

Historical milestone notes follow.

# Current: mobile gameplay repair milestone

Build fe75225a2ce12aa3. See reports/MOBILE_FIX_REPORT_TH.md for current changes/tests. China/Suzuka six-car laps and six-car concurrent pit bay approach/stop pass. DRS threshold 10 seconds; real straight 0–300 11.92 s vs 14.13 s. Night shader preparation and conservative CPU visibility blocks implemented; actual Android GPU FPS remains unverified. Main unchanged; GitHub still blocked.

The section below records the prior Engine 1.0 milestone and its historical browser measurements.

# F1M Engine 1.0 — candidate milestone

Build: f1034b7394d3c0aa. Based on recovered F1M_China_Suzuka_33.html, backed up unchanged in backups/r33 before restructuring.

Private HTTPS preview published successfully: https://f1m-engine-mobile-preview.newpike2.chatgpt.site/ (build f1034b7394d3c0aa). This is a separate Sites preview mirror, not GitHub Pages.

Canonical local branch: develop/f1m-engine-1.0. No main changes. GitHub publication remains BLOCKED: the repository is empty; authenticated API reports admin/push permission but Git data creation returns 409 for an empty repository, and HTTPS Git push has no usable credential. No successful remote write has been claimed.

Implemented: module separation, deterministic batched worker integration, shared immutable crew resources, static garage batches, binary model loading, mobile controls, versioned PWA shell, explicit safe updates, preview/CI preparation. China and Suzuka retained with all five original tracks, six race cars, AI and pit systems. Grid crew attention/reach/clear behavior retained from R33.

Passed: npm test, build, PWA static/unit tests, six-car one-lap China/Suzuka integration, single-car pit entry/stop both circuits, full seven-vehicle Safety Car cycle. Frozen solver/controller/config and model checksums unchanged (20 files).

Browser: current China loads and renders at 390 × 780 CSS viewport in remote Linux Chrome CPU fallback. Single 5-second baseline vs after: 1.793 vs 1.796 FPS; no significant FPS gain established. Scene geometries 3752 → 3440. Browser race start hit the existing >250 ms heartbeat guard; browser nested-worker progression is not verified. This is NOT an Android GPU measurement.

NOT VERIFIED: actual Android Chrome GPU FPS/thermal stability, install-to-home-screen, real browser offline reload/update flow, full pit release/merge on imported tracks, multi-lap season, every seed, prepared Playwright CI and GitHub Pages deployment. Legacy scripts may depend on historical fixtures; only the reported suites were executed.

See reports/PERFORMANCE_TH.md and reports/TEST_REPORT_TH.md for evidence and limits.
