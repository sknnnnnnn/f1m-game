import assert from 'node:assert/strict';
import * as T from 'three';
import {gridCrew33} from '../engine/rendering/grid-crew33.js';
import {createAuthoredTrack33,mountCircuit} from '../engine/tracks/scenery/suzuka.js';
import {circuit} from '../engine/tracks/track.js';
import {C0} from '../racing/runtime/config.js';
import {gridSlot28} from '../engine/tracks/track-layout28.js';
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>o[k]??(()=>{})});
globalThis.document={createElement:()=>({getContext:()=>context})};
let minHip=Infinity,maxLeg=0;
for(const fps of [15,30,60]){
 const crew=gridCrew33(T,new T.Scene(),circuit,C0),cars=Array.from({length:6},(_,i)=>{const q=circuit.point(gridSlot28(i).station,gridSlot28(i).lane);return{id:i+1,state:{X:q.x,Y:q.y,psi:q.psi}};});
 crew.update({phase:'GRID'},cars,false,false);
 const matrix=new T.Matrix4();
 for(let frame=0;frame<=6*fps;frame++){
  const time=frame/fps;crew.update({phase:'GRID_CLEAR',gridClearTime31:time,running:false},cars,false,false);
  for(const [i,a] of crew.diagnostics().report.entries()){
   if(time<1.05)continue;
   crew.rig.parts.get('pelvis').getMatrixAt(i,matrix);
   const hip=matrix.elements[13]-a.position[1]/.88;minHip=Math.min(minHip,hip);
   maxLeg=Math.max(maxLeg,crew.rig.debug[i].legError);
  }
 }
}
console.log({track:circuit.key,minHip,maxLeg});assert(minHip>.78,'Walking pelvis must remain above a seated pose');assert(maxLeg<.02,'No stretched shin while clearing grid');
const track=createAuthoredTrack33(T),scene=new T.Scene(),api=mountCircuit({scene,renderer:{toneMappingExposure:1},environment:false,detail:false});
const terrain=api.landscape.children.find(o=>o.isMesh),ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);let maxTerrain=-Infinity;
for(const q of track.samples.filter((_,i)=>i%3===0))for(const d of [-7,0,7]){
 const x=q.p.x+q.n.x*d,z=q.p.z+q.n.z*d;ray.set(new T.Vector3(x,100,z),down);
 const hit=ray.intersectObject(terrain)[0];if(hit)maxTerrain=Math.max(maxTerrain,hit.point.y-q.p.y);
}
console.log({maxTerrainAboveRoad:maxTerrain});assert(maxTerrain<-.25,'Terrain triangles stay below all road lanes including both bridge decks');api.dispose();
