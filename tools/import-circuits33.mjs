import fs from 'node:fs';import * as T from 'three';
const data={};for(const key of ['shanghai','suzuka']){const {createAuthoredTrack33}=await import('../engine/tracks/scenery/'+key+'.js');const t=createAuthoredTrack33(T),L=t.length,N=key==='suzuka'?3200:2600;
 const rows=[];for(let i=0;i<=N;i++){const s=i/N*L,p=t.curve.getPointAt(i/N),a=t.curve.getTangentAt(((s-.5+L)%L)/L),b=t.curve.getTangentAt(((s+.5)%L)/L),v=t.curve.getTangentAt(i/N),psi=Math.atan2(-v.z,v.x),da=Math.atan2(-a.z,a.x),db=Math.atan2(-b.z,b.x),k=Math.atan2(Math.sin(db-da),Math.cos(db-da));rows.push([s,p.x,-p.z,psi,k,p.y,v.y/Math.hypot(v.x,v.z)].map(x=>+x.toFixed(8)));}
 const old=t.pit,entry=t.closest(old.getPointAt(0))*L-100,exit=L+t.closest(old.getPointAt(1))*L+60;
 const pts=[t.curve.getPointAt((entry+L)%L/L),t.curve.getPointAt((entry+45+L)%L/L),...Array.from({length:31},(_,i)=>old.getPointAt(i/30)),t.curve.getPointAt((exit-35)%L/L),t.curve.getPointAt(exit%L/L)];const curve=new T.CatmullRomCurve3(pts,false,'centripetal');curve.arcLengthDivisions=4000;curve.updateArcLengths();
 const pit=[];for(let i=0;i<=600;i++){const p=curve.getPointAt(i/600);pit.push([entry+(exit-entry)*i/600,p.x,-p.z,p.y].map(x=>+x.toFixed(8)));}
 data[key]={length:L,width:key==='shanghai'?15.4:14,samples:rows,corners:t.corners.map((c,i)=>({number:i+1,s:c.u*L})),pit:{entry,exit,mergeWait:exit-90,samples:pit},source:key.toUpperCase()+'_SCENE_02.mjs / PRESENTATION 02'};
 console.log(key,L,'pit',entry,exit,'samples',rows.length);
}fs.writeFileSync('engine/ai/imported-circuits33.js','// Generated from the accepted Presentation 02 authored curves. Do not respline.\nexport const IMPORTED_CIRCUITS33='+JSON.stringify(data)+';\n');
