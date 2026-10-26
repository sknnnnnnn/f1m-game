import * as T from 'three';
import {prepareCar} from './crew/car-assembly.js';
import {racePitRuntime28} from './crew/service-runtime28.js';
import {createPitRoom} from './crew/pit-room.js';
import {createPitCraft} from './crew/pit-craft.js';
import {pitRoad,pitStopStation} from './pit-lane.js';
const yieldUI=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
export function pitScene28(scene,camera){
 const kits=new Map(),profiles={};let lastTime=-1,generation=null;
 function mark(g){g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){o.userData.modelMesh=true;o.castShadow=true;o.receiveShadow=true;}});}
 function mirrorLabels(root,except){
  const textures=new Map(),materials=new Set(),excluded=new Set();except?.traverse(o=>excluded.add(o.id));
  root.traverse(o=>{if(!o.isMesh||excluded.has(o.id))return;for(const mat of Array.isArray(o.material)?o.material:[o.material]){
   if(!mat||materials.has(mat))continue;materials.add(mat);const tex=mat.map,img=tex?.image;if(!img?.getContext)continue;
   if(!textures.has(tex)){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(img,0,0);const t=tex.clone();t.image=c;t.needsUpdate=true;textures.set(tex,t);}mat.map=textures.get(tex);mat.needsUpdate=true;
  }});
 }
 async function prepare(models,progress=()=>{}){for(const [id,m] of models){
  progress('เตรียมพิตรถ '+id+' / '+models.size);await yieldUI();
  const bay=new T.Group(),work=new T.Group(),dynamic=new T.Group(),v=m.visualScale;bay.name='PIT_FLOW_ORIGINAL_29_'+id;const q=pitRoad(id).at(pitStopStation(id));
  // Reflect the studio bay outward; counter-reflect only the accepted car clone.
  bay.add(work);work.add(dynamic);const garage=createPitRoom(bay),craft=createPitCraft(dynamic,camera),copy=m.root.clone(true);copy.position.set(0,0,0);copy.rotation.set(0,0,0);copy.scale.set(-1,1,1);
  for(const [left,right] of [['FL_Tire','FR_Tire'],['RL_Tire','RR_Tire']]){const a=copy.getObjectByName(left),b=copy.getObjectByName(right);if(a&&b){a.name=right;b.name=left;}}
  for(const child of [...copy.children])if(child.isMesh&&child.geometry?.type==='PlaneGeometry'&&child.material?.transparent)copy.remove(child);
  const source=new T.Group();source.add(copy);const car=prepareCar(source);dynamic.add(car.root);const fronts=[];car.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('FW_'))fronts.push(o);});for(const o of fronts)car.nose.attach(o);
  const api=racePitRuntime28(dynamic,car,garage.obstacles);profiles[id]={};for(const job of ['tyres','combined']){progress('เตรียมพิตรถ '+id+' / '+models.size+' · '+(job==='tyres'?'ยาง':'ยางและปีก'));await yieldUI();profiles[id][job]=api.prepare(job);}
  mark(bay);mirrorLabels(dynamic,car.root);mirrorLabels(garage.room);bay.position.set(q.x,(q.height??0)+.045,-q.y);bay.rotation.y=q.psi-Math.PI/2;bay.scale.set(-v,v,v);scene.add(bay);dynamic.visible=false;
  kits.set(id,{bay,work,dynamic,garage,craft,api,car,v,call:null,job:'tyres',lastService:null,returnAt:null,wasActive:false,completed:false});
 }return profiles;}
 function reset(){for(const k of kits.values()){k.call=null;k.job='tyres';k.lastService=null;k.returnAt=null;k.wasActive=false;k.completed=false;k.dynamic.visible=false;k.craft.sound.silence();k.work.position.set(0,0,0);k.work.quaternion.identity();k.work.scale.set(1,1,1);}}
 function restore(models){for(const m of models.values())for(const wheels of [m.wheels,m.low.wheels])for(const w of wheels)w.spin.visible=true;}
 function update(p,cars,models,time,cpu,replay,audio,running){const proofs=[];if(p.generation!==generation||time<lastTime){reset();generation=p.generation;}lastTime=time;
  for(const [id,k] of kits){k.dynamic.visible=false;if(replay||p.ceremony26)continue;const c=cars.find(c=>c.id===id),m=models.get(id),pit=c?.pit,f=pit?.flow27;if(!c||!m)continue;
   const call=f?(f.cycleId??f.calledAt):null,active=!!(f||pit.active);
   if(call!==null&&call!==k.call){k.call=call;k.job=f.nose?'combined':'tyres';k.lastService=null;k.returnAt=null;k.completed=false;k.work.position.set(0,0,0);k.work.quaternion.identity();k.work.scale.set(1,1,1);}
   if(!active&&k.wasActive)k.returnAt=time;k.wasActive=active;const job=k.job,profile=profiles[id][job];
   if(!active&&(k.returnAt===null||time-k.returnAt>profile.return))continue;
   const serviceAt=f?.serviceAt??pit.serviceStarted,startedNow=Number.isFinite(serviceAt)&&['SERVICE','RELEASE','PIT_OUT','YIELD','MERGE'].includes(pit.phase);
   if(startedNow&&k.lastService!==serviceAt){
    k.lastService=serviceAt;k.returnAt=null;
    // Only the work origin follows the actual stop. The building stays fixed.
    k.bay.updateMatrixWorld(true);const target=new T.Matrix4().compose(new T.Vector3(c.state.X,(pitRoad(id).project(c.state.X,c.state.Y).height??0)+.045,-c.state.Y),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),c.state.psi-Math.PI/2),new T.Vector3(-k.v,k.v,k.v));
    new T.Matrix4().copy(k.bay.matrixWorld).invert().multiply(target).decompose(k.work.position,k.work.quaternion,k.work.scale);
   }
   const returning=k.returnAt!==null,started=startedNow||(returning&&k.lastService!==null),age=startedNow?Math.max(0,time-serviceAt):0,phase=returning&&started?profile.end:started?Math.min(profile.end,profile.start+age):0,done=started&&phase>=profile.release;
   if(done)k.completed=true;let crewMode=null,crewTime=0;if(returning){crewMode='return';crewTime=time-k.returnAt;}else if(!started){crewMode='deploy';crewTime=Math.max(0,time-(f?.calledAt??time));}
   const transforms=[k.bay,k.work].map(g=>({g,position:g.position.clone(),quaternion:g.quaternion.clone(),scale:g.scale.clone()}));let clear=false;
   try{
    for(const {g} of transforms){g.position.set(0,0,0);g.quaternion.identity();g.scale.set(1,1,1);}k.bay.updateMatrixWorld(true);
    k.api.render(job,phase,{x:0,z:0,yaw:0,travel:0,started,done,crewMode,crewTime,idleTime:time});clear=k.api.releaseClear();k.car.root.visible=startedNow&&['SERVICE','RELEASE'].includes(pit.phase);k.dynamic.visible=!cpu;
   }finally{for(const {g,position,quaternion,scale} of transforms){g.position.copy(position);g.quaternion.copy(quaternion);g.scale.copy(scale);}k.bay.updateMatrixWorld(true);}
   if(startedNow&&['SERVICE','RELEASE'].includes(pit.phase))proofs.push({id,serviceAt,at:p.time,clear:done&&clear});
   if(k.car.root.visible&&!cpu){m.root.visible=false;m.low.root.visible=false;}
   if(audio?.context){const s=k.craft.sound;if(!s.ctx){s.ctx=audio.context;s.master=s.ctx.createGain();s.master.gain.value=.5;s.master.connect(audio.master);}s.enabled=audio.enabled;k.craft.update(k.api.frame(),time,running);}
  }return proofs;
 }
 return {prepare,profiles,update,restore,kits};
}
