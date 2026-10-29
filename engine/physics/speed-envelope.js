import {pathLaneAt} from '../tracks/racing-path.js';
import {circuit} from '../tracks/track.js';
import {isAttackConfig} from './attack-drive.js';
// P2 demand planning only. C0, tyre/actuator physics and controller stay frozen.
export function trafficCaution(agent){
 const p=agent.perception;if(!p)return 0;
 return Math.max(0,...p.cars.filter(o=>!o.pit&&Math.abs(o.lateral-p.own.d)<6&&(o.gap>=0||Math.abs(o.gap)<10&&Math.abs(o.lateral-p.own.d)>1.8)).map(o=>Math.max(0,Math.min(1,(18-Math.abs(o.gap))/10))));
}
export function brakingTrafficCaution(agent){
 const p=agent.perception;if(!p)return 0;
 const width=agent.config?.width??1.9,curve=agent.curve;
 const shares40=o=>curve?.racing&&o.intent?.curve?.racing?[0,.4,.8,1.2].some(t=>Math.abs(pathLaneAt(curve,curve.t0+t).d-pathLaneAt(o.intent.curve,curve.t0+t).d)<width+.4):Math.min(Math.abs(o.lateral-p.own.d),Math.abs((o.intent?.targetLane??o.lateral)-(agent.targetLane??p.own.d)))<width+.4;
 // Nearby cars still constrain lateral turn-in, but a car alongside on a
 // separate line may relax part of the early longitudinal braking reserve.
 return Math.max(0,...p.cars.filter(o=>!o.pit&&o.gap>0&&shares40(o)).map(o=>Math.max(0,Math.min(1,(45-o.gap)/30))));
}
export function lateralDemandFactor(agent,caution=trafficCaution(agent),curvature=0){
 const before=.86*(agent.personality.corner??1)*(agent.style?.cornerFactor??1),next=Math.min(.98,.97*(agent.personality.corner??1)*(agent.style?.cornerFactor??1));
 // Tight corners retain the existing turn-in reserve for the unchanged
 // steering actuator; extra lateral usage is for flowing bends, not hairpins.
 const tight=Math.max(0,Math.min(1,(Math.abs(curvature)-.008)/.012));
 const reserve=Math.max(caution*(circuit.key==='bahrain'?1:.35),tight);
 return next+(before-next)*reserve;
}
export function brakingBudget(c,agent,tyre,k,v,curveV=v,caution=brakingTrafficCaution(agent)){
 const aero=.5*c.rho*c.ClA/c.m,grip=c.mu*tyre*(c.g+aero*v*v);
 const lateral=Math.min(.98,Math.abs(k)*v*v/Math.max(.1,grip));
 const reserve=Math.sqrt(Math.max(.04,1-lateral*lateral));
 const mechanical=(2*c.brakeF+2*c.brakeR)/(c.R*c.m);
 const style=Math.max(.9,Math.min(1,(agent.personality.braking??6.3)/6.5));
 // Respect both fixed brake torque and the simultaneous tyre-force budget.
 // The old extra curvature multiplier penalised the friction circle twice.
 const racing40=isAttackConfig(c)&&agent.config?.driverBraking==='LATE_ENTRY'&&agent.id!==23&&!agent.recovery&&!['YELLOW','VSC'].includes(agent.state);
 const clear=racing40?1:agent.config?.driverBraking==='LATE_ENTRY'?1-trafficCaution(agent):0,torqueUse=.84+.06*clear,gripUse=.84+.04*clear;
 const next=Math.max(1,Math.min(torqueUse*mechanical*style,gripUse*grip*reserve));
 // Race cars share this physical reserve; following control owns spacing.
 if(racing40)return next*.96;
 const oldLateral=Math.abs(k)*curveV*curveV/grip,oldReserve=Math.sqrt(Math.max(.12,1-Math.min(.96,oldLateral)**2));
 const before=Math.min((agent.personality.braking??6)*1.85,.68*grip*oldReserve)*Math.max(.45,Math.min(1,1-30*Math.abs(k)));
 // Longitudinal reserve follows an occupied or converging corridor.
 // A neighbour on a separate lane still constrains lateral grip and is
 // checked by corridorThreat, but must not halve every braking budget.
 return next+(before-next)*caution;
}

// Feed the unchanged controller an acceleration reference only when the car
// reaches its braking envelope. Otherwise its negative feed-forward cancels
// the positive speed error and produces a long, premature lift/coast phase.
export function approachDemand(profileA,allowedSpeed,actualSpeed,agent,caution=trafficCaution(agent),curvature=0){
 if(isAttackConfig(agent.config??{})&&agent.id!==23&&!['YELLOW','VSC'].includes(agent.state)){
  const margin=Math.max(.7,-Math.min(0,profileA)*(.1+1/(agent.config.pedalRate??16)));
  const drive=Math.max(0,Math.min(14,(allowedSpeed-actualSpeed-.1)*2));
  if(profileA>=-.05)return drive;
  // Blend the former acceleration/braking switch across 0.3 m/s. Tiny
  // speed noise must not toggle the entire negative feed-forward term.
  const x=Math.max(0,Math.min(1,(allowedSpeed-actualSpeed-margin)/.3)),blend=x*x*(3-2*x);
  return profileA+(drive-profileA)*blend;
 }
 if(agent.config?.driverBraking!=='LATE_ENTRY'||caution>.25||Math.abs(curvature)>(agent.config?.driverBraking==='LATE_ENTRY'&&agent.id!==23&&!['YELLOW','VSC'].includes(agent.state)?.004:.0012))return profileA<-.05?profileA:agent.acceleration;
 if(profileA>=-.05)return agent.acceleration;
 // Include the100ms planning cadence and the unchanged physical pedal slew.
 const reactionMargin=Math.max(.5,-profileA*(.1+1/(agent.config?.pedalRate??8)));
 const x=Math.max(0,Math.min(1,(allowedSpeed-actualSpeed-reactionMargin)/2)),hold=x*x*(3-2*x);
 const drive=Math.max(0,agent.personality.exit??6);
 return profileA+(drive-profileA)*hold;
}

// Solve the braking envelope at its resulting entry speed. Evaluating aero
// grip at the untouched straight-line cap (e.g. 94 m/s), then assigning a
// 20 m/s entry, invents high-speed downforce that the slower car does not have.
export function reachableEntrySpeed(c,agent,tyre,k,limit,exitSpeed,ds,caution,scale=1){
 let entry=limit;
 for(let i=0;i<10;i++){
  const v=Math.max(entry,exitSpeed),budget=brakingBudget(c,agent,tyre,k,v,entry,caution)*scale;
  const next=Math.min(entry,Math.sqrt(exitSpeed*exitSpeed+2*budget*ds));
  if(entry-next<.0001){entry=next;break;}
  entry=next;
 }
 return entry;
}
