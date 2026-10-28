import assert from 'node:assert/strict';
import fs from 'node:fs';
import {preparePass47,armCounter47} from '../engine/ai/pass-timing47.js';
import {upcomingBend} from '../engine/ai/racecraft.js';
import {towAttack46,applyAttackEnergy46} from '../engine/ai/tow-attack46.js';
import {explainPass46} from '../engine/race/pass-evidence46.js';
import {passCaption46} from '../engine/ui/pass-caption46.js';
import {circuit} from '../engine/tracks/track.js';
const station=circuit.samples.find(q=>Math.abs(q.k)<.002&&(()=>{const b=upcomingBend(q.s,250);return b&&b.distance>=100&&b.distance<=160;})());assert(station);
const make=()=>({id:1,duel:{pass:{id:2,started:90},gaps:new Map(),passesSuffered:0},racecraft:{action:'COMMIT'},personality:{pace:92,commit:1.5},raceContext:{flag:'GREEN',remaining:5000}}),p={own:{s:station.s,k:station.k,d:0},speed:60,cars:[{id:2,gap:60,pit:false,relativeSpeed:-2,lateral:0}]};
let a=make();assert(preparePass47(a,{time:100,brake:0},p));assert.equal(a.duel.pass,null);assert.equal(a.racecraft.action,'WAIT');assert.equal(a.passAudit47.resets,1);
assert(!preparePass47(make(),{time:100,brake:.8},p));assert(!preparePass47(make(),{time:100,brake:0},{...p,cars:[{...p.cars[0],gap:15}]}));assert(!preparePass47(make(),{time:20,brake:0},p),'standing-start safety behaviour is retained');
a=make();a.duel.pass=null;a.tow44=.8;a.commitUntil=0;a.perception={own:{k:0},speed:60,cars:[{id:2,gap:80,pit:false}]};a.resources={fraction:.5,allowDeploy:true,reserve:.2};a.runway47=500;
const d={choice:0,pace:92,mode:'FOLLOW',reason:'fixture'};
towAttack46(a,{time:100,brake:0},{...p,cars:[{...p.cars[0],gap:80,relativeSpeed:3}]},()=>true,d,500);assert.notEqual(a.towAttack46.phase,'BANK','do not bank while the rival is pulling away');
a.towAttack46={phase:'BANK',until:101};applyAttackEnergy46(a,{time:100});assert.equal(a.resources.mode,'TOW_ACCEL');assert(a.resources.allowDeploy,'use finite ERS to build closing speed before pulling out on a long straight');
a.towAttack46.phase='IDLE';a.runway47=100;applyAttackEnergy46(a,{time:100});assert.equal(a.resources.mode,'EXIT_BANK');assert(!a.resources.allowDeploy);
a.engineerOrder={energy:'SAVE'};a.towAttack46={phase:'COMMIT',until:101};applyAttackEnergy46(a,{time:100});assert(!a.resources.allowDeploy);
const loser={id:1,finishedAt:null,pit:{active:false},agent:make()},winner={id:2,pit:{active:false}};armCounter47(loser,winner,100);assert.equal(loser.agent.duel.counter.id,2);assert.equal(loser.agent.duel.counter.until,160);
const evidence=explainPass46({agent:loser.agent,state:{time:101,brake:0,lastAx:1}},{id:2,state:{brake:0,lastAx:0}});assert(evidence.counter47);assert(passCaption46({time:102,events:[{kind:'OVERTAKE',time:101,by:1,of:2,...evidence}]},1).startsWith('แซงคืนสำเร็จ'));
const pendingLoser={id:1,finishedAt:null,pit:{active:false},agent:make()};armCounter47(pendingLoser,winner,20);assert(pendingLoser.agent.pendingCounter47);assert(!pendingLoser.agent.duel.counter);preparePass47(pendingLoser.agent,{time:30,brake:0},p);assert.equal(pendingLoser.agent.duel.counter.id,2);assert.equal(pendingLoser.agent.pendingCounter47,null);
fs.writeFileSync('reports/battles47/UNIT.json',JSON.stringify({status:'PASS',beforeBrakeReset:true,nearbyAndLaunchPreserved:true,noBankWhenLosingGround:true,stagedFiniteERS:true,playerSave:true,eventArmedCounterAndCaption:true},null,2));console.log('PASS pass timing reset, close/launch exclusions, bank/ERS window, player overrides and observed counterattack caption');

const {racingPath,pathOffset}=await import('../engine/tracks/racing-path.js');
const at={...circuit.at(300),s:300,d:0},body={time:100,u:60,v:0,r:0,psi:at.psi,lastAx:0};
const passCurve=racingPath(null,body,at,2.6);assert(passCurve.racing.fixed47);for(const ds of [130,250,500,900])assert(Math.abs(pathOffset(passCurve,at.s+ds)-2.6)<1e-10,'the passing corridor must not snake with the ideal apex line after the join');
const launchCurve=racingPath(null,{...body,time:20},at,2.6);assert(!launchCurve.racing.fixed47);
console.log('PASS fixed road-relative passing corridor after30s, bounded smooth join and preserved launch geometry');

