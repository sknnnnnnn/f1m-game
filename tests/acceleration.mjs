import {C0} from '../racing/runtime/config.js';
import {initial,step} from '../racing/runtime/frozen/physics.js';
import {highSpeedConfig,gearCommand,prepareGearShift,SHIFT_SECONDS} from '../engine/physics/vehicle-preset.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const c=highSpeedConfig(C0),s=initial(c),box={},times={},shifts=[];
for(let i=0;i<2400;i++){
 const cmd=gearCommand(c,s,{tick:s.tick,expires:s.tick,throttle:1,brake:0,steer:0,energy:false},box);
 prepareGearShift(s,cmd);
 const old=s.gear;step(c,s,cmd);
 if(old!==s.gear)shifts.push({time:s.time,gear:s.gear,kph:s.u*3.6});
 for(const v of [100,200,300])if(!times[v]&&s.u*3.6>=v)times[v]=s.time;
}
// A real gearbox command leaves the old gear active for the torque cut,
// then the frozen actuator changes it on the third 8.333 ms physical substep.
const test=initial(c,{u:40,gear:2,shiftTarget:2});
const shift={tick:0,expires:0,throttle:1,brake:0,steer:0,gear:3};
prepareGearShift(test,shift);assert.equal(test.gear,2);
step(c,test,shift);assert.equal(test.gear,2);
step(c,test,{...shift,tick:1,expires:1});assert.equal(test.gear,3);
assert.equal(gearCommand(c,{...s,E:0},{throttle:1,brake:0},{}).energy,false);
assert.equal(gearCommand(c,s,{throttle:1,brake:1},{}).energy,false);
assert(s.E>=0&&s.E<=c.capacity);assert(s.u*3.6>300);
const baseline=JSON.parse(fs.readFileSync(new URL('../evidence/ACCELERATION_05.json',import.meta.url)));
assert(times[100]<=baseline.times[100]);assert(times[200]<baseline.times[200]*.95);assert(times[300]<baseline.times[300]*.8);
const result={scope:'Node straight-line physical full-throttle, no draft, dry tyres, initial half hybrid store; not a browser timing',energyRemaining:s.E,config:{ratios:c.ratios,shiftSeconds:SHIFT_SECONDS},times,shifts,finalKPH:s.u*3.6};
console.log(JSON.stringify(result,null,2));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));
