import assert from 'node:assert/strict';import fs from 'node:fs';import {CrewBatch as Old} from './fixtures/crew-rig-before37.js';import * as T from 'three';import {CrewBatch} from '../engine/pit/crew/crew-rig.js';
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>o[k]??(()=>{})});globalThis.document={createElement:()=>({getContext:()=>context})};
const old=new Old(new T.Scene(),2),next=new CrewBatch(new T.Scene(),2),M=new T.Matrix4();let checks=0;
const pose=n=>{const anchor=new T.Vector3(3+n,0,4),feet=[-1,1].map(side=>({world:anchor.clone().add(new T.Vector3(side*.15,.075,side*.06)),yaw:.15,roll:0}));return {anchor,feet};};
for(let frame=0;frame<180;frame++){
 const p=pose(frame<30?frame*.003:.087),options={posture:{height:.88,bend:.14},feet:p.feet,crouch:.14,speed:0,look:.04*Math.sin(frame*.03),collision:{wheels:[],props:frame<120?[]:[{x:20,z:20,hx:1,hz:1}]}};
 if(frame===80){old.hide(0);next.hide(0);}old.pose(0,p.anchor,.15,options);next.pose(0,p.anchor,.15,options);
 for(const [key,o] of old.parts){const a=o.instanceMatrix.array,b=next.parts.get(key).instanceMatrix.array;for(let i=0;i<16;i++){assert(Math.abs(a[i]-b[i])<1e-6,key+' '+frame+' '+i);checks++;}}
 old.flush();next.flush();
}
function bench(C){const x=new C(new T.Scene(),22),p=pose(0),o={posture:{height:.88,bend:.14},feet:p.feet,collision:{wheels:[],props:[],cacheKey37:'fixed'}};const start=performance.now();for(let f=0;f<120;f++){for(let i=0;i<22;i++)x.pose(i,p.anchor,.15,{...o,look:.04*Math.sin(f*.03+i)});x.flush();}return {ms:performance.now()-start,cache:x.cacheStats37??null};}
const bounds=new T.Box3(new T.Vector3(-5,-3,-5),new T.Vector3(8,4,8));next.setBounds37(bounds);for(const mesh of next.parts.values()){assert(mesh.frustumCulled);mesh.geometry.computeBoundingSphere();mesh.getMatrixAt(0,M);const sphere=mesh.geometry.boundingSphere.clone().applyMatrix4(M);assert(sphere.center.distanceTo(mesh.boundingSphere.center)+sphere.radius<=mesh.boundingSphere.radius,'Conservative crew bound');}
const a=bench(Old),b=bench(CrewBatch),out={status:'PASS',matrixComparisons:checks,tolerance:1e-6,cacheInvalidation:true,before:a,after:b,speedup:a.ms/b.ms,scope:'Same authored crew geometry and head animation, Node CPU microbenchmark; not Android FPS'};assert(next.cacheStats37.hits>100);fs.mkdirSync('reports/race37',{recursive:true});fs.writeFileSync('reports/race37/CREW_CACHE.json',JSON.stringify(out,null,2));console.log(out);
