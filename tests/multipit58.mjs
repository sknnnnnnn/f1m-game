import fs from 'node:fs';import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {initial} from '../racing/runtime/frozen/physics.js';import {Agent} from '../engine/ai/agent.js';
import {circuit} from '../engine/tracks/track.js';import {pitRoad,pitStopStation} from '../engine/pit/pit-lane.js';
import {TEAMS52} from '../engine/race/roster52.js';
const r=new LivingSession26().race;r.laps=3;r.live26.automatic=false;r.race15.automatic=false;
for(const c of r.cars){const S=pitStopStation(c.id)-(c.id%2?34:47),q=pitRoad(c.id).at(S);c.state=initial(r.configuration(c),{X:q.x,Y:q.y,psi:q.psi,u:8,gear:2,shiftTarget:2});c.agent=new Agent(c.id,c.kind,0,r.seed,c.traits);c.projection=pitRoad(c.id).project(q.x,q.y);c.progress=S-circuit.length;c.distance=100;c.pit.active=true;c.pit.phase='PIT_IN';c.pit.nextCompound='H';c.pit.enteredAt=0;c.pit.cycle={enteredAt:0,compoundBefore:c.tyres.compound,requested:'H',positionBefore:c.id};}
r.prepare();let simultaneous=0,occupancyErrors=[],exitCount=0;const snapshots=[];
for(let i=0;i<10800&&!r.stop;i++){
 for(const c of r.cars)if(['SERVICE','RELEASE'].includes(c.pit.phase)&&r.time-c.pit.serviceStarted>=r.serviceDuration(c)+.2)c.pit.releaseProof29={serviceAt:c.pit.serviceStarted,at:r.time,clear:true};
 if(!r.advance())break;simultaneous=Math.max(simultaneous,r.cars.filter(c=>['SERVICE','RELEASE'].includes(c.pit.phase)).length);
 for(const t of TEAMS52)if(r.cars.filter(c=>t.cars.includes(c.id)&&['SERVICE','RELEASE'].includes(c.pit.phase)).length>1)occupancyErrors.push({time:r.time,team:t.id});
 exitCount=r.cars.filter(c=>c.pit.lastStop&&c.pit.stops===1).length;
 if(i%1200===0){snapshots.push({time:r.time,exitCount,cars:r.cars.map(c=>({id:c.id,phase:c.pit.phase,s:pitRoad(c.id).project(c.state.X,c.state.Y).s,u:c.state.u,rejection:c.lastController?.rejection}))});console.error('PIT57',circuit.key,Math.round(r.time),'exits',exitCount,'active',simultaneous);}
 if(exitCount===22)break;
}
const result={track:circuit.key,time:r.time,stop:r.stop,rejections:r.controllerRejections,simultaneousServiceCars:simultaneous,occupancyErrors,exitCount,cars:r.cars.map(c=>({id:c.id,phase:c.pit.phase,stops:c.pit.stops,lastStop:c.pit.lastStop??null})),snapshots,scope:'22-car synthetic arrival fixture, 11 shared team stalls; physical integration after initialization. Crew release-clear proof supplied by fixture; rendered crew not verified by this test.'};fs.mkdirSync('reports/recovery58',{recursive:true});fs.writeFileSync('reports/recovery58/MULTIPIT_'+circuit.key+'.json',JSON.stringify(result,null,2));console.log({track:result.track,time:r.time,exitCount,rejections:r.controllerRejections,simultaneous,stop:r.stop});assert(!r.stop);assert.equal(r.controllerRejections,0);assert.equal(occupancyErrors.length,0);assert.equal(exitCount,22);assert(simultaneous>=4);
