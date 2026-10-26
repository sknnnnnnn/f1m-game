import {clearance} from '../physics/collision.js';import {circuit} from '../tracks/track.js';import {laneAt} from '../physics/reference-adapter.js';
// Frenet lane distances alone miss nose/tail convergence in a tight bend.
// Forecast the existing intended corridors; this never moves physical poses.
export function corridorThreat(agent,state,other,track=circuit){
 if(agent.config?.driverBraking!=='LATE_ENTRY'||other.pit||other.gap<=0||other.gap>35||Math.abs(other.lateral-agent.perception.own.d)>6)return false;
 const own=agent.perception.own,c=agent.config??{length:5.5,width:1.9},speed=Math.hypot(state.u,state.v),time=state.time;
 const pose=(station,d,curve,v,headingError,t,bodySpeed,sideSpeed,yawRate)=>{const lane=curve?laneAt(curve,time+t):{d,vd:0},base=curve?laneAt(curve,time).d:d,n=lane.d+(d-base)*Math.exp(-t*2),a=track.at(station+v*t),q=track.point(station+v*t,n);if(t<=.6){const start=track.point(station,d),psi=track.at(station).psi+(headingError??0),r=yawRate??0,u=bodySpeed,w=sideSpeed??0,next=psi+r*t;return Math.abs(r)>.001?{X:start.x+(u*(Math.sin(next)-Math.sin(psi))+w*(Math.cos(next)-Math.cos(psi)))/r,Y:start.y+(-u*(Math.cos(next)-Math.cos(psi))+w*(Math.sin(next)-Math.sin(psi)))/r,psi:next}:{X:start.x+(u*Math.cos(psi)-w*Math.sin(psi))*t,Y:start.y+(u*Math.sin(psi)+w*Math.cos(psi))*t,psi:next};}return {X:q.x,Y:q.y,psi:a.psi+Math.atan2(lane.vd,Math.max(2,v))+(headingError??0)*Math.exp(-t*3)};};
 const ownHeading=Math.atan2(Math.sin(state.psi-own.psi),Math.cos(state.psi-own.psi)),ownProgress=speed*Math.cos(ownHeading)/Math.max(.5,1-own.k*own.d),otherAt=track.at(other.s),otherHeading=ownHeading+(other.headingError??0)+own.psi-otherAt.psi,otherProgress=other.speed*Math.cos(otherHeading)/Math.max(.5,1-otherAt.k*other.lateral);
 for(const t of [.1,.2,.4,.6,1,1.25]){const a=pose(own.s,own.d,agent.curve,ownProgress,ownHeading,t,state.u,state.v,state.r),b=pose(other.s,other.lateral,other.intent?.curve,otherProgress,otherHeading,t,Math.sqrt(Math.max(0,other.speed**2-(other.sideSpeed??0)**2)),other.sideSpeed,other.yawRate);if(clearance(a,b,c)<.4)return true;}
 return false;
}
