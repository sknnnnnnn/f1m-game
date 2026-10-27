import {circuit} from '../tracks/track.js';
export function resolveCameraStory(story,cars){return story?.partnerId?{...story,partner:cars.find(c=>c.id===story.partnerId)?.state??null}:story;}
// Selected-car editorial rules. No random draws, scheduled angle carousel,
// leaderboard subject changes, or writes to the simulation.
export class BroadcastDirector{
 constructor(){this.reset();}
 reset(id=1){this.focus=id;this.holdUntil=0;this.since=-Infinity;this.candidate=null;this.candidateSince=0;this.tracksideUntil=0;this.lastEventKey=null;this.story={kind:'GRID',shot:'grid',title:'รถที่เลือก · บนกริด'};}
 classify(frame,time,id){const car=frame.cars.find(c=>c.id===id);if(!car)return null;const s=car.state,at=circuit.project(s.X,s.Y,s.psi),speed=Math.hypot(s.u,s.v),k=Math.abs(at.k),brake=s.brake??0,gas=s.throttle??0;
 const peers=frame.cars.filter(c=>c.id!==id&&c.id!==7&&!!c.pit?.active===!!car.pit?.active).map(c=>({car:c,gap:Math.abs(circuit.delta(circuit.project(c.state.X,c.state.Y,c.state.psi).s,at.s)),distance:Math.hypot(c.state.X-s.X,c.state.Y-s.Y)})).filter(c=>c.gap<60&&c.distance<70).sort((a,b)=>a.distance-b.distance),near=peers[0];
 if(['GRID','GRID_CLEAR','LIGHTS'].includes(frame.phase))return {kind:'GRID',shot:'grid',title:'รถที่เลือก · รอสัญญาณ'};
 if(frame.stop)return {kind:'STOPPED',shot:'chase',title:'การแข่งขันหยุด · รถที่เลือก',urgent:true};
 if(car.finishedAt!==null&&car.finishedAt!==undefined)return {kind:'FINISH',shot:'front',title:'เข้าเส้นชัย'};
 if(car.pit?.active)return {kind:'PIT',shot:car.pit.phase==='SERVICE'?'front':'drone',title:car.pit.phase==='SERVICE'?'งานพิตของรถที่เลือก':'ติดตามรถเข้าพิต'};
 const reaction=car.response21?.phase;if(['RELEASE','SETTLE'].includes(reaction))return {kind:'RECOVERY',shot:'front',title:'คลายเบรก · ตั้งรถใหม่',urgent:true};
 if(['DEPLOY','LEAD','IN','RETURN'].includes(frame.safetyCar?.phase))return {kind:'SAFETY_CAR',shot:'drone',title:'รถที่เลือก · ตามขบวน Safety Car'};
 if(frame.controlZone?.flag==='VSC'||frame.controlZone?.flag==='YELLOW'&&(car.agent?.state==='YELLOW'||car.intelligence?.action==='YELLOW'))return {kind:'CAUTION',shot:frame.controlZone.flag==='VSC'?'drone':'chase',title:'ชะลอตามสัญญาณ · รักษาพื้นที่'};
 const pass=(frame.moments??[]).filter(e=>e.kind==='OVERTAKE'&&(e.by===id||e.of===id)&&time-e.time>=0&&time-e.time<4).at(-1);
 if(pass)return {kind:'PASS',shot:'duel',title:pass.by===id?'แซงสำเร็จ':'ถูกแซง · เตรียมสวน',partnerId:pass.by===id?pass.of:pass.by,eventKey:pass.time+':'+pass.by+':'+pass.of,urgent:true};
 if(this.story?.partnerId&&['DUEL','PASS'].includes(this.story.kind)){const rival=peers.find(p=>p.car.id===this.story.partnerId);if(rival&&rival.distance<36&&rival.gap<28)return {kind:'DUEL',shot:'duel',title:'ดวลต่อเนื่อง · เข้าโค้งถึงทางออก',partnerId:rival.car.id};}
 if(peers.filter(c=>c.distance<22).length>=2)return {kind:'PACK',shot:'high',title:'อ่านพื้นที่รอบรถ'};
 if(near&&near.gap<10&&near.distance<15)return {kind:'DUEL',shot:'duel',title:'ขึ้นคู่ · รักษาพื้นที่',partnerId:near.car.id};
 if(brake>.42&&speed>17)return {kind:'BRAKING',shot:time>=this.tracksideUntil?'trackside':'front',title:'จุดเบรก · คลายน้ำหนักเข้าโค้ง'};
 if(k>.012&&speed>9)return {kind:'TECHNICAL',shot:'drone',title:'ดูไลน์เข้า–ออกโค้ง'};
 if((car.draft??0)>.08&&speed>38&&brake<.08)return {kind:'TOW',shot:'fps',title:'มุมคนขับ · เก็บลมดูด'};
 if(near&&near.gap>14&&near.gap<48&&speed>38&&brake<.08)return {kind:'CHASE',shot:'fps',title:'มุมคนขับ · ไล่รถข้างหน้า'};
 if(gas>.65&&k>.0008&&speed>14)return {kind:'EXIT',shot:'chase',title:'คืนคันเร่ง · เร่งออกโค้ง'};
 if(k>.002&&speed>35)return {kind:'SWEEP',shot:'drone',title:'โค้งเร็ว · รักษาโมเมนตัม'};
 if(speed>65&&gas>.8&&k<.0007)return {kind:'STRAIGHT',shot:'nose',title:'ทางตรง · เต็มคันเร่ง'};
 return {kind:'FLOW',shot:'chase',title:'ติดตามรถที่เลือก'};
 }
 update(frame,time,id=this.focus){if(!frame?.cars?.some(c=>c.id===id))return null;if(id!==this.focus||time<this.lastTime){this.reset(id);}this.lastTime=time;const next=this.classify(frame,time,id);if(!next)return null;
 const key=next.kind+':'+next.shot+':'+(next.partnerId??'');if(key!==this.candidate){this.candidate=key;this.candidateSince=time;}
 let switched=false;const duration=time-this.since,entry=!Number.isFinite(this.since),stable=time-this.candidateSince>=.7,critical=next.urgent&&duration>=(next.kind==='STOPPED'?.5:next.kind==='PASS'?2:4)&&(!next.eventKey||next.eventKey!==this.lastEventKey);
 const matureDuel=next.kind==='DUEL'&&duration>=7&&time>=this.holdUntil;
 if(entry||next.kind==='GRID'||((stable||matureDuel)&&time>=this.holdUntil)||critical){const changed=next.shot!==this.story.shot||(next.shot==='duel'&&next.partnerId!==this.story.partnerId);if(changed||entry){if(this.story.shot==='trackside')this.tracksideUntil=time+10;this.story=next;if(next.eventKey)this.lastEventKey=next.eventKey;this.since=time;this.holdUntil=time+(next.shot==='trackside'?6:next.kind==='PASS'?8:7);switched=true;}}
 if(next.shot===this.story.shot&&next.partnerId===this.story.partnerId){this.story={...this.story,...next};}
 // A stationary TV post must not pan after a car for an entire straight.
 if(this.story.shot==='trackside'&&time-this.since>6){this.story={kind:'EXIT',shot:'chase',title:'ออกจากจุดเบรก · ตามรถต่อ'};this.tracksideUntil=time+10;this.since=time;this.holdUntil=time+4.5;switched=true;}
 return {id,story:resolveCameraStory(this.story,frame.cars),switched};}
}
