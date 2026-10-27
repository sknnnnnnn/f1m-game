const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Bounded, low-frequency lens/aim cues. No camera shake or vehicle changes.
export function driveCues26(previous,state,dt,snap=false){
 const speed=Math.hypot(state.u,state.v),target={lens:5*clamp((speed-35)/59,0,1),aim:clamp((state.lastAx??0)*.018,-.32,.18),roll:clamp(-(state.r??0)*speed*.00012,-.012,.012)};
 if(!previous||snap)return target;
 const k=1-Math.exp(-Math.min(.1,Math.max(0,dt))*4);
 return Object.fromEntries(Object.entries(target).map(([key,v])=>[key,previous[key]+(v-previous[key])*k]));
}
