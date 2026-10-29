import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {importedScene33} from '../engine/rendering/imported-scene33.js';import {buildTrack} from '../engine/rendering/track-scene.js';import {circuit} from '../engine/tracks/track.js';
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:100})},{get:(o,k)=>o[k]??(()=>{})});globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>context})};
const scene=new T.Scene(),scenery=circuit.imported33?importedScene33(T,scene,circuit):buildTrack(T,scene,circuit);scene.updateMatrixWorld(true);scene.matrixAutoUpdate=false;
const fixed=[],dynamic=[],visible=[];scene.traverse(o=>{if(o.isMesh){visible.push(o);(o.matrixWorldAutoUpdate===false?fixed:dynamic).push(o);}});assert(fixed.length>0);const matrices=fixed.map(o=>o.matrixWorld.toArray()),positions=fixed.map(o=>o.geometry.attributes.position?.array.slice());
let staticComposes=0;for(const o of fixed){const update=o.updateMatrix.bind(o);o.updateMatrix=()=>{staticComposes++;update();};}
const wheel=scenery.api?.architecture.wheelRoot;let oldWheel;if(wheel){wheel.updateMatrixWorld(true);oldWheel=[];wheel.traverse(o=>{oldWheel.push(o.matrixWorld.toArray());});}
const flags=[];scenery.api?.finish?.root.traverse(o=>{if(o.userData.base)flags.push({o,array:o.geometry.attributes.position.array.slice()});});
const camera=new T.PerspectiveCamera();camera.position.set(5,8,10);
for(let i=1;i<=12;i++){scenery.update33?.(i/5,camera,new T.Vector3());scene.updateMatrixWorld();}
assert.equal(staticComposes,0);assert.deepEqual(fixed.map(o=>o.matrixWorld.toArray()),matrices);let changedWheel=false;if(wheel){let i=0;wheel.traverse(o=>{if(o.matrixWorld.toArray().some((v,j)=>v!==oldWheel[i][j]))changedWheel=true;i++;});assert(changedWheel);}
for(let i=0;i<fixed.length;i++){if(positions[i])assert.deepEqual(fixed[i].geometry.attributes.position.array,positions[i]);}
const waving=flags.filter(({o,array})=>o.geometry.attributes.position.array.some((v,i)=>v!==array[i])).length;if(flags.length)assert.equal(waving,flags.length);
const result={status:'PASS',track:circuit.key,frozenTransforms:scenery.staticTransforms55,staticMeshesChecked:fixed.length,staticTransformCompositionsOver12Frames:staticComposes,unchangedStaticWorldMatrices:true,unchangedStaticGeometry:true,animatedWheel:wheel?changedWheel:null,wavingFlags:waving,scope:'Actual authored scenery and Three.js matrix/geometry verification; no GPU/FPS claim.'};fs.writeFileSync('reports/assets55/SCENERY_'+circuit.key+'.json',JSON.stringify(result,null,2));console.log(result);
