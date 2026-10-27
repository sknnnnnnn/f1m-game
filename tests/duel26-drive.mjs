import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LivingSession26} from '../engine/race/living-session26.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {circuit} from '../engine/tracks/track.js';
// Pick the least curved 450 m window of the current circuit. Initial conditions
// create a slower opponent, then only normal controls/physics advance the cars.
let best={score:Infinity};for(let s=0;s<circuit.length;s+=20){let score=0;for(let d=0;d<450;d+=10)score+=Math.abs(circuit.at(s+d).k);if(score<best.score)best={s,score};}
const r=new LivingSession26().race;r.cars=r.cars.slice(0,2);r.laps=3;
for(const [i,c]of r.cars.entries()){
 const station=(best.s+(i?0:38))%circuit.length,p=circuit.point(station,0),speed=i?70:53;
 c.state=initial(r.config,{X:p.x,Y:p.y,psi:p.psi,u:speed,gear:5,shiftTarget:5});c.projection=circuit.project(p.x,p.y,p.psi);c.progress=station;c.distance=1000;c.agent.curve={t0:0,T:1,c:[0]};c.agent.targetLane=0;c.agent.targetSpeed=speed;c.basePersonality={...c.basePersonality,pace:i?94:53,defend:i?.55:.95};c.agent.personality={...c.basePersonality};c.agent.plan=null;
}
r.order=r.ranking().map(c=>c.id);r.prepare();const modes=new Set(),trace=[];let passed=null;
for(let n=0;n<1200&&!r.stop&&!r.controllerRejections;n++){
 r.advance();const a=r.cars[1],b=r.cars[0],gap=circuit.delta(b.projection.s,a.projection.s);modes.add(a.agent.state);
 if(n%30===0)trace.push({time:r.time,gap,lane:a.projection.d,mode:a.agent.state,speed:a.state.u*3.6});
 if(gap< -10){passed??=r.time;if(r.time>passed+1)break;}
}
const out={track:circuit.key,status:!r.stop&&!r.controllerRejections?'PASS':'FAIL',straight:best,passedAt:passed,modes:[...modes],stop:r.stop,rejections:r.controllerRejections,minClearance:r.minClearance,trace,scope:'Controlled two-car speed differential; actual physics and corridor gates; no guaranteed pass on every circuit.'};fs.writeFileSync('reports/race26/DUEL_'+circuit.key+'.json',JSON.stringify(out,null,2));console.log(out);assert.equal(out.status,'PASS');assert(modes.has('DRAFT')||modes.has('PASS_COMMIT')||modes.has('HOLD_SPACE')||modes.has('SLINGSHOT'));
