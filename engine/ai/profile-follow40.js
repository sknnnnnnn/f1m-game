import {circuit,clamp} from '../tracks/track.js';
import {racingOffset} from '../tracks/racing-line.js';
// Forecast an observed driver's validated spatial speed envelope. Positions
// here are predictions only; the ordinary controller still drives every car.
export function profileMotion40(profile,station,speed,time,ax=0){
 if(!profile||![profile.time,profile.origin,station,speed,time,ax].every(Number.isFinite)||speed<0||!Array.isArray(profile.points)||profile.points.length<2||profile.points.length>61||!profile.points.every(v=>Number.isFinite(v)&&v>=0&&v<=100)||!Array.isArray(profile.metric)||profile.metric.length!==profile.points.length||!profile.metric.every(v=>Number.isFinite(v)&&v>=.3&&v<=3)||time-profile.time<-.01||time-profile.time>.25)return null;
 let s=profile.origin+circuit.delta(station,profile.origin),v=speed;const start=s,rows=[];
 for(let i=1;i<=20;i++){
  const dt=.125,look=s+v*dt,index=clamp((look-profile.origin+4)/6,0,profile.points.length-1),j=Math.floor(index),target=profile.points[j]+((profile.points[j+1]??profile.points[j])-profile.points[j])*(index-j);
  const next=Math.max(0,v+clamp(target-v,-Math.max(18,Math.min(24,-ax))*dt,10*dt));
  const metric=Math.max(.5,profile.metric?.[j]??1);s+=(v+next)*.5*dt/metric;v=next;rows.push({time:i*dt,distance:s-start,speed:v,metric});
 }
 return rows;
}
export function profileFollowing40(agent,state,other){
 const own=agent.perception?.own,a=agent.curve?.racing,b=other.intent?.curve?.racing;
 if(!own||!a||!b||a.join||b.join||Number.isFinite(a.lane40)||Number.isFinite(b.lane40)||other.pit||other.gap<=0||other.gap>140||Math.abs(own.d-racingOffset(own.s))>1.25||Math.abs(other.lateral-racingOffset(other.s))>1.25)return null;
 const speed=Math.hypot(state.u,state.v),self=profileMotion40(agent.profile40,own.s,speed,state.time,state.lastAx),front=profileMotion40(other.intent.profile40,other.s,other.speed,state.time,other.ax);
 if(!self||!front)return null;
 let reduction=0,minimumGap=other.gap;
 for(let i=0;i<self.length;i++){
  const x=self[i],y=front[i],gap=other.gap+y.distance-x.distance,required=((agent.config?.length??5.5)+1+Math.min(4,.04*Math.min(x.speed,y.speed))+.3*x.time)/Math.min(x.metric,y.metric);
  minimumGap=Math.min(minimumGap,gap*Math.min(x.metric,y.metric));reduction=Math.max(reduction,(required-gap)*Math.min(x.metric,y.metric)*1.3/Math.max(.4,x.time));
 }
 return {limit:reduction>0?Math.max(0,speed-reduction):Infinity,minimumGap};
}
