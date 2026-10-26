import {pitRoad,PIT,pitRouteSpeedCap} from './pit-lane.js';
export function pitTrafficCap32(car,field,config){const road=pitRoad(car.id),own=road.project(car.state.X,car.state.Y);let cap=pitRouteSpeedCap(own.s);
 for(const other of field){if(other.id===car.id||other.live26?.removed)continue;const q=road.project(other.state.X,other.state.Y),gap=q.s-own.s;
  if(gap<-.1||gap>125||q.distance>config.width+1.4)continue;if(Math.abs(gap)<.1&&other.id>car.id)continue;
  const speed=Math.max(0,other.state.u*Math.cos(other.state.psi-own.psi)),reserve=config.length+3+Math.max(0,car.state.u-speed)*.7;
  cap=Math.min(cap,Math.sqrt(speed*speed+2*3*Math.max(0,gap-reserve)),Math.max(0,speed+(gap-reserve)*.6));
 }return cap;
}
