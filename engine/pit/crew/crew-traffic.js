import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const priority=(a,i)=>a.loadGroup?0:a.loadType==='wheel'?20+i:40+i;
// Predictive right of way for free transit. Stop before entering a conflict;
// avoid asking the separation solver to squeeze people out of a jam.
export function crewRightOfWay(pos,goal,actors,index,actor,maxSpeed){
 const dir=goal.clone().sub(pos);if(dir.length()<.04)return {speed:maxSpeed,obstacles:[],yielding:false};dir.normalize();let speed=maxSpeed,nearest=null,nearestDistance=Infinity,yielding=false,movingYield=false;
 for(let j=0;j<actors.length;j++){const b=actors[j];if(!b||j===index||actor.loadGroup&&actor.loadGroup===b.loadGroup)continue;const rel=b.pos.clone().sub(pos),distance=rel.length();if(distance>3.4||distance<.001)continue;
  const along=rel.dot(dir),lateral=Math.abs(rel.x*dir.z-rel.z*dir.x),vel=b.velocity??V(),otherSpeed=vel.length(),same=otherSpeed>.12&&vel.clone().normalize().dot(dir)>.45;
  const ownPriority=priority(actor,index),otherPriority=priority(b,j),otherGoal=b.desired??b.pos,settled=otherSpeed<.15&&b.pos.distanceTo(otherGoal)<.16;
  if(along>.0&&same&&lateral<.72){speed=Math.min(speed,Math.max(0,(along-.92)*2.1));yielding=true;continue;}
  // A parked colleague is a navigation obstacle, rather than someone to push.
  if(otherSpeed<.15&&(settled||ownPriority<otherPriority)&&along>-.15&&lateral<.85&&goal.distanceTo(b.pos)>.84&&distance<nearestDistance){nearest=b;nearestDistance=distance;}
  const relative=vel.clone().addScaledVector(dir,-Math.max(.6,maxSpeed)),tau=T.MathUtils.clamp(-rel.dot(relative)/(relative.lengthSq()||1),0,1.1),miss=rel.clone().addScaledVector(relative,tau).length();
  const mustYield=otherPriority<ownPriority||settled;
  if(mustYield&&along>-.15&&miss<.94&&tau>0&&tau<1.1){const clearance=Math.max(0,along-.98),braking=Math.sqrt(2*3.4*clearance);speed=Math.min(speed,braking,clearance*2.5);yielding=true;if(!settled)movingYield=true;}
  if(mustYield&&along>0&&distance<1.0&&lateral<.76){speed=0;yielding=true;}
 }
 const obstacles=nearest?[{x:nearest.pos.x,z:nearest.pos.z,hx:.34,hz:.34,h:1.8}]:[];
 // Once there is a deliberate bypass around a stationary person, yield to
 // moving crossings only; otherwise the person would remain a permanent gate.
 if(nearest&&obstacles.length&&speed<.05&&!movingYield)speed=Math.min(maxSpeed,1.4);
 return {speed,obstacles,yielding};
}
