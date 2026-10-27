import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {circuit} from '../engine/tracks/track.js';
const sourceHashes=Object.fromEntries(['engine/physics/reference-adapter.js','engine/tracks/corner-speed-reference.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const r=new LivingSession26().race;r.seed=19;r.reset();r.laps=Number(process.env.AUDIT_LAPS??1);
if(process.env.AUDIT_SOLO==='1')r.cars=r.cars.slice(0,1);
r.prepare();
const dataset=fs.readFileSync(new URL('../docs/F125_ALL_CORNERS_SOURCE.md',import.meta.url),'utf8');
const refs={};for(const [key,name] of [['bahrain','Bahrain International'],['suzuka','Suzuka International'],['shanghai','Shanghai International']]){const section=dataset.split('## '+name)[1].split('\n## ')[0];refs[key]=Object.fromEntries([...section.matchAll(/^\| T(\d+) \| ([\d.]+) \|/gm)].map(m=>[Number(m[1]),Number(m[2])]));}
const corners=circuit.turns.filter(t=>refs[circuit.key]?.[t.number]).map(t=>({...t,refKPH:refs[circuit.key][t.number],cars:{}}));
let roadViolation=null;let boundary=0;const events=[];const prev=new Map();
for(let n=0;n<40000&&!r.finished&&!r.stop;n++){
 r.advance();if(r.controllerRejections)break;
 if(n%6)continue;
 for(const c of r.cars){if(c.finishedAt!==null||c.pit.active)continue;
 const st=c.state,cmd=c.lastCommand,s=c.projection.s,v=Math.hypot(st.u,st.v)*3.6;
 for(const t of corners){const ds=circuit.delta(s,t.s);if(Math.abs(ds)>35)continue;
 const a=t.cars[c.id]??={samples:0,brakeSamples:0,throttleSum:0,minKPH:Infinity,maxKPH:0,apexDistance:Infinity};
 a.samples++;a.brakeSamples+=Number(cmd.brake>.03);a.throttleSum+=cmd.throttle;a.minKPH=Math.min(a.minKPH,v);a.maxKPH=Math.max(a.maxKPH,v);
 if(Math.abs(ds)<a.apexDistance){a.apexDistance=Math.abs(ds);a.atMarkerKPH=v;}
 }
 const old=prev.get(c.id);if(old&&cmd.brake>.03&&old.brake<=.03)events.push({id:c.id,s,v});prev.set(c.id,cmd);
 for(const along of [-r.config.length/2,r.config.length/2])for(const across of [-r.config.width/2,r.config.width/2]){
 const d=Math.abs(circuit.project(st.X+along*Math.cos(st.psi)-across*Math.sin(st.psi),st.Y+along*Math.sin(st.psi)+across*Math.cos(st.psi)).d);boundary=Math.max(boundary,d);if(!roadViolation&&d>circuit.width/2+.05)roadViolation={t:r.time,id:c.id,s:c.projection.s,d:c.projection.d,body:d,v,mode:c.agent.state,command:cmd,controller:c.lastController,tyres:st.wheels.map(w=>({Ts:w.Ts,wear:w.wear})),trace:c.trace.slice(-120)};
 }
 }
 if(process.env.AUDIT_STOP_EDGE&&roadViolation)break;
}
for(const t of corners)for(const a of Object.values(t.cars)){a.brakePct=100*a.brakeSamples/a.samples;a.meanThrottle=a.throttleSum/a.samples;}
const result={roadViolation,sourceHashes,laps:r.laps,track:circuit.key,solo:process.env.AUDIT_SOLO==='1',finished:r.finished,time:r.time,stop:r.stop,rejections:r.controllerRejections,rejectionDetails:r.cars.filter(c=>c.lastController?.rejection).map(c=>({id:c.id,s:c.projection.s,d:c.projection.d,v:c.state.u*3.6,reason:c.lastController.rejection,mode:c.agent.state})),boundary,roadHalfWidth:circuit.width/2,retired:r.cars.filter(c=>c.live26?.retired).map(c=>c.id),finish:r.cars.map(c=>({id:c.id,time:c.finishedAt})),brakeApplications:events.length,corners,events};
fs.writeFileSync(process.env.AUDIT_OUT??`reports/CORNER_${circuit.key}.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,events:undefined,corners:corners.map(t=>({turn:t.number,ref:t.refKPH,cars:t.cars}))}));
assert(r.finished&&!r.stop&&!r.controllerRejections);assert(boundary<=circuit.width/2+.05);assert.equal(result.retired.length,0);
