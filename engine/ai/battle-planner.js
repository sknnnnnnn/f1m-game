import {tacticalLane26} from './tactical-lanes26.js';
import {circuit,clamp,mod} from '../tracks/track.js';
import {racingOffset,smooth} from '../tracks/racing-line.js';
import {rivalSummary} from './rival-memory.js';
// Rolling estimates, not a solved future. Only the first safe lane is executable;
// subsequent corners are rescored as the observed scene changes.
export function cornerHorizon(s){return circuit.turns.map(t=>({...t,distance:mod(t.s-s,circuit.length)})).filter(t=>t.distance>15).sort((a,b)=>a.distance-b.distance).slice(0,3);}
function gripFactor(state){const tf=T=>T<60?.75:T<110?1:Math.max(.45,1-(T-110)/110);return Math.min(...state.wheels.map(w=>tf(w.Ts)*Math.max(.4,1-.4*w.wear)*Math.max(.3,1-.5*w.damage)));}
export function scoreLines(agent,state,p,safeLane){
 const turns=cornerHorizon(p.own.s),first=turns[0],c=agent.config??{mu:1.55,rho:1.2,ClA:3,m:850,g:9.81};
 if(!first)return null;const turn=Math.sign(first.k),rival=p.cars.filter(o=>!o.pit&&o.gap>12&&o.gap<110).sort((a,b)=>(agent.target23?.mode==='ATTACK'?Number(b.id===agent.target23.id)-Number(a.id===agent.target23.id):0)||a.gap-b.gap)[0],learned=rivalSummary(agent,rival?.id),grip=.68*c.mu*gripFactor(state)*(agent.personality.corner??1),aero=.5*c.rho*c.ClA/c.m;
 const end=Math.min(1300,turns.at(-1).distance+130),specs=[{kind:'INSIDE',label:'แซงไลน์ใน',lane:turn*3.4},{kind:'OUTSIDE',label:'รักษาความเร็วไลน์นอก',lane:-turn*3.4},{kind:'EXIT',label:'จัดรถสวนขาออก',lane:-turn*2.7}];
 const candidates=specs.map(raw=>{const spec={...raw,lane:tacticalLane26(raw.lane)};
  const lane=(ds)=>{const base=racingOffset(p.own.s+ds),entry=first.distance-100,apex=first.distance+15;
   const start=p.own.d+(spec.lane-p.own.d)*smooth(ds/Math.max(90,p.speed*(agent.personality.commit+1.2)));
   if(ds<apex)return start;
   const exit=spec.kind==='EXIT'?turn*1.5:base;
   const n=start+(exit-start)*smooth((ds-apex)/100);return n+(base-n)*smooth((ds-first.distance-150)/150);};
  const point=ds=>circuit.point(p.own.s+ds,lane(ds)),knots=[];
  for(let ds=0;ds<=end;ds+=16){const a=point(ds-1),b=point(ds),d=point(ds+1),dx=(d.x-a.x)/2,dy=(d.y-a.y)/2,ddx=d.x-2*b.x+a.x,ddy=d.y-2*b.y+a.y,k=(dx*ddy-dy*ddx)/Math.max(1e-8,Math.hypot(dx,dy)**3),v=Math.abs(k)>grip*aero?Math.min(94,Math.sqrt(grip*c.g/(Math.abs(k)-grip*aero))):94;knots.push({ds,x:b.x,y:b.y,k,v,n:lane(ds)});}
  for(let i=knots.length-2;i>=0;i--){const a=knots[i],b=knots[i+1];a.v=Math.min(a.v,Math.sqrt(b.v*b.v+2*9*Math.hypot(b.x-a.x,b.y-a.y)));}
  let time=0,v=Math.min(p.speed,knots[0].v),exitSpeed=0;for(let i=1;i<knots.length;i++){const a=knots[i-1],b=knots[i],ds=Math.hypot(b.x-a.x,b.y-a.y),next=Math.min(b.v,Math.sqrt(v*v+2*agent.personality.exit*(agent.tyreManagement.exitFactor??1)*ds));time+=2*ds/Math.max(8,v+next);v=next;if(b.ds<first.distance+110)exitSpeed=v;}
  const reachable=Math.abs(spec.lane-p.own.d)<=4.3&&safeLane(spec.lane),entryK=Math.max(...knots.filter(q=>Math.abs(q.ds-first.distance)<35).map(q=>Math.abs(q.k))),cornerSpeed=Math.min(...knots.filter(q=>Math.abs(q.ds-first.distance)<35).map(q=>q.v));
  const stopDistance=Math.max(0,(p.speed*p.speed-cornerSpeed*cornerSpeed)/(2*9))+p.speed*.25;
  const tooLate=spec.kind==='INSIDE'&&stopDistance>Math.max(0,first.distance-12)&&p.speed>cornerSpeed+4;
  const traffic=rival&&Math.abs(spec.lane-rival.lateral)<3.1?2.5:0,wearCost=agent.style.tyreCare*(spec.kind==='INSIDE'?.8:spec.kind==='EXIT'?.05:.25),learnedCost=learned.confidence*(spec.kind==='INSIDE'?learned.insideRate*.7:spec.kind==='OUTSIDE'?(.5-learned.insideRate)*.7:-Math.max(0,3-learned.exitAcceleration)*.1);
  const preference=spec.kind==='INSIDE'?-(agent.personality.risk-.5)*.8:spec.kind==='EXIT'?-agent.style.lateApex*.5:0;
  return {...spec,time,exitKPH:exitSpeed*3.6,cornerKPH:cornerSpeed*3.6,score:time+traffic+wearCost+learnedCost+preference+(agent.engineerOrder?.attack==='EXIT'&&spec.kind==='EXIT'?-.9:agent.engineerOrder?.attack==='PREPARE'&&spec.kind==='INSIDE'?-.35:0),reachable,tooLate,rejected:!reachable?'ช่องทางไม่ปลอดภัย':tooLate?'เลยระยะเบรกที่เผื่อไว้':null,entryK,stopDistance};
 });
 const legal=candidates.filter(x=>!x.rejected).sort((a,b)=>a.score-b.score);return {created:state.time,turns:turns.map(t=>({number:t.number,distance:t.distance,turn:Math.sign(t.k)})),rival:rival?.id??null,learned,candidates,selected:legal[0]?.kind??null,window:first.distance};
}
export function planBattle(agent,state,p,safeLane,decision){
 if(!agent.battle||state.time-agent.battle.created>=.6)agent.battle=scoreLines(agent,state,p,safeLane);
 const report=agent.battle;if(agent.engineerOrder?.attack==='ABORT'){agent.battleCommit=null;return decision;}if(!report)return decision;
 const protectedMode=['HOLD_SPACE','BOXED_IN','RECOVER','BRAKE','FEINT','OUTSIDE_SWITCH','PASS_COMMIT'].includes(decision.mode);
 const rival=p.cars.find(o=>o.id===report.rival),memory=agent.battleCommit;
 if(memory){const d=circuit.delta(memory.apex,p.own.s),other=p.cars.find(o=>o.id===memory.rival);let lane=memory.lane,mode=memory.kind==='EXIT'?'EXIT_SETUP':'BRAKE_DUEL';
  if(!other||other.gap< -14||other.gap>115||state.time-memory.started>12||d< -150){agent.battleCommit=null;}
  else if(!protectedMode){
   if(memory.kind==='EXIT'&&d<10){lane=memory.turn*1.5;mode='EXIT_TARGET';}
   if(Math.abs(lane-p.own.d)<=4.3&&safeLane(lane))return {...decision,choice:lane,mode,reason:mode==='EXIT_TARGET'?`DRIVE EXIT / CAR ${memory.rival}`:`${memory.kind} / T${memory.number} → NEXT TWO CORNERS`,pace:Math.min(94,agent.personality.pace+1)};
   agent.battleCommit=null;agent.lastAbort={time:state.time,rival:memory.rival,reason:'ช่องแซงปิด ให้รถหมุนและรอจังหวะใหม่'};
   return {...decision,choice:agent.targetLane,mode:'ABORT_ATTACK',pace:Math.min(decision.pace,other.speed),reason:'PASS CORRIDOR CLOSED / WAIT'};
  }
 }
 if(protectedMode||memory||!rival||rival.gap<30||rival.gap>85||p.speed<25||Math.abs(p.own.k)>.008||report.window>380||report.window<70||state.time<agent.commitUntil||agent.duel?.pass||agent.duel?.exit||agent.racecraft?.action==='COMMIT')return decision;
 // Preserve an effective tow until the speed/transition gap warrants leaving it.
 if(decision.mode==='DRAFT'&&report.window>Math.max(100,p.speed*3)&&rival.gap>14+.18*p.speed+Math.max(0,-rival.relativeSpeed)*(agent.personality.commit+1.2))return decision;
 const candidate=report.candidates.find(c=>c.kind===report.selected);
 if(!candidate){if(report.candidates.some(c=>c.tooLate)){agent.lastAbort={time:state.time,rival:rival.id,reason:'ระยะเบรกหรือพื้นที่ไม่พอ'};return {...decision,mode:'ABORT_ATTACK',pace:Math.min(decision.pace,rival.speed),reason:'NO REACHABLE ATTACK / FOLLOW'};}return decision;}
 if(!safeLane(candidate.lane))return decision;
 const first=report.turns[0];agent.battleCommit={kind:candidate.kind,lane:candidate.lane,rival:rival.id,started:state.time,apex:mod(p.own.s+first.distance,circuit.length),number:first.number,turn:first.turn};
 return {...decision,choice:candidate.lane,mode:candidate.kind==='EXIT'?'EXIT_SETUP':'BRAKE_DUEL',reason:`PLAN ${candidate.kind} / T${report.turns.map(t=>t.number).join(' → T')}`};
}
export function intelligenceView(agent){return {action:agent.state,reason:agent.reason,plan:agent.battle,commit:agent.battleCommit??null,abort:agent.lastAbort??null,resources:agent.resources??null};}
