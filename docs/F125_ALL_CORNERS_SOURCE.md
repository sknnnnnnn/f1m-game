# F1M — Apex Speeds for All Corners (Bahrain / Shanghai / Suzuka)

**Purpose:** Reference speed dataset for F1M cornering AI.

**Important:** These values are **median minimum (apex) speeds from multi-driver F1 25 game telemetry** collected by Driver Dojo, **not official real-world F1 driver telemetry**, not single-driver maximum speeds, and not fixed speed limits. They should be used as starting benchmarks and adjusted according to F1M physics, tires, fuel and downforce. Some consecutive corner definitions may differ between datasets.

Units: km/h. `slow` = <120, `medium` = 120–<180, `fast` = >=180.

## Bahrain International Circuit — 15 turns

| Turn | Median apex speed (km/h) | Class |
|---|---:|---|
| T1 | 69 | slow |
| T2 | 119 | slow |
| T3 | 131 | medium |
| T4 | 111 | slow |
| T5 | 198 | fast |
| T6 | 196 | fast |
| T7 | 196 | fast |
| T8 | 81 | slow |
| T9 | 127 | medium |
| T10 | 74 | slow |
| T11 | 151 | medium |
| T12 | 241 | fast |
| T13 | 138 | medium |
| T14 | 121 | medium |
| T15 | 122 | medium |

Source: https://driverdojo.app/tracks/bahrain.html (781 sampled laps)

## Shanghai International Circuit — 16 turns

| Turn | Median apex speed (km/h) | Class |
|---|---:|---|
| T1 | 174 | medium |
| T2 | 90 | slow |
| T3 | 85 | slow |
| T4 | 85.5 | slow |
| T5 | 271 | fast |
| T6 | 75 | slow |
| T7 | 239 | fast |
| T8 | 156.5 | medium |
| T9 | 108.5 | slow |
| T10 | 111 | slow |
| T11 | 84 | slow |
| T12 | 91 | slow |
| T13 | 127 | medium |
| T14 | 63 | slow |
| T15 | 63 | slow |
| T16 | 159 | medium |

Source: https://driverdojo.app/tracks/shanghai.html (156 sampled laps)

## Suzuka International Racing Course — 18 turns

| Turn | Median apex speed (km/h) | Class |
|---|---:|---|
| T1 | 162 | medium |
| T2 | 155 | medium |
| T3 | 209 | fast |
| T4 | 195 | fast |
| T5 | 192 | fast |
| T6 | 164 | medium |
| T7 | 204 | fast |
| T8 | 234 | fast |
| T9 | 136 | medium |
| T10 | 73 | slow |
| T11 | 73 | slow |
| T12 | 225 | fast |
| T13 | 190 | fast |
| T14 | 152.5 | medium |
| T15 | 295 | fast |
| T16 | 90 | slow |
| T17 | 90 | slow |
| T18 | 94 | slow |

Source: https://driverdojo.app/tracks/suzuka.html (477 sampled laps)

## Recommended F1M integration

- Interpret `median apex speed` as a **reference target at the minimum-speed point**, not approach, exit, or maximum instantaneous speed.
- Smooth acceleration and deceleration in time and along track distance; avoid alternating brake/throttle for small curvature changes.
- Plan ahead across multiple linked corners (especially Suzuka T3–T7 and Shanghai T1–T4).
- Apply tire grip, aero/downforce, fuel load, track condition and driver skill modifiers.
- Never hard-code braking on all corners; brake only when predicted feasible corner speed is below current speed.
- Validate corner numbering and segment location against the actual F1M track geometry before mapping to AI nodes.
