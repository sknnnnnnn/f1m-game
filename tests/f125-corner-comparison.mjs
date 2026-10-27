import fs from 'node:fs';
import {LivingSession26} from '../engine/race/living-session26.js';
import {circuit} from '../engine/tracks/track.js';
const text=fs.readFileSync(new URL('../docs/F125_ALL_CORNERS_SOURCE.md',import.meta.url),'utf8');
const title={bahrain:'Bahrain International',shanghai:'Shanghai International',suzuka:'Suzuka International'}[circuit.key];
const section=text.split('## '+title)[1].split('\n## ')[0];
const refs=Object.fromEntries([...section.matchAll(/^\| T(\d+) \| ([\d.]+) \|/gm)].map(m=>[Number(m[1]),Number(m[2])]));
const r=new LivingSession26().race;r.seed=19;r.reset();r.laps=2;r.cars=r.cars.slice(0,1);r.prepare();
const corners=circuit.turns.map((t,i)=>{const prev=circuit.turns[(i-1+circuit.turns.length)%circuit.turns.length],next=circuit.turns[(i+1)%circuit.turns.length];return {...t,ref:refs[t.number],entry:(t.s-prev.s+circuit.length)%circuit.length/2,exit:(next.s-t.s+circuit.length)%circuit.length/2,laps:{}};});
let peak=0;const lapStats={};
for(let n=0;n<40000&&!r.finished&&!r.stop;n++){
 r.advance();if(r.controllerRejections)break;
 const c=r.cars[0],s=c.projection.s,v=Math.hypot(c.state.u,c.state.v)*3.6,lap=1+Math.floor(Math.max(0,c.progress)/circuit.length);if(lap>2)continue;
 peak=Math.max(peak,v);const l=lapStats[lap]??={peak:0,min:Infinity};l.peak=Math.max(l.peak,v);l.min=Math.min(l.min,v);
 if(n%3)continue;
 for(const t of corners){
  const ds=circuit.delta(s,t.s);if(ds < -t.entry||ds>t.exit)continue;
  const a=t.laps[lap]??={segmentMin:Infinity,segmentMinS:null,nearMin:Infinity,nearMax:0,nearSamples:0,brakeSamples:0,throttleSum:0,markerDistance:Infinity};
  if(v<a.segmentMin){a.segmentMin=v;a.segmentMinS=s;}
  if(Math.abs(ds)<a.markerDistance){a.markerDistance=Math.abs(ds);a.atMarker=v;a.referenceK=c.lastController.reference.k;a.radius=1/Math.abs(a.referenceK);a.throttle=c.lastCommand.throttle;a.brake=c.lastCommand.brake;a.tyres=c.state.wheels.map(w=>({surface:w.Ts,core:w.Tc,wear:w.wear,damage:w.damage}));a.physicalMu=r.configuration(c).mu;a.planSpeed=c.lastController.reference.v*3.6;}
  if(Math.abs(ds)<=35){a.nearMin=Math.min(a.nearMin,v);a.nearMax=Math.max(a.nearMax,v);a.nearSamples++;a.brakeSamples+=Number(c.lastCommand.brake>.03);a.throttleSum+=c.lastCommand.throttle;}
 }
}
const result={build:process.env.F125_BUILD??'candidate',track:circuit.key,reference:'Supplied F1 25 median apex dataset, not real-world telemetry',conditions:'solo car 1, Medium, seed 19, 2 laps; use flying lap 2',finished:r.finished,time:r.time,rejections:r.controllerRejections,stop:r.stop,peak,lapStats,corners};
fs.writeFileSync(process.env.AUDIT_OUT??'reports/F125_49_AFTER_'+circuit.key+'.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,corners:corners.map(t=>({turn:t.number,ref:t.ref,lap2:t.laps[2]}))}));
if(!r.finished||r.stop||r.controllerRejections)process.exit(1);
