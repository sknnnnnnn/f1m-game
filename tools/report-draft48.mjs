import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const green = e => !['YELLOW', 'VSC'].includes(e.decision);
function summary(r) {
  const passes = r.passes.filter(green);
  return {
    finished: r.finished, time: r.time,
    latePasses: r.latePasses.filter(green).length,
    passes: passes.length,
    counterPasses: passes.filter(e => e.counter47).length,
    reversePairWithin150s: passes.filter((e, i) => passes.slice(0, i).some(p => p.by === e.of && p.of === e.by && e.time - p.time <= 150)).length,
    stop: r.stop, rejections: r.rejections, retired: r.retired,
    sampledOff: r.off, samplingStarts: r.start,
    wakeBuildSamples: Object.entries(r.battle46Counts ?? {}).filter(([k]) => k.endsWith('/WAKE_BUILD')).reduce((n, [, v]) => n + v, 0)
  };
}
const cases = ['suzuka7', 'suzuka19', 'shanghai7', 'bahrain7'];
const results = cases.map(name => {
  const baseline = read(`reports/draft48/baseline/${name}.json`);
  const candidate = read(`reports/draft48/${name}.json`);
  const until = Math.min(baseline.time, candidate.time);
  return {
    case: name,
    baselineR47: summary(baseline), candidateR48: summary(candidate),
    commonWindow: {
      until,
      baselineLatePasses: baseline.latePasses.filter(e => green(e) && e.time <= until).length,
      candidateLatePasses: candidate.latePasses.filter(e => green(e) && e.time <= until).length,
      note: baseline.finished ? 'Both runs finished; full-race counts also reported.' : 'Baseline stopped. Its partial count is not a completed-race total.'
    }
  };
});
const wet = summary(read('reports/draft48/bahrain-wet7.json'));
const launch = read('reports/draft48/LAUNCH_MATRIX.json');
const safe = r => r.finished && !r.stop && !r.rejections && !r.retired.length && !r.sampledOff;
const safety = results.every(r => safe(r.candidateR48)) && safe(wet) && launch.results.every(r => r.exit === 0 && r.time >= 35 && !r.stop && !r.rejections && !r.off);
const report = {
  build: read('reports/BUILD.json').version,
  safety: safety ? 'PASS' : 'FAIL',
  results, extraWet: wet, launchCases: launch.results.length,
  engineJobs: read('reports/draft48/UNIT.json').engineJobs,
  coverage: read('reports/draft48/NOOP_COVERAGE.json'),
  scope: 'Batched physical integrations from the grid. Late passes are after the first car completes lap one. Same R47 comparison filter: exclude events labelled YELLOW/VSC in decision; no independently recorded flag field. Reverse-pair metric uses a 150-second window. Off-track checks sample centre plus half-width every 0.5s, not continuous rotated body corners. No Android FPS, audio, touch or all-seed acceptance.'
};
fs.writeFileSync('reports/draft48/RELEASE_SUMMARY.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
assert(safety, 'Candidate safety/completion gate failed; retain the published R47.');
