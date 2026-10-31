import {circuit} from '../engine/tracks/track.js';
import assert from 'node:assert/strict';
import {overtakeConfig60} from '../engine/race/overtake60.js';
import {highSpeedConfig} from '../engine/physics/vehicle-preset.js';import {C0} from '../racing/runtime/config.js';import {initial} from '../racing/runtime/frozen/physics.js';import {step} from '../engine/physics/mobile57.js';
const base=highSpeedConfig(C0),fixture=()=>({id:2,finishedAt:null,pit:{active:false},projection:{s:100,d:0,k:0},state:{time:180,u:65,v:0,r:0,delta:0,E:base.capacity*.6,brake:0},agent:{state:'PASS_COMMIT',runway47:500,raceContext:{progress:6500,length:5500},resources:{allowDeploy:true,reserve:.1},duel:{pass:{id:1}},perception:{cars:[{id:1,gap:30,pit:false}]}}});
const c=fixture(),before=structuredClone(c.state),burst=overtakeConfig60(base,c);assert.equal(burst.deployW,base.deployW*1.5);assert.equal(burst.motorTorque,base.motorTorque*1.2);assert.deepEqual(c.state,before);assert.equal(base.deployW,600000);
for(const flag of ['YELLOW','RED','VSC'])assert.equal(overtakeConfig60(base,fixture(),flag),base);
for(const patch of [{pit:{active:true}},{finishedAt:70},{id:23},{projection:{k:.01}},{state:{time:20,u:65,v:0,E:base.capacity,brake:0}},{state:{time:180,u:65,v:0,E:0,brake:0}},{state:{time:180,u:65,v:0,E:base.capacity,brake:.4}}])assert.equal(overtakeConfig60(base,Object.assign(fixture(),patch)),base);
for(const patch of [{engineerOrder:{energy:'SAVE'}},{engineerOrder:{pace:'CONSERVE'}},{engineerOrder:{attack:'ABORT'}},{state:'CRUISE'},{recovery:true},{pitApproach:true},{runway47:150},{wetTow44:true},{resources:{allowDeploy:false}},{perception:{cars:[]}}]){const c=fixture();Object.assign(c.agent,patch);assert.equal(overtakeConfig60(base,c),base);}
const one=initial(base,{u:65,gear:6,shiftTarget:6});one.E=base.capacity*.8;one.throttle=1;one.wheels.forEach(w=>w.omega=65/base.R);const two=structuredClone(one),E=one.E;let energy1=0,energy2=0;
for(let i=0;i<60;i++){const cmd={tick:one.tick,expires:one.tick+1,throttle:1,brake:0,steer:0,gear:6,energy:true};energy1+=step(base,one,cmd).records.reduce((a,r)=>a+r.deployActual,0);energy2+=step(burst,two,{...cmd,tick:two.tick,expires:two.tick+1}).records.reduce((a,r)=>a+r.deployActual,0);}
assert(two.u>one.u);assert(energy2>energy1);assert(two.E<one.E&&two.E>=0&&one.E<E);
console.log({status:'PASS',finiteBurst:{baseSpeed:one.u,burstSpeed:two.u,baseEnergyUsed:energy1,burstEnergyUsed:energy2},playerOrdersFlagsPitRecoveryLaunchAndBrakingWindowRespected:true});

const firstLap=fixture();firstLap.agent.raceContext.progress=1000;firstLap.state.time=45;assert.equal(overtakeConfig60(base,firstLap)!==base,circuit.key!=='suzuka');
