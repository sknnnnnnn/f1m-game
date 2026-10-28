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
  if(gap<0||gap>45||Math.abs(other.projection.d-car.projection.d)>6||Math.hypot(other.state.X-car.state.X,other.state.Y-car.state.Y)>50)continue;
  const closing=Math.max(0,Math.hypot(car.state.u,car.state.v)-Math.hypot(other.state.u,other.state.v)),margin=.3+Math.min(.5,closing*.05);
  // A braking/converging pack needs closing-energy and reaction room before
  // the final body sweep. Clear-road pull-outs retain the body forecast only.
  const heading=car.projection.psi,side=s=>s.u*Math.sin(s.psi-heading)+(s.v??0)*Math.cos(s.psi-heading),lateral=other.projection.d-car.projection.d,sideRate=side(other.state)-side(car.state),shared=[0,.4,.8].some(t=>Math.abs(lateral+sideRate*t)<config.width+.6);
  const ownSpeed=Math.hypot(car.state.u,car.state.v),leadSpeed=Math.hypot(other.state.u,other.state.v),reserve=config.length+1.2+closing*.65+Math.max(0,(ownSpeed*ownSpeed-leadSpeed*leadSpeed)/20)+((other.state.brake??0)>.12?ownSpeed*.3:0);
  const brakingOrBend=(other.state.brake??0)>.12||(car.state.brake??0)>.12||Math.abs(car.projection.k)>.003;
  if(shared&&brakingOrBend&&gap<reserve||[.1,.25,.45,.7,1.0].some(t=>clearance(projected(car.state,t),projected(other.state,t),config)<margin)){
   return {...out,command:{...out.command,throttle:0,brake:Math.max(.8,out.command.brake??0),energy:false},trace:{...out.trace,contactBrake42:other.id}};
  }
 }
 return out;
}
