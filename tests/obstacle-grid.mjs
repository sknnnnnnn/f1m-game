import assert from 'node:assert/strict';
import * as T from 'three';
import {ObstacleGrid} from '../engine/rendering/obstacle-grid.js';
import {CameraSafety30} from '../engine/rendering/camera-safety30.js';
let seed=13;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const entries=Array.from({length:3000},()=>{const v=new T.Vector3((random()-.5)*4000,random()*10,(random()-.5)*4000);return {box:new T.Box3(v,v.clone().add(new T.Vector3(random()*50+1,20,random()*50+1)))};});entries.push({box:new T.Box3(new T.Vector3(-5000,0,-5000),new T.Vector3(5000,.1,5000))});
const old=new CameraSafety30(T),fast=new CameraSafety30(T);old.entries=entries;fast.entries=entries;fast.grid=new ObstacleGrid(entries);let total=0;
for(let i=0;i<2000;i++){const p=new T.Vector3((random()-.5)*4000,random()*40,(random()-.5)*4000),q=p.clone().add(new T.Vector3(random()*60-30,random()*10-5,random()*60-30));assert.equal(fast.blocked(p,q),old.blocked(p,q));const box=new T.Box3().setFromPoints([p,q]).expandByScalar(3);const expected=entries.filter(e=>e.box.intersectsBox(box));assert.deepEqual(fast.grid.query(box).filter(e=>e.box.intersectsBox(box)),expected);total+=fast.grid.query(box).length;}
console.log(JSON.stringify({queries:2000,obstacles:entries.length,meanCandidates:total/2000,exactBlockedAndBoxParity:true}));
