# F1 25 comparison geometry

Public factual map coordinates from Driver Dojo's F1 25 telemetry pages:

- https://driverdojo.app/tracks/bahrain.html
- https://driverdojo.app/tracks/suzuka.html

The JSON map files contain numeric route and corner-marker coordinates only.
The layout files are a new reconstruction: oriented to the existing authored
world, scaled to lap length, smoothed, and blended into the retained start/pit
corridor. They are approximate road controls, not EA code, EA assets or LiDAR.
Existing authored elevations, architecture, terrain and road appearance remain
part of the project. The regenerated road is shared by scenery and physics.

`*-old.json.gz` retain the pre-change geometry needed by the offline generator.
Run `python tools/calibrate-circuit25.py`, then
`node tools/import-circuits33.mjs` to reproduce the imported road data.
The Python calibration and line-optimisation tools need NumPy/SciPy only when
regenerating controls; the shipped browser game uses generated data and needs
neither Python nor those tools.

The Shanghai T14 correction is an authored rounded hairpin in its existing
location. Its former inside edge folded because the schematic centreline radius
was smaller than half the road width. This correction is not claimed as a scan.
