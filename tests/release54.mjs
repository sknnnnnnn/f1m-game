import assert from 'node:assert/strict';import fs from 'node:fs';
import {LivingSession26} from '../engine/race/living-session26.js';
import {compactFrame54} from '../engine/runtime/presentation54.js';
import {VisualBuffer} from '../engine/rendering/presentation.js';
import {VisualBuffer as OldBuffer} from './fixtures/presentation53.js';
import {BufferLease54} from '../engine/rendering/buffer-lease54.js';
import {RacePerformance54} from '../engine/rendering/race-performance54.js';
import {configureMenuSession49,advanceMenuSession49,resetMenuSession53} from '../engine/race/menu-session49.js';
import {saveWeekend,loadWeekend} from '../engine/race/weekend-save.js';
import {validatePitPlan,makePitPlan,pitCornerSpeed35} from '../engine/pit/pit-reference.js';
import {PIT,pitRoad,pitStopStation,stallStation} from '../engine/pit/pit-lane.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {SAVE_MAX_BYTES54} from '../engine/race/save-limits54.js';
const session=new LivingSession26();configureMenuSession49(session,{mode:'QUICK',stage:'RACE',team:11,laps:1,weather:'DRY',setup:'BALANCED'});
const r=session.race;const full=session.presentation(),before=JSON.stringify(full);r.presentationTeam54=true;const compact=compactFrame54(session.presentation());delete r.presentationTeam54;assert.equal(JSON.stringify(full),before);assert.equal(compact.cars.length,22);assert.equal(compact.engineer.cars.filter(c=>c.forecast!==null).length,2);
for(const c of compact.cars){assert.equal(c.agent.plan,null);assert.deepEqual(c.state,full.cars.find(x=>x.id===c.id).state);if(c.id<21)assert.equal(c.intelligence,undefined);else assert.deepEqual(c.intelligence,full.cars.find(x=>x.id===c.id).intelligence);}
const byteLength=x=>Buffer.byteLength(JSON.stringify(x)),transport={fullBytes:byteLength(full),compactBytes:byteLength(compact)};assert(transport.compactBytes<transport.fullBytes*.65);
const old=new OldBuffer(140),now=new VisualBuffer(140);let comparisons=0;
for(let tick=1;tick<=35;tick++){const cars=full.cars.map(c=>({...c,state:{...c.state,X:c.id+tick,Y:c.id-tick,psi:tick*.01,delta:tick*.001,time:tick/20,lastAx:1,lastAy:2,wheelAngles:[tick,tick,tick,tick]}}));for(const buffer of [old,now])buffer.push(cars,tick*50,true,tick);for(const at of [tick*50-180,tick*50,tick*50+190]){assert.deepEqual(now.sample(at,true),old.sample(at,true));comparisons++;}}
const allocations=[],renderer={cpu:false,setDrawingBufferSize:(...args)=>allocations.push(args)},lease=new BufferLease54(renderer);assert(lease.park());assert(!lease.park());assert.deepEqual(allocations,[[1,1,1]]);assert(lease.resume());assert(!lease.resume());
const metrics=new RacePerformance54();for(let n=0;n<=1900;n++)metrics.paint(n*1000/60,{renderer:'WebGL',pack:true});assert.equal(metrics.report().samples[0].deviceValidation,'MEASURED');assert(Math.abs(metrics.report().samples[0].fps-60)<1e-8);metrics.idle();metrics.paint(999999,{renderer:'WebGL'});assert.equal(metrics.report().samples.length,1);const cpu=new RacePerformance54();for(let n=0;n<2200;n++)cpu.paint(n*20,{renderer:'CPU'});assert.equal(cpu.report().samples[0].deviceValidation,'INSUFFICIENT');
for(const c of r.cars){const config=r.configuration(c),S=pitStopStation(c.id)-12,q=pitRoad(c.id).at(S),state=initial(config,{X:q.x,Y:q.y,psi:q.psi,u:4});const plan=makePitPlan(config,state,{...c,pit:{...c.pit,phase:'PIT_IN'}},[]);assert.equal(validatePitPlan(config,state,plan),null,'car '+c.id+' pit plan');assert.equal(pitCornerSpeed35(config,.06,stallStation(c.id)),Math.sqrt(.5*config.mu*config.g/(.06-.5*config.mu*.5*config.rho*config.ClA/config.m)));}
assert(SAVE_MAX_BYTES54>=32000000);const restored=loadWeekend(saveWeekend(session));assert.equal(restored.race.engineer.team,11);assert.equal(restored.race.laps,1);resetMenuSession53(restored);assert.equal(restored.race.engineer.team,11);
configureMenuSession49(session,{mode:'WEEKEND',stage:'RACE',team:7,laps:4,weather:'RAIN',setup:'WET'});advanceMenuSession49(session);const quali=loadWeekend(saveWeekend(session));assert.equal(quali.stage,'QUALIFYING');assert.equal(quali.race.engineer.team,7);advanceMenuSession49(quali);assert.equal(quali.stage,'RACE');assert.equal(quali.race.laps,4);assert.equal(quali.race.weather.mode,'RAIN');
const result={status:'PASS',transport,poseComparisons:comparisons,all22PitPlans:true,all22BaySpeedBudgets:true,inactiveBufferParking:true,passiveLiveFPS:true,cpuNotAcceptedAsGPUProof:true,teamSaveResetAndWetWeekend:true,saveLimitBytes:SAVE_MAX_BYTES54};fs.mkdirSync('reports/release54',{recursive:true});fs.writeFileSync('reports/release54/UNIT.json',JSON.stringify(result,null,2));console.log(result);
