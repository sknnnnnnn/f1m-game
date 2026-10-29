// A standing grid has two occupied lanes. Do not converge all 22 cars onto
// the ideal racing line while the first rows are still accelerating.
export function launchDecision53(a,s,p){
 if(Math.abs(p.own.d-a.launchLane53)>1.4||Math.abs(s.v)>2||s.time>=4.5||Math.abs(p.own.k)>.002||a.id===23||a.pitApproach||a.recovery||a.raceContext?.flag!=='GREEN'||!Number.isFinite(a.launchLane53))return null;
 const lane=a.launchLane53,length=a.config?.length??5.5,width=a.config?.width??1.9;
 a.curve={t0:s.time,T:1,c:[lane]};a.targetLane=lane;a.freeLine=false;a.entryCommit25=null;a.battleCommit=null;a.corridorDecel=0;a.maneuverLimit=Infinity;a.trafficLimit=Infinity;
 for(const o of p.cars){if(o.pit||o.gap<=0||o.gap>80||Math.abs(o.lateral-lane)>width+.25)continue;
  const room=Math.max(0,o.gap-length-.7),closing=Math.max(0,-o.relativeSpeed);
  a.trafficLimit=Math.min(a.trafficLimit,Math.sqrt(o.speed*o.speed+2*10*room));
  if(o.gap<length+.6&&closing>.5)a.trafficLimit=Math.min(a.trafficLimit,Math.max(0,o.speed-1));
 }
 a.targetSpeed=Math.max(a.targetSpeed,75);a.acceleration=a.personality.exit;a.state='LAUNCH';a.reason='GRID LANE / BUILD SPEED BEFORE MERGING';
 const entry={tick:s.tick,time:s.time,state:a.state,reason:a.reason,lane,targetSpeed:a.targetSpeed,front:p.leader?.id??null,gap:p.leader?.gap??null};a.history.push(entry);if(a.history.length>180)a.history.shift();return entry;
}
