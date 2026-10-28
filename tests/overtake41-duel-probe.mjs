import fs from 'node:fs';
import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {circuit} from '../engine/tracks/track.js';
import {racingOffset} from '../engine/tracks/racing-line.js';
import {racingPath} from '../engine/tracks/racing-path.js';
import {zonesFor24} from '../engine/drs/drs24.js';
const r=new LivingSession26().race;r.laps=5;r.reset();r.cars=r.cars.slice(0,2);r.time=100;r.tick=6000;
const start=zonesFor24()[0].start+60;
for(const [i,c] of r.cars.entries()){
 const s=(start-i*22+circuit.length)%circuit.length,d=racingOffset(s),q=circuit.point(s,d);
 c.state=initial(r.configuration(c),{X:q.x,Y:q.y,psi:q.psi,u:i?79:77,v:0,r:0,gear:6,shiftTarget:6});c.state.time=r.time;c.state.tick=r.tick;
 for(const w of c.state.wheels){w.Ts=90;w.Tc=90;}
 c.projection=circuit.project(q.x,q.y,q.psi);c.progress=circuit.length+s;c.lap=1;c.agent.curve=racingPath(null,c.state,c.projection);c.agent.curve.racing.join=null;c.agent.targetLane=d;c.agent.targetSpeed=90;c.agent.plan=null;c.agent.profile40=null;
}
r.prepare();let off=null;const modes=new Set();let pass=null;
for(let i=0;i<2400&&!r.stop;i++){
 if(!r.advance())break;
 for(const c of r.cars){modes.add(c.agent.state);if(Math.abs(c.projection.d)+r.config.width/2>circuit.width/2+.05)off??={time:r.time,id:c.id};}
 pass=r.events.find(e=>e.kind==='OVERTAKE'&&e.by===2&&e.of===1);if(pass&&r.time>pass.time+3)break;
}
const out={track:circuit.key,pass,stop:r.stop,rejections:r.controllerRejections,off,modes:[...modes],gap:r.cars[0].progress-r.cars[1].progress,scope:'Two-car straight duel initialized once at lap 2, warm tyres, 22 m gap and 2 m/s closing speed. Physical integration only afterwards; not evidence of natural full-race pass frequency.'};
fs.writeFileSync(`reports/overtake41/duel-${circuit.key}.json`,JSON.stringify(out,null,2));console.log(out);assert(!r.stop&&!r.controllerRejections&&!off);assert(pass,'a safely closing car must finish a physical pass');
