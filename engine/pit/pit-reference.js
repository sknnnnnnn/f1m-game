import {pitRoad,PIT,stallStation,pitStopStation,pitRouteSpeedCap,pitSpeedLimitLines,pitMergeStop35} from './pit-lane.js';
import {clamp,circuit} from '../tracks/track.js';
export function makePitPlan(c,s,car,field){
 const road=pitRoad(car.id),at=road.project(s.X,s.Y),phase=car.pit.phase;
 let stop=phase==='PIT_IN'?pitStopStation(car.id):phase==='PIT_OUT'?pitMergeStop35(car,field):Infinity;
 let cap=pitRouteSpeedCap(at.s);
 for(const other of field){if(other.id===car.id||other.live26?.removed)continue;const p=road.project(other.state.X,other.state.Y),gap=p.s-at.s;if(gap>0&&gap<100&&Math.abs(p.d)<3.5){const reserve=11+.4*Math.max(0,s.u);cap=Math.min(cap,Math.sqrt(Math.max(0,other.state.u)**2+2*1.8*Math.max(0,gap-reserve)));if(gap<reserve)cap=Math.min(cap,Math.max(0,other.state.u+(gap-reserve)*.6));}}
 const p={schema:'P1-Trajectory/1.0',id:`PIT-${car.id}-${s.tick}`,inputTick:s.tick,expires:s.tick+10,createdTime:s.time,modelVersion:c.version,routeVersion:'PIT-09/1',route:'P2-BAHRAIN-PIT',stallId:car.id,direction:1,speed:cap,offset:0,corridor:{halfWidth:road.width/2,margin:.3},knots:[]};
 for(let ds=-4;ds<=100;ds+=4){const S=at.s+ds,q=road.at(S),remaining=stop-S,v=Math.min(cap,pitRouteSpeedCap(S),Math.sqrt(2*2.2*Math.max(0,remaining)),pitCornerSpeed35(c,q.k,S));p.knots.push({t:(ds+4)/Math.max(5,cap),x:q.x,y:q.y,psi:q.psi,k:q.k,v,a:Number.isFinite(stop)&&remaining<100&&remaining>0?-2.2:0});}
 {for(let i=p.knots.length-2;i>=0;i--){const a=p.knots[i],b=p.knots[i+1],ds=Math.hypot(b.x-a.x,b.y-a.y);a.v=Math.min(a.v,Math.sqrt(b.v*b.v+12*ds));}}
 for(let i=0;i<p.knots.length-1;i++){const a=p.knots[i],b=p.knots[i+1],ds=Math.hypot(b.x-a.x,b.y-a.y);a.a=Math.min(0,(b.v*b.v-a.v*a.v)/Math.max(.1,2*ds));}
 return p;
}
export function validatePitPlan(c,s,p){
 if(p.schema!=='P1-Trajectory/1.0'||p.routeVersion!=='PIT-09/1'||p.modelVersion!==c.version||!Number.isInteger(p.stallId)||p.stallId<1||p.stallId>7)return'VERSION_MISMATCH';
 if(p.inputTick>s.tick||p.expires<s.tick||s.time-p.createdTime>.5)return'EXPIRED_PLAN';
 const road=pitRoad(p.stallId);let previous=-Infinity;
 for(const q of p.knots){if(!Object.values(q).every(Number.isFinite)||q.t<=previous||q.v<0||q.v>pitRouteSpeedCap(road.project(q.x,q.y).s)+.05)return'INVALID_PIT_KNOT';previous=q.t;if(Math.abs(road.project(q.x,q.y).d)+c.width/2+.3>road.width/2)return'OUTSIDE_PIT_CORRIDOR';if(Math.abs(q.k)*q.v*q.v>.9*c.mu*(c.g+.5*c.rho*c.ClA*q.v*q.v/c.m))return'PIT_LATERAL_BUDGET';}
 return null;
}

const approachCache=new Map();
export function pitApproachSpeed(c){
 const key=c.mu+':'+c.g;if(approachCache.has(key))return approachCache.get(key);
 let speed=60;const end=pitSpeedLimitLines().start+20;
 for(let s=PIT.entry;s<=end;s+=4){const q=pitRoad(1).at(s),local=Math.min(pitRouteSpeedCap(s),Math.sqrt(.5*c.mu*c.g/Math.max(.00001,Math.abs(q.k))));speed=Math.min(speed,Math.sqrt(local*local+12*(s-PIT.entry)));}
 if(approachCache.size>=256)approachCache.delete(approachCache.keys().next().value);approachCache.set(key,speed);return speed;
}

// Preserve the gentle bay manoeuvre; the separated exit uses the actual
// aero/grip budget rather than a blanket half-static-grip corner speed.
export function pitCornerSpeed35(c,k,S){
 const reserve=S>stallStation(6)+35?.85:.5;
 const divisor=Math.abs(k)-reserve*c.mu*.5*c.rho*c.ClA/c.m;
 return divisor>0?Math.sqrt(reserve*c.mu*c.g/divisor):60;
}
