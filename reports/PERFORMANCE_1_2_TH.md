# Performance update 1.2

Build 69cb878ded0866f3. Based on Android report 2026-10-26: WebGL, 503 calls, 337968 triangles, mean frame work 20.2ms; mean recent frame gap 28.6ms. These are separate rolling windows, not a controlled whole-race benchmark.

Changes: exact spatial broad phase for camera obstacles (same box/ray tests, ordered candidates and all large objects retained); concurrent car and safety-car requests; defer first service-worker registration until ready and paused; minified production application and workers. No resolution, geometry, lighting, texture or draw-distance reduction.

Validation: 2000 deterministic spatial queries with 3001 obstacles match exhaustive box and blocked-ray results. Mean broad-phase candidates 2.704 (synthetic fixture only). PWA static/cache unit tests pass. No new Android FPS or startup measurement has been performed. Existing service workers may still update independently of deferred first registration.
