import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import fs from 'node:fs';
import * as original from '../racing/runtime/frozen/physics.js';
import * as fast from '../engine/physics/solver53.js';
import {C0} from '../racing/runtime/config.js';
import {highSpeedConfig} from '../engine/physics/vehicle-preset.js';
let oldMS=0,newMS=0,steps=0,matchedFailures=[];
for(const speed of [0,25,65,95])for(const rain of [0,2]){
 const c=highSpeedConfig(C0),a=original.initial(c,{u:speed}),b=structuredClone(a);a.E=b.E=c.capacity*.7;
 const surface=(x,y)=>({water:rain+(y>0?.4:0),mu:y>0?.85:1,abrasion:1});
 for(let i=0;i<35;i++){
  const command={tick:a.tick,expires:a.tick,throttle:i<20?1:0,brake:i<20?0:.7,steer:speed===0?.02:.025*Math.sin(i/12),gear:speed>60?6:1,energy:i<10};
  let t=performance.now();let ra,rb,ea,eb;try{ra=original.step(c,a,command,{surface});}catch(e){ea=e.message;}oldMS+=performance.now()-t;t=performance.now();try{rb=fast.step(c,b,command,{surface});}catch(e){eb=e.message;}newMS+=performance.now()-t;assert.equal(eb,ea);assert.deepEqual(b,a);assert.deepEqual(rb,ra);if(ea){matchedFailures.push({speed,rain,step:i,error:ea});break;}steps++;
 }
}
const result={status:'PASS',steps,matchedFailures,scenarios:8,stateAndRecords:'bit-for-bit equal',originalMS:oldMS,optimisedMS:newMS,speedup:oldMS/newMS};fs.mkdirSync('reports/grid53',{recursive:true});fs.writeFileSync('reports/grid53/SOLVER.json',JSON.stringify(result,null,2));console.log(result);
