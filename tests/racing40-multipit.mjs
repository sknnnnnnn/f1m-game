import fs from 'node:fs';import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {circuit} from '../engine/tracks/track.js';import {PIT} from '../engine/pit/pit-lane.js';
const r=new LivingSession26().race;r.laps=3;r.reset();
// Initial fixture: one physical convoy arriving at pit entry, 18 m spacing.
// After this setup all progress, speed, entry and exit come from integration.
for(const [i,c] of r.cars.entries()){
 const s=PIT.entry-100-i*18,q=circuit.point(s,0);c.tyres.compound='M';
 c.state=initial(r.configuration(c),{X:q.x,Y:q.y,psi:q.psi,u:80/3.6,v:0,r:0,gear:2,shiftTarget:2});
 c.projection=circuit.project(q.x,q.y,q.psi);c.progress=s-circuit.gate;c.agent.curve={t0:0,T:1,c:[0]};c.agent.targetLane=0;c.agent.targetSpeed=80/3.6;c.agent.plan=null;c.agent.profile40=null;
 assert(r.requestPit(c.id,'H'));
}
r.prepare();let maxActive=0,off=null;const exits={};
for(let i=0;i<20000&&!r.stop;i++){
 const active=new Map(r.cars.map(c=>[c.id,c.pit.active]));
 for(const c of r.cars)if(['SERVICE','RELEASE'].includes(c.pit.phase)&&r.time-c.pit.serviceStarted>=r.serviceDuration(c)+.2)c.pit.releaseProof29={serviceAt:c.pit.serviceStarted,at:r.time,clear:true};
 if(!r.advance())break;maxActive=Math.max(maxActive,r.cars.filter(c=>c.pit.active).length);
 for(const c of r.cars){if(active.get(c.id)&&!c.pit.active&&c.pit.stops)exits[c.id]={time:r.time,kph:Math.hypot(c.state.u,c.state.v)*3.6};if(!c.pit.active&&Math.abs(c.projection.d)+r.config.width/2>circuit.width/2+.05)off??={id:c.id,time:r.time,d:c.projection.d};}
 if(i%1800===0)console.error('MULTIPIT40',Math.round(r.time),maxActive,Object.keys(exits).length);
 if(Object.keys(exits).length===6&&r.time>Math.max(...Object.values(exits).map(e=>e.time))+3)break;
}
const out={track:circuit.key,time:r.time,stop:r.stop,rejections:r.controllerRejections,off,maxActive,exits,stops:r.cars.map(c=>({id:c.id,stops:c.pit.stops,phase:c.pit.phase})),scope:'Six-car pit-arrival convoy initialized once at 80 km/h and 18 m spacing; real integrated entry/service/exit thereafter. Crew-clear proof fixture only.'};
fs.writeFileSync('reports/racing40/MULTIPIT.json',JSON.stringify(out,null,2));console.log(out);assert(!r.stop&&!r.controllerRejections&&!off&&maxActive>=4&&Object.keys(exits).length===6&&r.cars.every(c=>c.pit.stops===1));
