# F1M Engine 1.0 architecture

The R33 game remains the implementation. `docs/R33_MODULE_MAP.json` maps each of its 127 moved source modules to its current path. Numerical physics and controller sources remain byte-identical in the frozen runtime. The small `racing/src/reference-adapter.js` compatibility export preserves the unchanged controller's original import.

| Module | Responsibility | Main files |
|---|---|---|
| `engine/race` | race/session clock, atomic commit, weekend, strategy, resources and saves | `engine.js`, `living-race26.js`, `living-session26.js` |
| `engine/ai` | driver perception, planning, tactics, rivals and safe corridors | `agent.js`, `battle-planner.js` |
| `engine/pit` | pit routes, planning, queues and presentation | `pit-lane.js`, `pit-scene28.js`, `crew/` |
| `engine/drs` | detection permits, activation and accepted wing kits | `drs24.js`, `wing-kits25.js` |
| `engine/safety` | Safety Car state machine, proposals, collision guard and model | `safety-car.js`, `safety-scene.js` |
| `engine/physics` | race geometry/reference adapter, tyre and collision policy | `reference-adapter.js`, `collision.js` |
| `racing/runtime/frozen` | unchanged numerical integrator and controller | `physics.js`, `controller.js` |
| `engine/rendering` | scene construction, cars, camera, CPU/WebGL and effects | `app.js`, `cameras.js`, `imported-scene33.js` |
| `engine/tracks` | five circuits, sampled geometry, height and scenery | `track.js`, `imported-circuits33.js`, `scenery/` |
| `engine/runtime` | worker orchestration, binary asset loader and telemetry | `race-worker.js`, `physics-pool32.js`, `physics-batch.js` |
| `engine/ui`, `engine/audio` | controls/team interface and sound | UI modules, `audio.js` |
| `public` | install/update/offline shell and mobile instrumentation | `mobile.js`, `sw.js`, `manifest.webmanifest` |

Race progression: prepare AI and controller commands → integrate every car in a batch → wait for all results → evaluate existing guards → atomically commit the tick → publish presentation snapshots. Rendering never writes authoritative vehicle positions.

`engine/index.js` is the public simulation entry. Rendering starts separately from `engine/rendering/app.js`. Hosted workers are independent cached script files, bootstrapped with the selected track and the actual pit profiles. A worker failure stops/presents the error; it never commits a partial field.

Shared crew geometry/atlases are immutable. Instance transforms and per-rig materials remain independent. The resource benchmark verifies equal authored vertex and instance counts before/after. Full-size cars and existing collision policies remain active.

PWA caches only build assets of this game. It ignores non-GET and out-of-scope requests. Updates wait for an explicit action; the UI refuses to activate one while racing. No credentials, saved races or external sites are cached by new application code.
