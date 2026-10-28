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
