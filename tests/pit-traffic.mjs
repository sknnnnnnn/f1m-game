import assert from 'node:assert/strict';import fs from 'node:fs';import {StrategyRace} from '../engine/race/strategy-race.js';import {initial} from '../racing/runtime/frozen/physics.js';import {Agent} from '../engine/ai/agent.js';import {circuit} from '../engine/tracks/track.js';import {PIT,pitRoad,stallStation} from '../engine/pit/pit-lane.js';
function put(r,c,S,{pit=false,u=15,phase='PIT_IN'}={}){const p=pit?pitRoad(c.id).at(S):circuit.at(S);c.state=initial(r.configuration(c),{X:p.x,Y:p.y,psi:p.psi,u,gear:u>40?5:1,shiftTarget:u>40?5:1});c.agent=new Agent(c.id,c.kind,0,7,c.traits);c.projection=pit?pitRoad(c.id).project(p.x,p.y):circuit.project(p.x,p.y);c.progress=S;c.distance=S;if(pit){Object.assign(c.pit,{phase,active:true,nextCompound:'H',enteredAt:0,cycle:{enteredAt:0,compoundBefore:c.tyres.compound,requested:'H'}});}}
const results=[];
{
 const r=new StrategyRace({laps:3});r.cars=r.cars.slice(0,2);put(r,r.cars[0],PIT.mergeWait-70,{pit:true,phase:'PIT_OUT',u:12});put(r,r.cars[1],PIT.mergeWait-600,{u:70});r.prepare();let steps=0;
 for(let i=0;i<3600&&!r.stop&&!r.cars[0].pit.lastStop;i++){assert(r.advance());steps++;}
 const yielding=r.pitEvents.find(e=>e.kind==='PIT_YIELD'),merging=r.pitEvents.find(e=>e.kind==='PIT_MERGE');assert.equal(r.stop,null);assert(yielding&&merging);assert(merging.time>yielding.time,'Merge must follow the measured traffic yield');assert(r.cars[0].pit.lastStop);results.push({name:'Fast car passes while pit car yields, then physical rejoin',status:'PASS',steps,yieldSeconds:merging.time-yielding.time,events:r.pitEvents,minClearance:r.minClearance});
}
{
 const r=new StrategyRace({laps:3});r.cars=r.cars.slice(0,2);put(r,r.cars[0],stallStation(1)-.2,{pit:true,u:0,phase:'SERVICE'});r.cars[0].pit.serviceStarted=0;r.cars[0].pit.cycle.stoppedAt=0;r.cars[0].pit.cycle.stopPose={X:r.cars[0].state.X,Y:r.cars[0].state.Y};put(r,r.cars[1],stallStation(1)-45,{pit:true,u:15});r.prepare();let maxMove=0;
 for(let i=0;i<8000&&!r.stop&&!r.cars.every(c=>c.pit.lastStop);i++){const before=r.cars.map(c=>({X:c.state.X,Y:c.state.Y}));assert(r.advance());r.cars.forEach((c,j)=>maxMove=Math.max(maxMove,Math.hypot(c.state.X-before[j].X,c.state.Y-before[j].Y)));}
 assert.equal(r.stop,null);assert.equal(r.controllerRejections,0);assert(r.cars.every(c=>c.pit.lastStop&&c.pit.stops===1));assert(maxMove<100*r.config.dt);results.push({name:'Two cars queue and service in neighbouring real stalls, no teleport or overlap',status:'PASS',maxMove,minClearance:r.minClearance,cycles:r.cars.map(c=>c.pit.lastStop),events:r.pitEvents});
}
fs.writeFileSync('evidence/PIT_TRAFFIC_09.json',JSON.stringify({status:'PASS',tests:results},null,2));console.log(JSON.stringify(results));
