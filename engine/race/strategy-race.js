import {pitTrafficCap32} from '../pit/pit-traffic32.js';
import {WeekendRace} from './weekend.js';
import {control} from '../../racing/runtime/frozen/controller.js';
import {replaceTyres} from '../../racing/runtime/frozen/physics.js';
import {circuit,clamp} from '../tracks/track.js';
import {connectLane,laneAt,makeReference,trajectoryTarget} from '../physics/reference-adapter.js';
import {PIT,pitRoad,stallStation,pitStopStation,canMerge} from '../pit/pit-lane.js';
import {makePitPlan,pitApproachSpeed} from '../pit/pit-reference.js';
import {COMPOUNDS,tyreConfig,tyreInfo,tyreWear} from '../physics/tyres.js';
import {evaluateStrategy} from './strategy.js';
const active=phase=>['PIT_IN','SERVICE','RELEASE','PIT_OUT','YIELD','MERGE'].includes(phase);
const PHASES={RACING:'กำลังแข่ง',BOOKED:'รอเข้าพิต',APPROACH:'เตรียมเข้าพิต',PIT_IN:'เข้าพิต',SERVICE:'เปลี่ยนยาง',RELEASE:'รอปล่อยรถ',PIT_OUT:'ออกพิต',YIELD:'รอช่องรวมสนาม',MERGE:'รวมกลับสนาม'};
export class StrategyRace extends WeekendRace {
 reset(){super.reset();this.tyreConfigs=Object.fromEntries(Object.keys(COMPOUNDS).map(k=>[k,tyreConfig(this.config,k)]));this.pitEvents=[];this.strategyChecks=0;
  for(const car of this.cars){const compound='M';car.tyres={compound,fittedDistance:0,sets:1};car.pit={phase:'RACING',active:false,stops:0,manual:false,requestedCompound:null,nextCompound:null,serviceElapsed:0,decision:null,enteredAt:null,cycle:null};}}
 isOnTrack(car){return !car.pit?.active;}
 configuration(car){return this.tyreConfigs?.[car.tyres?.compound]??this.config;}
 perceptionProjection(car){return car.pit?.active?circuit.project(car.state.X,car.state.Y,car.state.psi):car.projection;}
 projectCar(car,state){return car.pit?.active?pitRoad(car.id).project(state.X,state.Y):super.projectCar(car,state);}
 draftFor(car,field){return car.pit?.active?0:super.draftFor(car,field);}
 eventPit(car,kind,extra={}){const e={kind,car:car.id,time:this.time,tick:this.tick,...extra};this.pitEvents.push(e);if(this.pitEvents.length>150)this.pitEvents.shift();this.raceMoments.push({...e,by:car.id});if(this.raceMoments.length>100)this.raceMoments.shift();}
 requestPit(id,compound=null){const car=this.cars.find(c=>c.id===id);if(!car||car.finishedAt!==null||car.pit.active||compound&&!COMPOUNDS[compound])return false;car.pit.manual=true;car.pit.requestedCompound=compound;car.pit.phase='BOOKED';car.agent.plan=null;return true;}
 cancelPit(id){const car=this.cars.find(c=>c.id===id);if(!car||car.pit.active)return false;car.pit.manual=false;car.pit.requestedCompound=null;car.pit.phase='RACING';car.pit.cancelUntil=car.progress+circuit.length*.4;car.agent.plan=null;return true;}
 thinkCar(car,field,c){
  const pit=car.pit;
  if(pit?.active){car.agent.state='PIT_'+pit.phase;car.agent.reason=PHASES[pit.phase];car.agent.plan=makePitPlan(c,car.state,car,this.cars);car.agent.lastThoughtTick=this.tick;return {state:car.agent.state};}
  car.agent.pitApproach=pit?.phase==='APPROACH';
  car.agent.pitEntry=car.agent.pitApproach?{station:PIT.entry,speed:pitApproachSpeed(c)}:null;
  const decision=super.thinkCar(car,field,c);
  if(pit?.phase==='APPROACH'){
   car.agent.freeLine=false;
   const own=car.projection,others=field.filter(o=>o.id!==car.id&&!o.pit?.active),candidate=connectLane(car.agent.curve,car.state.time,0,3),safe=others.every(o=>{const gap=circuit.delta(o.projection.s,own.s),relative=Math.hypot(o.state.u,o.state.v)-Math.hypot(car.state.u,car.state.v);for(let j=0;j<=14;j++){const t=j*.25,n=laneAt(candidate,car.state.time+t).d,otherN=o.intent?.curve?laneAt(o.intent.curve,car.state.time+t).d:o.projection.d;if(Math.abs(gap+relative*t)<10+1.4*t*t&&Math.abs(n-otherN)<3.2)return false;}return true;});
   if(safe&&(car.agent.curve.racing||Math.abs(car.agent.targetLane)>.1)){car.agent.curve=connectLane(car.agent.curve,car.state.time,0,3);car.agent.targetLane=0;car.agent.commitUntil=car.state.time+3;}
   car.agent.state='PIT_APPROACH';car.agent.reason='BOX / ชะลอเข้าพิต';car.agent.plan=makeReference(c,car.state,car.agent);
  }
  return decision;
 }
 evaluatePitStrategy(car){return evaluateStrategy(car,this.cars,this.laps);}
 serviceAvailable(car){return true;}
 serviceDuration(car){return PIT.serviceSeconds;}
 releaseReady(car){return true;}
 commandCar(car,c){
  const out=control(c,car.state,car.agent.plan);if(!car.pit.active)return out;
  const phase=car.pit.phase,road=pitRoad(car.id),at=road.project(car.state.X,car.state.Y),stop=phase==='PIT_IN'?pitStopStation(car.id):phase==='PIT_OUT'?PIT.mergeWait:Infinity;
  if(['SERVICE','RELEASE','YIELD'].includes(phase)||phase==='PIT_IN'&&stop-at.s<.22){out.command={...out.command,throttle:0,brake:1,steer:0,energy:false};out.controllerState={iv:0};return out;}
  // A pit-only speed servo drives the existing physical pedals and brakes.
  const remaining=stop-at.s,localTarget=trajectoryTarget(car.agent.plan,car.state),target=Math.min(localTarget.v,pitTrafficCap32(car,this.cars,c),car.agent.plan.speed,Number.isFinite(stop)?Math.sqrt(2*2.2*Math.max(0,remaining)):PIT.target),a=clamp(Math.min(0,localTarget.a??0)+(target-car.state.u)*2.5,-7,2.5),drag=.5*c.rho*c.CdA*car.state.u**2,force=c.m*a+drag;
  // Use the frozen controller's engine-force conversion and brake model while
  // avoiding integral wind-up around a stationary service box.
  if(a<0){out.command={...out.command,throttle:0,brake:clamp(-force/((2*c.brakeF+2*c.brakeR)/c.R),0,1),energy:false};}
  else out.command={...out.command,throttle:Math.min(out.command.throttle,.5),brake:0,energy:false};
  out.controllerState={iv:0};return out;
 }
 prepareAdvance(){
  for(const car of this.cars){const pit=car.pit,main=circuit.project(car.state.X,car.state.Y,car.state.psi);
   if(car.finishedAt!==null)continue;
   if(!pit.active&&this.tick%60===car.id-1&&pit.phase==='RACING'&&car.progress>(pit.cancelUntil??0)&&car.distance>circuit.length*.5){const d=this.evaluatePitStrategy(car);pit.decision=d;this.strategyChecks++;if(d.call){pit.phase='BOOKED';pit.nextCompound=d.nextCompound;this.eventPit(car,'PIT_CALL',{reason:d.reason,compound:d.nextCompound,gain:d.estimatedGainSeconds});}}
   if(pit.phase==='APPROACH'&&main.s>PIT.entry+70&&main.s<PIT.entry+330){pit.phase='BOOKED';car.agent.plan=null;this.eventPit(car,'PIT_DEFER',{reason:'ไม่ตัดหน้ารถข้างกัน รอทางเข้ารอบถัดไป'});}
   if(pit.phase==='BOOKED'&&main.s>PIT.entry-360&&main.s<PIT.entry+25){pit.phase='APPROACH';pit.entryBlocked=false;pit.nextCompound=pit.requestedCompound??pit.nextCompound??this.evaluatePitStrategy(car).nextCompound;car.agent.plan=null;}
   if(pit.phase==='APPROACH'&&main.s>=PIT.entry&&main.s<PIT.entry+70&&Math.abs(main.d)<1.4&&car.state.u<pitApproachSpeed(this.configuration(car))+3){const occupied=this.cars.some(o=>{if(o.id===car.id||o.pit.active)return false;const q=circuit.project(o.state.X,o.state.Y,o.state.psi),gap=circuit.delta(q.s,main.s),closing=Math.max(0,o.state.u-car.state.u);return Math.abs(q.d-main.d)<4&&gap<18&&gap> -Math.max(90,55+closing*4);});if(occupied){if(!pit.entryBlocked){pit.entryBlocked=true;this.eventPit(car,'PIT_ENTRY_WAIT',{reason:'รถอยู่ข้างทางเข้าพิต รักษาเลนหลักก่อน'});this.radioCall?.(car.id,'มีรถอยู่ด้านทางเข้าพิต ต้องรอหรือเข้ารอบถัดไป','pitEntryBlocked',10);}continue;}pit.phase='PIT_IN';pit.active=true;pit.enteredAt=this.time;pit.serviceStarted=null;pit.serviceElapsed=0;pit.releaseProof29=null;pit.cycle={enteredAt:this.time,compoundBefore:car.tyres.compound,requested:pit.nextCompound,positionBefore:this.ranking().findIndex(c=>c.id===car.id)+1};car.projection=pitRoad(car.id).project(car.state.X,car.state.Y);car.agent.plan=null;this.eventPit(car,'PIT_ENTRY');}
  }
  return super.prepareAdvance();
 }
 commitAdvance(proposed){const ok=super.commitAdvance(proposed);if(!ok)return false;
  for(const car of this.cars){const pit=car.pit;if(!pit.active)continue;const pitAt=pitRoad(car.id).project(car.state.X,car.state.Y),S=pitAt.s,speed=Math.hypot(car.state.u,car.state.v);
   if(pit.phase==='PIT_IN'&&(S-pitStopStation(car.id)>=.75||(S>=pitStopStation(car.id)-.22&&speed<.15&&Math.abs(pitAt.d)>.6)||this.serviceProfile28?.(car)?.blocked===true)){pit.phase='PIT_OUT';pit.serviceStarted=null;pit.cycle.aborted=true;pit.cycle.abortReason=S-pitStopStation(car.id)>=.75?'MISSED_BOX':Math.abs(pitAt.d)>.6?'MISALIGNED_BOX':'CREW_PLAN_UNSAFE';car.agent.plan=null;this.eventPit(car,'PIT_ABORT',{reason:pit.cycle.abortReason});this.radioCall?.(car.id,'ยกเลิกงานพิต · ออกตามเลนแล้วเรียก BOX ใหม่','pitAbort29',6);}
   if(pit.phase==='PIT_IN'&&Math.abs(S-pitStopStation(car.id))<.75&&Math.abs(pitAt.d)<=.6&&speed<.15&&this.serviceAvailable(car)){pit.phase='SERVICE';pit.serviceElapsed=0;pit.serviceStarted=this.time;pit.cycle.stoppedAt=this.time;pit.cycle.stopPose={X:car.state.X,Y:car.state.Y};car.agent.plan=null;this.eventPit(car,'PIT_STOP',{speed,stationError:S-pitStopStation(car.id)});}
   if(pit.phase==='SERVICE'){
    pit.serviceElapsed=this.time-pit.serviceStarted;
    if(pit.serviceElapsed>=this.serviceDuration(car)){const before=tyreWear(car.state),compound=pit.nextCompound??'M';replaceTyres(car.state,'pit-'+car.id+'-'+(pit.stops+1));car.tyres={compound,fittedDistance:car.distance,sets:car.tyres.sets+1};pit.stops++;pit.cycle.serviceSeconds=pit.serviceElapsed;pit.cycle.wearBefore=before;pit.cycle.compoundAfter=compound;pit.phase='RELEASE';car.agent.plan=null;this.eventPit(car,'TYRE_CHANGE',{compound,wearBefore:before,serviceSeconds:pit.serviceElapsed});}
   }
   if(pit.phase==='RELEASE'){
    const blocked=this.cars.some(o=>o.id!==car.id&&o.pit.active&&o.state.u>2&&(()=>{const q=pitRoad(car.id).project(o.state.X,o.state.Y);return q.s-S> -80&&q.s-S<28&&Math.abs(q.d)<8;})());
    if(!blocked&&this.releaseReady(car)){pit.phase='PIT_OUT';car.agent.plan=null;this.eventPit(car,'PIT_RELEASE');}
   }
   if(pit.phase==='PIT_OUT'&&S>=PIT.mergeWait-2&&speed<.15){pit.phase='YIELD';car.agent.plan=null;this.eventPit(car,'PIT_YIELD');}
   if(pit.phase==='YIELD'&&canMerge(car,this.cars)){pit.phase='MERGE';car.agent.plan=null;this.eventPit(car,'PIT_MERGE');}
   if(pit.phase==='MERGE'&&S>=PIT.exit-3){pit.phase='RACING';pit.active=false;pit.manual=false;pit.requestedCompound=null;pit.nextCompound=null;pit.lastStop={...pit.cycle,positionAfter:this.ranking().findIndex(c=>c.id===car.id)+1,exitedAt:this.time,totalSeconds:this.time-pit.enteredAt};pit.cycle=null;car.projection=circuit.project(car.state.X,car.state.Y,car.state.psi);car.agent.curve={t0:car.state.time,T:1,c:[car.projection.d]};car.agent.targetLane=car.projection.d;car.agent.targetSpeed=speed;car.agent.acceleration=0;car.agent.plan=null;this.eventPit(car,'PIT_EXIT',{totalSeconds:pit.lastStop.totalSeconds});}
  }
  return true;
 }
 pitInfo(car){const p=car.pit;return {phase:p.phase,label:PHASES[p.phase],active:p.active,stops:p.stops,nextCompound:p.requestedCompound??p.nextCompound,serviceSeconds:p.serviceElapsed,serviceTarget:this.serviceDuration(car),reason:p.manual?'คำสั่ง BOX':p.decision?.reason??null,decision:p.decision,lastStop:p.lastStop??null};}
 snapshot(light=false){const s=super.snapshot(light);s.cars=s.cars.map(c=>{const car=this.cars.find(v=>v.id===c.id);return {...c,tyres:tyreInfo(car),pit:this.pitInfo(car)};});return s;}
 presentation(){const p=super.presentation();p.cars=p.cars.map(c=>{const car=this.cars.find(v=>v.id===c.id);return {...c,tyres:tyreInfo(car),pit:this.pitInfo(car)};});return {...p,pitEvents:this.pitEvents.slice(-20),compounds:COMPOUNDS};}
 results(){return super.results().map(r=>{const c=this.cars.find(c=>c.id===r.id);return {...r,stops:c.pit.stops,compound:c.tyres.compound};});}
 export(){return {...super.export(),edition:'Tyres & Pit Strategy 09',pitEvents:this.pitEvents,tyres:this.cars.map(c=>({id:c.id,...tyreInfo(c),pit:this.pitInfo(c)})),strategyChecks:this.strategyChecks};}
}
