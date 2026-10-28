import {passingLanes26} from './tactical-lanes26.js';
// Plan physical pedal/lane demand. No speed, position, rank or grip writes.
export function towAttack46(agent,state,p,safeLane,decision,runway){
 const memory=agent.towAttack46??={phase:'IDLE',until:0,rival:null};
 const enabled=agent.id!==7&&state.time>25&&!agent.pitApproach&&!agent.recovery&&agent.engineerOrder?.attack!=='ABORT'&&agent.engineerOrder?.pace!=='CONSERVE'&&agent.raceContext?.flag!=='YELLOW'&&agent.raceContext?.flag!=='VSC';
 if(!enabled){memory.phase='IDLE';return decision;}
 const pass=agent.duel?.pass,rival=pass&&p.cars.find(c=>c.id===pass.id&&!c.pit);
 if(pass&&rival&&state.time-pass.started<22&&rival.gap>-(agent.config?.length??5.5)-6){memory.phase='COMMIT';memory.rival=rival.id;memory.until=state.time+.8;return decision;}
 if(memory.phase==='COMMIT'){memory.phase='CLEAR';memory.until=state.time+1.5;}
 if(memory.phase==='CLEAR'&&state.time<memory.until)return decision;
 memory.phase='IDLE';
 if(['BRAKE','HOLD_SPACE','RECOVER','BOXED_IN','ABORT_ATTACK','EXIT_SETUP','EXIT_TARGET','EXIT_DRIVE','BRAKE_DUEL'].includes(decision.mode)||(state.brake??0)>.15||Math.abs(p.own.k)>.003||p.speed<35||runway<Math.max(170,p.speed*2.8))return decision;
 const front=p.cars.filter(c=>!c.pit&&c.gap>12&&c.gap<160).sort((a,b)=>a.gap-b.gap)[0];
 if(!front||agent.entryCommit25||state.time<agent.commitUntil)return decision;
 const closing=Math.max(0,-front.relativeSpeed),deadline=Math.max(30,12+p.speed*.18+closing*(agent.personality.commit+1.8));
 const lanes=passingLanes26(p.own.d,front.lateral,safeLane).sort((a,b)=>Math.abs(a-p.own.d)-Math.abs(b-p.own.d));
 if(front.gap>deadline&&(agent.tow44??0)>.2){
  memory.phase='BANK';memory.rival=front.id;
  // Stay in the wake only while there is enough room to complete pull-out.
  if(Math.abs(front.lateral-p.own.d)<2.6&&safeLane(front.lateral))return {...decision,choice:front.lateral,mode:'DRAFT',reason:`BANK TOW / PULL OUT BEFORE ${deadline.toFixed(0)}m / CAR ${front.id}`};
 }
 if(lanes.length&&front.gap<=deadline+12&&(closing>1.2||agent.drs40||front.gap<30)){
  const lane=lanes[0];agent.duel??={gaps:new Map(),counter:null,exit:null,passesSuffered:0};
  agent.duel.pass={id:front.id,lane,started:state.time,reach42:160,stall42:8};
  memory.phase='COMMIT';memory.rival=front.id;memory.until=state.time+.8;
  return {...decision,choice:lane,mode:'PASS_COMMIT',reason:`TOW → PULL OUT → ERS / CAR ${front.id}`};
 }
 return decision;
}

export function applyAttackEnergy46(agent,state){
 const plan=agent.towAttack46,resources=agent.resources,order=agent.engineerOrder;
 if(!resources||(order?.energy??'AUTO')!=='AUTO'||(order?.pace??'AUTO')==='CONSERVE')return;
 if(plan?.phase==='BANK'&&resources.fraction>.15){resources.allowDeploy=false;resources.mode='TOW_BANK';resources.reason='เกาะลมดูด เก็บ ERS ไว้ตอนเบี่ยงแซง';}
 if(['COMMIT','CLEAR'].includes(plan?.phase)&&state.time<plan.until&&resources.fraction>.12&&Math.abs(agent.perception?.own.k??1)<.003){resources.allowDeploy=true;resources.reserve=.1;resources.mode='PASS_DEPLOY';resources.reason='ใช้ ERS จบการแซงในช่องที่เปิด';}
}
