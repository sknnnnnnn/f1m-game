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
