import {RENDER_HEARTBEAT_GRACE_MS} from '../runtime/render-health.js';
import {closeFieldTraits} from './drivers.js';
import {gridSlot28} from '../tracks/track-layout28.js';
import {VisualRace} from '../rendering/visual-race.js';
import {initial} from '../../racing/runtime/frozen/physics.js';
import {Agent} from '../ai/agent.js';
import {circuit} from '../tracks/track.js';
import {RaceClock} from './race-clock.js';
export class WeekendRace extends VisualRace {
 reset(){super.reset();this.lapTiming=new Map();this.raceMoments=[];this.lastEventTick=-1;this.tacticalMoments=new Map();
  for(const [i,car] of this.cars.entries()){const {station,lane:n}=gridSlot28(i,this.config.length),p=circuit.point(station,n);car.state=initial(this.config,{X:p.x,Y:p.y,psi:p.psi,u:0,v:0,r:0,gear:1,shiftTarget:1});car.agent=new Agent(car.id,car.kind,n,this.seed,closeFieldTraits(car));car.projection=circuit.project(p.x,p.y);car.progress=station-circuit.gate;car.peakKPH=0;this.lapTiming.set(car.id,{lastCrossing:0,laps:[],best:null});}
 }
 commitAdvance(proposed){const before=this.cars.map(c=>({progress:c.progress,time:c.state.time}));const eventKeys=new Set(this.events.map(e=>e.kind+':'+e.tick+':'+e.by+':'+e.car));const ok=super.commitAdvance(proposed);if(!ok)return false;
  this.cars.forEach((car,i)=>{const timing=this.lapTiming.get(car.id),old=before[i];for(let lap=timing.laps.length+1;lap<=this.laps;lap++){const threshold=lap*circuit.length;if(car.progress<threshold)break;const at=old.time+this.config.dt*Math.max(0,Math.min(1,(threshold-old.progress)/Math.max(1e-9,car.progress-old.progress))),duration=at-timing.lastCrossing;timing.lastCrossing=at;timing.laps.push(duration);timing.best=timing.best===null?duration:Math.min(timing.best,duration);this.raceMoments.push({kind:'LAP',time:at,car:car.id,lap,duration});}});
  for(const e of this.events){const key=e.kind+':'+e.tick+':'+e.by+':'+e.car;if(!eventKeys.has(key)&&['OVERTAKE','FINISH'].includes(e.kind))this.raceMoments.push({...e,time:e.time??this.time});}for(const car of this.cars){const kind=car.agent.state,allowed=['FEINT','OUTSIDE_SWITCH','EXIT_DRIVE','DEFEND','HOLD_SPACE','DRAFT','BRAKE_DUEL','ABORT_ATTACK','EXIT_TARGET'].includes(kind),old=this.tacticalMoments.get(car.id);if(allowed&&car.state.u>12&&(!old||old.kind!==kind&&this.time-old.time>5)){const target=car.agent.battleCommit?.rival??car.agent.battle?.rival??car.agent.racecraft?.target??car.agent.duel?.exit?.id??car.agent.perception?.cars.filter(c=>Math.abs(c.gap)<60).sort((a,b)=>Math.abs(a.gap)-Math.abs(b.gap))[0]?.id;if(target){this.raceMoments.push({kind,time:this.time,car:car.id,by:car.id,of:target,tick:this.tick});this.tacticalMoments.set(car.id,{kind,time:this.time});}}}
  if(this.raceMoments.length>100)this.raceMoments.splice(0,this.raceMoments.length-100);return true;
 }
 timing(){return this.cars.map(c=>({id:c.id,laps:[...this.lapTiming.get(c.id).laps],best:this.lapTiming.get(c.id).best,last:this.lapTiming.get(c.id).laps.at(-1)??null,finishedAt:c.finishedAt}));}
 results(){const order=this.ranking(),winner=order.find(c=>c.finishedAt!==null)?.finishedAt??null;return order.map((c,i)=>({position:i+1,id:c.id,name:c.name,personality:c.kind,finished:c.finishedAt!==null,time:c.finishedAt,gap:winner!==null&&c.finishedAt!==null?c.finishedAt-winner:null,completedLaps:this.lapTiming.get(c.id).laps.length,bestLap:this.lapTiming.get(c.id).best,lastLap:this.lapTiming.get(c.id).laps.at(-1)??null,peakKPH:c.peakKPH}));}
 presentation(){return {...super.presentation(),timing:this.timing(),moments:this.raceMoments.slice(-20),results:this.finished||this.stop?this.results():null};}
 export(){return {...super.export(),edition:'Bahrain Race Intelligence 11',grid:'Standing start; 2 staggered columns',timing:this.timing(),results:this.results(),moments:structuredClone(this.raceMoments)};}
}
export class WeekendSession {
 constructor({laps=3,raceFactory=options=>new WeekendRace(options)}={}){this.laps=laps;this.raceFactory=raceFactory;this.reset();}
 reset(){this.race=this.raceFactory({laps:this.laps});this.race.prepare();this.clock=new RaceClock();this.phase='GRID';this.countdown=0;this.countdownMS=0;this.running=false;this.notice='';this.pacing={slowed:false,slowEvents:0,stepMS:0};}
 start(){if(['FINISHED','RED_FLAG'].includes(this.phase))return;if(this.phase==='GRID'){this.phase='GRID_CLEAR';this.gridClearTime31=0;this.countdown=0;this.countdownMS=0;}this.running=true;this.notice='';this.clock.reset();}
 pause(reason=''){this.running=false;this.clock.reset();this.notice=reason;}
 tick(gap,options={}){if(!this.running)return {steps:0};if(gap>RENDER_HEARTBEAT_GRACE_MS){this.pause('พัก: ภาพขาดช่วงเกิน 2000 ms');return {guard:true};}
  if(this.phase==='GRID_CLEAR'){this.gridClearTime31=(this.gridClearTime31??0)+Math.max(0,gap)/1000;if(this.gridClearTime31>=6){this.phase='LIGHTS';this.countdown=0;this.countdownMS=0;}return {steps:0};}
  if(this.phase==='LIGHTS'){this.countdownMS+=Math.max(0,gap);this.countdown=this.countdownMS/1000;if(this.countdownMS>=4800){this.phase='RACE';this.clock.reset();}return {steps:0};}
  const result=this.clock.advance(gap,this.race.config.dt,()=>this.race.advance(),options.budget??6*this.clock.scale);if(result.guard)this.pause('พัก: ภาพขาดช่วงเกิน 2000 ms');else if(result.overload||(options.keepRunning&&this.clock.accumulator>this.race.config.dt*2)){if(this.clock.scale===2){this.clock.setScale(1);this.clock.reset();this.notice='เครื่องคำนวณไม่ทัน ×2 กลับเป็น ×1';}else if(options.keepRunning){this.pacing??={slowed:false,slowEvents:0,stepMS:0};this.pacing.slowed=true;this.pacing.slowEvents++;this.pacing.lastSlowTick=this.race.tick;this.clock.accumulator=Math.min(this.clock.accumulator,this.race.config.dt*2);}else this.pause('พัก: เครื่องคำนวณไม่ทัน');}
  if(this.pacing?.slowed&&this.race.tick-(this.pacing.lastSlowTick??0)>180)this.pacing.slowed=false;
  if(this.race.stop){this.phase='RED_FLAG';this.pause('หยุดการแข่งขัน · '+this.race.stop.kind);}else if(this.race.finished){this.phase='FINISHED';this.pause('CHEQUERED FLAG');}return result;
 }
 async tickParallel32(gap,run){if(!this.running)return {steps:0};if(this.phase!=='RACE'||this.ceremony26)return this.tick(gap,{keepRunning:true});const options={keepRunning:true};
  const result=await this.clock.advanceAsync(gap,this.race.config.dt,()=>this.race.advanceParallel32(run),2);if(result.guard)this.pause('พัก: ภาพขาดช่วงเกิน 2000 ms');else if(result.overload||(options.keepRunning&&this.clock.accumulator>this.race.config.dt*2)){if(this.clock.scale===2){this.clock.setScale(1);this.clock.reset();this.notice='เครื่องคำนวณไม่ทัน ×2 กลับเป็น ×1';}else if(options.keepRunning){this.pacing??={slowed:false,slowEvents:0,stepMS:0};this.pacing.slowed=true;this.pacing.slowEvents++;this.pacing.lastSlowTick=this.race.tick;this.clock.accumulator=Math.min(this.clock.accumulator,this.race.config.dt*2);}else this.pause('พัก: เครื่องคำนวณไม่ทัน');}
  if(this.pacing?.slowed&&this.race.tick-(this.pacing.lastSlowTick??0)>180)this.pacing.slowed=false;
  if(this.race.stop){this.phase='RED_FLAG';this.pause('หยุดการแข่งขัน · '+this.race.stop.kind);}else if(this.race.finished){this.phase='FINISHED';this.pause('CHEQUERED FLAG');}return result;
 }
 presentation(){return {...this.race.presentation(),phase:this.phase,lights:this.phase==='LIGHTS'?Math.min(5,Math.floor(this.countdown/.7)+1):0,countdown:this.countdown,gridClearTime31:this.gridClearTime31??0,pacing:this.pacing??{slowed:false,slowEvents:0,stepMS:0},running:this.running,ready:true,scale:this.clock.scale,notice:this.notice};}
}
