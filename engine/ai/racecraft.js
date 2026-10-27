import {tacticalLane26} from './tactical-lanes26.js';
import {circuit,clamp} from '../tracks/track.js';
import {RACE_STYLES} from './personality.js';
export function upcomingBend(station,range=300){
 for(let ds=20;ds<=range;ds+=10){const q=circuit.at(station+ds);if(Math.abs(q.k)>.012)return {...q,distance:ds};}
 return null;
}
// Intent is conditional on observed defence and available corridors. It never
// changes position, grip, engine power or rank. Downstream space checks win.
export function racecraft(agent,state,p,safeLane,decision){
 const memory=agent.racecraft??={action:'PACE',target:null,until:0,cooldown:0,attempts:0,feints:0,switches:0};
 const style=RACE_STYLES[agent.kind]??RACE_STYLES.SMOOTH;
 let {choice,pace,mode,reason}=decision;
 const bend=upcomingBend(p.own.s,420),alongside=p.cars.some(c=>Math.abs(c.gap)<14&&Math.abs(c.lateral-p.own.d)>1.8);
 const front=p.cars.filter(c=>c.gap>18&&c.gap<100).sort((a,b)=>a.gap-b.gap)[0];
 const rival=p.cars.find(c=>c.id===memory.target);
 if(['FEINT','OUTSIDE_SWITCH','COMMIT'].includes(memory.action)){
  if(!rival||rival.gap< -13||rival.gap>110||state.time>memory.until||alongside){memory.action=alongside?'LEAVE_ROOM':'PACE';memory.cooldown=state.time+7;}
  else if(memory.action==='FEINT'){
   choice=memory.lane;mode='FEINT';reason=`SHOW INSIDE / READ DEFENCE CAR ${rival.id}`;
   const reacted=(rival.lateral-memory.rivalLane)*memory.turn>.65;
   if(state.time>=agent.commitUntil&&state.time-memory.started>1.2){
    const outside=tacticalLane26(-memory.turn*3.1);
    if(reacted&&Math.abs(outside-p.own.d)<=4.3&&Math.abs(outside-rival.lateral)>3.2&&safeLane(outside)){
     choice=outside;mode='OUTSIDE_SWITCH';reason=`DEFENCE COMMITTED / OUTSIDE CAR ${rival.id}`;memory.action='OUTSIDE_SWITCH';memory.lane=outside;memory.until=state.time+6;memory.switches++;
    }else if(state.time-memory.started>3.4){
     if(Math.abs(memory.passLane-rival.lateral)>3.2&&Math.abs(memory.passLane-p.own.d)<=4.3&&safeLane(memory.passLane)){memory.action='COMMIT';memory.lane=memory.passLane;choice=memory.lane;mode='PASS_COMMIT';reason=`INSIDE STILL OPEN / CAR ${rival.id}`;}
     else {memory.action='WAIT';memory.cooldown=state.time+style.patience+5;choice=agent.targetLane;mode='FOLLOW';reason=`DEFENCE HOLDS / WAIT CAR ${rival.id}`;}
    }
   }
  }else if(safeLane(memory.lane)){choice=memory.lane;mode=memory.action==='OUTSIDE_SWITCH'?'OUTSIDE_SWITCH':'PASS_COMMIT';reason=`HOLD PASS CORRIDOR / CAR ${rival.id}`;}
  else {memory.action='WAIT';memory.cooldown=state.time+5;choice=agent.targetLane;}
 }
 if(!['FEINT','OUTSIDE_SWITCH','COMMIT'].includes(memory.action)&&front&&(mode!=='DRAFT'||bend&&front.relativeSpeed< -1.5)&&!alongside&&state.time>=agent.commitUntil&&state.time>=memory.cooldown&&Math.abs(p.own.k)<.002&&front.relativeSpeed<.5&&front.gap<35+agent.personality.risk*30&&(!bend||bend.distance>Math.max(120,p.speed*4))){
  const turn=Math.sign(bend?.k??circuit.at(p.own.s+550).k)||1;
  const lanes=[tacticalLane26(turn*3.5),tacticalLane26(-turn*3.5)].filter(l=>Math.abs(l-front.lateral)>3.2&&Math.abs(l-p.own.d)<=4.3&&safeLane(l));
  if(lanes.length){
   choice=lanes[0];memory.target=front.id;memory.lane=choice;memory.passLane=choice;memory.turn=turn;memory.rivalLane=front.lateral;memory.started=state.time;memory.until=state.time+8;memory.attempts++;
   if(style.feint>=.7&&bend&&front.gap>35&&Math.sign(choice)===turn&&Math.abs(p.own.d)<2.6&&safeLane(turn*1.1)){choice=turn*1.1;memory.lane=choice;memory.action='FEINT';memory.feints++;mode='FEINT';reason=`SHOW INSIDE / TEST CAR ${front.id}`;}
   else {memory.action='COMMIT';mode='SLINGSHOT';reason=`PLAN ${Math.sign(choice)===turn?'INSIDE':'OUTSIDE'} PASS CAR ${front.id}`;}
  }
 }
 if(alongside)memory.action='LEAVE_ROOM';
 else if(mode==='DEFEND')memory.action='DEFEND';
 else if(['EXIT_SETUP','EXIT_DRIVE'].includes(mode))memory.action='EXIT';
 choice=clamp(choice,-circuit.width/2+1.7,circuit.width/2-1.7);
 return {...decision,choice,pace,mode,reason};
}
