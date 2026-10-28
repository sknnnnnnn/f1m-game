import {clearance} from './collision.js';
import {circuit,clamp} from '../tracks/track.js';
// Recheck actual body motion every physics frame, between the 100 ms thoughts.
// Only the trailing driver's pedals change; no pose or velocity corrections.
function projected(s,t){
 const psi=s.psi,r=s.r??0,u=Math.max(0,s.u+.5*clamp(s.lastAx??0,-20,10)*t),v=s.v??0,next=psi+r*t;
 return Math.abs(r)>.001?{X:s.X+(u*(Math.sin(next)-Math.sin(psi))+v*(Math.cos(next)-Math.cos(psi)))/r,Y:s.Y+(-u*(Math.cos(next)-Math.cos(psi))+v*(Math.sin(next)-Math.sin(psi)))/r,psi:next}:{X:s.X+(u*Math.cos(psi)-v*Math.sin(psi))*t,Y:s.Y+(u*Math.sin(psi)+v*Math.cos(psi))*t,psi:next};
}
export function contactBrake42(car,field,out,config){
 if(car.pit?.active||car.finishedAt!==null)return out;
 for(const other of field){
  if(other.id===car.id)continue;
  const gap=circuit.delta(other.projection.s,car.projection.s);
  if(gap<0||gap>28||Math.abs(other.projection.d-car.projection.d)>6||Math.hypot(other.state.X-car.state.X,other.state.Y-car.state.Y)>32)continue;
  const closing=Math.max(0,Math.hypot(car.state.u,car.state.v)-Math.hypot(other.state.u,other.state.v)),margin=.3+Math.min(.5,closing*.05);
  if([.1,.2,.35].some(t=>clearance(projected(car.state,t),projected(other.state,t),config)<margin)){
   return {...out,command:{...out.command,throttle:0,brake:Math.max(.8,out.command.brake??0),energy:false},trace:{...out.trace,contactBrake42:other.id}};
  }
 }
 return out;
}
