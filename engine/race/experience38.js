// Observed crossing times and race journal. Presentation only, no race commands.
export class RaceTiming38 {
 constructor(){this.reset();}
 reset(){this.samples=new Map();this.time=-1;this.tick=-1;}
 update(p){if(!p?.snapshot?.cars||!Number.isFinite(p.time))return;if(p.time<this.time||p.tick<this.tick)this.reset();if(p.time===this.time)return;this.time=p.time;this.tick=p.tick;
  for(const c of p.snapshot.cars){if(!Number.isFinite(c.progress))continue;const a=this.samples.get(c.id)??[];if(a.length&&c.progress<a.at(-1).s-.1){this.reset();return;}if(!a.length||c.progress>a.at(-1).s+.01)a.push({s:c.progress,t:p.time});while(a.length>720||a.length>2&&p.time-a[1].t>100)a.shift();this.samples.set(c.id,a);}
 }
 crossing(id,s){const a=this.samples.get(id);if(!a||a.length<2||s<a[0].s||s>a.at(-1).s)return null;let lo=0,hi=a.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(a[m].s<=s)lo=m;else hi=m;}const x=a[lo],y=a[hi];return x.t+(y.t-x.t)*(s-x.s)/Math.max(1e-9,y.s-x.s);}
 view(p,id){const rows=p?.snapshot?.cars??[],i=rows.findIndex(c=>c.id===id),own=rows[i];if(!own)return null;const physical=n=>p.cars?.find(c=>c.id===n),valid=c=>c&&!physical(c.id)?.pit?.active&&!physical(c.id)?.live26?.retired&&c.finishedAt==null;
  const front=rows[i-1],rear=rows[i+1],gap=(a,b)=>{if(!valid(a)||!valid(b))return null;const t=this.crossing(a.id,b.progress);return t===null?null:Math.max(0,p.time-t);};
  const timing=p.timing?.find(c=>c.id===id),laps=timing?.laps??[],delta=laps.length>=2?laps.at(-1)-laps.at(-2):null;
  return {position:i+1,front:front?{id:front.id,name:front.name,metres:Math.max(0,front.progress-own.progress),seconds:gap(front,own)}:null,rear:rear?{id:rear.id,name:rear.name,metres:Math.max(0,own.progress-rear.progress),seconds:gap(own,rear)}:null,lapDelta:delta,lap:own.lap,phase:physical(id)?.show22?.battle?.phase??null};
 }
}
export function strategyChoices38({oldLoss,newLoss,pitLoss,trafficPenalty,wear,rate,remaining,length,waitLoss}){
 const laps=Math.max(0,remaining/length),one=Math.min(1,laps),nextWear=Math.min(1.5,wear+rate*length*one),lapCost=(wear+nextWear)*4.5*one+23*Math.max(0,(wear+nextWear)/2-.45)**2*one;
 const stay=Math.max(0,oldLoss),box=newLoss+pitLoss+trafficPenalty,after=Math.max(0,laps-one),wait=(waitLoss??lapCost+newLoss*(laps?after/laps:0))+pitLoss+trafficPenalty;
 const rows=[{key:'STAY_OUT',label:'อยู่จนจบ',cost:stay},{key:'BOX_NOW',label:'BOX รอบนี้',cost:box},{key:'WAIT_ONE',label:'อยู่ต่อหนึ่งรอบ',cost:wait,unavailable:laps<1.75}];const best=rows.filter(r=>!r.unavailable).reduce((a,b)=>a.cost<=b.cost?a:b);return {best:best.key,rows:rows.map(r=>({...r,delta:r.cost-best.cost})),uncertainty:3+Math.min(7,laps*.8+trafficPenalty*.4),scope:'แบบจำลองเวลาที่อาจเสียจากยางและพิต รวมการจราจรปัจจุบัน ไม่ใช่เวลารอบหรือผลที่รับประกัน'};
}
export function raceRecord38(p,track){if(!p?.finished||p.stop||p.weekend?.stage&&p.weekend.stage!=='RACE'||!Array.isArray(p.results)||p.results.length!==22)return null;
 const results=p.results.map(r=>({id:r.id,name:String(r.name??'').slice(0,40),position:r.position,time:r.finished&&Number.isFinite(r.time)?r.time:null,bestLap:Number.isFinite(r.bestLap)?r.bestLap:null,stops:r.stops??0,retired:!!r.retired}));if(results.some(r=>r.time===null&&!r.retired)||new Set(results.map(r=>r.id)).size!==6)return null;
 return {version:1,key:track+':'+p.tick+':'+results.map(r=>r.time).join('/'),track,laps:p.laps,overtakes:p.overtakes??0,results};
}
export class RaceJournal38{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.rows=[];this.error=null;try{const raw=JSON.parse(storage?.getItem('F1M-RACE-JOURNAL38')??'[]');if(Array.isArray(raw))this.rows=raw.filter(r=>r?.version===1&&typeof r.key==='string'&&Array.isArray(r.results)&&r.results.length===6).slice(-12);}catch{this.error='อ่านประวัติไม่ได้';}}
 record(p,track,run='legacy'){const row=raceRecord38(p,track);if(!row)return false;row.key=run+':'+row.key;if(this.rows.some(r=>r.key===row.key))return false;this.rows.push({...row,savedAt:new Date().toISOString()});if(this.rows.length>12)this.rows.shift();try{this.storage?.setItem('F1M-RACE-JOURNAL38',JSON.stringify(this.rows));this.error=null;}catch{this.error='พื้นที่บันทึกเต็ม · ประวัติรอบนี้อยู่ในหน่วยความจำ';}return true;}
}
