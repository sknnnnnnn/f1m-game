import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0);
// One coherent trunk transform for mesh, shoulders, neck and IK targets.
const poseCache=new Map();
export function fitContactPose(anchor,yaw,crouch=0,hands=null,feet=null){
 const rot=new T.Quaternion().setFromAxisAngle(Y,yaw),inv=rot.clone().invert(),goals=hands?.map(h=>h.clone().sub(anchor).applyQuaternion(inv));
 let best=null;
 const c=T.MathUtils.clamp(crouch,0,1.15),rest=.94-.42*c;
 let limit=.94;if(feet)for(const f of feet){const q=f.world.clone().sub(anchor).applyQuaternion(inv);limit=Math.min(limit,.09+Math.sqrt(Math.max(.01,.84*.84-q.x*q.x-q.z*q.z)));}
 if(!goals)return contactPoseAt(anchor,yaw,{height:Math.min(rest,limit),bend:.10+.12*c},null);
 const key=[Math.round(c*50),Math.round(limit*100),...goals.flatMap(g=>g.toArray().map(v=>Math.round(v*100)))].join(',');
 const cached=poseCache.get(key);if(cached){const pose=contactPoseAt(anchor,yaw,{height:Math.min(limit,cached.height),bend:cached.bend},hands);if(pose.error<.02)return pose;}
 const heights=(goals?[.28,.34,.43,.49,.57,.65,.74,.84,.94]:[rest]).map(h=>Math.min(h,limit));
 const bends=goals?[-.12,.10,.28,.46,.64,.78]:[.10+.12*c];
 for(const h of heights)for(const bend of bends){
  const q=new T.Quaternion().setFromAxisAngle(V(1,0,0),-bend),chest=V(0,h+.035,0),shoulders=[-1,1].map(s=>V(s*.195,.445,0).applyQuaternion(q).add(chest));
  let error=0,stretch=0;
  if(goals)goals.forEach((g,k)=>{const d=g.distanceTo(shoulders[k]);error=Math.max(error,Math.max(0,d-.582));stretch+=Math.max(0,d-.53)**2;});
  const cost=error*100+stretch*.20+(h-rest)**2*.025+(bend-.20)**2*.006;
  if(!best||cost<best.cost)best={height:h,bend,chest,shoulders,q,cost,error,rot,goals};
 }
 // Refine the grid continuously so posture does not jump between height bands.
 let dh=.035,db=.055;
 for(let n=0;n<8;n++){let improved=false;for(const [h,bend]of [[Math.max(.26,best.height-dh),best.bend],[Math.min(limit,best.height+dh),best.bend],[best.height,Math.max(-.12,best.bend-db)],[best.height,Math.min(.85,best.bend+db)]]){
  const q=new T.Quaternion().setFromAxisAngle(V(1,0,0),-bend),chest=V(0,h+.035,0),shoulders=[-1,1].map(s=>V(s*.195,.445,0).applyQuaternion(q).add(chest));let error=0,stretch=0;
  if(goals)goals.forEach((g,k)=>{const d=g.distanceTo(shoulders[k]);error=Math.max(error,Math.max(0,d-.582));stretch+=Math.max(0,d-.53)**2;});
  const cost=error*100+stretch*.20+(h-rest)**2*.025+(bend-.20)**2*.006;if(cost<best.cost-1e-9){best={height:h,bend,chest,shoulders,q,cost,error,rot,goals};improved=true;}
 }if(!improved){dh*=.5;db*=.5;}}
 if(poseCache.size>16000)poseCache.clear();poseCache.set(key,{height:best.height,bend:best.bend});
 return best;
}
export function gripError(actor){if(!actor?.contactTargets&&!actor?.hands)return 0;const targets=actor.contactTargets??actor.hands;
 const fit=actor.posture?contactPoseAt(actor.pos,actor.yaw,actor.posture,targets):fitContactPose(actor.pos,actor.yaw,actor.crouch,targets,actor.feet);
 const blend=actor.contactTargets&&actor.hands?Math.max(...actor.contactTargets.map((h,i)=>h.distanceTo(actor.hands[i]))):0;return Math.max(fit.error,blend);
}
export function contactPoseAt(anchor,yaw,posture,hands=null){
 const rot=new T.Quaternion().setFromAxisAngle(Y,yaw),inv=rot.clone().invert(),q=new T.Quaternion().setFromAxisAngle(V(1,0,0),-posture.bend),chest=V(0,posture.height+.035,0),goals=hands?.map(h=>h.clone().sub(anchor).applyQuaternion(inv)),shoulders=[-1,1].map(s=>V(s*.195,.445,0).applyQuaternion(q).add(chest));let error=0;
 if(goals)goals.forEach((g,i)=>error=Math.max(error,Math.max(0,g.distanceTo(shoulders[i])-.585)));
 return {height:posture.height,bend:posture.bend,q,chest,goals,shoulders,rot,error};
}
