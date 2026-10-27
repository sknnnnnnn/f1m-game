import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {LivingSession26} from '../engine/race/living-session26.js';
import {circuit} from '../engine/tracks/track.js';
import {PIT,pitRoad,pitSpeedLimitLines,canMerge,pitMergeStop35} from '../engine/pit/pit-lane.js';
import {pitHandoff35} from '../engine/pit/pit-handoff35.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {Agent} from '../engine/ai/agent.js';
// Physical full cycle; the fixture supplies only the renderer's crew-clear proof.
const r=new LivingSession26().race,c=r.cars[0];r.cars=[c];r.laps=3;r.live26.automatic=false;
const station=PIT.entry-90,q=circuit.point(station);
c.state=initial(r.configuration(c),{X:q.x,Y:q.y,psi:q.psi,u:15,gear:2,shiftTarget:2});c.agent=new Agent(c.id,c.kind,0,r.seed,c.traits);c.projection=circuit.project(q.x,q.y,q.psi);c.progress=station;c.distance=station;r.requestPit(c.id,'M');r.prepare();
const lines=pitSpeedLimitLines(),samples=[],transitions=[];let maxLimited=0,minRunout=Infinity,maxMove=0,exit=null,postExit=null,oldPhase=c.pit.phase;
for(let n=0;n<15000&&!postExit;n++){
 if(['SERVICE','RELEASE'].includes(c.pit.phase)&&r.time-c.pit.serviceStarted>=r.serviceDuration(c)+.2)c.pit.releaseProof29={serviceAt:c.pit.serviceStarted,at:r.time,clear:true};
 const prev={X:c.state.X,Y:c.state.Y,u:c.state.u};assert(r.advance(),JSON.stringify(r.stop));
 const at=pitRoad(c.id).project(c.state.X,c.state.Y),kph=c.state.u*3.6;
 maxMove=Math.max(maxMove,Math.hypot(c.state.X-prev.X,c.state.Y-prev.Y));
 if(c.pit.active&&at.s>=lines.start&&at.s<=lines.end)maxLimited=Math.max(maxLimited,kph);
 if(['PIT_OUT','MERGE'].includes(c.pit.phase)&&at.s>=PIT.mergeWait-80)minRunout=Math.min(minRunout,kph);
 if(c.pit.phase!==oldPhase){transitions.push({time:r.time,phase:c.pit.phase,kph,station:at.s});oldPhase=c.pit.phase;}
 if(n%12===0&&c.pit.active)samples.push({time:r.time,phase:c.pit.phase,kph,station:at.s});
 if(!exit&&c.pit.lastStop)exit={time:r.time,kph,beforeKph:prev.u*3.6,station:at.s,gear:c.state.gear};
 if(exit&&r.time-exit.time>=2)postExit={time:r.time,kph,gear:c.state.gear};
}
assert(exit&&postExit);assert.equal(r.controllerRejections,0);assert.equal(c.pit.stops,1);assert(!transitions.some(x=>x.phase==='YIELD'),'Clear exit must not stop');assert(maxLimited<=80.5);assert(minRunout>78,'Runout must retain limiter pace');assert(exit.kph>78);assert(exit.station>=PIT.exit);assert(Math.abs(exit.kph-exit.beforeKph)<1,'No velocity reset at main-road handoff');assert(postExit.kph>exit.kph+10,'Physical acceleration resumes');assert(maxMove<r.config.dt*100,'No pose teleport');
// Main-road traffic still requires a stop; removed cars do not block a merge.
const gate=pitRoad(c.id).at(PIT.mergeWait),main=circuit.point(PIT.mergeWait-100),own={id:1,state:{X:gate.x,Y:gate.y,u:22,v:0},pit:{active:true}},rival={id:2,state:{X:main.x,Y:main.y,u:75,v:0},pit:{active:false}};
assert.equal(canMerge(own,[own,rival]),false);assert.equal(pitMergeStop35(own,[own,rival]),PIT.mergeWait);assert.equal(pitMergeStop35(own,[own]),Infinity);rival.live26={removed:true};assert.equal(pitMergeStop35(own,[own,rival]),Infinity);
// Scene-graph alignment across all bays, varied headings/heights and car scales.
let maxHandoffError=0;
for(let id=1;id<=6;id++)for(const height of [0,7.4]){
 const scene=new T.Scene(),bay=new T.Group(),work=new T.Group(),vehicle=new T.Group(),copy=new T.Group();scene.add(bay,vehicle);bay.add(work);work.add(copy);bay.position.set(120+id,2.3,-300);bay.rotation.y=id*.31;bay.scale.set(-.83,.83,.83);vehicle.position.set(130+id,height,-280);vehicle.rotation.y=id*.29;vehicle.scale.setScalar(.83);copy.scale.set(-1,1,1);pitHandoff35(bay,vehicle,work);scene.updateMatrixWorld(true);
 for(const point of [new T.Vector3(),new T.Vector3(1,.42,-2.7),new T.Vector3(-1,.42,2.7)]){const error=point.clone().applyMatrix4(copy.matrixWorld).distanceTo(point.clone().applyMatrix4(vehicle.matrixWorld));maxHandoffError=Math.max(maxHandoffError,error);assert(error<1e-9);}
}
let exitMaxCurvature=0;for(let S=PIT.mergeWait;S<=PIT.exit;S+=.5){const q=pitRoad(1).at(S);exitMaxCurvature=Math.max(exitMaxCurvature,Math.abs(q.k));assert(Math.abs(pitRoad(1).project(q.x,q.y).d)<.02);}const end=pitRoad(1).at(PIT.exit),mainEnd=circuit.point(PIT.exit);assert(Math.hypot(end.x-mainEnd.x,end.y-mainEnd.y)<.01);
const report={exitMaxCurvature,status:'PASS',track:circuit.key,scope:'Integrated physical pit cycle with crew-ready fixture; scene-graph handoff math, not Android visual/FPS QA',maxLimited,minRunout,maxMove,exit,postExit,maxHandoffError,transitions,samples};fs.mkdirSync('reports/pit35',{recursive:true});fs.writeFileSync('reports/pit35/CONTINUITY_'+circuit.key+'.json',JSON.stringify(report,null,2));console.log({...report,samples:undefined});
