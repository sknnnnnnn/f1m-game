import * as T from 'three';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Online planted feet for the grid crew; actor paths remain authoritative.
export class GridFootsteps33 {
 constructor(){this.actors=new Map();}
 reset(id){this.actors.delete(id);}
 update(id,anchor,yaw,speed,time){
  const stance=leg=>new T.Vector3(leg? .155:-.155,.075,leg?.045:-.045).applyAxisAngle(new T.Vector3(0,1,0),yaw).add(anchor);
  let q=this.actors.get(id);
  if(!q||time<q.time||q.anchor.distanceTo(anchor)>.9){q={feet:[0,1].map(leg=>({world:stance(leg),yaw})),next:0,swing:null,anchor:anchor.clone(),time};this.actors.set(id,q);}
  if(q.swing&&time>=q.swing.end){q.feet[q.swing.leg]={world:q.swing.to,yaw:q.swing.yaw};q.swing=null;}
  const errors=q.feet.map((f,leg)=>f.world.distanceTo(stance(leg)));
  if(!q.swing&&(Math.max(...errors)>.20||speed>.10)){
   const leg=Math.max(...errors)>.36?errors.indexOf(Math.max(...errors)):q.next,duration=Math.max(.14,.25-speed*.025),target=stance(leg),forward=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
   target.addScaledVector(forward,Math.min(.32,speed*duration*.55));
   q.swing={leg,from:q.feet[leg].world.clone(),to:target,start:time,end:time+duration,yaw};q.next=1-leg;
  }
  q.time=time;q.anchor.copy(anchor);
  return q.feet.map((f,leg)=>{if(!q.swing||leg!==q.swing.leg)return{world:f.world.clone(),yaw:f.yaw,roll:0,stance:true};const a=q.swing,u=Math.max(0,Math.min(1,(time-a.start)/(a.end-a.start))),v=smooth(u),world=a.from.clone().lerp(a.to,v);world.y+=Math.sin(Math.PI*u)*Math.min(.09,.045+speed*.01);return{world,yaw:a.yaw,roll:Math.sin(2*Math.PI*u)*.12,stance:false};});
 }
}
