import * as T from 'three';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Online planted feet for the grid crew; actor paths remain authoritative.
export class GridFootsteps33 {
 constructor(){this.actors=new Map();this.inputs=new Map();}
 reset(id){this.actors.delete(id);this.inputs.delete(id);}
 update(id,anchor,yaw,speed,time){
  const prior=this.inputs.get(id);let result;
  if(!prior||time<=prior.time||time-prior.time>.25)result=this.step(id,anchor,yaw,speed,time);
  else {
   const count=Math.ceil((time-prior.time)*120),turn=Math.atan2(Math.sin(yaw-prior.yaw),Math.cos(yaw-prior.yaw));
   for(let k=1;k<=count;k++){const u=k/count;result=this.step(id,prior.anchor.clone().lerp(anchor,u),prior.yaw+turn*u,prior.speed+(speed-prior.speed)*u,prior.time+(time-prior.time)*u);}
  }
  this.inputs.set(id,{anchor:anchor.clone(),yaw,speed,time});return result;
 }
 step(id,anchor,yaw,speed,time){
  const stance=leg=>new T.Vector3(leg? .155:-.155,.075,leg?.045:-.045).applyAxisAngle(new T.Vector3(0,1,0),yaw).add(anchor);
  let q=this.actors.get(id);
  if(!q||time<q.time||q.anchor.distanceTo(anchor)>.9){q={feet:[0,1].map(leg=>({world:stance(leg),yaw})),next:0,swing:null,anchor:anchor.clone(),time};this.actors.set(id,q);}
  if(q.swing&&time>=q.swing.end){q.feet[q.swing.leg]={world:q.swing.to,yaw:q.swing.yaw};q.swing=null;}
  const dt=Math.max(.001,time-q.time),velocity=anchor.clone().sub(q.anchor).multiplyScalar(1/dt);
  velocity.y=0;velocity.clampLength(0,Math.max(.1,speed));
  const errors=q.feet.map((f,leg)=>f.world.distanceTo(stance(leg)));
  if(!q.swing&&(Math.max(...errors)>.10||speed>.10)){
   const leg=Math.max(...errors)>.36?errors.indexOf(Math.max(...errors)):q.next,duration=Math.max(.075,.24/(1+speed*.85)),target=stance(leg);
   target.addScaledVector(velocity,duration*1.15);
   q.swing={leg,from:q.feet[leg].world.clone(),to:target,start:time,end:time+duration,yaw};q.next=1-leg;
  }
  q.time=time;q.anchor.copy(anchor);
  return q.feet.map((f,leg)=>{if(!q.swing||leg!==q.swing.leg)return{world:f.world.clone(),yaw:f.yaw,roll:0,stance:true};const a=q.swing,u=Math.max(0,Math.min(1,(time-a.start)/(a.end-a.start))),v=smooth(u),world=a.from.clone().lerp(a.to,v);world.y+=Math.sin(Math.PI*u)*Math.min(.09,.045+speed*.01);return{world,yaw:a.yaw,roll:Math.sin(2*Math.PI*u)*.12,stance:false};});
 }
}
