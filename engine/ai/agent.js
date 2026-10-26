import {racingPath} from '../tracks/racing-path.js';
import {corridorThreat} from './corridor-threat.js';
import {trafficSpace} from './traffic-space.js';
import {observeRivals} from './rival-memory.js';
import {resourcePlan} from '../race/race-resources.js';
import {planBattle} from './battle-planner.js';

import {racingOffset} from '../tracks/racing-line.js';
import {RACE_STYLES,tyreDemand} from './personality.js';
import {racecraft,upcomingBend} from './racecraft.js';
import {circuit,clamp} from '../tracks/track.js';
import {connectLane,laneAt} from '../physics/reference-adapter.js';import {duelTactics} from './duel-tactics.js';
const PERSONALITIES={ATTACKER:{},TACTICIAN:{},GUARDIAN:{},DEFENDER:{},OPPORTUNIST:{},SMOOTH:{}};
class Agent {
 constructor(id,kind,n,seed=1,traits={}){this.id=id;this.kind=kind;this.style=RACE_STYLES[kind]??RACE_STYLES.SMOOTH;this.personality={pace:85,headway:1,risk:.5,commit:3.2,braking:5.8,corner:.95,exit:5.8,defend:.4,bias:0,...traits};this.personality.exit*=1.35;this.targetLane=n;this.targetSpeed=8;this.acceleration=0;this.curve={t0:0,T:1,c:[n]};this.commitUntil=0;this.state='FOLLOW';this.reason='ROLLING START';this.decisions=0;this.laneChanges=0;this.perception=null;this.opponentSpeeds=new Map();this.history=[];this.seed=seed;this.plan=null;}
 sense(self,field){const own=field.find(x=>x.id===this.id)?.projection??circuit.project(self.X,self.Y,self.psi),speed=Math.hypot(self.u,self.v);const cars=field.filter(x=>x.id!==this.id).map(o=>{const p=o.projection??circuit.project(o.state.X,o.state.Y,o.state.psi),gap=circuit.delta(p.s,own.s),relativeSpeed=Math.hypot(o.state.u,o.state.v)-speed,previous=this.opponentSpeeds.get(o.id),acceleration=previous&&self.time>previous.time?clamp((relativeSpeed+speed-previous.speed)/(self.time-previous.time),-8,4):0;this.opponentSpeeds.set(o.id,{speed:relativeSpeed+speed,time:self.time});return{id:o.id,s:p.s,pit:!!o.pit?.active,brake:o.state.brake??0,throttle:o.state.throttle??0,ax:o.state.lastAx??0,gap,lateral:p.d,speed:relativeSpeed+speed,relativeSpeed,acceleration,intent:o.intent??null,sideSpeed:o.state.v,yawRate:o.state.r,headingError:Math.atan2(Math.sin(o.state.psi-self.psi),Math.cos(o.state.psi-self.psi)),side:Math.abs(gap)<8&&Math.abs(p.d-own.d)<5.5,closingTime:gap>0&&relativeSpeed<-.1?gap/-relativeSpeed:Infinity};});return{own,speed,cars,edges:{left:circuit.width/2-own.d,right:circuit.width/2+own.d},leader:cars.filter(x=>x.gap>0&&x.gap<180&&Math.abs(x.lateral-own.d)<2.9).sort((a,b)=>a.gap-b.gap)[0]??null};}
 think(state,field){this.decisions++;this.lastThoughtTick=state.tick;const p=this.sense(state,field);this.perception=p;this.tyreManagement=tyreDemand(this,state);observeRivals(this,state,p);this.resources=resourcePlan(this,state,p);this.tyreManagement.exitFactor=this.resources.exitFactor;this.tyreManagement.hybridReserve=this.resources.reserve;const personality=this.personality,ahead=p.leader,behind=p.cars.filter(o=>o.gap<0&&o.gap>-110).sort((a,b)=>b.gap-a.gap)[0];this.drafting=!!ahead&&Math.abs(p.own.k)<.003&&ahead.gap<140&&Math.abs(ahead.lateral-p.own.d)<2.4;let choice=this.targetLane,mode='CRUISE',reason='OPEN ROAD',pace=personality.pace;
  const now=p.own,preview=circuit.at(now.s+Math.max(80,p.speed*4)),corner=Math.abs(now.k)>.0005||Math.abs(preview.k)>.0005;

  const launchLeadSpeed=o=>o.speed+(state.time<4&&p.speed<60&&Math.abs(now.k)<.001&&o.gap>(this.config?.length??5.5)+10&&o.brake<.02&&o.throttle>.8&&Math.abs(o.headingError)<.06?clamp(o.acceleration??0,0,14)*.25:0);
  const bend=Math.abs(now.k)>.004?now:upcomingBend(now.s,600)??preview,turn=Math.sign(bend.k)||1;
  let ideal=clamp(racingOffset(now.s+Math.max(10,p.speed*.8)),p.own.d-4,p.own.d+4);
  this.freeLine=!p.cars.some(o=>!o.pit&&o.gap> -30&&o.gap<Math.max(35,p.speed*.8));
  if(Math.abs(ideal)<.12&&!corner)ideal=personality.bias*.3;
  // Check actual quintic corridors and allow opponent speed changes at turn-in.
  const safeLane=(lane)=>{if(Math.abs(lane)>circuit.width/2-1.7)return false;const candidate=Math.abs(lane-this.targetLane)>.6?connectLane(this.curve,state.time,lane,personality.commit+1.2):this.curve;return p.cars.every(o=>{for(let j=0;j<=14;j++){const t=j*.25,gap=o.gap+o.relativeSpeed*t,uncertainty=Math.min(4,.35*t*t),space=trafficSpace(this,state,o),otherN=o.intent?.curve?laneAt(o.intent.curve,state.time+t).d:o.lateral,ownN=laneAt(candidate,state.time+t).d;if(Math.abs(gap)<space.longitudinal+uncertainty&&Math.abs(otherN-ownN)<space.lateral)return false;}return true;});};
  if(ahead&&ahead.gap<155){mode='FOLLOW';reason=`CAR ${ahead.id} / gap ${ahead.gap.toFixed(1)}m`;
   const candidates=[-3.8,-2.6,0,2.6,3.8].filter(n=>Math.abs(n-p.own.d)<=4.3&&Math.abs(n-ahead.lateral)>2.3&&safeLane(n));
   const closing=Math.max(0,-ahead.relativeSpeed),attackReach=ahead.gap<Math.min(65,Math.max(30,closing*5+15));
   // Hold the wake until enough speed is banked or a real pull-out deadline arrives.
   const pullOutGap=14+p.speed*.18+closing*(personality.commit+1.2);
   const waitForTow=(this.teamTow23===ahead.id&&ahead.gap>12||this.drafting&&ahead.gap>pullOutGap)&&(!corner||Math.abs(now.k)<.003)&&Math.abs(p.own.d-ahead.lateral)<2.4;
   const switchback=personality.risk<.75&&corner&&ahead.gap>16&&ahead.gap<38&&Math.sign(ahead.lateral)===turn&&Math.abs(ahead.lateral)>2.5;
   const outside=-turn*2.6;
   if(switchback&&safeLane(outside)&&state.time>=this.commitUntil){choice=outside;mode='SWITCHBACK';pace=Math.min(pace,ahead.speed+2);reason=`OUTSIDE ENTRY / CROSS EXIT CAR ${ahead.id}`;this.crossExit=ahead.id;}
   else if(waitForTow){choice=Math.abs(ahead.lateral-p.own.d)<3&&safeLane(ahead.lateral)?ahead.lateral:this.targetLane;mode='DRAFT';reason=`BUILD TOW CAR ${ahead.id} / ${ahead.gap.toFixed(0)}m`;}
   else if(attackReach&&candidates.length&&state.time>=this.commitUntil){candidates.sort((a,b)=>Math.abs(a-p.own.d)-Math.abs(b-p.own.d)+(.08+.12*(1-personality.risk))*(Math.abs(a-ideal)-Math.abs(b-ideal))+.08*(Math.abs(a-personality.bias)-Math.abs(b-personality.bias)));choice=candidates[0];mode='SLINGSHOT';reason=`PASS CAR ${ahead.id} / ${choice>0?'INSIDE':'OUTSIDE'} SPACE`;}
   else if(Math.abs(this.targetLane-ahead.lateral)>2.3&&safeLane(this.targetLane)){mode='SLINGSHOT';reason=`HOLD PASSING CORRIDOR / CAR ${ahead.id}`;}
   else pace=Math.min(pace,Math.max(3,ahead.speed+(ahead.gap-(7.8+(this.drafting?.3:personality.headway)*p.speed))*.75));
   if(ahead.gap<6.15+Math.max(0,-ahead.relativeSpeed)*1.4){pace=Math.min(pace,Math.max(0,ahead.speed-3));mode='BRAKE';reason='FRONT COLLISION RISK / YIELD';}
  }else if(behind&&-behind.gap<80&&-behind.gap>20+Math.max(0,behind.relativeSpeed)*1.8&&(state.brake??0)<.12&&Math.abs(now.k)<.002&&behind.relativeSpeed>.3&&personality.defend>.5&&state.time>=this.commitUntil){const cover=clamp(Math.abs(behind.lateral-now.d)>1?behind.lateral:turn*3.6,-4,4);if(this.coveredOpponent!==behind.id&&Math.abs(cover-now.d)<4.3&&safeLane(cover)&&!p.cars.some(o=>o.side)){choice=cover;this.coveredOpponent=behind.id;this.coverLane=cover;mode='DEFEND';reason=`ONE EARLY COVER CAR ${behind.id}; LEAVE ROOM ALONGSIDE`;}}
  else if(state.time>=this.commitUntil&&safeLane(ideal)){choice=ideal;reason=Math.abs(now.k)>.001?'DYNAMIC APEX / EXIT':'CORNER ENTRY / OPEN ROAD';}
  if(mode==='CRUISE'&&behind&&this.coveredOpponent===behind.id&&behind.gap> -100&&Math.abs(now.k)<.003&&(state.brake??0)<.12&&!p.cars.some(o=>o.side)){choice=this.targetLane;mode='DEFEND';reason=`HOLD ONE COVER / CAR ${behind.id}`;}
  if(this.crossExit&&!corner&&state.time>=this.commitUntil&&safeLane(ideal)){choice=ideal;mode='SWITCHBACK';reason='CROSS TO EXIT / TRACTION';this.crossExit=null;}
  if(!behind||behind.gap < -100)this.coveredOpponent=null;
  ({choice,pace,mode,reason}=racecraft(this,state,p,safeLane,{choice,pace,mode,reason,turn,corner,ideal}));
  ({choice,pace,mode,reason}=duelTactics(this,state,p,safeLane,{choice,pace,mode,reason,turn,corner,ideal}));
  ({choice,pace,mode,reason}=planBattle(this,state,p,safeLane,{choice,pace,mode,reason}));
  if(this.engineerOrder?.attack==='ABORT'&&!p.cars.some(o=>o.side)&&!['BRAKE','RECOVER','HOLD_SPACE','BOXED_IN'].includes(mode)){choice=this.targetLane;this.battleCommit=null;this.crossExit=null;if(this.duel){this.duel.pass=null;this.duel.exit=null;}mode='ABORT_ATTACK';reason='ENGINEER / HOLD SAFE CORRIDOR';if(ahead&&ahead.gap<80)pace=Math.min(pace,ahead.speed);}
  if(Math.abs(now.d)>circuit.width/2-1.5||Math.abs(state.v)>3){choice=clamp(now.d,-3,3);pace=Math.min(pace,9);mode='RECOVER';reason='ROAD EDGE / SIDESLIP';}
  this.freeLine=this.freeLine&&!['HOLD_SPACE','PASS_COMMIT','BRAKE_DUEL','EXIT_SETUP','EXIT_TARGET','BOXED_IN','RECOVER','FEINT','OUTSIDE_SWITCH'].includes(mode)&&state.time>=this.commitUntil;
  const followPath=circuit.key==='shanghai'&&this.id!==7&&!this.pitApproach&&['CRUISE','FOLLOW','DRAFT'].includes(mode)&&!this.recovery&&!p.cars.some(o=>!o.pit&&Math.abs(o.gap)<18&&Math.abs(o.lateral-now.d)>1.5);
  if(this.pitApproach)this.freeLine=false;
  if(followPath){this.curve=racingPath(this.curve,state,now);this.targetLane=racingOffset(now.s);this.freeLine=true;}
  else if(this.curve.racing){this.curve=connectLane(this.curve,state.time,clamp(choice,-5.4,5.4),Math.max(3,personality.commit));this.targetLane=clamp(choice,-5.4,5.4);}
  choice=clamp(choice,-circuit.width/2+1.7,circuit.width/2-1.7);if(!followPath&&Math.abs(choice-this.targetLane)>.6){this.curve=connectLane(this.curve,state.time,choice,personality.commit+1.2);this.targetLane=choice;this.commitUntil=state.time+personality.commit;this.laneChanges++;}
  // Predictive following protects the corridor throughout a passing transition.
  for(const o of p.cars){const futureN=laneAt(this.curve,state.time+.8).d;if(o.gap>0&&o.gap<140&&(this.curve.racing&&o.intent?.curve?.racing||Math.min(Math.abs(o.lateral-now.d),Math.abs(o.lateral-futureN))<2.3)){const limit=launchLeadSpeed(o)+(o.gap-trafficSpace(this,state,o).reserve)*.75;if(limit<pace){pace=Math.max(0,limit);if(!['SLINGSHOT','DRAFT','SWITCHBACK','COUNTER','EXIT_SETUP','EXIT_DRIVE','HOLD_SPACE','BOXED_IN','PASS_COMMIT','THIRD_CAR_ATTACK','FEINT','OUTSIDE_SWITCH'].includes(mode)){mode=pace<p.speed-1?'BRAKE':'FOLLOW';reason=`PREDICTED GAP TO ${o.id}`;}}}}
  // Actual traffic caps the local reference independently of the slower free-road
  // target slew. Corner speed limits can keep measured speed far below that target.
  this.trafficLimit=Infinity;this.corridorDecel=0;
  for(const o of p.cars){const futureN=laneAt(this.curve,state.time+.8).d,geometricThreat=corridorThreat(this,state,o);if(o.gap>0&&o.gap<120&&(geometricThreat||(this.curve.racing&&o.intent?.curve?.racing||Math.min(Math.abs(o.lateral-now.d),Math.abs(o.lateral-futureN))<2.3))){const caution=Math.max(clamp(Math.abs(now.k)/.004,0,1),clamp(-o.acceleration/4,0,1)),reserve=trafficSpace(this,state,o).reserve,available=Math.max(0,o.gap-reserve);const predictedSpeed=Math.max(0,launchLeadSpeed(o)+Math.min(0,o.acceleration??0)*(.25+.4*caution)),limit=o.gap<reserve?Math.max(0,predictedSpeed+(o.gap-reserve)*.7):Math.sqrt(predictedSpeed*predictedSpeed+2*personality.braking*available);if(geometricThreat)this.corridorDecel=-Math.min(18,.8*(this.config?.mu??1.55)*9.81);this.trafficLimit=Math.min(this.trafficLimit,limit,geometricThreat?Math.max(0,o.speed+(o.gap-reserve)*.75):Infinity);}}
  this.maneuverLimit=mode==='RECOVER'?9:mode==='EXIT_SETUP'?Math.min(pace,p.speed+2):['BRAKE','BOXED_IN','ABORT_ATTACK'].includes(mode)?Math.max(0,pace):Infinity;
  const old=this.targetSpeed;const freeRoadPace=Math.max(personality.pace,Math.min(94,pace));this.targetSpeed+=clamp(freeRoadPace-this.targetSpeed,-personality.braking*.1,personality.exit*.1);this.targetSpeed=clamp(this.targetSpeed,0,94);this.acceleration+=clamp(clamp((this.targetSpeed-old)*10,-personality.braking,personality.exit)-this.acceleration,-1.0,1.0);this.state=mode;this.reason=reason;
  const entry={tick:state.tick,time:state.time,state:mode,reason,lane:this.targetLane,targetSpeed:this.targetSpeed,front:ahead?.id??null,gap:ahead?.gap??null,strategicPlan:this.battle?.selected??null,energy:this.resources.mode,perceivedCars:p.cars.map(o=>({id:o.id,gap:o.gap,lateral:o.lateral,relativeSpeed:o.relativeSpeed}))};this.history.push(entry);if(this.history.length>180)this.history.shift();return entry;
 }
}


export {PERSONALITIES,Agent};
