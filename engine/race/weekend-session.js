import {closeFieldTraits} from './drivers.js';
import {raceLaps31} from './race-format31.js';
import {gridSlot28} from '../tracks/track-layout28.js';
import {viewRace15} from './race-intelligence15.js';
import {ensureEngineer} from './team-engineer.js';
import {WeekendSession} from './weekend.js';
import {LivingRace26 as Weekend2Race} from './living-race26.js';
import {circuit} from '../tracks/track.js';
import {initial} from '../../racing/runtime/frozen/physics.js';
import {Agent} from '../ai/agent.js';
import {SETUPS} from './weekend-environment.js';
export class Weekend2Session extends WeekendSession {
 constructor(){super({laps:5,raceFactory:o=>new Weekend2Race(o)});}
 reset(){this.stage='RACE';this.qualifying=[];this.sessionHistory=[];this.savedSetups={};this.weatherMode='DRY';super.reset();this.race.laps=raceLaps31(circuit.key);this.notice=circuit.name+' · เรซ '+this.race.laps+' รอบ';}
 advanceStage(){if(this.running)return false;if(this.race.stop)return false;const next={PRACTICE:'QUALIFYING',QUALIFYING:'RACE'}[this.stage];if(!next)return false;
  const timings=this.race.timing().map(t=>this.stage==='QUALIFYING'&&this.qualifyingFormat==='FLYING'?{...t,best:this.race.cars[t.id-1].invalidLaps?.includes(2)?null:t.laps[1]??null}:t);this.sessionHistory.push({stage:this.stage,complete:this.race.finished,time:this.race.time,timing:structuredClone(timings),engineer:structuredClone(this.race.presentation().engineer),race15:structuredClone(viewRace15(this.race))});
  if(this.stage==='QUALIFYING')this.qualifying=timings.map(t=>({id:t.id,time:t.best})).sort((a,b)=>(a.time??Infinity)-(b.time??Infinity)||a.id-b.id);
  this.savedSetups=Object.fromEntries(this.race.cars.map(c=>[c.id,{name:c.setup,adjust:c.setupAdjust??{}}]));this.weatherMode=this.race.weather.mode;
  const weather=structuredClone(this.race.weather),engineer=structuredClone(this.race.engineer),memories=this.race.cars.map(c=>structuredClone(c.agent.rivals));super.reset();this.stage=next;this.race.laps=next==='RACE'?raceLaps31(circuit.key):2;this.qualifyingFormat='FLYING';this.race.weather=weather;
  for(const c of this.race.cars){const s=this.savedSetups[c.id];c.setup=s?.name??'BALANCED';c.setupAdjust=s?.adjust??{};}
  if(next==='RACE')this.placeGrid(this.qualifying.map(t=>t.id));else this.placeGrid([1,2,3,4,5,6]);
  this.race.engineer=engineer;ensureEngineer(this.race);for(const c of this.race.cars){if(next==='RACE'){const measured=this.qualifying.find(q=>q.id===c.id)?.time;if(Number.isFinite(measured))c.paceReference=measured;}c.basePersonality={...c.agent.personality};c.baseStyle={...c.agent.style};c.agent.rivals=memories[c.id-1];for(const rival of c.agent.rivals?.values()??[]){rival.visits=new Map();rival.lastS=this.race.cars[rival.id-1]?.projection.s??0;rival.totalS=rival.lastS;}c.agent.opponentSpeeds.clear();const plan=this.race.engineer.orders[c.id].pitPlan;if(plan){plan.done=false;plan.disabled=plan.lap>this.race.laps;plan.initialStops=0;}for(const s of this.race.engineer.orders[c.id].stints??[]){s.done=false;}c.agent.plan=null;}this.race.prepare();
  this.notice=next==='RACE'?'RACE · 5 รอบ · กริดตามเวลาควอลิฟายจริง (ไม่มีเวลาจะอยู่ท้าย)':'QUALIFYING · รอบแรกอุ่นยาง / รอบสอง Flying lap · ใช้เวลารอบสองจัดกริด';return true;
 }
 placeGrid(order){for(const car of this.race.cars){const i=order.indexOf(car.id),{station,lane:n}=gridSlot28(i,this.race.config.length),p=circuit.point(station,n);car.state=initial(this.race.config,{X:p.x,Y:p.y,psi:p.psi,u:0,v:0,r:0,gear:1,shiftTarget:1});car.agent=new Agent(car.id,car.kind,n,this.race.seed,closeFieldTraits(car));car.projection=circuit.project(p.x,p.y);car.progress=station-circuit.gate;car.gridPosition=i+1;}this.race.order=this.race.ranking().map(c=>c.id);if(this.race.race15)this.race.race15.lastOrder=[...this.race.order];this.race.prepare();}
 setup(id,name,adjust={}){if(this.running||!SETUPS[name])return false;return this.race.setSetup(id,name,adjust);}
 presentation(){const p=super.presentation();if(this.stage==='QUALIFYING'&&this.qualifyingFormat==='FLYING'&&p.results){const rows=p.results.map(row=>{const time=this.race.cars[row.id-1].invalidLaps?.includes(2)?null:this.race.lapTiming.get(row.id).laps[1]??null;return {...row,time,bestLap:time,lastLap:time,finished:time!==null};}).sort((a,b)=>(a.time??Infinity)-(b.time??Infinity)||a.id-b.id),best=rows.find(r=>r.time!==null)?.time;p.results=rows.map((r,i)=>({...r,position:i+1,gap:r.time===null?null:r.time-best}));}return {...p,weekend:{stage:this.stage,qualifyingFormat:this.qualifyingFormat??'FLYING',qualifyingTiming:this.stage==='QUALIFYING'?this.race.timing().map(t=>({id:t.id,outlap:t.laps[0]??null,flying:this.race.cars[t.id-1].invalidLaps?.includes(2)?null:t.laps[1]??null,invalid:this.race.cars[t.id-1].invalidLaps?.includes(2)??false,current:this.race.cars[t.id-1].lap===1?'OUT LAP':'FLYING LAP'})):[],qualifying:this.qualifying,history:this.sessionHistory.map(h=>({stage:h.stage,complete:h.complete,time:h.time})),canAdvance:!this.running&&!this.race.stop&&this.stage!=='RACE',setups:Object.fromEntries(Object.entries(SETUPS).map(([k,v])=>[k,v.label]))}};}
}
