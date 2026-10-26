import {circuit as defaultCircuit,mod} from '../tracks/track.js';
// Game DRS zones: this is a documented game mechanic, not a ruleset for a
// specific championship year. Detection grants one zone permit; it is not
// recomputed from the changing race gap on every rendering/configuration call.
export function drsZones24(track=defaultCircuit){
 if(track.key==='bahrain')return [{id:'MAIN',name:'ทางตรงหลัก',detect:5075,start:5150,end:650},{id:'T3-T4',name:'ทางตรงหลัง T3',detect:980,start:1050,end:1410},{id:'T10-T11',name:'ทางตรงหลัง T10',detect:2770,start:2830,end:3280}];
 // Find long, gently curved runs from the actual geometry of fictional tracks.
 const step=10,N=Math.ceil(track.length/step),flat=Array.from({length:N},(_,i)=>Math.abs(track.at(i*step).k)<.0018);let cut=flat.findIndex(x=>!x);if(cut<0)cut=0;const runs=[];let first=null;
 for(let j=1;j<=N+1;j++){const i=(cut+j)%N,yes=j<=N&&flat[i];if(yes&&first===null)first=j;if(!yes&&first!==null){const length=(j-first)*step;if(length>=450){const s=mod((cut+first)*step,track.length);runs.push({id:'STRAIGHT-'+runs.length,name:'ทางตรง '+(runs.length+1),detect:mod(s-55,track.length),start:mod(s+15,track.length),end:mod(s+length-120,track.length),length});}first=null;}}
 return runs.filter(z=>{const psi=track.at(z.start).psi,length=mod(z.end-z.start,track.length);let lo=0,hi=0;for(let ds=0;ds<=length;ds+=10){const d=track.at(z.start+ds).psi-psi,a=Math.atan2(Math.sin(d),Math.cos(d));lo=Math.min(lo,a);hi=Math.max(hi,a);}return hi-lo<.26;}).sort((a,b)=>b.length-a.length).slice(0,3).sort((a,b)=>a.start-b.start);
}
export const DRS_GAP_SECONDS=3;
const zoneCache=new WeakMap();export function zonesFor24(track=defaultCircuit){if(!zoneCache.has(track))zoneCache.set(track,drsZones24(track));return zoneCache.get(track);}
export function inDRSZone24(s,z,track=defaultCircuit){return mod(s-z.start,track.length)<=mod(z.end-z.start,track.length);}
function detection(r,car,track){let closest=null;const s=car.projection.s;for(const other of r.cars){if(other.id===car.id||other.pit?.active||other.finishedAt!==null)continue;const station=other.projection?.s??mod(other.progress,track.length),gap=mod(station-s,track.length);if(gap<=0||closest&&gap>=closest.metres)continue;closest={id:other.id,metres:gap,seconds:gap/Math.max(15,other.state?.u??car.state.u)};}return {allowed:!!closest&&closest.seconds<=DRS_GAP_SECONDS,gap:closest?.seconds??null,target:closest?.id??null};}
export function wingEligibility24(r,car,track=defaultCircuit){
 const s=car.state,station=car.projection?.s??mod(car.progress,track.length),zones=zonesFor24(track);const q=car.wing24??={permits:{},active:false,status:'LOCKED',reason:'รอเริ่มแข่ง',lastS:station};
 const emergency=car.pit?.active?'เข้าพิต':car.finishedAt!==null?'เข้าเส้นชัยแล้ว':r.controlZone?.flag!=='GREEN'?'ธงจำกัดความเร็ว':r.safetyCar?.phase!=='PARKED'?'Safety Car':r.time<8?'รอช่วงออกตัว':Math.abs(s.delta??0)>.045||Math.abs(car.projection.k??0)>.0035?'ปิดก่อนเข้าโค้ง':car.response21?.phase&&car.response21.phase!=='NORMAL'?'กำลังคืนแรงเกาะ':null;
 const stamp=[r.tick??s.tick??r.time,station,s.brake,s.u,emergency].join(':');if(q.stamp===stamp)return q.active;q.stamp=stamp;
 const progress=car.progress??station,delta=mod(station-q.lastS,track.length);for(const z of zones){const crossed=delta>0&&delta<250&&mod(z.detect-q.lastS,track.length)>0&&mod(z.detect-q.lastS,track.length)<=delta;if(crossed&&!emergency){const cycle=Math.floor((progress-z.detect)/track.length),key=z.id+':'+cycle;q.permits[z.id]={key,...detection(r,car,track)};}}
 q.lastS=station;const zone=zones.find(z=>inDRSZone24(station,z,track));q.zone=zone?.id??null;q.zoneName=zone?.name??null;q.active=false;
 if(emergency){if(zone&&q.openedKey===zone.id+':'+Math.floor((progress-zone.detect)/track.length))q.closedKey=q.openedKey;q.status='LOCKED';q.reason=emergency;return false;}
 if(!zone){const next=zones.map(z=>({z,d:mod(z.start-station,track.length)})).sort((a,b)=>a.d-b.d)[0],permit=next?q.permits[next.z.id]:null;q.status=permit?.allowed&&next.d<100?'READY':'WAIT';q.reason=q.status==='READY'?'มีสิทธิ์ · รอเขตเปิด':'รอเขต DRS';return false;}
 const key=zone.id+':'+Math.floor((progress-zone.detect)/track.length);let permit=q.permits[zone.id];
 // Starting/loading inside a zone has no earlier observed detection crossing.
 // Sample once after the launch lock, and keep that permit for this passage.
 if(!permit||permit.key!==key)permit=q.permits[zone.id]={key,...detection(r,car,track)};
 q.gap=permit.gap;q.target=permit.target;q.available=permit.allowed;
 if(!permit.allowed){q.status='UNAVAILABLE';q.reason=permit.target?'จุดตรวจ: ตามคันหน้า '+(permit.gap??0).toFixed(2)+'s · ต้อง ≤'+DRS_GAP_SECONDS+'s':'จุดตรวจ: ไม่มีรถข้างหน้า';return false;}
 if(s.brake>.12){if(q.openedKey===key)q.closedKey=key;q.status='BRAKE';q.reason='ปิดขณะเบรก';return false;}
 if(q.closedKey===key){q.status='BRAKE';q.reason='เบรกแล้ว · รอเขตถัดไป';return false;}
 if(s.u<35){q.status='READY';q.reason='มีสิทธิ์ · รอความเร็ว';return false;}
 q.active=true;q.openedKey=key;q.status='OPEN';q.reason='เปิดปีก';return true;
}
export function wingView24(car){const q=car.wing24;return q?{active:q.active,status:q.status,reason:q.reason,zone:q.zone,zoneName:q.zoneName,gap:q.gap??null,target:q.target??null}:{active:false,status:'WAIT',reason:'รอเขต DRS'};}
