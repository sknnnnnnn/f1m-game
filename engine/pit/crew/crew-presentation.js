import * as T from 'three';
import {CrewMotion} from './crew-motion.js';
import {PIT_LAYOUT as L,parkingSpot} from './pit-layout.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0);
export const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const turn=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u;
export function blendActor(a,b,u){
 if(!a)return b;if(!b)return a;const hand=(p,k)=>p.hands?.[k]??V(k?.25:-.25,(p.posture?.height??.94)-.08,-.07).applyAxisAngle(Y,p.yaw).add(p.pos);
 return {...a,pos:a.pos.clone().lerp(b.pos,u),yaw:turn(a.yaw,b.yaw,u),crouch:T.MathUtils.lerp(a.crouch,b.crouch,u),speed:T.MathUtils.lerp(a.speed??0,b.speed??0,u),gait:T.MathUtils.lerp(a.gait??0,b.gait??0,u),sideLean:T.MathUtils.lerp(a.sideLean??0,b.sideLean??0,u),hands:[0,1].map(k=>hand(a,k).clone().lerp(hand(b,k),u)),posture:{height:T.MathUtils.lerp(a.posture.height,b.posture.height,u),bend:T.MathUtils.lerp(a.posture.bend,b.posture.bend,u)},feet:a.feet.map((f,k)=>({...f,world:f.world.clone().lerp(b.feet[k].world,u),yaw:turn(f.yaw,b.feet[k].yaw,u),roll:T.MathUtils.lerp(f.roll,b.feet[k].roll,u)}))};
}
function pathAt(points,u){const ds=[0];let total=0;for(let i=1;i<points.length;i++){total+=points[i].distanceTo(points[i-1]);ds.push(total);}const s=T.MathUtils.clamp(u,0,1)*total;let i=1;while(i<points.length-1&&ds[i]<s)i++;return points[i-1].clone().lerp(points[i],(s-ds[i-1])/(ds[i]-ds[i-1]||1));}
export class CrewPresentation{
 constructor(workStart,workEnd,props=[],job='tyres'){
  this.workStart=workStart;this.workEnd=workEnd;this.job=job;
  this.active=i=>i>=12&&i<=16||i<12&&job!=='nose'||i>=17&&job!=='tyres';
  const home=Array.from({length:22},(_,i)=>{const p=parkingSpot(i);return V(p.x,0,p.z);});
  const make=(kind,duration)=>new CrewMotion(t=>({state:{garage:true,presentation:true,t,carZ:0,releaseAt:Infinity,propObstacles:props},wheels:[],actors:home.map((p,i)=>{
   const work=(kind==='return'?workEnd:workStart)[i];if(!work)return null;
   let points;if(!this.active(i))points=[p,p];
   else if(kind==='deploy')points=i===17||i===18?[p,V(p.x,0,-4.75),V(-6.1,0,-4.75),V(-3.4,0,-5.4),work.pos]:[p,V(-6.1,0,p.z*.85),...(work.pos.x>0?[V(-3.4,0,-6.5),V(5.6,0,-6.5),V(5.6,0,work.pos.z)]:[]),work.pos];
   else if(kind==='return')points=[work.pos,...(work.pos.x>0?[V(5.6,0,work.pos.z),V(5.6,0,-6.5),V(-3.4,0,-6.5)]:[]),V(-6.1,0,p.z*.85),p];
   else points=[workEnd[i]?.pos??p,work.pos];
   const loadedPair=(kind==='return'&&(i===17||i===18)||kind==='deploy'&&(i===19||i===20))&&job!=='tyres';
   if(loadedPair){
    const ids=kind==='return'?[17,18]:[19,20],target=ids.map(id=>(kind==='return'?workEnd:workStart)[id]),mid=target[0].pos.clone().add(target[1].pos).multiplyScalar(.5),homeMid=home[ids[0]].clone().add(home[ids[1]]).multiplyScalar(.5);
    const route=kind==='return'?[mid,V(-4.8,0,-7.3),V(-5.4,0,-3.18),homeMid]:[homeMid,V(-5.4,0,-3.18),V(-3.4,0,-7.3),V(3.6,0,-7.3),mid];
    const raw=T.MathUtils.clamp((t-.9)/duration,0,1),u=raw<.15?raw*raw/(.3*.85):raw>.85?1-(1-raw)**2/(.3*.85):(raw-.075)/.85,center=pathAt(route,u),next=pathAt(route,Math.min(1,u+.065)),d=next.clone().sub(pathAt(route,Math.max(0,u-.065))),initial=kind==='return'?target[0].yaw:-Math.PI/2,finish=kind==='return'?-Math.PI/2:target[0].yaw,travel=d.length()>.001?Math.atan2(-d.x,-d.z):finish;let yaw=turn(initial,travel,smooth((t-.9)/1.4));yaw=turn(yaw,finish,smooth((raw-.85)/.15));
    const offset=target[i===ids[0]?0:1].pos.clone().sub(mid).applyAxisAngle(Y,yaw-target[0].yaw);
    return {pos:center.add(offset),yaw,loadYaw:yaw,loadGroup:ids[0],loadType:i===ids[0]?'nose':null,scripted:true,crouch:0,hands:null,walkSpeed:3.1};
   }
   const stagger=kind==='turnaround'?0:(i<12?Math.floor(i/3)*.38+(i%3)*.65:kind==='deploy'&&(i===17||i===18)?4.2:((i-12)%4)*.28),q=T.MathUtils.clamp((t-.9-stagger)/duration,0,1),pos=pathAt(points,q),aim=pathAt(points,Math.min(1,q+.01)),d=aim.clone().sub(pos);
   return {pos,loadType:this.active(i)&&i<12&&(kind==='return'?i%3===1:i%3===2)&&kind!=='turnaround'?'wheel':null,yaw:t<.9?(kind==='deploy'?-Math.PI/2:workEnd[i]?.yaw??0):d.length()>.001?Math.atan2(-d.x,-d.z):kind==='return'?-Math.PI/2:work.yaw,walkSpeed:kind==='return'?2.8:3.4,crouch:0,hands:null};
  })}),duration+12);
  this.deploy=make('deploy',L.deploy);this.returning=make('return',L.return);this.turnaround=make('turnaround',L.turnaround);
  const ready=(motion,target,after)=>{const f=motion.frames.findIndex((f,n)=>n/60>=after&&f.actors.every((a,i)=>!a||!this.active(i)||a.pos.distanceTo(target[i].pos)<.12&&a.speed<.15));return f<0?motion.frames.length/60:f/60;};
  this.readyAt=ready(this.deploy,workStart,L.deploy)+1.8;this.turnReadyAt=ready(this.turnaround,workStart,L.turnaround)+1.8;this.returnAt=ready(this.returning,home.map(pos=>({pos})),L.return)+1.45;
 }
 report(){return {deployment:this.readyAt,turnaround:this.turnReadyAt,return:this.returnAt,active:Array.from({length:22},(_,i)=>i).filter(this.active)};}
 sample(kind,t){
  t=Math.max(0,t);const m=kind==='return'?this.returning:kind==='turnaround'?this.turnaround:this.deploy;let a=m.sample(t);
  if(kind==='return'&&t<.9){const u=smooth(t/.9);a=a.map((b,i)=>this.active(i)?blendActor(this.workEnd[i],b,u):b);}
  if(kind!=='return'){const end=kind==='turnaround'?this.turnReadyAt:this.readyAt,u=smooth((t-end+1.8)/1.8);if(u)a=a.map((b,i)=>this.active(i)?blendActor(b,this.workStart[i],u):b);}
  return a;
 }
 home(){return this.deploy.sample(0);}
}
