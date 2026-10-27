import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {prepareCar} from '../engine/pit/crew/car-assembly.js';
import {pitHandoff35} from '../engine/pit/pit-handoff35.js';
const bytes=fs.readFileSync('models/car163.glb'),gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const vehicle=new T.Group();vehicle.add(gltf.scene);const copy=vehicle.clone(true);copy.scale.set(-1,1,1);
for(const [left,right] of [['FL_Tire','FR_Tire'],['RL_Tire','RR_Tire']]){const a=copy.getObjectByName(left),b=copy.getObjectByName(right);a.name=right;b.name=left;}
const source=new T.Group();source.add(copy);const service=prepareCar(source),scene=new T.Scene(),bay=new T.Group(),work=new T.Group();scene.add(vehicle,bay);bay.add(work);work.add(service.root);
vehicle.position.set(240,6.7,-180);vehicle.rotation.y=1.7;vehicle.scale.setScalar(.79);bay.position.set(245,6.745,-184);bay.rotation.y=1.69;bay.scale.set(-.79,.79,.79);
pitHandoff35(bay,vehicle,work);scene.updateMatrixWorld(true);
let maxError=0;
for(const name of ['Rear_Wing','FL_Tire','FR_Tire','RL_Tire','RR_Tire']){
 const swapped={FL_Tire:'FR_Tire',FR_Tire:'FL_Tire',RL_Tire:'RR_Tire',RR_Tire:'RL_Tire'};
 const a=new T.Box3().setFromObject(vehicle.getObjectByName(name)),b=new T.Box3().setFromObject(service.root.getObjectByName(swapped[name]??name));
 const error=Math.max(a.min.distanceTo(b.min),a.max.distanceTo(b.max));maxError=Math.max(maxError,error);assert(error<1e-8,name+' handoff mismatch');
}
const out={status:'PASS',scope:'Actual GLB assembled by prepareCar; world-space wheel/wing bounds match the racing model at the service handoff. No GPU rendering.',maxError};fs.mkdirSync('reports/pit35',{recursive:true});fs.writeFileSync('reports/pit35/MODEL_HANDOFF.json',JSON.stringify(out,null,2));console.log(out);
