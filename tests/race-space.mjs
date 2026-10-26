import assert from 'node:assert/strict';import fs from 'node:fs';import {StrategyRace} from '../engine/race/strategy-race.js';import {Agent} from '../engine/ai/agent.js';import {initial} from '../racing/runtime/frozen/physics.js';import {circuit} from '../engine/tracks/track.js';
function place(r,c,s,n,v){const p=circuit.point(s,n);c.state=initial(r.configuration(c),{X:p.x,Y:p.y,psi:p.psi,u:v,gear:4,shiftTarget:4});c.agent=new Agent(c.id,c.kind,n,7,c.traits);c.projection=circuit.project(p.x,p.y);c.progress=s;}
const tests=[];
{
 const r=new StrategyRace({laps:5});r.cars=r.cars.slice(0,3);r.cars.forEach((c,i)=>place(r,c,200,[-3.6,0,3.6][i],45));r.prepare();let hold=0;for(let i=0;i<360;i++){assert(r.advance());if(r.cars.some(c=>c.agent.state==='HOLD_SPACE'))hold++;}assert(hold>60);assert(r.maxLateral<4.4);assert.equal(r.stop,null);assert.equal(r.controllerRejections,0);tests.push({name:'Three physical cars share the straight without crossing occupied lanes',status:'PASS',seconds:r.time,holdTicks:hold,maxLateral:r.maxLateral,minClearance:r.minClearance});
}
{
 const r=new StrategyRace({laps:5});r.cars=r.cars.slice(0,2);place(r,r.cars[0],20,0,55);place(r,r.cars[1],2800,0,30);r.cars[0].finishedAt=1;r.cars[0].progress=5*circuit.length+20;r.prepare();for(let i=0;i<1800;i++){assert(r.advance());assert.equal(r.cars[0].lastCommand.energy,false);}assert.equal(r.cars[0].agent.state,'COOLDOWN');assert(r.cars[0].state.u<30);assert(r.cars[0].distance>100);assert(r.maxLateral<4.4);assert.equal(r.stop,null);tests.push({name:'Finished car physically slows and follows the circuit while another racer continues',status:'PASS',seconds:r.time,finalKPH:r.cars[0].state.u*3.6,metresDriven:r.cars[0].distance,maxLateral:r.maxLateral});
}
fs.writeFileSync('evidence/RACE_SPACE_11.json',JSON.stringify({status:'PASS',tests},null,2));console.log(JSON.stringify(tests));
