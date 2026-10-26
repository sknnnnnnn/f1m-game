import {pathOffset,pathLaneAt} from '../tracks/racing-path.js';
import {isAttackConfig} from './attack-drive.js';
import {lateralDemandFactor,brakingBudget,trafficCaution,brakingTrafficCaution,approachDemand} from './speed-envelope.js';
import {racingOffset,smooth} from '../tracks/racing-line.js';
import {pitRoad} from '../pit/pit-lane.js';
import {validatePitPlan} from '../pit/pit-reference.js';

// P2-only reference dependency for byte-identical P1 Controller. Physics source unchanged. Separate P2 high-speed vehicle preset; original C0 retained.
import {circuit,clamp,wrap} from '../tracks/track.js';
import * as P1 from '../../racing/runtime/frozen/reference.js';
const road=p=>p.route==='P2-BAHRAIN-GP'?circuit:p.route==='P2-BAHRAIN-PIT'?pitRoad(p.stallId):P1.road(p);
function offsetAt(p,t){if(p.route==='P2-BAHRAIN-PIT')return {d:0,vd:0,ad:0};if(p.route!=='P2-BAHRAIN-GP')return P1.offsetAt(p,t);return laneAt(p.laneCurve,t);}
function laneAt(curve,t){if(curve.racing)return pathLaneAt(curve,t);const z=clamp(t-curve.t0,0,curve.T),c=curve.c;return{d:c.reduce((v,a,j)=>v+a*z**j,0),vd:z>=curve.T?0:c.reduce((v,a,j)=>v+(j?j*a*z**(j-1):0),0),ad:z>=curve.T?0:c.reduce((v,a,j)=>v+(j>1?j*(j-1)*a*z**(j-2):0),0)};}
function connectLane(old,t,target,T=3.4){
 const a=laneAt(old,t),D=target-a.d;let v=a.vd,b=a.ad;
 if(old.racing){v=clamp(v,-1.5,1.5);b=clamp(b,-1.5,1.5);}
 let result;
 for(let attempt=0;attempt<10;attempt++){
  result={t0:t,T,c:[a.d,v,b/2,10*D/T**3-6*v/T**2-1.5*b/T,-15*D/T**4+8*v/T**3+1.5*b/T**2,6*D/T**5-3*v/T**4-.5*b/T**3]};
  if(!old.racing||Array.from({length:41},(_,i)=>laneAt(result,t+i*T/40).d).every(d=>Math.abs(d)<=Math.max(6,Math.abs(a.d),Math.abs(target))+.001))break;
  v*=.5;b*=.5;
 }
 return result;
}
function tyreFactor(s){const tf=T=>T<=20?.55:T<=60?.55+(T-20)*.3/40:T<=90?.85+(T-60)*.15/30:T<=110?1-(T-90)*.08/20:T<=140?.92-(T-110)*.27/30:T<=180?.65-(T-140)*.3/40:.35;return Math.min(...s.wheels.map(w=>tf(w.Ts)*Math.max(.4,1-.4*w.wear)*Math.max(.3,1-.5*w.damage)));}
function makeReference(c,s,agent){const at=circuit.project(s.X,s.Y,s.psi),speed=agent.targetSpeed,p={schema:'P1-Trajectory/1.0',id:`P2-${agent.id}-${s.tick}`,inputTick:s.tick,expires:s.tick+15,modelVersion:c.version,routeVersion:'P2-BAHRAIN-GP/2',route:'P2-BAHRAIN-GP',direction:1,speed,offset:agent.targetLane,createdTime:s.time,recovery:agent.recovery??null,corridor:{halfWidth:circuit.width/2,margin:.35},knots:[],laneCurve:agent.curve};
  const point=(ds)=>{
   const a=circuit.at(at.s+ds);let n;
   if(agent.curve.racing)n=pathOffset(agent.curve,at.s+ds);
   else{const tm=s.time+ds/Math.max(5,Math.hypot(s.u,s.v)),o=laneAt(agent.curve,tm),blend=agent.freeLine?smooth((ds-Math.max(20,Math.hypot(s.u,s.v)*.5))/90):0;n=blend?o.d+(racingOffset(at.s+ds)-o.d)*blend:o.d;}
   return{x:a.x-n*Math.sin(a.psi),y:a.y+n*Math.cos(a.psi)};
  };
  // Shanghai flowing bends may use the actual vehicle grip. Fade back to the
  // proven tight-corner reserve above 0.012/m, reaching it at 0.047/m.
  // Recovery, safety car and caution plans keep their original envelope.
  const shanghaiAttack=circuit.key==='shanghai'&&isAttackConfig(c)&&agent.id!==7&&!agent.recovery&&!['VSC','YELLOW'].includes(agent.state);
  const conservative10=circuit.imported33||agent.id===7||['VSC','YELLOW'].includes(agent.state);
  const tyre=tyreFactor(s),caution=trafficCaution(agent),brakeCaution=brakingTrafficCaution(agent),gripScale=(conservative10?.62:.8)*(isAttackConfig(c)?Math.min(c.mu,1.7):c.mu)*tyre,aero=.5*c.rho*c.ClA/c.m;
  for(let ds=-4;ds<=900;ds+=6){const a=point(ds-.4),b=point(ds),d=point(ds+.4),dx=(d.x-a.x)/.8,dy=(d.y-a.y)/.8,ddx=(d.x-2*b.x+a.x)/.16,ddy=(d.y-2*b.y+a.y)/.16,k=(dx*ddy-dy*ddx)/Math.max(1e-9,(dx*dx+dy*dy)**1.5),K=lateralDemandFactor(agent,caution,k)*(shanghaiAttack?gripScale+(.68*c.mu*tyre-gripScale)*(1-clamp((Math.abs(k)-.012)/.035,0,1)):gripScale),cap=Math.abs(k)>K*aero?Math.sqrt(K*c.g/(Math.abs(k)-K*aero)):94;p.knots.push({t:(ds+4)/Math.max(5,speed),x:b.x,y:b.y,psi:Math.atan2(dy,dx),k,v:Math.min(speed,cap,agent.pitEntry?Math.sqrt(agent.pitEntry.speed**2+12*Math.max(0,circuit.delta(agent.pitEntry.station,at.s)-ds)):Infinity,agent.maneuverLimit??Infinity,ds<Math.max(14,Math.hypot(s.u,s.v)*.35)?agent.trafficLimit??Infinity:Infinity),a:agent.acceleration});}
  // Tyre-limited braking envelope for compact hard-braking sections.
  for(let j=p.knots.length-2;j>=0;j--){const a=p.knots[j],b=p.knots[j+1],ds=Math.hypot(a.x-b.x,a.y-b.y),v=Math.max(a.v,b.v),budget=brakingBudget(c,agent,tyre,a.k,v,a.v,brakeCaution)*(isAttackConfig(c)&&agent.id!==7&&!['VSC','YELLOW'].includes(agent.state)?.60:conservative10?.62:1);a.v=Math.min(a.v,Math.sqrt(b.v*b.v+2*budget*ds));}
  for(let j=0;j<p.knots.length-1;j++){const a=p.knots[j],b=p.knots[j+1],ds=Math.hypot(a.x-b.x,a.y-b.y);b.v=Math.min(b.v,Math.sqrt(a.v*a.v+2*(isAttackConfig(c)?14:agent.personality.exit??6)*(agent.tyreManagement?.exitFactor??1)*ds));const profileA=(b.v*b.v-a.v*a.v)/Math.max(.1,2*ds);a.a=approachDemand(profileA,a.v,Math.hypot(s.u,s.v),agent,caution,a.k);if(j<4&&agent.corridorDecel<0)a.a=Math.min(a.a,agent.corridorDecel);}
  // The 900 m speed envelope is propagated back before passing only the local
  // 110 m control corridor to the unchanged controller. Distant knots cannot
  // be nearest to this car during a 0.1 s plan lifetime on this compact circuit.
  p.previewMetres=900;p.controlLookaheadMetres=110;p.knots=p.knots.slice(0,20);
  for(const knot of p.knots)Object.freeze(knot);Object.freeze(p.knots);Object.freeze(p.corridor);Object.freeze(p.laneCurve.c);if(p.laneCurve.racing){if(p.laneCurve.racing.join)Object.freeze(p.laneCurve.racing.join);Object.freeze(p.laneCurve.racing);}Object.freeze(p.laneCurve);return Object.freeze(p);
}
const validationCache=new WeakMap();
function validatePlan(c,s,p){if(p?.route==='P2-BAHRAIN-PIT')return validatePitPlan(c,s,p);if(p?.route!=='P2-BAHRAIN-GP')return P1.validatePlan(c,s,p);
 if(p.schema!=='P1-Trajectory/1.0'||p.routeVersion!=='P2-BAHRAIN-GP/2'||p.modelVersion!==c.version)return'VERSION_MISMATCH';
 if(!Number.isInteger(p.inputTick)||!Number.isInteger(p.expires)||p.inputTick>s.tick||p.expires<s.tick||s.time-p.createdTime>.5)return'EXPIRED_PLAN';
 if(!Number.isFinite(p.speed)||p.speed<0||!Array.isArray(p.knots)||p.knots.length<2||p.direction!==1||!p.laneCurve||!Array.isArray(p.laneCurve.c)||!p.laneCurve.c.every(Number.isFinite))return'INVALID_PLAN';
 const tyre=tyreFactor(s),cached=validationCache.get(p);if(cached&&cached.config===c)return cached.minimumTyre>tyre?'UNREACHABLE_LATERAL_ACCELERATION':null;let previous=-Infinity,minimumTyre=0;
 for(const q of p.knots){if(!Object.values(q).every(Number.isFinite)||q.v<0||q.t<=previous)return'INVALID_KNOTS';previous=q.t;
  const lateral=Math.abs(circuit.project(q.x,q.y).d);if(p.recovery){if(!Number.isFinite(p.recovery.startD)||p.recovery.startD<4.65||p.recovery.startD>18||p.speed>12||q.v>12||lateral>p.recovery.startD+.1||Math.abs(circuit.project(s.X,s.Y,s.psi).d)>18)return'INVALID_RECOVERY';}else if(lateral+c.width/2+p.corridor.margin>circuit.width/2)return'OUTSIDE_CORRIDOR';
  const need=Math.abs(q.k)*q.v*q.v/(.8*c.mu*(c.g+.5*c.rho*c.ClA*q.v*q.v/c.m));minimumTyre=Math.max(minimumTyre,need);if(need>tyre)return'UNREACHABLE_LATERAL_ACCELERATION';
 }
 if(Object.isFrozen(p)&&Object.isFrozen(p.knots)&&p.knots.every(Object.isFrozen))validationCache.set(p,{config:c,minimumTyre});return null;
}
const trajectoryTarget=(p,s)=>P1.trajectoryTarget(p,s);


export {road,offsetAt,laneAt,connectLane,makeReference,validatePlan,trajectoryTarget};
