// Fit a C2 world-space route on a fixed station grid. Curvature is taken from
// the same curve we ask the controller to drive, not isolated road sample kinks.
// Per-plan memoisation also avoids repeating the expensive raw geometry query.
const sharedGeometry=new WeakMap();
function controlsFor(key,spacing){if(!key)return null;let table=sharedGeometry.get(key);if(!table)sharedGeometry.set(key,table=new Map());if(!table.has(spacing))table.set(spacing,new Map());return table.get(spacing);}
function spline(rawPoint,origin,spacing=8,shared=null){
 const points=shared??new Map();
 const control=i=>{if(!points.has(i))points.set(i,rawPoint(i*spacing-origin));return points.get(i);};
 return ds=>{const z=(origin+ds)/spacing,i=Math.floor(z),t=z-i,b=[(1-t)**3/6,(3*t**3-6*t*t+4)/6,(-3*t**3+3*t*t+3*t+1)/6,t**3/6];let x=0,y=0;for(let j=0;j<4;j++){const q=control(i+j-1);x+=b[j]*q.x;y+=b[j]*q.y;}return {x,y};};
}

export function smoothWorldRoute(rawPoint,origin,spacing=8,track=null,wideSpacing=32,cacheKey=null){
 const narrow=spline(rawPoint,origin,spacing,controlsFor(cacheKey,spacing));if(!track)return narrow;
 // Shanghai T5 is a shallow change of heading between two straights. Fit
 // that entire bend as one curve; tight linked corners retain the local fit.
 const center=track.turns.find(t=>t.number===5)?.s??-10000;
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10-15*x+6*x*x);};
 const wide=spline(rawPoint,origin,wideSpacing,controlsFor(cacheKey,wideSpacing)),weights=spline(ds=>{const s=origin+ds;return{x:ease((s-center+210)/100)*ease((center+185-s)/90),y:0};},origin,spacing);
 return ds=>{const a=narrow(ds),w=weights(ds).x;if(w<1e-6)return a;const b=wide(ds);return{x:a.x+(b.x-a.x)*w,y:a.y+(b.y-a.y)*w};};
}
