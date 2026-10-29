import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {createCarInstances53 as before} from './fixtures/car-instances53-before54.js';
import {createCarInstances53 as after} from '../engine/rendering/car-instances53.js';
const home=new T.Scene(),models=new Map(),geometry=new T.BoxGeometry(1,2,3),material=new T.MeshStandardMaterial({color:0x12aa56});
for(let id=1;id<=22;id++){const root=new T.Group(),low=new T.Group();low.visible=false;root.position.x=id*4;for(let n=0;n<100;n++){const m=new T.Mesh(geometry,material);m.position.set(n*.1,n*.2,n*.3);root.add(m);}home.add(root,low);models.set(id,{root,low:{root:low}});}
const a=new T.Scene(),b=new T.Scene(),old=before(T,a,models),next=after(T,b,models);
const image=scene=>scene.children.filter(o=>o.isInstancedMesh&&o.visible).map(o=>({mat:o.material.type,count:o.count,matrices:[...o.instanceMatrix.array.slice(0,o.count*16)],colours:[...o.instanceColor.array.slice(0,o.count*3)]}));
for(let tick=0;tick<20;tick++){for(const [id,m]of models){m.root.position.z=tick*.7;m.root.rotation.y=tick*.02;m.root.visible=tick%3!==0||id%2===0;}old.update();next.update();assert.deepEqual(image(b),image(a));}
for(const m of models.values())m.root.visible=true;old.update();next.update();const initial=next.stats.createdBatches;
for(let i=0;i<8;i++){for(const m of models.values())m.root.visible=false;old.update();next.update();for(const m of models.values())m.root.visible=true;old.update();next.update();}
assert.equal(next.stats.createdBatches,initial);assert.equal(next.stats.disposedBatches,0);
const measure=pool=>{const t=performance.now();for(let i=0;i<40;i++)pool.update();return performance.now()-t;};measure(old);measure(next);const oldMS=measure(old),newMS=measure(next);const result={status:'PASS',parts:2200,transformAndColourComparisons:20,samePaintedBuffers:true,visibilityRoundTrips:8,recreatedBatchesDuringRoundTrips:next.stats.createdBatches-initial,oldMS,newMS,speedup:oldMS/newMS,scope:'CPU submission preparation, synthetic shared parts; not GPU FPS.'};fs.writeFileSync('reports/release54/INSTANCES.json',JSON.stringify(result,null,2));console.log(result);
