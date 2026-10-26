import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {VisualBuffer} from '../engine/rendering/presentation.js';import {circuit} from '../engine/tracks/track.js';import * as broadcast from '../engine/rendering/broadcast.js';
const {CameraDirector}=await import(process.argv[2]??'../engine/rendering/cameras.js');
const baseline=Boolean(process.argv[2]);
const car=(id,t)=>({id,state:{X:70*t+(id===2?8:0),Y:id===2?3:0,psi:0,u:70,v:0,time:t,delta:0,lastAx:0,lastAy:0,wheelAngles:[0,0,0,0],wheels:[0,0,0,0].map(()=>({omega:70/.34}))}});
const series=[];
for(const hz of [30,60,90,120])for(const packetMS of [45,70])for(const aspect of [390/844,16/9]){
 const buffer=new VisualBuffer(100),d=new CameraDirector(T,circuit);d.mode='cinema';d.camera.aspect=aspect;let packetAt=0,latest=null,previous=null,maxStep=0,sum=0,count=0;
 for(let i=0;i<hz*5;i++){const now=i*1000/hz;while(packetAt<=now){latest={cars:[car(1,packetAt/1000),car(2,packetAt/1000)]};buffer.push(latest.cars,packetAt,true,Math.round(packetAt*60/1000));packetAt+=packetMS;}
  const shown=buffer.sample(now,true);let story={shot:'duel',kind:'BATTLE',partnerId:2,partner:latest.cars[1].state};
  if(!baseline)story=broadcast.resolveCameraStory(story,shown);
  d.story=story;const camera=d.update(shown[0],new T.Group(),shown[0].state.time,1/hz);camera.updateMatrixWorld(true);
  const point=new T.Vector3(shown[0].state.X,.6,-shown[0].state.Y).project(camera);
  if(i>hz&&previous){const step=point.distanceTo(previous);maxStep=Math.max(maxStep,step);sum+=step*step;count++;}previous=point;
 }
 series.push({hz,packetMS,aspect,maxFrameNDCStep:maxStep,rmsFrameNDCStep:Math.sqrt(sum/count)});
}
const stationary=[];
for(const aspect of [390/844,16/9]){
 const d=new CameraDirector(T,circuit);d.mode='cinema';d.camera.aspect=aspect;d.story={shot:'trackside'};let anchor=null,maxAnchorJump=0,oldFov=null,maxFovStep=0;
 for(let i=0;i<360;i++){const q=circuit.at(400+70*i/60),state={X:q.x,Y:q.y,psi:q.psi,u:70,v:0,time:i/60};d.update({id:1,state},new T.Group(),i/60,1/60);if(anchor)maxAnchorJump=Math.max(maxAnchorJump,d.camera.position.distanceTo(anchor));anchor=d.camera.position.clone();if(oldFov!==null)maxFovStep=Math.max(maxFovStep,Math.abs(d.camera.fov-oldFov));oldFov=d.camera.fov;}
 stationary.push({aspect,maxAnchorJump,maxFovStep});
}
const result={scope:'Node presentation timing and camera math, rigid pair at 252 km/h, actual VisualBuffer with asynchronous packets; not browser FPS or full-race QA',series,stationary};
if(!baseline){
 for(const row of series)assert(row.maxFrameNDCStep<1e-5,JSON.stringify(row));
 for(const row of stationary){assert(row.maxAnchorJump<1e-8,JSON.stringify(row));assert(row.maxFovStep<.6,JSON.stringify(row));}
 // Raw publication order and pair gaps cannot interrupt an existing shot.
 const b=new broadcast.BroadcastDirector();const make=(id,s)=>{const p=circuit.at(s);return {id,state:{X:p.x,Y:p.y,psi:p.psi,u:70,v:0}};};
 const frame={phase:'RACE',time:1,cars:[make(1,400),make(2,420),make(3,700)],snapshot:{cars:[{id:1},{id:2},{id:3}]},moments:[]};
 const start=b.update(frame,1);for(let i=1;i<=200;i++){const time=1+i*.02;frame.cars=[make(1,400+70*(time-1)),make(2,406+70*(time-1)),make(3,700+70*(time-1))];const q=b.update(frame,time);assert.equal(q.id,start.id);assert.equal(q.story.shot,start.story.shot);assert.equal(q.story.partnerId,start.story.partnerId);assert.equal(q.switched,false);}
 // A composition change includes partner identity, even if focus and shot match.
 frame.cars=[make(1,1000),make(2,1400),make(3,1005)];frame.time=9;const next=b.update(frame,9);assert.equal(next.story.partnerId,3);assert(next.switched);
 const immutable=JSON.stringify(frame);broadcast.resolveCameraStory(next.story,frame.cars);assert.equal(JSON.stringify(frame),immutable);
 result.director={heldAcrossPackets:200,partnerChangesDetected:true,sourceUnmodified:true};
}
fs.writeFileSync(baseline?'evidence/CINEMA_07_BASELINE.json':'evidence/CINEMA_SMOOTH_08.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({baseline,cases:series.length,maxFrameNDCStep:Math.max(...series.map(r=>r.maxFrameNDCStep)),stationary,director:result.director}));
