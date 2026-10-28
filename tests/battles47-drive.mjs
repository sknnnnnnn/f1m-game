import {runPhysicsBatch} from '../engine/runtime/physics-batch.js';
import {serialize,deserialize} from 'node:v8';
import {Agent} from '../engine/ai/agent.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {circuit} from '../engine/tracks/track.js';
import {saveWeekend,loadWeekend} from '../engine/race/weekend-save.js';
const run46=async(proposed,environment)=>{for(const result of runPhysicsBatch({jobs:proposed.map((q,id)=>({id,config:{...q.config,CdA:q.aeroCdA},state:q.next,command:q.out.command,compound:q.car.tyres.compound,pit:q.car.pit.active})),environment})){proposed[result.id].next=result.state;proposed[result.id].result=result.result;}};
const session=process.env.RESUME40?loadWeekend(fs.readFileSync(process.env.RESUME40,'utf8')):new LivingSession26();
let r=session.race;if(process.env.RESTORE40){const proto=Object.getPrototypeOf(r);r=deserialize(fs.readFileSync(process.env.RESTORE40));Object.setPrototypeOf(r,proto);for(const c of r.cars)Object.setPrototypeOf(c.agent,Agent.prototype);Object.setPrototypeOf(r.safetyCar.agent,Agent.prototype);r.physicalConfigs=new Map();session.race=r;}
if(!process.env.RESUME40&&!process.env.RESTORE40){r.seed=Number(process.env.SEED40??19);r.laps=Number(process.env.LAPS40??3);r.reset();if(process.env.ALL_MEDIUM40)for(const c of r.cars)c.tyres.compound='M';r.prepare();}
if(process.env.TEAM46){r.selectTeam(Number(process.env.TEAM46));if(process.env.ORDERS46)for(const id of [Number(process.env.TEAM46)*2-1,Number(process.env.TEAM46)*2])r.issueOrder(id,{pace:'ATTACK',energy:'DEPLOY'});}
if(process.env.TYRES46){for(const [i,c]of r.cars.entries())c.tyres.compound=process.env.TYRES46[i];r.prepare();}
if(process.env.GRID46)session.placeGrid(process.env.GRID46.split(',').map(Number));
if(process.env.WET40)r.setWeather('RAIN');
const battle46Counts={};let off=null,sideSeconds=0,nearSeconds=0;const samples=[],passes=process.env.RESTORE40?r.events.filter(e=>e.kind==='OVERTAKE'):[],rejectionDetails=[],start=r.time;
const output=process.env.OUT40??`reports/racing40/${circuit.key}.json`;
for(let i=0;i<55000&&!r.finished&&!r.stop&&r.time<Number(process.env.END40??900);i++){
 for(const c of r.cars)if(['SERVICE','RELEASE'].includes(c.pit.phase)&&r.time-c.pit.serviceStarted>=r.serviceDuration(c)+.2)c.pit.releaseProof29={serviceAt:c.pit.serviceStarted,at:r.time,clear:true};
 if(process.env.LOG_DRS40&&i%15===0){const c=r.cars[1];if(c.projection.s>5300||c.projection.s<750)console.error('DRS40',JSON.stringify({t:r.time,s:c.projection.s,k:c.projection.k,delta:c.state.delta,brake:c.state.brake,v:c.state.u*3.6,target:c.agent.targetSpeed,wing:c.wing24,mode:c.agent.state,reason:c.agent.reason}));}
 const count=r.overtakes,oldRejections=r.controllerRejections;if(!(process.env.PARALLEL46?await r.advanceParallel32(run46):r.advance()))break;
 if(r.controllerRejections>oldRejections)for(const c of r.cars)if(c.lastController?.rejection)rejectionDetails.push({time:r.time,id:c.id,rejection:c.lastController.rejection,mode:c.agent.state,k:c.projection.k,lane:c.agent.targetLane});
 if(r.overtakes>count)passes.push(...r.events.filter(e=>e.kind==='OVERTAKE'&&e.tick===r.tick));
 if(i%30===0){for(const c of r.cars){const key=(c.agent.towAttack46?.phase??'IDLE')+'/'+c.agent.state+'/'+c.agent.resources?.mode;battle46Counts[key]=(battle46Counts[key]??0)+1;}const active=r.cars.filter(c=>!c.pit.active&&c.finishedAt===null);for(const c of active)if(Math.abs(c.projection.d)+r.config.width/2>circuit.width/2+.05)off??={id:c.id,time:r.time,d:c.projection.d};
  if(r.time>Math.min(...r.timing().map(t=>t.laps[0]??Infinity)))for(let a=0;a<active.length;a++)for(let b=a+1;b<active.length;b++){const g=Math.abs(active[a].progress-active[b].progress);if(g<80)nearSeconds+=.5;if(g<9&&Math.abs(active[a].projection.d-active[b].projection.d)>1.9)sideSeconds+=.5;}
 }
 if(process.env.SNAPSHOT40&&i%3600===0&&r.time>30)fs.writeFileSync(process.env.SNAPSHOT40+'-'+Math.round(r.time)+'.bin',serialize(r));
 if(i%600===0){const rows=r.ranking().map(c=>({id:c.id,lap:c.lap,s:Math.round(c.projection.s),d:+c.projection.d.toFixed(2),gap:+(r.ranking()[0].progress-c.progress).toFixed(1),kph:+(Math.hypot(c.state.u,c.state.v)*3.6).toFixed(1),mode:c.agent.state,reason:c.agent.reason,target:c.agent.targetLane,racing:!!c.agent.curve.racing,limit:c.agent.trafficLimit,brake:c.state.brake,throttle:c.state.throttle,energy:+(c.state.E/r.config.capacity).toFixed(2)}));samples.push({time:r.time,cars:rows});console.error(circuit.key,Math.round(r.time),'passes',r.overtakes,'gaps',rows.map(x=>x.gap).join(','));}
 if(process.env.CHECKPOINT40&&r.time>=Number(process.env.CHECKPOINT_AT40??100)){fs.writeFileSync(process.env.CHECKPOINT40,saveWeekend(session));break;}
}
const firstLap=Math.min(...r.timing().map(t=>t.laps[0]??Infinity));
const result={audits47:r.cars.map(c=>({id:c.id,...c.agent.passAudit47})),battle46Counts,track:circuit.key,seed:r.seed,laps:r.laps,start,time:r.time,finished:r.finished,stop:r.stop,rejections:r.controllerRejections,rejectionDetails,off,stopCars:r.stop?r.cars.filter(c=>r.stop.cars?.includes(c.id)).map(c=>({id:c.id,state:c.state,projection:c.projection,agent:{mode:c.agent.state,reason:c.agent.reason,curve:c.agent.curve,target:c.agent.targetLane,plan:c.agent.plan,history:c.agent.history.slice(-8)},command:c.lastCommand})):null,retired:r.cars.filter(c=>c.live26.retired).map(c=>c.id),latePasses:passes.filter(e=>e.time>firstLap),passes,sideSeconds,nearSeconds,timing:r.timing(),results:r.results(),samples};
fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,samples:undefined,results:undefined,timing:undefined}));
assert(!r.stop&&!r.controllerRejections&&!off&&!result.retired.length);
if(!process.env.CHECKPOINT40&&!process.env.END40)assert(r.finished);
