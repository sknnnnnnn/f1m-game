// Passive measurements of painted live racing frames. Never treat RAF callbacks,
// the CPU fallback, paused scenes or a minimap as an Android GPU benchmark.
export class RacePerformance54{
 constructor(){this.reset();}
 reset(){this.buckets=new Map();this.last=null;}
 idle(){this.last=null;}
 paint(now,{renderer='WebGL',night=false,wet=false,pack=false,pit=false}={}){
  const key=renderer+'/'+(wet?'WET':'DRY')+'/'+(night?'NIGHT':'DAY')+'/'+(pit?'PIT':pack?'PACK':'OPEN');
  if(this.last?.key===key){const dt=now-this.last.now;if(dt>0&&dt<2000){const row=this.buckets.get(key)??{renderer,frames:0,elapsedMS:0,gaps:[]};row.frames++;row.elapsedMS+=dt;row.gaps.push(dt);if(row.gaps.length>1800)row.gaps.shift();this.buckets.set(key,row);}}
  this.last={key,now};
 }
 report(){return {targetFPS:60,scope:'Painted live frames on this device; per-condition rolling P95. CPU fallback is not Android GPU evidence.',samples:[...this.buckets].map(([condition,r])=>{const sorted=[...r.gaps].sort((a,b)=>a-b);return {condition,renderer:r.renderer,paintedIntervals:r.frames,seconds:r.elapsedMS/1000,fps:r.elapsedMS?r.frames*1000/r.elapsedMS:null,p95MS:sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]??null,deviceValidation:r.renderer==='WebGL'&&r.elapsedMS>=30000?'MEASURED':'INSUFFICIENT'};})};}
}
