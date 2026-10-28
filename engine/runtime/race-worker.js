import {configureMenuSession49,advanceMenuSession49} from '../race/menu-session49.js';
import {validPitProof39} from '../pit/release-proof39.js';
import {renderHeartbeatLost,RENDER_HEARTBEAT_GRACE_MS} from './render-health.js';
import {physicsPool32} from './physics-pool32.js';
import {raceLaps31} from '../race/race-format31.js';
import {circuit} from '../tracks/track.js';
import {command23,applyPlans23} from '../ui/control23.js';
import {LivingSession26 as Weekend2Session} from '../race/living-session26.js';
import {saveWeekend,loadWeekend} from '../race/weekend-save.js';
const physics32=physicsPool32(PHYSICS_WORKER_SOURCE32,circuit.key);let busy32=false;
let campaign23=null,session=new Weekend2Session(),generation=0,last=performance.now(),heartbeat=last,lastPublish=last;
function publish(){postMessage({type:'FRAME',generation,...session.presentation(),menu49:session.menu49??null,performance32:{...physics32.metrics,...session.race.performance32}});lastPublish=performance.now();}
const pending32=[];self.onmessage=e=>{const m=e.data;if(busy32&&m.type!=='HEARTBEAT'&&m.type!=='PIT_READY29'){pending32.push(m);return;}if(m.type==='RESET'){generation=m.generation;session.reset();if(campaign23){session.stage='RACE';session.race.laps=campaign23.laps===0?raceLaps31(circuit.key):campaign23.laps;session.race.selectTeam(campaign23.team);if(campaign23.plans?.length===2)applyPlans23(session.race,campaign23.plans);}last=heartbeat=performance.now();publish();return;}if(m.generation!==generation)return;

 if(m.type==='RESUME_CONTACT32'){if(session.race.resumeContact32()){session.phase='RACE';session.running=true;session.clock.reset();session.notice='ขับต่อจากจุดปลอดภัย · คู่กรณีเบรกเพื่อเว้นระยะ';last=heartbeat=performance.now();}else session.notice='ยังไม่ปลอดภัยที่จะขับต่อ · เก็บเซฟหรือลองเริ่มเรซใหม่';publish();return;}
 if(m.type==='PIT_READY29'){for(const proof of m.proofs??[]){const c=session.race.cars.find(c=>c.id===proof.id);if(c&&validPitProof39(c,proof,session.race.time))c.pit.releaseProof29={serviceAt:proof.serviceAt,at:proof.at,clear:proof.clear===true};}return;}
 if(m.type==='BOOT23'){if(session.race.tick===0){session.reset();session.stage='RACE';session.race.laps=[1,2,4,5,6].includes(m.laps)?m.laps:raceLaps31(circuit.key);session.race.selectTeam(m.team);campaign23={team:m.team,laps:m.laps===0?0:session.race.laps};publish();}return;}
 if(m.type==='LIVING26'){const ok=m.action==='SKIP_CEREMONY'?session.skipCeremony26():m.action==='CEREMONIES'?(session.ceremonies26=m.value!==false,true):session.race.command26(m.action,m.id);postMessage({type:'LIVING_RESULT26',generation,ok});publish();return;}
 if(m.type==='COMMAND23'){const result=command23(session.race,m.command);postMessage({type:'CONTROL_RESULT23',generation,...result});publish();}
 if(m.type==='PLAN23'){const result=applyPlans23(session.race,m.plans);if(result.ok&&campaign23)campaign23.plans=structuredClone(m.plans);postMessage({type:'CONTROL_RESULT23',context23:'PLAN',generation,...result});publish();}
 if(m.type==='SAVE23'){session.pause();postMessage({type:'SAVE23',generation,data:saveWeekend(session)});publish();}
 if(m.type==='RACE_AUTO'){session.race.race15.automatic=m.value===true;publish();}
 if(m.type==='SAFETY_CAR'){session.race.callSafety(m.action);publish();}
 if(m.type==='TEAM'){session.race.selectTeam(m.id);publish();}
 if(m.type==='ORDER'){const result=session.race.issueOrder(m.id,m.patch);postMessage({type:'ORDER_RESULT',generation,...result});publish();}
 if(m.type==='CONFIGURE49'){const result=configureMenuSession49(session,m.config);if(result.ok){campaign23=null;last=heartbeat=performance.now();postMessage({type:'MENU49_RESET',generation});}publish();postMessage({type:'MENU49_RESULT',generation,...result});return;}
 if(m.type==='NEXT_STAGE'){advanceMenuSession49(session);publish();}
 if(m.type==='SETUP'){session.setup(m.id,m.name,m.adjust??{});publish();}
 if(m.type==='WEATHER'){session.race.setWeather(m.mode);publish();}
 if(m.type==='FLAG'){session.race.caution(m.flag);publish();}
 if(m.type==='SAVE'){session.pause();postMessage({type:'SAVE',generation,data:saveWeekend(session)});publish();}
 if(m.type==='LOAD'){try{const restored=loadWeekend(m.data);session=restored;for(const c of session.race.cars)c.pit.releaseProof29=null;if(Object.prototype.hasOwnProperty.call(m,'campaign23'))campaign23=m.campaign23;last=heartbeat=performance.now();postMessage({type:'LOADED',generation});publish();}catch(e){postMessage({type:'SAVE_ERROR',generation,message:'โหลดไม่สำเร็จ: '+String(e)});}}
 if(m.type==='ANALYSIS')postMessage({type:'ANALYSIS',generation,data:session.race.report()});
 if(m.type==='BOX'){if(session.stage==='PRACTICE'&&!session.race.finished&&session.race.laps===1){session.race.laps=2;session.notice='PRACTICE · 2 รอบ เพื่อดูงานพิตที่เรียก';}session.race.requestPit(m.id,m.compound??null);publish();}if(m.type==='CANCEL_BOX'){session.race.cancelPit(m.id);publish();}
 if(m.type==='START'){session.start();last=heartbeat=performance.now();publish();}if(m.type==='PAUSE'){session.pause(m.reason||'');publish();}if(m.type==='HEARTBEAT')heartbeat=performance.now();if(m.type==='SCALE'){session.clock.setScale(m.scale);publish();}if(m.type==='EXPORT')postMessage({type:'EXPORT',generation,data:session.race.export()});};
setInterval(async()=>{if(busy32)return;const now=performance.now(),gap=now-last;last=now;if(!session.running)return;if(renderHeartbeatLost(now,heartbeat)){session.pause('พัก: เฟรมแสดงผลขาดช่วงเกิน 2000 ms');publish();return;}try{busy32=true;const began=performance.now();await session.tickParallel32(gap,physics32.run);if(session.pacing)session.pacing.stepMS=performance.now()-began;if(!session.running||now-lastPublish>45)publish();}catch(error){session.pause('Simulation error: '+String(error));publish();postMessage({type:'ERROR',generation,message:String(error)});}finally{busy32=false;for(const m of pending32.splice(0))self.onmessage({data:m});}},6);publish();
