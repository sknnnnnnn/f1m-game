// Isolated browser camera QA: a rigid synthetic pair exercises real presentation
// modules with asynchronous publication and requestAnimationFrame. Not a race.
import * as T from 'three';
import {VisualBuffer} from '../engine/rendering/presentation.js';
import {CameraDirector} from '../engine/rendering/cameras.js';
import {resolveCameraStory} from '../engine/rendering/broadcast.js';
import {circuit} from '../engine/tracks/track.js';
const buffer=new VisualBuffer(100),d=new CameraDirector(T,circuit),root=new T.Group();d.mode='cinema';d.camera.aspect=390/780;
const start=performance.now(),canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),report=document.querySelector('pre');let tick=0,frames=0,last=start,previous=null,maxNDCStep=0,maxGapMS=0,errors=[];
const make=(id,t)=>({id,state:{X:t*70+(id===2?8:0),Y:id===2?3:0,psi:0,u:70,v:0,time:t,delta:0,lastAx:0,lastAy:0,wheelAngles:[0,0,0,0],wheels:[0,0,0,0].map(()=>({omega:206}))}});
function publish(){const now=performance.now();buffer.push([make(1,(now-start)/1000),make(2,(now-start)/1000)],now,true,++tick);}publish();const timer=setInterval(publish,45);
function frame(now){try{const gap=now-last;last=now;maxGapMS=Math.max(maxGapMS,gap);const cars=buffer.sample(now,true);d.story=resolveCameraStory({shot:'duel',title:'CAMERA QA',partnerId:2},cars);const camera=d.update(cars[0],root,cars[0].state.time,gap/1000);camera.updateMatrixWorld(true);const points=cars.map(c=>new T.Vector3(c.state.X,.6,-c.state.Y).project(camera));
 if(now-start>1500&&previous)maxNDCStep=Math.max(maxNDCStep,points[0].distanceTo(previous));previous=points[0].clone();frames++;
 ctx.fillStyle='#18212d';ctx.fillRect(0,0,390,780);for(const [i,p] of points.entries()){ctx.fillStyle=i?'#61bad4':'#ed4357';ctx.fillRect((p.x*.5+.5)*390-8,(-p.y*.5+.5)*780-16,16,32);}
 const done=now-start>6500,result={scope:'Isolated real-browser presentation test; synthetic rigid pair, not full game/race/FPS acceptance',status:done?(frames>=12&&maxNDCStep<.0001&&!errors.length?'PASS':'INCONCLUSIVE'):'RUNNING',frames,packets:tick,maxGapMS,maxFrameNDCStep:maxNDCStep,errors};report.textContent=JSON.stringify(result,null,2);
 if(!done)requestAnimationFrame(frame);else clearInterval(timer);
 }catch(e){errors.push(String(e));report.textContent=JSON.stringify({status:'FAIL',errors});clearInterval(timer);}}
requestAnimationFrame(frame);
