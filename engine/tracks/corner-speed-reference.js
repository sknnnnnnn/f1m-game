// Speeds supplied by the user, 2026-10-27 (km/h). These are comparison
// references, not exact apex telemetry or hard limits on the simulated car.
// Retain their source status; track geometry and physical grip still win.
export const CORNER_SPEED_REFS=Object.freeze({
 bahrain:Object.freeze({3:211,5:243,6:209,7:228,12:264}),
 suzuka:Object.freeze({1:229,3:234,4:217,5:211,6:184,7:244,8:243,12:224,15:295}),
 shanghai:Object.freeze({4:181,5:286,7:258,8:182})
});
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
export function referenceGripDemand(track,station,k,base,c,tyre){
 const ref=cornerSpeedReference(track,station);if(!ref)return base;
 const v=ref.speed,aero=.5*c.rho*c.ClA/c.m;
 const needed=Math.abs(k)*v*v/(c.g+aero*v*v);
 // Request enough lateral usage for the reference if the actual car can
 // support it. This stays below the validator's .8*mu budget, never adds
 // physical grip, never lowers an already faster safe plan and scales with
 // cold/worn/damaged tyres. Some schematic bends cannot reach the reference.
 const requested=Math.min(.78*c.mu*tyre,needed*1.04*tyre);
 return base+Math.max(0,requested-base)*ref.weight;
}
