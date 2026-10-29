import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {carDetail22} from '../engine/rendering/showtime-scene22.js';
import {attachRollingWheels} from '../engine/rendering/dynamics.js';
import {createCarInstances53} from '../engine/rendering/car-instances53.js';
import {CAR_COLOURS52} from '../engine/race/roster52.js';
await import('../engine/rendering/grip-hand.js');await import('../engine/rendering/driver-rig.js');
const bytes=fs.readFileSync('models/car163.glb'),gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const scene=new T.Scene(),models=new Map();let triangles=0;
for(let id=1;id<=22;id++){
 const root=new T.Group(),body=gltf.scene.clone(true);body.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.name==='BaseColor')o.material.color.setHex(CAR_COLOURS52[id-1]);}});
 const rig=createDriverRig(T,body);root.add(body);const wheels=attachRollingWheels(T,root,body,rig),detail=carDetail22(T,body,{id,color:CAR_COLOURS52[id-1]});detail.update({show22:{wing:id%2===0},health:{wing:0}},0);
 root.position.set(id*9,0,id%2*4);root.scale.setScalar(.8);root.rotation.y=.3;rig.setSteering(id%2?12:-12);for(const w of wheels)w.spin.rotation.x=id;
 const low=new T.Group();low.visible=false;scene.add(root,low);models.set(id,{root,low:{root:low},rig,body,detail});
}
const countTriangles=()=>{let n=0;scene.traverseVisible(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.layers.test(new T.Layers()))n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});return n;};
triangles=countTriangles();const pool=createCarInstances53(T,scene,models);pool.update();const first={...pool.stats};assert(first.visibleParts>1000);assert(first.savedSubmissions/first.visibleParts>.8);
let batchedTriangles=0;scene.traverse(o=>{if(o.isInstancedMesh&&o.visible)batchedTriangles+=o.count*(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});assert.equal(batchedTriangles+countTriangles(),triangles,'same geometry, no triangle reduction');
const m=models.get(7);m.rig.setSteering(-18);m.detail.update({show22:{wing:true},health:{wing:.5,wingSide:1}},.1);pool.update();assert(pool.stats.visibleParts===first.visibleParts);models.get(8).root.visible=false;pool.update();assert(pool.stats.visibleParts<first.visibleParts);
const result={status:'PASS',actualGLB:true,cars:22,...first,savedFraction:first.savedSubmissions/first.visibleParts,trianglesPreserved:triangles,animatedSteeringWheelDRSDamageAndVisibility:true,scope:'Actual Three.js scene and instance buffers; browser WebGL and Android GPU not measured.'};fs.writeFileSync('reports/grid53/ACTUAL_CARS.json',JSON.stringify(result,null,2));console.log(result);
