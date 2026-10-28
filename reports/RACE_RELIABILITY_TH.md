# Race Reliability 39

Build `196b3d129a406ec9` — 2026-10-28. Existing GitHub Pages site and development branch retained. No frozen physics, original car assets, graphics quality/DPR/shadows or six-car grid changes.

## Fixes included

- Frame gaps of 250–2000 ms no longer automatically pause the race. Accepted wall-time catch-up is bounded to 100 ms; physics step size and step budget stay fixed. Hidden tabs and gaps above 2000 ms still pause. This prevents the reported 250 ms pause from masquerading as a pit/weather deadlock; it does not promise frames never stall.
- Pit crews share bounded pose cache entries across garages. Head look animation is recomputed. Release proof remains tied to the same service cycle, confirmed clear geometry, service completion and traffic safety; its expiry now matches the 2-second render heartbeat grace. Save/load discards proofs.
- Wet spray uses one instanced GPU submission instead of up to 96 separate meshes; 72 puddles share one instanced submission with per-instance opacity/roughness. The CPU fallback is retained. Duplicate HTML rain is disabled for WebGL, and 3D rain is hidden when dry.
- Shower mode starts its own 7-minute wet / 7-minute dry phase when selected. Continuous rain remains continuous. Automatic weather calls require stable conditions and cooldown; stale booked weather calls are cancelled and automatic tyre selection checks actual water again at service completion. Explicit manual compound choices are honoured.
- Nose lens is raised and its near clipping plane reduced. Original forward location and visible nose are retained. Actual GLB ray tests cover three stations each at Shanghai and Suzuka.
- Radio uses a separate chime bus into the existing compressor, a louder double pip and a brief engine duck. Menu-open notifications no longer lose their cue. Camera menu includes **ลองเสียงเตือนวิทยุ**, usable while paused. No speech synthesis.

## Validation

- `npm test`: all 53 configured jobs passed; production build and PWA/cache tests passed.
- Three dry physical integrations: six cars, three laps, seed 19 at Shanghai, Suzuka and Bahrain. All finished; zero safety stops, controller rejections, retirements or sampled off-road events.
- Shanghai same-lap six-car pit requests: all six completed one stop and exited. Five were active in the pit system concurrently. Release-clear geometry is supplied by a test fixture; the full renderer was checked separately. This is not a phone rendering benchmark.
- Suzuka continuous-rain integration: six cars, three laps completed without a stop or rejection. All six automatic changes were to wet tyres; no switch back to dry tyres.
- Shared-crew matrix parity: 106,560 comparisons within 1e-6; pit runtime bounds: 51,282 checks.
- Wet scenegraph comparison: 90 visible spray submissions reduced to one, with 1,440 transform elements compared within Float32 tolerance. Shader alpha/roughness plumbing tested; actual GPU rendering and Android FPS remain unverified.
- Audio envelope and routing tested programmatically. Android audibility has not been listened to here.

## Open: racing after the first lap

This issue is **not resolved**. Launch anticipation, cautious-exit penalties and dirty-air planning were adjusted within the existing physical controls. Final three-lap seed-19 tests recorded **zero overtakes after the first completed lap on all three circuits**. Finish gaps remained 18.28 s Shanghai, 15.01 s Suzuka and 15.42 s Bahrain. Proximity alone is not treated as successful racing.

More aggressive experimental lateral planning triggered the contact guard and was removed. No teleporting, rank correction, rubber-band power or disabled contact checks are included. The next AI change must demonstrate late overtakes and safe side-by-side driving across multiple seeds before being called fixed.

## Updating / checking

Pause → ตั้งค่า → ตรวจอัปเดต → accept the ready update. Confirm build `196b3d129a406ec9`. For stable wet weather choose **ฝนต่อเนื่อง**; for the chime use กล้อง → **ลองเสียงเตือนวิทยุ**. A 60 FPS guarantee on the user's Android device is not established.
