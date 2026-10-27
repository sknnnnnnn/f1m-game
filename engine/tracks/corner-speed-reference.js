// Multi-driver F1 25 median apex speeds (Driver Dojo), supplied 2026-10-27.
// Comparison references, not official real-world telemetry or hard speed caps.
export const CORNER_SPEED_REFS=Object.freeze({"bahrain":{"1":69.0,"2":119.0,"3":131.0,"4":111.0,"5":198.0,"6":196.0,"7":196.0,"8":81.0,"9":127.0,"10":74.0,"11":151.0,"12":241.0,"13":138.0,"14":121.0,"15":122.0},"suzuka":{"1":162.0,"2":155.0,"3":209.0,"4":195.0,"5":192.0,"6":164.0,"7":204.0,"8":234.0,"9":136.0,"10":73.0,"11":73.0,"12":225.0,"13":190.0,"14":152.5,"15":295.0,"16":90.0,"17":90.0,"18":94.0},"shanghai":{"1":174.0,"2":90.0,"3":85.0,"4":85.5,"5":271.0,"6":75.0,"7":239.0,"8":156.5,"9":108.5,"10":111.0,"11":84.0,"12":91.0,"13":127.0,"14":63.0,"15":63.0,"16":159.0}});
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10-15*x+6*x*x);};
const segments=new WeakMap();
function trackSegments(track){
 let table=segments.get(track);if(table)return table;
 const refs=CORNER_SPEED_REFS[track.key]??{},turns=track.turns;
 table=turns.map((a,i)=>{const b=turns[(i+1)%turns.length];return {s:a.s,number:a.number,next:b.number,length:(b.s-a.s+track.length)%track.length,av:refs[a.number],bv:refs[b.number]};});
 segments.set(track,table);return table;
}
export function cornerSpeedReference(track,station){
 if(!CORNER_SPEED_REFS[track.key])return null;
 const table=trackSegments(track),s=(station%track.length+track.length)%track.length;
 if(!table.length)return null;
 let lo=0,hi=table.length;
 while(lo<hi){const mid=(lo+hi)>>1;if(table[mid].s<=s)lo=mid+1;else hi=mid;}
 const a=table[(lo-1+table.length)%table.length],{av,bv,length}=a;
 if(!av&&!bv)return null;
 const ds=(s-a.s+track.length)%track.length,t=ds/length;
 // Linked reference corners share one continuous speed preference. There
 // are no conservative islands between the Esses. Unreferenced turns keep
 // their original envelope with 35 m protected around their marker.
 if(av&&bv)return {turn:t<.5?a.number:a.next,speed:(av+(bv-av)*ease(t))/3.6,weight:1};
 const weight=av?1-ease(ds/Math.max(1,length-35)):ease((ds-35)/Math.max(1,length-35));
 return {turn:av?a.number:a.next,speed:(av??bv)/3.6,weight};
}
export function referenceGripDemand(track,station,k,base,c,tyre,caution=0){
 const ref=cornerSpeedReference(track,station);if(!ref)return base;
 const v=ref.speed,aero=.5*c.rho*c.ClA/c.m;
 const needed=Math.abs(k)*v*v/(c.g+aero*v*v);
 // Request enough lateral usage for the reference if the actual car can
 // support it. This stays below the validator's .8*mu budget, never adds
 // physical grip, never lowers an already faster safe plan and scales with
 // cold/worn/damaged tyres. Some schematic bends cannot reach the reference.
 const requested=Math.min((.78-.14*Math.max(0,Math.min(1,caution)))*c.mu*tyre,needed*1.04*tyre);
 return base+Math.max(0,requested-base)*ref.weight;
}
