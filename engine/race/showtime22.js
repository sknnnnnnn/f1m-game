import {wingEligibility24} from '../drs/drs24.js';
import {clearance,brakeBrush} from '../physics/collision.js';
// Game telemetry adapters. No writes to authoritative pose, rank, wheels or grip.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function wheelSlip22(s,c){return [[c.a,c.tf/2],[c.a,-c.tf/2],[-c.b,c.tr/2],[-c.b,-c.tr/2]].map(([x,y],i)=>{const d=i<2?s.delta:0,vx=(s.u-s.r*y)*Math.cos(d)+(s.v+s.r*x)*Math.sin(d);return clamp((vx-(s.wheels?.[i]?.omega??vx/c.R)*c.R)/Math.max(8,Math.abs(vx)),0,1);});}
export function tyrePhase22(car){const wheels=car.state.wheels??[],temperature=car.tyres?.temperature??wheels.reduce((a,w)=>a+(w.Ts??90),0)/Math.max(1,wheels.length),wear=car.tyres?.wear??Math.max(0,...wheels.map(w=>w.wear??0));return {temperature,wear,label:wear>.65?'ยางสึก':(car.tyres?.sets??1)>1&&(car.tyres?.ageMetres??(car.distance-car.tyres.fittedDistance))<450?'ยางใหม่ · กำลังเข้าช่วง':temperature<70?'กำลังอุ่นยาง':temperature>120?'ยางร้อน':'ยางพร้อม'};}
// Simplified game wing, not a claim of a particular season's regulations.
export function wingEligibility22(r,car){return wingEligibility24(r,car);}
export function effectsTelemetry22(car,c){const s=car.state,speed=Math.hypot(s.u,s.v),slips=wheelSlip22(s,c),braking=s.brake>.2&&speed>12&&!car.pit?.active,locks=slips.map(v=>braking&&v>.32?v:0),bump=car.surface?.bump??s.surface?.bump??0;
 // Flat road solver has no vertical contact. This bounded visual clearance proxy
 // combines actual speed load, chassis acceleration, travel and positive kerb height.
 const compression=clamp(speed*speed*.000007,0,.045)+Math.max(0,-(s.lastAx??0))*.0006,clearance=.042-compression-Math.max(0,bump)*1.6,scrape=speed>36&&clearance<.016&&(car.surface?.kind==='KERB'||speed>60);
 return {speed,locks,smoke:Math.max(...locks),clearance,scrape,spark:scrape?clamp((.016-clearance)*75+.3,0,1):0,dust:['GRAVEL','SAND'].includes(car.surface?.kind)&&speed>8?clamp(speed/35,0,1):0,wing:car.show22?.wing??false,tyre:tyrePhase22(car)};}
export function battleBrief22(car){const a=car.agent??{},d=a.duel??{},p=a.personality??{},rival=d.counter?.id??d.pass?.id??d.exit?.id??a.perception?.leader?.id;return {rival:rival??null,phase:d.counter?'สวนคืน':d.exit?'วางทางออก':d.pass?'รักษาช่องแซง':a.state==='DRAFT'?'เตรียมจากลมดูด':'อ่านพื้นที่',style:p.risk>.72?'เบรกกล้า · ชอบบุก':p.defend>.7?'ป้องกันพื้นที่':(a.style?.tyreCare??0)>.75?'ถนอมยาง · เน้นทางออก':'ปรับไลน์ตามคู่แข่ง'};}

export function freshTyreFactor22(car){return (car.tyres?.sets??1)>1?.96+.04*clamp((car.distance-car.tyres.fittedDistance)/450,0,1):1;}
// Damage only on an already-accepted tiny stable braking brush. Hard impacts
// still stop before contact. This is wing wear, not an impulse/crash solver.
export function brushDamage22(r,dt){for(const a of r.cars)for(const b of r.cars){if(a.id===b.id||a.pit.active||b.pit.active||!a.health)continue;const s=a.state,t=b.state;if(clearance(s,t,r.config)>=0||!brakeBrush(s,s,t,t,r.config))continue;const dx=t.X-s.X,dy=t.Y-s.Y,forward=dx*Math.cos(s.psi)+dy*Math.sin(s.psi),side=-dx*Math.sin(s.psi)+dy*Math.cos(s.psi);if(forward<r.config.length*.65)continue;a.health.wing=clamp(a.health.wing+dt*.08,0,1);a.health.wingSide=-Math.sign(side)||1;}}