const {scoreLines}=await import('../engine/ai/battle-planner.js'),{highSpeedConfig}=await import('../engine/physics/vehicle-preset.js'),{C0}=await import('../racing/runtime/config.js');
const cfg={...highSpeedConfig(C0),driverBraking:'LATE_ENTRY'},ag={config:cfg,personality:{corner:1,exit:7,risk:.6},style:{tyreCare:.5,lateApex:.5},tyreManagement:{exitFactor:1}},st={time:100,wheels:Array.from({length:4},()=>({Ts:90,wear:0,damage:0}))},per={own:{s:circuit.turns[0].s-200,k:0,d:0},speed:60,cars:[{id:2,gap:35,pit:false,lateral:0}]};
const dry=scoreLines(ag,st,per,()=>true),wet=scoreLines({...ag,config:{...cfg,mu:cfg.mu*.25}},st,per,()=>true);assert(dry.brakingMS2>9&&dry.brakingMS2<=22);assert(wet.brakingMS2<dry.brakingMS2);
console.log('PASS planner braking reserve follows actual dry/wet grip and torque budget instead of fixed9m/s2');

const {initial,step}=await import('../racing/runtime/frozen/physics.js');
function harvest(config){const state=initial(config,{X:0,Y:0,psi:0,u:70,gear:7,shiftTarget:7,E:config.capacity*.3});state.E=config.capacity*.3;let joules=0;for(let i=0;i<120;i++){const result=step(config,state,{tick:state.tick,expires:state.tick,throttle:0,brake:.3,steer:0,gear:7,energy:false});joules+=result.records.reduce((v,r)=>v+r.regenActual,0);}return {u:state.u,x:state.X,E:state.E,joules};}
const legacyHarvest=harvest({...cfg,regenW:100000,regenFraction:.25}),newHarvest=harvest((await import('../engine/physics/hybrid-recovery47.js')).recoveryConfig47(cfg));assert(newHarvest.joules>legacyHarvest.joules);assert(Math.abs(newHarvest.u-legacyHarvest.u)<1e-5&&Math.abs(newHarvest.x-legacyHarvest.x)<1e-4,'regen replaces friction brake torque; it must not add braking force');assert(newHarvest.E<=cfg.capacity&&newHarvest.E>cfg.capacity*.3);
fs.writeFileSync('reports/battles47/HARVEST.json',JSON.stringify({legacy:legacyHarvest,release:newHarvest,capacity:cfg.capacity,scope:'Frozen integrator, identical70m/s start and0.3brake for2seconds. Higher recovered energy with matching physical braking, no deployment or energy injection.'},null,2));
console.log('PASS higher measured braking-energy recovery, same braking motion and finite8MJ capacity');

const {speedLimit47}=await import('../engine/physics/speed-limit47.js');const demand={throttle:1,brake:0,steer:0,gear:8,energy:true};assert.strictEqual(speedLimit47(cfg,{u:100,v:0},demand),demand);const fast={u:104.5,v:0},poseBefore=JSON.stringify(fast),limited=speedLimit47(cfg,fast,demand);assert.equal(limited.throttle,.5);assert(!limited.energy);assert.equal(JSON.stringify(fast),poseBefore);
const fastState=initial(cfg,{X:0,Y:0,psi:0,u:104.5,gear:8,shiftTarget:8});let peak=fastState.u;for(let i=0;i<120;i++){const command=speedLimit47(cfg,fastState,{...demand,tick:fastState.tick,expires:fastState.tick});step({...cfg,CdA:cfg.CdA*.044},fastState,command);peak=Math.max(peak,fastState.u);}assert(peak<106,'physical torque taper must keep a powered low-drag car inside the unchanged envelope');
console.log('PASS overspeed torque/ERS taper, clear-road no-op, no velocity writes and actual powered low-drag integrator stays below106m/s');

const {LivingSession26}=await import('../engine/race/living-session26.js'),{saveWeekend,loadWeekend}=await import('../engine/race/weekend-save.js');const session=new LivingSession26(),stored=session.race.cars[0].state;stored.u=104.5;stored.v=0;for(const w of stored.wheels)w.omega=stored.u/session.race.config.R;assert.equal(loadWeekend(saveWeekend(session)).race.cars[0].state.u,104.5,'save validation must accept a speed inside the unchanged race envelope');stored.u=106.1;assert.throws(()=>loadWeekend(saveWeekend(session)),/SAVE_PHYSICS/);
console.log('PASS valid in-envelope high-speed saves load; values beyond106m/s are still rejected');
