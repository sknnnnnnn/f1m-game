import {Race} from '../engine/race/engine.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {Agent} from '../engine/ai/agent.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {circuit} from '../engine/tracks/track.js';
import {racecraft} from '../engine/ai/racecraft.js';
import {RACE_STYLES,tyreDemand} from '../engine/ai/personality.js';
import {duelTactics} from '../engine/ai/duel-tactics.js';
import {BroadcastDirector} from '../engine/rendering/broadcast.js';
import {ReplayTape} from '../engine/rendering/replay.js';
import {CameraDirector} from '../engine/rendering/cameras.js';
import {buildTrack} from '../engine/rendering/track-scene.js';
const tests=[];function check(name,fn){const details=fn();tests.push({name,status:'PASS',details});console.log('PASS',name);}
check('Bahrain flat schematic: lap, clockwise turns, closure and unambiguous projection',()=>{
 assert.equal(circuit.length,5412);assert.equal(circuit.width,12);assert.equal(circuit.turns.length,15);
 let rotation=0,maxCurvature=0,maxProjectionError=0;
 for(let s=0;s<5412;s+=4){const q=circuit.at(s),n=circuit.at(s+4);rotation+=Math.atan2(Math.sin(n.psi-q.psi),Math.cos(n.psi-q.psi));maxCurvature=Math.max(maxCurvature,Math.abs(q.k));for(const d of [-4,0,4]){const p=circuit.point(s,d),back=circuit.project(p.x,p.y);maxProjectionError=Math.max(maxProjectionError,Math.abs(circuit.delta(back.s,s)));assert(Math.abs(back.d-d)<.02);}}
 assert(Math.abs(rotation+2*Math.PI)<.02);assert(maxProjectionError<.05);assert(maxCurvature<.085);assert(circuit.turns.filter(t=>t.k<0).length===9);assert(circuit.turns.filter(t=>t.k>0).length===6);
 return {length:5412,turns:15,rotation,maxCurvature,maxProjectionError,scope:'Schematic trace, uniform width and flat physics; not surveyed geometry or elevation'};
});
const decision={choice:0,pace:85,mode:'FOLLOW',reason:'RIVAL AHEAD',turn:-1,corner:false,ideal:0};
function fixture(kind='TACTICIAN'){
 const agent={kind,personality:{risk:.8},targetLane:0,commitUntil:0};
 const state={time:10};const p={own:{...circuit.at(400),d:0},speed:45,cars:[{id:2,gap:45,lateral:0,relativeSpeed:-1,speed:44}]};return {agent,state,p};
}
check('Feint switches outside only after observing an actual defensive response',()=>{
 const f=fixture(),a=racecraft(f.agent,f.state,f.p,()=>true,decision);assert.equal(a.mode,'FEINT');assert(Math.abs(a.choice)<=1.1);
 f.agent.targetLane=a.choice;f.agent.commitUntil=12;f.state.time=13;f.p.own.d=-.9;f.p.cars[0].lateral=-1;
 const b=racecraft(f.agent,f.state,f.p,()=>true,decision);assert.equal(b.mode,'OUTSIDE_SWITCH');assert(b.choice>0);assert.equal(f.agent.racecraft.switches,1);return {initial:a.mode,response:b.mode};
});
check('No defensive response or unsafe space cannot produce an outside switch',()=>{
 const f=fixture();racecraft(f.agent,f.state,f.p,()=>true,decision);f.state.time=12;const a=racecraft(f.agent,f.state,f.p,()=>true,decision);assert.equal(a.mode,'FEINT');assert.equal(f.agent.racecraft.switches,0);
 f.p.cars[0].lateral=-1;f.state.time=13;const b=racecraft(f.agent,f.state,f.p,()=>false,decision);assert.notEqual(b.mode,'OUTSIDE_SWITCH');assert.equal(f.agent.racecraft.switches,0);
 f.p.cars=[];f.state.time=14;racecraft(f.agent,f.state,f.p,()=>true,decision);assert.equal(f.agent.racecraft.action,'PACE');
});
check('Personalities make different choices and tyre conservation follows measured heat',()=>{
 const f=fixture('GUARDIAN');assert.notEqual(racecraft(f.agent,f.state,f.p,()=>true,decision).mode,'FEINT');
 const hot={wheels:Array.from({length:4},()=>({Ts:145,wear:.15}))},cold={wheels:Array.from({length:4},()=>({Ts:90,wear:0}))};
 const guardian=tyreDemand({kind:'GUARDIAN'},hot),attacker=tyreDemand({kind:'ATTACKER'},hot);
 assert(guardian.exitFactor<attacker.exitFactor);assert(guardian.hybridReserve>attacker.hybridReserve);assert.equal(tyreDemand({kind:'GUARDIAN'},cold).exitFactor,1);assert.equal(new Set(Object.values(RACE_STYLES).map(s=>s.label)).size,6);return {guardian,attacker};
});
check('Alongside room overrides an attempted attack and avoids crossing the opponent',()=>{
 const f=fixture();f.agent.duel=undefined;f.agent.targetLane=-2;f.agent.curve={};f.p.own.d=-2;f.p.cars=[{id:2,gap:1,lateral:1.5,relativeSpeed:0,speed:45}];const q=duelTactics(f.agent,f.state,f.p,()=>true,{...decision,choice:3.5,mode:'OUTSIDE_SWITCH'});assert.equal(q.mode,'HOLD_SPACE');assert(q.choice<=-1.9);
});
check('Broadcast picks a real tactical moment and replay retains it without inventing events',()=>{
 const make=(id,ds)=>{const p=circuit.at(400+ds);return {id,state:{X:p.x,Y:p.y,psi:p.psi,u:45,v:0,wheelAngles:[0,0,0,0],wheels:Array.from({length:4},()=>({omega:130}))}};};
 const director=new BroadcastDirector(),frame={phase:'RACE',time:12,tick:720,cars:[make(1,0),make(2,40)],snapshot:{cars:[{id:2},{id:1}]},moments:[{kind:'OUTSIDE_SWITCH',time:11,car:1,by:1,of:2}]};
 const shot=director.update(frame,12);assert.equal(shot.id,1);assert.equal(shot.story.kind,'OUTSIDE_SWITCH');assert.equal(shot.story.partnerId,2);
 const tape=new ReplayTape();for(let t=10;t<=12;t+=.1)tape.record({...frame,time:t,tick:Math.round(t*60)});assert(tape.open());assert.equal(tape.clipMoment.by,1);assert.equal(tape.clipMoment.of,2);assert.equal(tape.moments.length,1);assert(tape.sample(11).every(c=>Number.isFinite(c.state.X)));
});
check('Battle camera fits close pairs and keeps the selected car close when the partner is distant',()=>{
 for(const aspect of [390/844,16/9])for(const gap of [4,8,12,18,45,65]){
  const d=new CameraDirector(T,circuit);d.camera.aspect=aspect;d.set('cinema');d.story={shot:'duel',partner:{X:gap,Y:3}};const camera=d.update({id:1,state:{X:0,Y:0,psi:0,u:50,v:0}},new T.Group(),0,1/60);camera.updateMatrixWorld(true);
  for(const X of (d.effective==='front'?[0]:[0,gap]))for(const dx of [-2.75,2.75]){const q=new T.Vector3(X+dx,.6,X===0?0:-3).project(camera);assert(Math.abs(q.x)<.93&&Math.abs(q.y)<.86,JSON.stringify({aspect,gap,ndc:q.toArray()}));}
 }
});
check('Desert scenery keeps palms off every road branch and batches lighting',()=>{
 const scene=new T.Scene(),scenery=buildTrack(T,scene,circuit);assert(scenery.treeCount>10&&scenery.treeCount<=28);for(const {object,box} of scenery.occlusion.objects){const radius=Math.max(box.max.x-box.min.x,box.max.z-box.min.z)/2;assert(circuit.project(object.position.x,-object.position.z).distance-radius>circuit.width/2+20);}const camera=new T.PerspectiveCamera(60,390/861,.65,1800);camera.position.set(0,5,15);camera.lookAt(0,0,0);camera.updateMatrixWorld();const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));const visible=scene.children.filter(o=>o.isMesh&&frustum.intersectsObject(o)).length;assert(scenery.staticBatches<=40);assert(visible<200);return {palms:scenery.treeCount,materialBatches:scenery.staticBatches,visibleMeshes:visible,scope:'Spatial frustum chunks replace the pre-v13 monolithic color-batch budget.'};
});
check('Physical two-car duel observes defence, feints and switches through real steering',()=>{
 const r=new Race({laps:2});r.cars=r.cars.slice(0,2);
 for(const [i,c] of r.cars.entries()){const station=i?400:450,p=circuit.point(station);c.state=initial(r.config,{X:p.x,Y:p.y,psi:p.psi,u:i?48:45,gear:3,shiftTarget:3});c.agent=new Agent(c.id,c.kind,0,7,c.traits);c.projection=circuit.project(p.x,p.y);c.progress=station;}
 r.prepare();const modes=new Set(),transitions=[];let switchEvidence=null;
 for(let i=0;i<600&&!r.stop;i++){assert(r.advance());const c=r.cars[1];if(!modes.has(c.agent.state)){modes.add(c.agent.state);transitions.push({time:r.time,state:c.agent.state,physicalLane:c.projection.d,target:c.agent.targetLane});if(c.agent.state==='OUTSIDE_SWITCH')switchEvidence={defenderLane:r.cars[0].projection.d,attackerLane:c.projection.d};}}
 assert.equal(r.stop,null);assert.equal(r.controllerRejections,0);assert(modes.has('FEINT')&&modes.has('OUTSIDE_SWITCH'));assert(switchEvidence.defenderLane<-.65);assert(r.cars[1].agent.racecraft.switches===1);assert(r.maxLateral<4.3);
 return {scope:'Controlled initial two-car setup, then 600 real physical ticks; no scripted poses after setup',transitions,switchEvidence,maxLateral:r.maxLateral};
});
fs.writeFileSync('evidence/BAHRAIN_RACECRAFT_07.json',JSON.stringify({status:'PASS',tests},null,2));
