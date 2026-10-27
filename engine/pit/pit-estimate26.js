import {circuit,clamp} from '../tracks/track.js';
import {PIT,pitRoad,pitStopStation,pitRouteSpeedCap} from './pit-lane.js';
import {pitCornerSpeed35} from './pit-reference.js';
const cache=new Map();
// Integrate the actual service route, speed limits, bay stop and acceleration.
// A forecast only: no race state, service readiness or merge gaps are changed.
export function pitEstimate26(car,{service=8.2,repair=0,queue=0}={}){
 const mu=car.agent?.config?.mu??2.7,key=car.id+':'+Math.round(mu*20);
 let route=cache.get(key);
 if(!route){
  const road=pitRoad(car.id),stop=pitStopStation(car.id),stations=[PIT.entry,stop,PIT.exit];
  for(let s=PIT.entry+4;s<PIT.exit;s+=4)stations.push(s);
  stations.sort((a,b)=>a-b);
  const nodes=[...new Set(stations)].map(s=>{const q=road.at(s);return {...q,v:Math.abs(s-stop)<.01?0:Math.min(pitRouteSpeedCap(s),pitCornerSpeed35(car.agent?.config??{mu,g:9.81,rho:1.2,ClA:3,m:850},q.k,s))};});
  for(let i=nodes.length-2;i>=0;i--){const a=nodes[i],b=nodes[i+1],ds=Math.hypot(a.x-b.x,a.y-b.y);a.v=Math.min(a.v,Math.sqrt(b.v*b.v+4.4*ds));}
  for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],ds=Math.hypot(a.x-b.x,a.y-b.y);b.v=Math.min(b.v,Math.sqrt(a.v*a.v+5*ds));}
  let moving=0,metres=0;
  for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],ds=Math.hypot(a.x-b.x,a.y-b.y);metres+=ds;moving+=2*ds/Math.max(.1,a.v+b.v);}
  route={moving,metres,mainMetres:PIT.exit-PIT.entry};cache.set(key,route);
 }
 const speed=clamp(car.distance/Math.max(1,car.state.time),27,60),transit=route.moving+service+repair+queue+2;
 return {...route,transit,loss:Math.max(0,transit-route.mainMetres/speed),speed,service,repair,queue};
}
