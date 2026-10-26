# Pit loading optimization

The loading label “เตรียมพิตรถ 1 / 6 · ยาง” precedes synchronous crew motion generation, including iterative contact/release gates and deployment/return routes. It is not a model download progress label.

Changes: cache destination-to-target visibility within each waypoint query, and skip collision sampling for candidates whose path length cannot improve the current route. Candidate iteration, exact geometry sampling, route choice, crew density, animation sample rate and release gates are retained.

Validation: 1,200 seeded queries with eight obstacles each, covering incoming/outgoing/no lane, matched the original chosen waypoint exactly. Local microbenchmark: 119.94 ms before, 37.87 ms after (3.17x for this function only). This is not an Android loading-time measurement or a whole-game speedup. Existing engine/PWA checks are run separately.

Latest supplied device report (previous build 19c7d176f7fc8405): Bahrain night, mean recent frame interval 30.56 ms (~32.7 FPS), render stage 14.04 ms, pit crew stage 7.57 ms. Different track/session from prior Shanghai reports; not a controlled comparison. No post-change Android result yet.
