import {upcomingBend} from './racecraft.js';
// Release an unproductive passing corridor when a smooth, validated return
// is still possible. A close or alongside fight keeps its occupied corridor.
export function preparePass47(agent,state,p){
 const pending=agent.pendingCounter47;
 if(state.time>=30&&pending){
  const other=p.cars.find(c=>c.id===pending.id&&!c.pit);
  if(other&&other.gap>0&&other.gap<350&&state.time<pending.until){agent.duel??={gaps:new Map(),counter:null,exit:null,passesSuffered:0};agent.duel.counter=pending;agent.passAudit47??={resets:0,reasons:{}};agent.passAudit47.counterArmed=(agent.passAudit47.counterArmed??0)+1;}
  agent.pendingCounter47=null;
 }

 const pass=agent.duel?.pass,rival=pass&&p.cars.find(c=>c.id===pass.id&&!c.pit);
 if(!pass||!rival||state.time<30||agent.pitApproach||agent.recovery||Math.abs(p.own.k)>.003||(state.brake??0)>.08||rival.gap<22||p.cars.some(c=>!c.pit&&Math.abs(c.gap)<18))return false;
 const bend=upcomingBend(p.own.s,600);if(!bend)return false;
 const closing=Math.max(0,-rival.relativeSpeed),timeToBend=bend.distance/Math.max(10,p.speed),timeToReach=(rival.gap-8)/Math.max(1,closing);
 // A car already established in a separate corridor may complete the
 // braking duel. Do not merge it back merely because the noses are not level.
 const established59=Math.abs(p.own.d-rival.lateral)>(agent.config?.width??1.9)+.5&&rival.gap<80&&timeToReach<timeToBend+2;
 if(established59){pass.entry59=true;return false;}
 if(bend.distance>Math.max(130,p.speed*3)||timeToReach+.6<timeToBend)return false;
 agent.passAudit47??={resets:0,reasons:{}};agent.passAudit47.resets++;agent.passAudit47.reasons.BRAKE_WINDOW=(agent.passAudit47.reasons.BRAKE_WINDOW??0)+1;
 agent.duel.lastPass={id:pass.id,result:'RESET_FOR_EXIT',time:state.time};agent.duel.pass=null;agent.battleCommit=null;agent.crossExit=null;agent.entryCommit25=null;
 if(agent.racecraft){agent.racecraft.action='WAIT';agent.racecraft.cooldown=state.time+2;}
 agent.passReset47={until:state.time+2,rival:rival.id,reason:'ไม่ทันก่อนจุดเบรก คืนไลน์เพื่อรักษาความเร็วออกโค้ง'};
 return true;
}
export function armCounter47(loser,winner,time){
 if(loser.pit?.active||winner.pit?.active||loser.finishedAt!==null)return;
 const a=loser.agent;if(time<30){a.pendingCounter47={id:winner.id,until:time+150,event47:time};return;}a.duel??={gaps:new Map(),counter:null,exit:null,passesSuffered:0};
 a.duel.counter={id:winner.id,until:time+60,event47:time};a.duel.passesSuffered=(a.duel.passesSuffered??0)+1;
 a.passAudit47??={resets:0,reasons:{}};a.passAudit47.counterArmed=(a.passAudit47.counterArmed??0)+1;
}
