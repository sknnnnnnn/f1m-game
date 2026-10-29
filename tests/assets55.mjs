import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createModelCache55} from '../engine/runtime/model-cache55.js';
import {freezeScenery55} from '../engine/rendering/static-scene55.js';
const cache=createModelCache55(),bytes=fs.readFileSync('models/car163.glb');
const read=()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),parse=b=>new GLTFLoader().parseAsync(b,'');
const [a,b]=await Promise.all([cache.scene('car',read,parse),cache.scene('car',read,parse)]);
assert.equal(a,b);assert.equal(cache.stats.reads,1);assert.equal(cache.stats.parses,1);
const garage=a.scene.clone(true),race=b.scene.clone(true);garage.position.x=55;assert.equal(race.position.x,0);const ga=[],ra=[];garage.traverse(o=>{if(o.isMesh)ga.push(o);});race.traverse(o=>{if(o.isMesh)ra.push(o);});ga[0].material=ga[0].material.clone();ga[0].material.color.setHex(0x123456);assert.notEqual(ga[0].material,ra[0].material);assert.equal(ga[0].geometry,ra[0].geometry);
let attempt=0;await assert.rejects(cache.scene('retry',()=>{if(!attempt++)throw Error('temporary');return read();},parse));await cache.scene('retry',read,parse);
// Production entry points: same URL before/after the model script is removed.
const {modelScene55,modelBuffer,modelCache55}=await import('../engine/runtime/assets.js');let fetches=0,removed=false;
globalThis.document={baseURI:'https://example.test/f1m-game/preview55/',getElementById:()=>removed?null:{dataset:{src:'./models/car163.glb'}}};
globalThis.fetch=async()=>{fetches++;return {ok:true,arrayBuffer:async()=>read()};};
const menuScene=await modelScene55('model',new GLTFLoader());removed=true;await modelBuffer('model');const raceScene=await modelScene55('model',new GLTFLoader());assert.notEqual(menuScene,raceScene);assert.equal(fetches,1);assert.equal(modelCache55.stats.parses,1);
// A mixed scene: 3,000 static nodes and a nested moving wheel/chair hierarchy.
const scene=new T.Scene(),root=new T.Group(),wheel=new T.Group(),chair=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial());scene.add(root);wheel.add(chair);root.add(wheel);chair.position.set(2,3,4);
for(let i=0;i<3000;i++){const n=new T.Group();n.position.set(i%37,i%5,-i);root.add(n);}
scene.updateMatrixWorld(true);scene.matrixAutoUpdate=false;
let transforms=0;root.traverse(o=>{const update=o.updateMatrix.bind(o);o.updateMatrix=()=>{transforms++;update();};});
const baseline=root.children.slice(1).map(o=>o.matrixWorld.toArray());
for(let i=0;i<60;i++){wheel.rotation.z=i*.02;chair.rotation.z=-i*.02;scene.updateMatrixWorld();}const before=transforms;
wheel.rotation.z=chair.rotation.z=0;scene.updateMatrixWorld();const frozen=freezeScenery55(root,[wheel]);transforms=0;
for(let i=0;i<60;i++){wheel.rotation.z=i*.02;chair.rotation.z=-i*.02;scene.updateMatrixWorld();const expected=new T.Matrix4().multiplyMatrices(wheel.matrixWorld,chair.matrix);assert.deepEqual(chair.matrixWorld.toArray(),expected.toArray());}
const after=transforms;assert.equal(after,120);assert.deepEqual(root.children.slice(1).map(o=>o.matrixWorld.toArray()),baseline);root.children[9].visible=false;assert.equal(root.children[9].visible,false);
const result={status:'PASS',actualGLB:true,concurrentGarageAndRaceReads:1,concurrentGLBParses:1,cloneTransformsAndMaterialsIsolated:true,immutableGeometryShared:true,failedReadRetry:true,productionModelElementRemovalRetainsCache:true,frozen,dynamicWheelAndChairFrames:60,localTransformCompositions:{before,after},staticMatricesUnchanged:true,scope:'Exact Three.js CPU matrix checks, not Android FPS or GPU measurements.'};
fs.writeFileSync('reports/assets55/ASSETS_AND_STATIC.json',JSON.stringify(result,null,2));console.log(result);
