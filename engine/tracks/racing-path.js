import {circuit,clamp,wrap} from './track.js';
import {racingOffset} from './racing-line.js';
// Spatial join is anchored once, not restarted at each 100 ms AI update.
// That allows the controller to converge onto the same road-relative path.
export function racingPath(previous,state,at){
 let join=previous?.racing?.join??null;
 if(!previous?.racing){
  const speed=Math.hypot(state.u,state.v),length=Math.max(100,speed*2);
  const heading=wrap(state.psi+Math.atan2(state.v,Math.max(1,state.u))-at.psi),room=Math.max(0,5.8-Math.abs(at.d)),slopeLimit=room/(length*.35);
  const initialSlope=clamp((1-at.k*at.d)*Math.tan(heading),-slopeLimit,slopeLimit);
  join={s:at.s,length,start:at.d,slope:initialSlope};
 }
 if(join&&circuit.delta(at.s,join.s)>=join.length)join=null;
 const heading=wrap(state.psi+Math.atan2(state.v,Math.max(1,state.u))-at.psi),progressSpeed=Math.hypot(state.u,state.v)*Math.cos(heading)/Math.max(.3,1-at.k*at.d);
 return {t0:state.time,T:5,c:[at.d],racing:{s:at.s,speed:progressSpeed,join}};
}
export function pathOffset(curve,station){
 const join=curve.racing.join;if(!join)return racingOffset(station);
 const d=circuit.delta(station,join.s),z=clamp(d,0,join.length),u=z/join.length,w=u*u*u*(10-15*u+6*u*u);
 return (1-w)*join.start+w*racingOffset(station)+join.slope*z*(1-w)**2;
}
export function pathLaneAt(curve,t){
 const r=curve.racing,station=r.s+r.speed*(t-curve.t0),d=pathOffset(curve,station),a=pathOffset(curve,station-.5),b=pathOffset(curve,station+.5);
 return {d,vd:(b-a)*r.speed,ad:(a-2*d+b)*4*r.speed*r.speed};
}
