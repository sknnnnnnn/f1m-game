import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Race} from '../engine/race/engine.js';
import {Agent} from '../engine/ai/agent.js';
import {initial,step} from '../racing/runtime/frozen/physics.js';
import {circuit} from '../engine/tracks/track.js';
import {racingOffset} from '../engine/tracks/racing-line.js';
import {draftFactor} from '../engine/ai/draft.js';
const tests=[];
function check(name,fn){const details=fn();tests.push({name,status:'PASS',details});console.log('PASS',name);}
function setup(stations,speeds,traits=[]){const r=new Race({laps:3});r.cars=r.cars.slice(0,stations.length);for(const [i,c] of r.cars.entries()){const p=circuit.point(stations[i]);c.state=initial(r.config,{X:p.x,Y:p.y,psi:p.psi,u:speeds[i],gear:speeds[i]>55?6:3,shiftTarget:speeds[i]>55?6:3});c.agent=new Agent(c.id,c.kind,0,7,{...c.traits,...traits[i]});c.projection=circuit.project(p.x,p.y);c.progress=stations[i];}r.prepare();for(const [i,c] of r.cars.entries()){c.agent.targetSpeed=speeds[i];c.agent.acceleration=0;c.agent.plan=null;}return r;}
check('Wake requires a real aligned on-track car ahead; pit cars cannot provide it',()=>{
 const r=setup([100,40],[65,65]);const follower=r.cars[1],field=r.cars.map(c=>({id:c.id,state:c.state,projection:c.projection}));const aligned=draftFactor(follower,field);assert(aligned>.5);assert.equal(draftFactor(follower,[{...field[0],pit:{active:true}},field[1]]),0);assert.equal(draftFactor(follower,[{...field[0],projection:{...field[0].projection,d:3.5}},field[1]]),0);return {aligned};
});
check('Identical physical throttle, gear and energy produce greater acceleration with less drag',()=>{
 const r=new Race(),c=r.config,p=circuit.point(0),a=initial(c,{X:p.x,Y:p.y,psi:p.psi,u:65,gear:6,shiftTarget:6}),b=structuredClone(a);for(let tick=0;tick<180;tick++){const cmd={tick,expires:tick,throttle:1,brake:0,steer:0,gear:6,energy:false};step(c,a,cmd);step({...c,CdA:c.CdA*.72},b,cmd);}assert(b.u>a.u+.1);assert.equal(a.E,b.E);return {seconds:3,cleanKPH:a.u*3.6,towKPH:b.u*3.6,advantageKPH:(b.u-a.u)*3.6,unchangedEnginePower:c.enginePower};
});
check('The legal geometric candidate smooths curvature without assigning a car path or result',()=>{
 let baseEnergy=0,lineEnergy=0,maxOffset=0;const h=6;for(let s=0;s<circuit.length;s+=h){const p=circuit.point(s,racingOffset(s)),a=circuit.point(s-h,racingOffset(s-h)),b=circuit.point(s+h,racingOffset(s+h));const dx=(b.x-a.x)/(2*h),dy=(b.y-a.y)/(2*h),ddx=(b.x-2*p.x+a.x)/(h*h),ddy=(b.y-2*p.y+a.y)/(h*h),k=(dx*ddy-dy*ddx)/Math.hypot(dx,dy)**3;baseEnergy+=circuit.at(s).k**2;lineEnergy+=k*k;maxOffset=Math.max(maxOffset,Math.abs(circuit.project(p.x,p.y).d));}console.log('LINE_ENERGY',JSON.stringify({maxOffset,lineEnergy,baseEnergy,ratio:lineEnergy/baseEnergy}));assert(maxOffset<3.11);assert(lineEnergy<baseEnergy*.96);return {baseEnergy,lineEnergy,ratio:lineEnergy/baseEnergy,maxOffset};
});
for(const scenario of [{name:'T3 flowing exit',s:920,v:30,turn:3,seconds:3},{name:'T5 gentle bend',s:1670,v:38,turn:5,seconds:3},{name:'T1 heavy braking',s:550,v:70,turn:1,seconds:8}])check('Physical corner choice: '+scenario.name,()=>{
 const r=setup([scenario.s],[scenario.v]);let samples=0,braking=0,accelerating=0,maxBrake=0,minKPH=999;const turn=circuit.turns[scenario.turn-1];for(let tick=0;tick<scenario.seconds*60&&!r.stop;tick++){assert(r.advance());const c=r.cars[0];maxBrake=Math.max(maxBrake,c.lastCommand.brake);minKPH=Math.min(minKPH,c.state.u*3.6);if(Math.abs(circuit.delta(c.projection.s,turn.s))<35){samples++;if(c.lastCommand.brake>.02)braking++;if(c.lastCommand.throttle>.6&&c.lastCommand.brake<.01)accelerating++;}}assert.equal(r.stop,null);assert.equal(r.controllerRejections,0);if(scenario.turn===1){assert(maxBrake>.3);assert(minKPH<150);}else{assert(samples>0);assert(accelerating>0);}return {samples,braking,accelerating,maxBrake,minKPH,maxLateral:r.maxLateral};
});
function towRun(enabled){const r=setup([5200,5140],[65,65],[{pace:65,defend:0},{pace:94,defend:0}]);if(!enabled)r.draftFor=()=>0;let draftTicks=0,cleanTowBraking=0,maxWake=0,passTime=null;const transitions=[];let mode=null;for(let tick=0;tick<1200&&!r.stop;tick++){assert(r.advance());const c=r.cars[1],a=c.agent;maxWake=Math.max(maxWake,c.draft);if(a.state!==mode){transitions.push({t:r.time,state:a.state,gap:circuit.delta(r.cars[0].projection.s,c.projection.s),lane:c.projection.d});mode=a.state;}if(a.state==='DRAFT'&&c.draft>.1){draftTicks++;if(c.lastCommand.brake>.02&&c.projection.s<450)cleanTowBraking++;}if(passTime===null&&r.events.some(e=>e.kind==='OVERTAKE'&&e.by===2))passTime=r.time;}assert.equal(r.stop,null);assert.equal(r.controllerRejections,0);return {draftTicks,cleanTowBraking,maxWake,passTime,minClearance:r.minClearance,transitions};}
check('Controlled slower rival: build a real tow, pull out, pass physically and leave room',()=>{
 const on=towRun(true),off=towRun(false);assert(on.draftTicks>60);assert(on.passTime!==null);assert(on.transitions.some(x=>x.state==='HOLD_SPACE'));assert(on.passTime<off.passTime||off.passTime===null);assert.equal(off.maxWake,0);return {on,off,scope:'Two cars with explicitly different pace targets; initial poses only, then normal AI/physical controls. Outcomes are not forced.'};
});
fs.writeFileSync('evidence/RACING_INTELLIGENCE_10.json',JSON.stringify({status:'PASS',tests},null,2));
