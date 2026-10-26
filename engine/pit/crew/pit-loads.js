import * as T from 'three';
import {fitContactPose} from './contact-pose.js';
import {smooth} from './crew-presentation.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0),unit=V(1,1,1);
const angle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
function grip(a,hands){a.hands=hands.sort((u,v)=>u.clone().sub(a.pos).applyAxisAngle(Y,-a.yaw).x-v.clone().sub(a.pos).applyAxisAngle(Y,-a.yaw).x);const fit=fitContactPose(a.pos,a.yaw,a.crouch,a.hands,a.feet);a.posture={height:fit.height,bend:fit.bend};}
function move(a,pos,yaw){const old=a.pos.clone(),dy=angle(a.yaw,yaw);a.feet=a.feet.map(f=>({...f,world:f.world.clone().sub(old).applyAxisAngle(Y,dy).add(pos),yaw:f.yaw+dy}));a.pos=pos;a.yaw=yaw;}
export class PitLoads{
 constructor({car,newNose,looseParts,tools,scene}){Object.assign(this,{car,newNose,looseParts,tools});this.report=[];
  const metal=new T.MeshStandardMaterial({color:0x8b9998,metalness:.6,roughness:.5}),dark=new T.MeshStandardMaterial({color:0x15353a});
  this.tasks=Array.from({length:22},(_,i)=>{const g=new T.Group();if(i===16||i%3===0){const tablet=new T.Mesh(new T.BoxGeometry(.20,.025,.15),dark);g.add(tablet);const screen=new T.Mesh(new T.BoxGeometry(.16,.003,.11),new T.MeshStandardMaterial({color:0x83ac9b,emissive:0x34594c,emissiveIntensity:.25}));screen.position.y=.015;g.add(screen);}else if(i%3===1){const gauge=new T.Mesh(new T.CylinderGeometry(.043,.043,.025,12),metal);g.add(gauge);const face=new T.Mesh(new T.CylinderGeometry(.034,.034,.027,12),dark);g.add(face);const stem=new T.Mesh(new T.BoxGeometry(.018,.025,.075),metal);stem.position.z=.05;g.add(stem);}else{const cloth=new T.Mesh(new T.BoxGeometry(.14,.018,.10),new T.MeshStandardMaterial({color:0xa2bcb0,roughness:1}));cloth.rotation.y=.2;g.add(cloth);}scene.add(g);return g;});

 }
 apply({actors,entry,state,pose,job,phase}){
  this.tasks.forEach(o=>o.visible=false);this.report=[];const p=entry.presentation,t=pose.crewTime??0,returning=pose.crewMode==='return',deploy=pose.crewMode&& !returning,started=pose.started,done=pose.done;
  const end=pose.crewMode==='turnaround'?p.turnReadyAt:p.readyAt,settle=deploy?smooth((t-end+1.8)/1.8):1;
  const pickup=deploy?smooth(t/.8):1,put=returning?smooth((t-p.returnAt+1.40)/.95):0,release=returning?smooth((t-p.returnAt+.48)/.38):0;
  for(const c of this.looseParts.values())c.visible=false;
  const place=(source,center,q,owners,kind)=>{const c=this.looseParts.get(source);c.visible=true;c.matrix.compose(center,q,source.scale);c.matrixWorldNeedsUpdate=true;source.visible=false;this.report.push({name:source.name,kind,owners,center:center.toArray(),axis:V(1,0,0).applyQuaternion(q).toArray(),gripHeld:!returning||release<.99});};
  for(let i=0;i<4;i++){
   const w=this.car.wheels[i];if(job==='nose')continue;
   const fresh=!done&&(!started||state.corners[i].mount===0),old=started&&(done||state.corners[i].oldAway>.99),id=i*3+(fresh?2:1),a=actors[id];if(!a||(!fresh&&!old))continue;
   const source=fresh?w.newRoot:w.root,base=source.getWorldPosition(V()),baseQ=source.getWorldQuaternion(new T.Quaternion());
   const carrying=pose.crewMode&&(!returning||put<.01),loadSway=carrying?Math.sin(a.gait??0)*Math.min(.008,(a.speed??0)*.0025):0;const carry=V(0,1.05+loadSway,-.55).applyAxisAngle(Y,a.yaw).add(a.pos),center=carry.clone(),reference=(fresh?p.workStart:p.workEnd)[id];
   const carryQ=new T.Quaternion().setFromAxisAngle(Y,a.yaw-(w.center.x<0?-1:1)*Math.PI/2).multiply(baseQ);let q=carryQ.clone();
   let weight=1;
   if(fresh){
    center.y=T.MathUtils.lerp(.473325,carry.y,smooth((t-.4)/.6));
    const targets=reference.contactTargets??reference.hands;
    if(targets){const native=targets[0].clone().add(targets[1]).multiplyScalar(.5).sub(V((w.center.x<0?-1:1)*.11,.10,0)),local=native.sub(reference.pos).applyAxisAngle(Y,-reference.yaw),attached=local.applyAxisAngle(Y,a.yaw).add(a.pos);center.lerp(attached,settle);q.slerp(baseQ,settle);}
    if(started){center.copy(base);q.copy(baseQ);}weight=started?1:smooth(t/.35);
   }
   else if(!returning&&!done){const blend=smooth((phase-(2.75+[0,.035,.055,.08][i]+1.95))/.65);center.copy(base).lerp(carry,blend);q.copy(baseQ).slerp(carryQ,blend);}
   if(returning){center.y=T.MathUtils.lerp(center.y,.473325,put);weight=1-release;}
   const s=w.center.x<0?-1:1,grips=[V(s*.11,.10,s*.215),V(s*.11,.10,-s*.215)].map(h=>h.applyQuaternion(q).add(center));
   if(weight>.001){const free=[V(-.25,.86,-.07),V(.25,.86,-.07)].map(h=>h.applyAxisAngle(Y,a.yaw).add(a.pos));grip(a,grips.map((h,k)=>free[k].lerp(h,weight)));}
   place(source,center,q,[id],fresh?'fresh tyre':put>.99?'stored old tyre':'old tyre');
  }
  if(job!=='tyres'){
   const fresh=!started,old=started&&(done||state.part.remove>.999),ids=fresh?[19,20]:[17,18],a=actors[ids[0]],b=actors[ids[1]];
   if(a&&b&&(fresh||old)){
    const source=fresh?this.newNose:this.car.nose,ref=(fresh?p.workStart:p.workEnd)[ids[0]],sourceQ=source.getWorldQuaternion(new T.Quaternion()),sourceP=source.getWorldPosition(V()),g=this.car.noseGrips,localMid=g[0].clone().add(g[1]).multiplyScalar(.5);
    const yaw=a.yaw,rot=yaw-ref.yaw,q=new T.Quaternion().setFromAxisAngle(Y,rot),mid=a.pos.clone().add(b.pos).multiplyScalar(.5).add(V(0,0,-.48).applyAxisAngle(Y,yaw));mid.y=1.02+(pose.crewMode&&put<.01?Math.sin(((a.gait??0)+(b.gait??0))*.5)*Math.min(.005,((a.speed??0)+(b.speed??0))*.001):0);
    const root=mid.clone().sub(localMid.clone().applyQuaternion(q));
    let load=1;
    if(fresh){root.y-=.870583*(1-smooth((t-.3)/.6));root.lerp(sourceP,settle);q.slerp(sourceQ,settle);load=smooth(t/.3);}
    else if(!returning){root.copy(sourceP);q.copy(sourceQ);}
    if(returning){const u=smooth(t/.9);root.lerp(sourceP,1-u);q.copy(sourceQ).slerp(new T.Quaternion().setFromAxisAngle(Y,rot),u);root.y-=.870583*put;load=1-release;}
    const heading=returning||deploy?yaw:ref.yaw;
    const centers=g.map(h=>h.clone().applyQuaternion(q).add(root));
    for(let k=0;k<2;k++){
     const actor=actors[ids[k]],anchor=centers[k].clone().sub(V(0,0,-.48).applyAxisAngle(Y,heading));anchor.y=0;
     // A rigid two-person load uses one transform, so the wing cannot stretch
     // between independently steered people. Match the source grip at handover.
     move(actor,anchor,heading);
     if(load>.001){const hand=[V(-.05,0,-.04),V(.05,0,.04)].map(h=>h.applyQuaternion(q).add(centers[k]));const free=[V(-.25,.86,-.07),V(.25,.86,-.07)].map(h=>h.applyAxisAngle(Y,actor.yaw).add(actor.pos));grip(actor,hand.map((h,j)=>free[j].lerp(h,load)));}
    }
    place(source,root,q,ids,fresh?'fresh nose':put>.99?'stored old nose':'old nose');


   }
  }
  // Purposeful garage preparation: inspect a gauge, clean a tool or check
  // the job tablet. Only staff clear of the doorway perform these idle tasks.
  const occupied=new Set(this.report.filter(r=>r.gripHeld).flatMap(r=>r.owners));
  actors.forEach((a,i)=>{
   if(!a||a.pos.x>-6.8||occupied.has(i)||i<12&&i%3===0&&job!=='nose'||[12,13,21].includes(i)&&p.active(i))return;
   const dispatch=deploy?1-smooth((t-.0)/.55):1,u=smooth((.30-(a.speed??0))/.30)*dispatch;if(u<.001)return;
   const idle=pose.idleTime??0,cycle=(idle+i*1.37)%7,inspect=smooth(cycle/.8)*(1-smooth((cycle-3.8)/.8));a.look=.10*Math.sin(idle*.7+i)*inspect;const wave=.025*Math.sin(idle*1.5+i*.8)*inspect,targets=[V(-.12,1.03+wave,-.27),V(.12,1.08-wave,-.29)].map(h=>h.applyAxisAngle(Y,a.yaw).add(a.pos));
   const hands=targets.map((h,k)=>(a.hands?.[k]??V(k?.25:-.25,.86,-.07).applyAxisAngle(Y,a.yaw).add(a.pos)).clone().lerp(h,u));grip(a,hands);
   const tool=this.tasks[i];tool.visible=true;tool.position.copy(hands[1]);tool.rotation.set(.12*Math.sin(idle*1.1+i)*inspect,a.yaw,.07*Math.cos(idle*.9+i)*inspect);tool.scale.setScalar(u);
  });
  // A brief visual acknowledgement before service, blended back to the
  // authored work pose. It never changes the main game's readiness decision.
  if(deploy&&actors[16]){const signal=smooth((t-end+3.5)/.55)*(1-smooth((t-end+.8)/.8));if(signal>.001){const a=actors[16],free=[V(-.25,.86,-.07),V(.25,.86,-.07)].map(h=>h.applyAxisAngle(Y,a.yaw).add(a.pos)),goal=V(.23,1.56,-.14).applyAxisAngle(Y,a.yaw).add(a.pos);const hands=[a.hands?.[0]?.clone()??free[0],(a.hands?.[1]?.clone()??free[1]).lerp(goal,signal)];grip(a,hands);a.look=.08*signal;this.tasks[16].visible=false;}}
  if(pose.crewMode)this.resolveTransit(actors,state.propObstacles??[]);
  // Wheel guns travel in the operator's hands; they never disappear in transit.
  for(let i=0;i<4;i++){
   const a=actors[i*3],tool=this.tools[i];if(job==='nose'){tool.visible=false;continue;}
   if(pose.crewMode){const point=V(.08,1.03,-.35).applyAxisAngle(Y,a.yaw).add(a.pos);tool.visible=true;tool.position.copy(point);tool.rotation.set(0,a.yaw,0);grip(a,[V(-.04,-.05,0),V(.06,.02,0)].map(v=>v.applyAxisAngle(Y,a.yaw).add(point)));}
  }
 }
 resolveTransit(actors,props){
  const shift=(id,delta)=>{
   const ids=actors[id]?.loadGroup?[actors[id].loadGroup,actors[id].loadGroup+1]:[id];
   for(const k of ids){const a=actors[k];if(!a)continue;a.pos.add(delta);a.feet.forEach(f=>f.world.add(delta));a.hands?.forEach(h=>h.add(delta));this.tasks[k].position.add(delta);}
   for(const r of this.report)if(r.owners.some(k=>ids.includes(k))){const source=[...this.looseParts.keys()].find(o=>o.name===r.name),c=this.looseParts.get(source);c.matrix.elements[12]+=delta.x;c.matrix.elements[14]+=delta.z;c.matrixWorldNeedsUpdate=true;r.center[0]+=delta.x;r.center[2]+=delta.z;}
  };
  for(let pass=0;pass<12;pass++){
   let worst=0;
   for(const r of this.report){if(r.kind.includes('tyre'))continue;const source=[...this.looseParts.keys()].find(o=>o.name===r.name),clone=this.looseParts.get(source),box=new T.Box3().setFromObject(clone);
    for(let i=0;i<actors.length;i++){const a=actors[i];if(!a||r.owners.includes(i)||this.report.some(other=>other.owners.includes(i)))continue;
     const hx=(box.max.x-box.min.x)/2+.32,hz=(box.max.z-box.min.z)/2+.32,cx=(box.max.x+box.min.x)/2,cz=(box.max.z+box.min.z)/2,dx=hx-Math.abs(a.pos.x-cx),dz=hz-Math.abs(a.pos.z-cz);
     if(dx>0&&dz>0){const d=dx<dz?V((Math.sign(a.pos.x-cx)||1)*(dx+.002),0,0):V(0,0,(Math.sign(a.pos.z-cz)||1)*(dz+.002));worst=Math.max(worst,d.length());shift(i,d);}
    }
   }
   for(let i=0;i<actors.length;i++){const a=actors[i];if(!a)continue;
    for(let j=i+1;j<actors.length;j++){const b=actors[j];if(!b||a.loadGroup&&a.loadGroup===b.loadGroup)continue;const d=b.pos.clone().sub(a.pos),gap=.625-d.length();if(gap>0){if(d.length()<.001)d.set(1,0,0);d.setLength(gap+.002);const fixedA=this.report.some(r=>r.owners.includes(i)),fixedB=this.report.some(r=>r.owners.includes(j));if(fixedA&&!fixedB)shift(j,d);else if(fixedB&&!fixedA)shift(i,d.negate());else{shift(i,d.clone().multiplyScalar(-.5));shift(j,d.multiplyScalar(.5));}worst=Math.max(worst,gap);}}
    for(const p of props){const dx=p.hx+.31-Math.abs(a.pos.x-p.x),dz=p.hz+.31-Math.abs(a.pos.z-p.z);if(dx>0&&dz>0){const d=dx<dz?V((Math.sign(a.pos.x-p.x)||1)*(dx+.002),0,0):V(0,0,(Math.sign(a.pos.z-p.z)||1)*(dz+.002));shift(i,d);worst=Math.max(worst,d.length());}}
   }
   if(worst<.002)break;
  }
 }

}
