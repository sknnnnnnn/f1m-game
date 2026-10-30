import {circuit} from '../tracks/track.js';
import {laneAt} from '../physics/reference-adapter.js';
import {passingLanes26} from './tactical-lanes26.js';
// Start the pull-out while there is still space to finish its spatial join.
// No writes to vehicle state, rival pace, grip, power or race order.
export function packAttack59(agent,state,p,safeLane,decision,runway){
 const m=agent.attack59??={phase:'IDLE',rival:null,lane:null,attempts:0,cleared:0};
 const permitted=state.time>25&&agent.id!==23&&!agent.pitApproach&&!agent.recovery&&!agent.entryCommit25&&state.time>=(agent.passReset47?.until??0)&&agent.engineerOrder?.attack!=='ABORT'&&agent.engineerOrder?.pace!=='CONSERVE'&&(agent.raceContext?.flag??'GREEN')==='GREEN'&&agent.raceContext?.remaining>180;
 if(!permitted||Math.abs(p.own.k)>.003||(state.brake??0)>.12||['RECOVER','BRAKE','BOXED_IN','ABORT_ATTACK'].includes(decision.mode)){m.phase='IDLE';return decision;}
 let front=m.phase==='PULL_OUT'?p.cars.find(o=>o.id===m.rival&&!o.pit):null;
 if(front&&front.gap<-(agent.config?.length??5.5)-5){m.cleared++;m.phase='IDLE';front=null;}
 if(front&&(front.gap>170||state.time-m.started>18)){m.phase='IDLE';front=null;}
 if(front){if(safeLane(m.lane,1.5)){return {...decision,choice:m.lane,mode:'PASS_COMMIT',reason:`HOLD EARLY PULL-OUT / CAR ${front.id}`};}m.phase='IDLE';return decision;}
 const target=p.cars.filter(o=>!o.pit&&o.id!==23&&o.gap>20&&o.gap<135).sort((a,b)=>a.gap-b.gap)[0];
 if(!target||p.speed<35||runway<Math.max(150,p.speed*2.2)||target.relativeSpeed>-.7)return decision;
 const closing=-target.relativeSpeed,joinSeconds=2.1,deadline=circuit.key==='shanghai'?Math.min(120,Math.max(48,(agent.config?.length??5.5)+18+closing*(joinSeconds+2.2))):Math.min(135,Math.max(100,(agent.config?.length??5.5)+35+closing*(joinSeconds+3.2)));
 if(target.gap>deadline)return decision;
 const lanes=passingLanes26(p.own.d,circuit.key!=='shanghai'&&target.intent?.curve?laneAt(target.intent.curve,state.time+2).d:target.lateral,l=>safeLane(l,2.5)).sort((a,b)=>Math.abs(a-p.own.d)-Math.abs(b-p.own.d));if(!lanes.length)return decision;
 m.phase='PULL_OUT';m.rival=target.id;m.lane=lanes[0];m.started=state.time;m.attempts++;
 agent.duel??={gaps:new Map(),counter:null,exit:null,passesSuffered:0};agent.duel.pass={id:target.id,lane:m.lane,started:state.time,reach42:170,stall42:10};
 return {...decision,choice:m.lane,mode:'PASS_COMMIT',reason:`EARLY PULL-OUT / ${closing.toFixed(1)}m/s CLOSING / CAR ${target.id}`};
}
export function packEnergy59(agent,state){if(agent.id===23||agent.pitApproach||agent.recovery||agent.engineerOrder?.attack==='ABORT'||(agent.raceContext?.flag??'GREEN')!=='GREEN'||state.time<=25)return;const p=agent.perception,r=agent.resources,m=agent.attack59;if(!r||!p||!(m?.phase==='PULL_OUT'||circuit.key!=='shanghai'&&p.cars.some(o=>!o.pit&&o.gap>20&&o.gap<130)&&(agent.runway47??0)>200&&r.fraction>.24)||(agent.engineerOrder?.energy??'AUTO')!=='AUTO'||agent.engineerOrder?.pace==='CONSERVE'||r.fraction<=.12||Math.abs(p.own.k)>(circuit.key==='shanghai'?.003:.006)||(state.brake??0)>.08)return;r.allowDeploy=true;r.reserve=.1;r.mode='PACK_DEPLOY';r.reason='ใช้พลังงานที่มีจริงขณะเบี่ยงจบแซง';}
