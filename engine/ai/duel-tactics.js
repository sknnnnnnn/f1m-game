import {passProgress26} from './pass-progress26.js';
import {tacticalLane26} from './tactical-lanes26.js';

import {clamp} from '../tracks/track.js';
// Event-driven tactical memory. This never writes a pose, command or race rank.
function duelTactics(agent,state,p,safeLane,decision){
 const memory=agent.duel??(agent.duel={gaps:new Map(),counter:null,exit:null,passesSuffered:0});
 let {choice,pace,mode,reason,turn,corner,ideal}=decision;
 for(const rival of p.cars){const old=memory.gaps.get(rival.id);if(rival.gap>3&&rival.gap<160&&old!==undefined&&old< -3&&old> -160){memory.counter={id:rival.id,until:state.time+22};memory.passesSuffered++;}if(Math.abs(rival.gap)>3)memory.gaps.set(rival.id,rival.gap);}
 const rival=memory.counter&&p.cars.find(c=>c.id===memory.counter.id);
 if(memory.counter&&(state.time>memory.counter.until||!rival||rival.gap< -12||rival.gap>160))memory.counter=null;
 if(memory.counter&&rival&&rival.gap>8&&rival.gap<130){
  // Ask for racing effort, never add engine power. Traffic/braking limits still apply.
  pace=Math.max(pace,Math.min(94,rival.speed+6));
  if(!corner&&rival.gap>36&&Math.abs(rival.lateral-p.own.d)<4.1&&safeLane(rival.lateral)){choice=rival.lateral;mode='COUNTER';reason=`REBUILD TOW / REATTACK CAR ${rival.id}`;}
  else if(['SLINGSHOT','SWITCHBACK','CRUISE'].includes(mode)){mode='COUNTER';reason=`REATTACK CAR ${rival.id} / SPACE AND EXIT`;}
 }
 const front=p.leader,k=Math.abs(p.own.k);
 // Preserve the rival through a linked corner sequence; corridor checks still win.
 memory.sequence=memory.counter?{id:memory.counter.id,phase:corner?'SAVE_EXIT':'REBUILD_TOW',until:memory.counter.until}:memory.exit?{id:memory.exit.id,phase:'EXIT_SETUP'}:null;
 if(!memory.exit&&front&&front.gap>18&&front.gap<35&&agent.personality.risk<.75&&corner&&Math.sign(front.lateral)===turn&&Math.abs(front.lateral)>2.4&&state.time>=agent.commitUntil){
  const outside=clamp(tacticalLane26(-turn*3.8),p.own.d-4,p.own.d+4);
  if(safeLane(outside)){memory.exit={id:front.id,turn,peak:k,started:state.time,drive:false};choice=outside;pace=Math.min(pace,front.speed+1.5);mode='EXIT_SETUP';reason=`TRADE ENTRY FOR EXIT / CAR ${front.id}`;}
 }
 if(memory.exit){const plan=memory.exit;plan.peak=Math.max(plan.peak,k);if(state.time-plan.started>10||Math.sign(p.own.k)!==plan.turn&&k>.001){memory.exit=null;}
  else if(plan.peak>.002&&k<plan.peak*.72){plan.drive=true;const undercut=clamp(plan.turn*2.8,p.own.d-4,p.own.d+4);if(state.time>=agent.commitUntil&&safeLane(undercut)){choice=undercut;pace=Math.max(pace,Math.min(94,agent.personality.pace+3));mode='EXIT_DRIVE';reason=`LATE APEX / DRIVE UNDER CAR ${plan.id}`;}if(k<.00025)memory.exit=null;}
  else if(!plan.drive){mode='EXIT_SETUP';reason=`WAIT FOR CORNER TO OPEN / CAR ${plan.id}`;}
 }
 // Keep a passing corridor until the rival is physically cleared. Returning to
 // the ideal line merely because the leader left the same-lane sensor aborts passes.
 if(mode==='SLINGSHOT'&&!memory.pass&&p.leader&&p.leader.gap<65){memory.pass={id:p.leader.id,lane:choice,started:state.time};}
 if(['FEINT','OUTSIDE_SWITCH'].includes(mode))memory.pass=null;
 if(memory.pass){const pass=memory.pass,opponent=p.cars.find(c=>c.id===pass.id);
  const progress=passProgress26(pass,opponent,state.time,agent.config?.length??5.5);
  if(progress!=='HOLD'){memory.lastPass={id:pass.id,result:progress,time:state.time};memory.pass=null;if(['STALLED','EXPIRED'].includes(progress)){memory.retryUntil38=state.time+Math.max(1.2,Math.min(2.5,agent.style?.patience??1.5));if(agent.racecraft){agent.racecraft.action='WAIT';agent.racecraft.cooldown=memory.retryUntil38;}agent.lastAbort={time:state.time,rival:pass.id,reason:'ช่องเดิมไม่คืบหน้า ตั้งรถแล้วเตรียมบุกใหม่'};}}
  else if(safeLane(pass.lane)){choice=pass.lane;mode='PASS_COMMIT';reason=`COMPLETE PASS CAR ${pass.id} / HOLD CORRIDOR`;}
  else {memory.pass=null;reason+=' / PASS SPACE CLOSED';}
 }
 if(state.time<(memory.retryUntil38??0)&&!memory.pass&&['SLINGSHOT','PASS_COMMIT'].includes(mode)){choice=agent.targetLane;mode='DRAFT';reason='RESET ATTACK / REBUILD CLOSING SPEED';}
 // A third driver can exploit an actual side-by-side fight ahead. The same
 // predictive corridor check and downstream following/braking limits still win.
 if(!['FEINT','OUTSIDE_SWITCH'].includes(mode)&&!memory.pass&&!memory.exit&&state.time>=(memory.retryUntil38??0)&&!corner&&agent.personality.risk>=.65&&state.time>=agent.commitUntil){
  const ahead=p.cars.filter(c=>c.gap>20&&c.gap<65);
  let opportunity=null;
  for(let i=0;i<ahead.length;i++)for(let j=i+1;j<ahead.length;j++){
   const a=ahead[i],b=ahead[j];if(Math.abs(a.gap-b.gap)>9||Math.abs(a.lateral-b.lateral)<3.4||Math.abs(a.speed-b.speed)>5)continue;
   const lanes=[-7.2,-3.6,0,3.6,7.2].filter(n=>Math.abs(n-p.own.d)<=4.3&&Math.abs(n-a.lateral)>3.4&&Math.abs(n-b.lateral)>3.4&&safeLane(n));
   lanes.sort((a,b)=>Math.abs(a-p.own.d)-Math.abs(b-p.own.d));
   if(lanes.length&&Math.abs(lanes[0]-agent.targetLane)>.6&&(!opportunity||Math.min(a.gap,b.gap)<opportunity.gap))opportunity={lane:lanes[0],gap:Math.min(a.gap,b.gap),ids:[a.id,b.id]};
  }
  if(opportunity){choice=opportunity.lane;memory.pass={id:opportunity.ids[0],lane:choice,started:state.time};mode='THIRD_CAR_ATTACK';reason=`FREE CORRIDOR / CARS ${opportunity.ids.join('/')} BATTLING`;}
 }
 // Once physically alongside, reserve the side already occupied. Never cross
 // a rival merely because the ideal apex or a counterattack lies beyond them.
 const alongside=p.cars.filter(c=>Math.abs(c.gap)<8&&Math.abs(c.lateral-p.own.d)>1.8&&Math.abs(c.lateral-p.own.d)<8);
 if(alongside.length){let low=-8.2,high=8.2;for(const other of alongside){if(other.lateral>p.own.d)high=Math.min(high,other.lateral-2.35);else low=Math.max(low,other.lateral+2.35);}
  const lane=low<=high?clamp(choice,low,high):p.own.d;
  if(Math.abs(lane-agent.targetLane)<.6||safeLane(lane))choice=lane;else choice=agent.targetLane;
  mode='HOLD_SPACE';reason=`RACE ALONGSIDE ${alongside.map(c=>c.id).join('/')} / LEAVE A CAR WIDTH`;
  if(low>high)pace=Math.min(pace,...alongside.map(c=>c.speed));
 }
 const near=p.cars.filter(c=>Math.abs(c.gap)<18),left=near.some(c=>c.lateral>p.own.d+2),right=near.some(c=>c.lateral<p.own.d-2);
 const blocker=p.cars.filter(c=>c.gap>0&&c.gap<55&&Math.abs(c.lateral-p.own.d)<3.2).sort((a,b)=>a.gap-b.gap)[0];
 if(left&&right&&blocker){pace=Math.min(pace,Math.max(0,blocker.speed+(blocker.gap-(10+.3*p.speed))*.5));mode='BOXED_IN';reason=`BOTH FLANKS OCCUPIED / WAIT BEHIND ${blocker.id}`;}
 return {choice,pace,mode,reason};
}


export {duelTactics};
