import {gridSlot28,clearPit28} from '../tracks/track-layout28.js';
import {brakingZones} from '../ai/braking-zones.js';
import {worldTextures} from './world-materials.js';
import {clearOfRoad,CameraOcclusion} from './occlusion.js';
// Visual scenery follows the Bahrain GP schematic centreline. Flat road physics is unchanged.
export function buildTrack(T,scene,circuit){
 const mats=new Map(),batches=new Map(),trees=[],structures=[],cameraBarriers=[],textures=worldTextures(T);
 function material(color){if(!mats.has(color)){const texture=color==='#343d43'?textures.asphalt:color==='#b8a17c'?textures.sand:color==='#998c72'?textures.gravel:color==='#69785b'?textures.grass:null;let m=color==='#fff2c4'?new T.MeshBasicMaterial({color}):new T.MeshStandardMaterial({color:texture?'#ffffff':color,map:texture??null,roughness:color==='#343d43'?.94:.82,metalness:color==='#284b58'?.35:0,side:T.DoubleSide});if(['#e8e4d8','#f0e7d5','#c34145','#c6c5b6'].includes(color)){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;}if(color==='#343d43'){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;}mats.set(color,m);}return mats.get(color);}
 function obstacle(parts,name){const root=new T.Group();root.name=name;for(const [g,color,position,rotation=0] of parts){const mesh=new T.Mesh(g,material(color));mesh.position.set(...position);mesh.rotation.y=rotation;mesh.userData.modelMesh=true;mesh.castShadow=true;root.add(mesh);}scene.add(root);structures.push(root);return root;}
 function board(station,n,text,color='#1b343f',width=10,height=1.5){const q=circuit.point(station,n);const root=obstacle([[new T.BoxGeometry(width,height,.18),color,[q.x,height*.65,-q.y],q.psi+Math.PI/2]],'Track board');if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=80;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,512,80);x.fillStyle='#f3eddd';x.font='700 42px sans-serif';x.textAlign='center';x.fillText(text,256,55);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mesh=root.children[0];mesh.material=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});}return root;}

 function part(g,color,position=[0,0,0],rotation=0){g=g.clone();g.rotateY(rotation);g.translate(...position);const a=batches.get(color)||[];a.push(g);batches.set(color,a);}
 function ribbon(inner,outer,color,height=.015,step=2.5,filter=()=>true){const p=[],ix=[];let n=0;for(let s=0;s<circuit.length;s+=step){if(!filter(s))continue;for(const z of [s,Math.min(s+step,circuit.length)])for(const d of [inner,outer]){const q=circuit.point(z,d);p.push(q.x,height,-q.y);}if(outer>=inner)ix.push(n,n+2,n+1,n+1,n+2,n+3);else ix.push(n,n+1,n+2,n+1,n+3,n+2);n+=4;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();part(g,color);}
 const half=circuit.width/2;
 for(const side of [-1,1]){ribbon(side*(half+2.3),side*(half+7),'#998c72',-.02,8,s=>Math.abs(circuit.at(s).k)>.00055);ribbon(side*(half+.95),side*(half+2.3),'#69785b',.007,8,s=>s/circuit.length>.55&&s/circuit.length<.72);}
 part(new T.PlaneGeometry(9000,9000,8,8).rotateX(-Math.PI/2),'#b8a17c',[0,-.4,0]);
 for(const side of [-1,1]){ribbon(side*half,side*(half+2.3),'#c5b18e',-.035,2.5);ribbon(side*half,side*(half+.95),'#b3aa98',-.005,2.5);}ribbon(-half,half,'#343d43',.018,1.8);
 for(const side of [-1,1]){ribbon(side*(half-.13),side*(half+.02),'#e8e4d8',.045,2.5);for(let color=0;color<2;color++)ribbon(side*(half+.06),side*(half+.92),color?'#f0e7d5':'#c34145',.065,2.5,s=>Math.abs(circuit.at(s).k)>.00055&&Math.floor(s/2.5)%2===color);}
 const start=circuit.at(circuit.gate);for(let j=0;j<10;j++)for(let i=0;i<2;i++){const q=circuit.point(circuit.gate+i*.65,-half+j*circuit.width/10+circuit.width/20);part(new T.BoxGeometry(.65,.022,circuit.width/10),((i+j)%2)?'#f0e8d8':'#16252c',[q.x,.04,-q.y],start.psi);}
 for(let j=0;j<6;j++){const slot=gridSlot28(j),q=circuit.point(slot.line,slot.lane);part(new T.BoxGeometry(.12,.012,2.8),'#c6c5b6',[q.x,.047,-q.y],q.psi);for(const side of [-1,1]){const p=circuit.point(slot.line-3,slot.lane+side*1.4);part(new T.BoxGeometry(6,.012,.07),'#c6c5b6',[p.x,.047,-p.y],p.psi);}}
 // Horizontal wall strips and the old duplicated pit building/apron were
 // removed. Vertical barriers below and the original Pit Flow garages own it.
 function local(s,n,y=0){const q=circuit.point(s,n);return {position:[q.x,y,-q.y],rotation:q.psi,q};}
 // Start gantry, brake markers and a few low-cost circuit details.
 {const parts=[];for(const n of [-15,15]){const q=circuit.point(circuit.gate,n);parts.push([new T.BoxGeometry(.35,8.5,.35),'#6a777b',[q.x,4.25,-q.y],q.psi]);}const q=circuit.point(circuit.gate,0);parts.push([new T.BoxGeometry(.7,1.2,30.5),'#20333e',[q.x,8.5,-q.y],q.psi]);obstacle(parts,'Start gantry');}
 for(let j=0;j<32;j++){const s=j*circuit.length/32,q=circuit.point(s,24);if(j%3===0)part(new T.BoxGeometry(.35,11,.35),'#c7c9b7',[q.x,5.5,-q.y]);}
 // Offsets must clear every branch of the circuit, not just their source station.
 // Sparse palms, far from the entire road network and subject to camera occlusion.
 for(let i=0;i<28;i++){const station=i*circuit.length/28,side=i%2?1:-1,q=circuit.point(station,side*(70+(i%4)*12)),radius=4;
 if(!clearOfRoad(circuit,q.x,q.y,radius,26))continue;
 const tree=new T.Group();tree.position.set(q.x,0,-q.y);tree.name='Road-clear palm '+i;
 const trunk=new T.Mesh(new T.CylinderGeometry(.28,.5,7,6),material('#827052'));trunk.position.y=3.5;trunk.userData.modelMesh=true;tree.add(trunk);
 for(let j=0;j<7;j++){const leaf=new T.Mesh(new T.ConeGeometry(1.1,5,3),material('#526955'));leaf.position.set(Math.cos(j*6.283/7)*1.6,7,Math.sin(j*6.283/7)*1.6);leaf.rotation.z=1.05;leaf.rotation.y=j*6.283/7;leaf.userData.modelMesh=true;tree.add(leaf);}scene.add(tree);trees.push(tree);
 }
 // Floodlight poles and luminous heads are batched; no expensive dynamic lights.
 for(let i=0;i<60;i++){const a=local(i*circuit.length/60,(i%2?1:-1)*24,8);if(!clearOfRoad(circuit,a.q.x,a.q.y,2,7))continue;obstacle([[new T.CylinderGeometry(.12,.22,16,5),'#c3c6c8',a.position],[new T.BoxGeometry(3,.3,1.3),'#fff2c4',[a.q.x,16,-a.q.y],a.rotation]],'Floodlight post');}
 // Architecture and distance markers are owned by bahrain-scene30.
 // Barrier faces and mesh fence strips stand vertically; the old horizontal wall ribbons are only footings.
 for(const side of [-1,1])for(let station=0;station<circuit.length;station+=20){const q=circuit.point(station,side*19);if(!clearOfRoad(circuit,q.x,q.y,10,2)||!clearPit28(q.x,q.y,10,1))continue;part(new T.BoxGeometry(19,.85,.3),'#d4d6cf',[q.x,.425,-q.y],q.psi);const proxy=new T.Mesh(new T.BoxGeometry(19,2.6,.35));proxy.position.set(q.x,1.3,-q.y);proxy.rotation.y=q.psi;cameraBarriers.push(proxy);part(new T.CylinderGeometry(.045,.045,2.4,4),'#61747a',[q.x,1.3,-q.y]);for(let row=0;row<3;row++)part(new T.BoxGeometry(19,.018,.018),'#899c9e',[q.x,1+row*.45,-q.y],q.psi);}
 for(const turn of circuit.turns){const q=circuit.point(turn.s,24);if(clearOfRoad(circuit,q.x,q.y,3,9)){board(turn.s,24,'T'+turn.number+'  /  F1M',turn.number%2?'#1b4654':'#91393c',8,1.25);}}
 for(const station of [250,1300,2450,3650,4550]){const q=circuit.point(station,-42);if(clearOfRoad(circuit,q.x,q.y,8,15))board(station,-42,circuit.name,'#29414c',24,2.6);}
 for(let i=0;i<16;i++){const q=circuit.point(i*circuit.length/16,130+(i%3)*70);if(!clearOfRoad(circuit,q.x,q.y,25,50))continue;part(new T.SphereGeometry(1,16,6).scale(40+i%4*18,3+i%3*2,24),'#b39a78',[q.x,-1.7,-q.y]);}
 // Static batches keep draw calls low on phones.
 for(const [color,gs]of batches){const chunks=new Map();for(const g of gs){const p=g.attributes.position,n=g.attributes.normal,ix=g.index?.array,total=ix?.length??p.count;for(let j=0;j<total;j+=3){const ids=[0,1,2].map(k=>ix?ix[j+k]:j+k),cx=ids.reduce((v,i)=>v+p.getX(i),0)/3,cz=ids.reduce((v,i)=>v+p.getZ(i),0)/3,key=color==='#b8a17c'?'ground':Math.floor(cx/180)+':'+Math.floor(cz/180);let c=chunks.get(key);if(!c){c={p:[],n:[],uv:[]};chunks.set(key,c);}for(const i of ids){c.p.push(p.getX(i),p.getY(i),p.getZ(i));c.n.push(n.getX(i),n.getY(i),n.getZ(i));c.uv.push(p.getX(i)/(color==='#b8a17c'?28:5),p.getZ(i)/(color==='#b8a17c'?28:5));}}g.dispose();}for(const c of chunks.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(c.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(c.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(c.uv,2));g.computeBoundingSphere();const mesh=new T.Mesh(g,material(color));mesh.name='Circuit '+color;mesh.userData.modelMesh=true;mesh.frustumCulled=true;mesh.receiveShadow=true;scene.add(mesh);}}

 return {finishMaterials:{sand:mats.get('#b8a17c'),grass:mats.get('#69785b'),gravel:mats.get('#998c72')},cameraBarriers,structuresOcclusion:new CameraOcclusion(T,structures),structures:structures.length,roadMaterial:mats.get('#343d43'),length:circuit.length,width:circuit.width,staticBatches:batches.size,treeCount:trees.length,occlusion:new CameraOcclusion(T,trees)};
}
