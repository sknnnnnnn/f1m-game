import {crewRightOfWay} from './crew-traffic.js';
import * as T from 'three';
import {fitContactPose,contactPoseAt} from './contact-pose.js';
import {projectTyres,tyreGap} from './tyre-clearance.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),DT=1/60,RADIUS=.30;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const angle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
// Conservative standing-body envelope. Hands may reach into the service area,
// but hips/feet route around the whole car, including tyres and wings.
export function obstruction(state){return {peopleRadius:.30,props:state.propObstacles??[],x:1.43,z:3.08,center:state.carZ,lane:state.garage?null:state.t<1.96?'incoming':state.t>=state.releaseAt?'outgoing':null};}
export function outside(p,o){return Math.abs(p.x)>=o.x-1e-6||(o.lane==='incoming'?p.z<=-o.z+1e-6:o.lane==='outgoing'?p.z>=o.z-1e-6:Math.abs(p.z-o.center)>=o.z-1e-6);}
function projectCar(p,o,preferred){
 if(outside(p,o))return p;
 if(o.lane){const z=o.lane==='incoming'?-o.z:o.z;if(Math.abs(p.z-z)<o.x-Math.abs(p.x))p.z=z;else p.x=(Math.sign(preferred?.x)||Math.sign(p.x)||1)*o.x;return p;}
 const options=[V(-o.x,0,p.z),V(o.x,0,p.z),V(p.x,0,o.center-o.z),V(p.x,0,o.center+o.z)];
 options.sort((a,b)=>a.distanceToSquared(p)-b.distanceToSquared(p));p.copy(options[0]);return p;
}
export function propGap(p,r){return Math.max(Math.abs(p.x-r.x)-r.hx-RADIUS-.025,Math.abs(p.z-r.z)-r.hz-RADIUS-.025);}
function project(p,o,preferred){projectCar(p,o,preferred);for(let n=0;n<4;n++)for(const r of o.props??[]){if(propGap(p,r)>=0)continue;const hx=r.hx+RADIUS+.025,hz=r.hz+RADIUS+.025,dx=hx-Math.abs(p.x-r.x),dz=hz-Math.abs(p.z-r.z);if(dx<dz)p.x=r.x+(Math.sign(p.x-r.x)||Math.sign(preferred?.x-r.x)||1)*hx;else p.z=r.z+(Math.sign(p.z-r.z)||Math.sign(preferred?.z-r.z)||1)*hz;projectCar(p,o,preferred);}return p;}
function segmentClear(a,b,o){for(let k=1;k<=16;k++){const p=a.clone().lerp(b,k/16);if(!outside(p,o)||(o.props??[]).some(r=>propGap(p,r)<-.00001))return false;}return true;}
function waypoint(a,b,o){
 if(segmentClear(a,b,o))return b;
 const corners=[V(-o.x-.035,0,o.center-o.z-.035),V(o.x+.035,0,o.center-o.z-.035),V(-o.x-.035,0,o.center+o.z+.035),V(o.x+.035,0,o.center+o.z+.035)];
 for(const r of o.props??[])for(const sx of [-1,1])for(const sz of [-1,1])corners.push(V(r.x+sx*(r.hx+RADIUS+.06),0,r.z+sz*(r.hz+RADIUS+.06)));
 // Each destination-to-target visibility is invariant within this query.
 // Reject routes that cannot improve the current winner before ray sampling.
 const destinations=[b,...corners],toTarget=new Map();
 let best=null,cost=Infinity;
 for(const c of corners)if(segmentClear(a,c,o)){
  const startDistance=a.distanceTo(c);
  for(const d of destinations){
   const n=startDistance+c.distanceTo(d)+d.distanceTo(b);
   if(n>=cost)continue;
   if(!toTarget.has(d))toTarget.set(d,segmentClear(d,b,o));
   if(toTarget.get(d)&&segmentClear(c,d,o)){cost=n;best=c;}
  }
 }
 return best??b;
}
function separate(actors,o,wheels){
 function clearLoads(){let worstLoad=0;
  for(let i=0;i<actors.length;i++){
   const owner=actors[i];if(!owner?.loadType)continue;const ids=owner.loadType==='nose'?[i,i+1]:[i],yaw=owner.loadYaw??owner.yaw,center=owner.pos.clone();if(ids.length===2)center.add(actors[i+1].pos).multiplyScalar(.5);
   center.add(V(0,0,owner.loadType==='nose'?-.705:-.55).applyAxisAngle(V(0,1,0),yaw));
   for(let j=0;j<actors.length;j++){
    const a=actors[j];if(!a||ids.includes(j))continue;const q=a.pos.clone().sub(center).applyAxisAngle(V(0,1,0),-yaw),r=(o.peopleRadius??RADIUS)+.04;let correction=V();
    if(owner.loadType==='wheel'){const hx=.42+r,hz=.24+r,dx=hx-Math.abs(q.x),dz=hz-Math.abs(q.z);if(dx>0&&dz>0){if(dx<dz)correction.x=(Math.sign(q.x)||1)*dx;else correction.z=(Math.sign(q.z)||1)*dz;}}
    else {const hx=1.22+r,hz=.63+r;if(Math.abs(q.x)<hx&&Math.abs(q.z)<hz){const dx=hx-Math.abs(q.x),dz=hz-Math.abs(q.z);if(dx<dz)correction.x=(Math.sign(q.x)||1)*dx;else correction.z=(Math.sign(q.z)||1)*dz;}}
    if(correction.lengthSq()){worstLoad=Math.max(worstLoad,correction.length());const step=correction.applyAxisAngle(V(0,1,0),yaw);if(a.loadGroup){for(const member of actors)if(member?.loadGroup===a.loadGroup){member.pos.add(step);project(member.pos,o,member.desired);}}else{a.pos.add(step);project(a.pos,o,a.desired);}}
   }
  }return worstLoad;
 }
 for(let n=0;n<128;n++){
  let worst=0;
  for(let i=0;i<actors.length;i++){const a=actors[i];if(!a)continue;const before=a.pos.clone();project(a.pos,o,a.desired);projectTyres(a.pos,wheels,a.desired);worst=Math.max(worst,before.distanceTo(a.pos));
   for(let j=i+1;j<actors.length;j++){const b=actors[j];if(!b)continue;const d=b.pos.clone().sub(a.pos),len=d.length(),gap=(o.peopleRadius??RADIUS)*2+.025-len;
    if(gap<=0||a.loadGroup&&a.loadGroup===b.loadGroup)continue;worst=Math.max(worst,gap);if(len<1e-7)d.set((i%2?1:-1),0,.35).normalize();else d.multiplyScalar(1/len);
    a.pos.addScaledVector(d,a.loadGroup?0:b.loadGroup?-gap*1.001:-gap*.501);b.pos.addScaledVector(d,b.loadGroup?0:a.loadGroup?gap*1.001:gap*.501);project(a.pos,o,a.desired);projectTyres(a.pos,wheels,a.desired);project(b.pos,o,b.desired);projectTyres(b.pos,wheels,b.desired);
   }
  }
  worst=Math.max(worst,clearLoads());if(worst<1e-5)break;
 }
}
export class CrewMotion{
 constructor(layout,duration){
  this.frames=[];this.dt=DT;let previous=null;
  const samples=Array.from({length:Math.ceil(duration/DT)+3},(_,f)=>layout(f*DT));
  for(let f=0;f<samples.length;f++){
   const {actors,state,wheels=[]}=samples[f],future=samples[Math.min(samples.length-1,f+12)].wheels??[],o=obstruction(state);
   const next=actors.map((a,i)=>{
    if(!a)return null;const desired=project(projectTyres(a.pos.clone(),a.requiresGrip?wheels:future,a.pos),o,previous?.[i]?.pos),prior=previous?.[i];let pos=desired.clone(),yaw=a.yaw;
    if(prior&&!a.requiresGrip&&!a.scripted){pos=prior.pos.clone();project(pos,o,desired);const limit=a.walkSpeed??(i===12||i===13||i%3===0&&i<12?3.2:i<12?3.8:i>=17&&i<=20?3.0:2.4),traffic=state.presentation?crewRightOfWay(pos,desired,previous,i,a,limit):{speed:limit,obstacles:[],yielding:false},navigation=a.navPadding||traffic.obstacles.length?{...o,props:[...o.props.map(p=>({...p,hx:p.hx+(a.navPadding?.x??0),hz:p.hz+(a.navPadding?.z??0)})),...traffic.obstacles]}:o,goal=waypoint(pos,desired,navigation),delta=goal.clone().sub(pos),distance=delta.length(),maxSpeed=traffic.speed;a.yielding=traffic.yielding;
     if(distance>.45&&!state.presentation){delta.normalize();for(let j=0;j<previous.length;j++){if(i===j||!previous[j])continue;const toward=previous[j].pos.clone().sub(pos),d=toward.length();if(d<.95&&d>.01&&delta.dot(toward)>.01&&d*d-delta.dot(toward)**2<.57*.57)delta.addScaledVector(V(-toward.z,0,toward.x).normalize(),(.95-d)*2.8);}}
     delta.normalize();if(!a.hands){if(distance>.04)yaw=Math.atan2(-delta.x,-delta.z);else yaw=state.presentation?a.yaw:prior.yaw;}
     const turn=!a.hands?Math.max(.08,Math.cos(angle(prior.yaw,yaw))):1,wanted=delta.clone().multiplyScalar(Math.min(maxSpeed,Math.sqrt(2*5*distance))*turn),velocity=prior.velocity?.clone()??V(),change=wanted.clone().sub(velocity);velocity.add(change.clampLength(0,6*DT)).clampLength(0,limit);
     if(distance<.004&&velocity.length()<.2)velocity.set(0,0,0);else pos.add(velocity.clone().multiplyScalar(DT).clampLength(0,distance));
     yaw=prior.yaw+Math.max(-3*DT,Math.min(3*DT,angle(prior.yaw,yaw)));
    }
    return {...a,rawPos:a.pos.clone(),pos,desired,yaw};
   });
   // A two-person carried assembly uses one navigation route. The second
   // person follows its leader at the authored separation, not opposite sides
   // of the same table. The leader reserves the full pair's footprint.
   next.forEach((a,i)=>{if(a?.navLeader===undefined)return;const leader=next[a.navLeader],rawLeader=actors[a.navLeader];if(leader&&rawLeader){a.pos.copy(leader.pos).add(actors[i].pos.clone().sub(rawLeader.pos));a.yaw=leader.yaw;}});
   separate(next,o,wheels);next.forEach((a,i)=>{if(a)a.velocity=previous?.[i]?a.pos.clone().sub(previous[i].pos).multiplyScalar(1/DT):V();});this.frames.push({actors:next,state,wheels});previous=next;
  }
  this.relaxVelocity();
  for(const f of this.frames)for(const a of f.actors){if(!a?.hands)continue;const aim=a.hands[0].clone().add(a.hands[1]).multiplyScalar(.5);if(a.toolAttach!==undefined)aim.add(a.pos.clone().sub(a.rawPos).multiplyScalar(a.toolAttach));aim.sub(a.pos);if(Math.hypot(aim.x,aim.z)>.05)a.yaw=Math.atan2(-aim.x,-aim.z);}
  // Anticipate turns in the baked route, then enforce continuous orientation.
  // This applies to loaded actors too: grip solving must not snap the torso.
  const turnStep=4.0*DT;
  for(let i=0;i<22;i++){
   for(let f=this.frames.length-2;f>=0;f--){const a=this.frames[f].actors[i],b=this.frames[f+1].actors[i];if(a&&b&&!a.hands)a.yaw=b.yaw+T.MathUtils.clamp(angle(b.yaw,a.yaw),-turnStep,turnStep);}
   for(let f=1;f<this.frames.length;f++){const a=this.frames[f].actors[i],b=this.frames[f-1].actors[i];if(a&&b)a.yaw=b.yaw+T.MathUtils.clamp(angle(b.yaw,a.yaw),-turnStep,turnStep);}
  }
  for(const f of this.frames)for(const a of f.actors)if(a?.loadGroup&&Number.isFinite(a.loadYaw))a.yaw=a.loadYaw;
  this.makeFootsteps();
  this.makePostures();
 }
 // Spread a forced clearance correction into earlier free frames. This makes
 // crew anticipate a moving tyre instead of jumping at the contact frame.
 relaxVelocity(){
  for(let pass=0;pass<10;pass++){
   let excess=0;
   for(let f=this.frames.length-2;f>=0;f--){const frame=this.frames[f],next=this.frames[f+1];
    for(let i=0;i<frame.actors.length;i++){const a=frame.actors[i],b=next.actors[i];if(!a||!b||a.requiresGrip||a.scripted&&((a.hands&&(i>=12||i%3!==0))||[12,13,21].includes(i)))continue;const d=a.pos.clone().sub(b.pos),maxStep=(a.walkSpeed??(i<12&&i%3!==0?3.8:3.2))*DT,len=d.length();if(len>maxStep){excess=Math.max(excess,len-maxStep);a.pos.copy(b.pos).add(d.setLength(maxStep));}}
    separate(frame.actors,obstruction(frame.state),frame.wheels);
   }
   // Also enforce the handover from a constrained carrying path to a free walk.
   // A backward-only pass can otherwise pull the first free frame past its load.
   for(let f=1;f<this.frames.length;f++){const frame=this.frames[f],prior=this.frames[f-1];
    frame.actors.forEach((a,i)=>{const b=prior.actors[i];if(!a||!b||a.requiresGrip||a.scripted&&((a.hands&&(i>=12||i%3!==0))||[12,13,21].includes(i)))return;const d=a.pos.clone().sub(b.pos),maxStep=(a.walkSpeed??(i<12&&i%3!==0?3.8:3.2))*DT;if(d.length()>maxStep){excess=Math.max(excess,d.length()-maxStep);a.pos.copy(b.pos).add(d.setLength(maxStep));}});
    separate(frame.actors,obstruction(frame.state),frame.wheels);
   }
   if(excess<1e-4)break;
  }
 }
 makeFootsteps(){
  for(let i=0;i<22;i++){
   let planted=null,swing=null,nextLeg=0,lastStep=-1,lastDuration=.20,distance=0;
   for(let f=0;f<this.frames.length;f++){
    const a=this.frames[f].actors[i];if(!a)continue;const t=f*DT;
    const stance=(sample,leg)=>V(leg===0?-.155:.155,.075,leg===0?-.045:.045).applyAxisAngle(V(0,1,0),sample.yaw).add(sample.pos);
    if(!planted)planted=[0,1].map(leg=>({world:stance(a,leg),yaw:a.yaw}));
    if(swing&&t>=swing.end){planted[swing.leg]={world:swing.to.clone(),yaw:swing.yaw};swing=null;}
    if(!swing&&t-lastStep>=lastDuration*.98){
     const next=this.frames[Math.min(this.frames.length-1,f+12)].actors[i]??a;
     const errors=[0,1].map(leg=>planted[leg].world.distanceTo(stance(a,leg)));
     const moving=next.pos.distanceTo(a.pos)>.035;
     if(Math.max(...errors)>.065||(moving&&Math.max(...errors)>.025)){
      const leg=errors[nextLeg]>.025?nextLeg:1-nextLeg;
      const speed=next.pos.distanceTo(a.pos)/.2,loaded=!!a.loadType||!!a.loadGroup,duration=loaded?T.MathUtils.lerp(.23,.12,T.MathUtils.clamp(speed/4,0,1)):T.MathUtils.lerp(.25,.075,T.MathUtils.clamp(speed/5.3,0,1)),landing=this.frames[Math.min(this.frames.length-1,f+Math.round(duration/DT))].actors[i]??a;
      swing={leg,from:planted[leg].world.clone(),to:stance(landing,leg),start:t,end:t+duration,fromYaw:planted[leg].yaw,yaw:landing.yaw,height:T.MathUtils.lerp(loaded?.035:.045,loaded?.065:.09,T.MathUtils.clamp(speed/3.8,0,1))};nextLeg=1-leg;lastStep=t;lastDuration=duration;
     }
    }
    a.feet=planted.map((p,leg)=>{
     if(!swing||swing.leg!==leg)return {world:p.world.clone(),yaw:p.yaw,stance:true,roll:0};
     const u=Math.max(0,Math.min(1,(t-swing.start)/(swing.end-swing.start))),q=smooth(u),world=swing.from.clone().lerp(swing.to,q);world.y+=Math.sin(Math.PI*u)*swing.height;
     return {world,yaw:swing.fromYaw+angle(swing.fromYaw,swing.yaw)*q,stance:false,roll:Math.sin(2*Math.PI*u)*((a.loadType||a.loadGroup) ? .10 : .18)};
    });
    const after=this.frames[Math.min(f+1,this.frames.length-1)].actors[i]??a;
    a.speed=after.pos.distanceTo(a.pos)/DT;const prior=this.frames[f-1]?.actors[i];if(prior)distance+=a.pos.distanceTo(prior.pos);a.gait=distance*Math.PI/.35+i*.7;
   }
  }
 }
 makePostures(){
  for(let i=0;i<22;i++){let previous=null,weight=0,lastLocal=null;
   for(const frame of this.frames){const a=frame.actors[i];if(!a)continue;const rot=new T.Quaternion().setFromAxisAngle(V(0,1,0),a.yaw),inv=rot.clone().invert();
    const raw=a.hands?.map(h=>h.clone())??null;
    if(raw&&i<12&&i%3===0){const delta=a.pos.clone().sub(a.rawPos).multiplyScalar(a.toolAttach??1);raw.forEach(h=>h.add(delta));}
    if(raw)raw.sort((u,v)=>u.clone().sub(a.pos).applyQuaternion(inv).x-v.clone().sub(a.pos).applyQuaternion(inv).x);
    a.contactTargets=raw;
    weight=Math.max(0,Math.min(1,weight+(raw?1:-1)*DT*5));
    if(raw)lastLocal=raw.map(h=>h.clone().sub(a.pos).applyQuaternion(inv));
    const restHeight=.94-.42*Math.min(1.15,a.crouch),free=[V(-.25,restHeight-.08,-.07),V(.25,restHeight-.08,-.07)];
    if(weight>0&&lastLocal)a.hands=lastLocal.map((h,k)=>free[k].clone().lerp(h,weight).applyQuaternion(rot).add(a.pos));else a.hands=null;
    let limit=.94;for(const f of a.feet){const k=a.feet.indexOf(f),p=f.world.clone().sub(a.pos).applyQuaternion(inv).add(V(0,.025,.035)),dx=p.x-(k===0?-.105:.105),dz=p.z-.015;limit=Math.min(limit,p.y+.02+Math.sqrt(Math.max(0,.875*.875-dx*dx-dz*dz)));}
    const goals=raw&&weight>.98?raw:a.hands,fit=fitContactPose(a.pos,a.yaw,a.crouch,goals,a.feet);let target={height:fit.height,bend:fit.bend};
    if(previous){
     const start={height:Math.min(previous.height,limit),bend:previous.bend};
     if(a.hands){
      const relaxed={height:start.height+T.MathUtils.clamp(target.height-start.height,-DT*1.4,DT*1.4),bend:start.bend+T.MathUtils.clamp(target.bend-start.bend,-DT*1.8,DT*1.8)};
      if(contactPoseAt(a.pos,a.yaw,relaxed,goals).error<=.018)target=relaxed;
      else if(fit.error<=.018){let lo=0,hi=1;for(let n=0;n<10;n++){const q=(lo+hi)/2,p={height:T.MathUtils.lerp(start.height,target.height,q),bend:T.MathUtils.lerp(start.bend,target.bend,q)};if(contactPoseAt(a.pos,a.yaw,p,goals).error<=.018)hi=q;else lo=q;}target={height:T.MathUtils.lerp(start.height,target.height,hi),bend:T.MathUtils.lerp(start.bend,target.bend,hi)};}
     }else{target.height=start.height+Math.max(-DT*1.6,Math.min(DT*1.6,target.height-start.height));target.bend=start.bend+Math.max(-DT*2.0,Math.min(DT*2.0,target.bend-start.bend));}
    }
    target.height=Math.min(target.height,limit);
    a.posture=target;a.gripWeight=weight;previous=target;
   }
  }
 }
 sample(time){
  const p=Math.max(0,Math.min(this.frames.length-2,time/DT)),f=Math.floor(p),q=p-f,a=this.frames[f].actors,b=this.frames[f+1].actors;
  return a.map((x,i)=>{if(!x)return null;const y=b[i]??x;return {...x,pos:x.pos.clone().lerp(y.pos,q),yaw:x.yaw+angle(x.yaw,y.yaw)*q,crouch:T.MathUtils.lerp(x.crouch,y.crouch,q),contactTargets:x.contactTargets&&y.contactTargets?x.contactTargets.map((h,k)=>h.clone().lerp(y.contactTargets[k],q)):x.contactTargets,posture:{height:T.MathUtils.lerp(x.posture.height,y.posture.height,q),bend:T.MathUtils.lerp(x.posture.bend,y.posture.bend,q)},gripWeight:T.MathUtils.lerp(x.gripWeight,y.gripWeight,q),toolAttach:T.MathUtils.lerp(x.toolAttach??0,y.toolAttach??0,q),carContact:x.carContact||y.carContact,sideLean:T.MathUtils.lerp(x.sideLean??0,y.sideLean??0,q),hands:x.hands&&y.hands?x.hands.map((h,k)=>h.clone().lerp(y.hands[k],q)):x.hands,feet:x.feet.map((foot,k)=>({...foot,world:foot.world.clone().lerp(y.feet[k].world,q),yaw:foot.yaw+angle(foot.yaw,y.feet[k].yaw)*q,roll:T.MathUtils.lerp(foot.roll,y.feet[k].roll,q),stance:foot.stance&&y.feet[k].stance})),gait:T.MathUtils.lerp(x.gait,y.gait,q)};});
 }
}
