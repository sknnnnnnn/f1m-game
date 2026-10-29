import {TEAMS52} from '../race/roster52.js';
import {triangleClearMain28} from '../tracks/track-layout28.js';
import {circuit} from '../tracks/track.js';
import {PIT,pitOffset,stallStation,pitStopStation,pitRoad} from './pit-lane.js';
export function buildPitScene(T,scene,roadMaterial=null){
 const crews=new Map(),materials=new Map();
 const mat=colour=>{if(!materials.has(colour))materials.set(colour,new T.MeshLambertMaterial({color:colour,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));return materials.get(colour);};
 function mesh(g,colour,parent=scene){const m=new T.Mesh(g,mat(colour));m.userData.modelMesh=true;parent.add(m);return m;}
 function ribbon(inner,outer,colour,height=.016,from=PIT.entry,to=PIT.exit){const p=[],ix=[];let n=0;for(let S=from;S<to;S+=4){for(const s of [S,Math.min(S+4,to)])for(const d of [inner,outer]){const q=circuit.point(s,typeof d==='function'?d(s):d);p.push(q.x,height,-q.y);}if((typeof outer==='function'?outer(S):outer)>=(typeof inner==='function'?inner(S):inner))ix.push(n,n+2,n+1,n+1,n+2,n+3);else ix.push(n,n+1,n+2,n+1,n+3,n+2);n+=4;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();const uv=[];for(let i=0;i<p.length;i+=3)uv.push(p[i]/5,p[i+2]/5);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const o=mesh(g,colour);if(roadMaterial&&colour==='#343d43')o.material=roadMaterial;}
 const fast=S=>{const a=pitOffset(S,1000);return a;};
 // One continuous pit surface, with the same material and metre UVs as the
 // main circuit. Its inner boundary stops outside the racing surface.
 const apron=S=>S>circuit.length-90&&S<circuit.length+280;
 if(!circuit.imported33){
 ribbon(S=>apron(S)?Math.min(-36,fast(S)-3.5):fast(S)-3.5,S=>fast(S)+3.5,'#343d43');
 for(const side of [-1,1])ribbon(S=>fast(S)+side*3.3,S=>fast(S)+side*3.45,'#ebe3cb',.038,PIT.entry+260,circuit.length+270);
 }else{
  const pos=[],uv=[],ix=[];for(let S=PIT.entry;S<PIT.exit;S+=3){const base=pos.length/3;for(const v of [S,Math.min(S+3,PIT.exit)]){const q=pitRoad(1000).at(v),near=v>stallStation(1)-95&&v<stallStation(22)+85;for(const n of [near?-15:-3.5,3.5]){pos.push(q.x-Math.sin(q.psi)*n,(q.height??0)+.031,-q.y-Math.cos(q.psi)*n);uv.push(n/5,(v-PIT.entry)/5);}}ix.push(base,base+2,base+1,base+1,base+2,base+3);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();const road=mesh(g,'#343d43');if(roadMaterial)road.material=roadMaterial;
 }
 const colours=TEAMS52.flatMap(t=>[t.colour,t.colour]);
 for(let id=1;id<=22;id+=2){
  const S=pitStopStation(id),q=pitRoad(id).at(S),root=new T.Group();root.position.set(q.x,q.height??0,-q.y);root.rotation.y=q.psi-Math.PI/2;scene.add(root);
  const front=mesh(new T.BoxGeometry(2.8,.012,.12),'#e7dfc5',root);front.position.set(0,.045,-3.05);
  for(const side of [-1,1]){const strip=mesh(new T.BoxGeometry(.07,.012,5.9),'#e7dfc5',root);strip.position.set(side*1.4,.045,-.10);}
  const crew=new T.Group();root.add(crew);crew.visible=false;const arms=[];
  for(const x of [-2,2])for(const z of [-1.8,1.8]){const worker=new T.Group();worker.position.set(x,0,z);crew.add(worker);const body=mesh(new T.BoxGeometry(.42,.62,.3),colours[id-1],worker);body.position.y=.8;const head=mesh(new T.SphereGeometry(.18,7,5),'#dfd7bf',worker);head.position.y=1.28;for(const side of [-1,1]){const leg=mesh(new T.BoxGeometry(.14,.5,.16),'#1b2730',worker);leg.position.set(side*.12,.25,0);}const arm=mesh(new T.BoxGeometry(.5,.13,.13),'#e3d5b7',worker);arm.position.set(0,.67,-Math.sign(z)*.38);arm.rotation.x=Math.sign(z)*.45;arms.push(arm);}
  const jack=mesh(new T.BoxGeometry(.7,.2,.6),'#dfc05d',crew);jack.position.set(2.9,.2,0);
  crews.set(id,{crew,arms});
  const sign=mesh(new T.BoxGeometry(.15,2,.15),'#c2c9c2',root);sign.position.set(4.2,1,0);
  if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle=colours[id-1];ctx.fillRect(0,0,64,64);ctx.fillStyle='#fff';ctx.font='bold 47px system-ui';ctx.textAlign='center';ctx.fillText(String(id),32,50);const board=new T.Mesh(new T.PlaneGeometry(1.3,1.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas),side:T.DoubleSide}));board.position.set(4.2,2,0);board.rotation.y=Math.PI/2;board.userData.modelMesh=true;root.add(board);}
 }
 return {update(cars,cpu=false){for(const [id,c] of crews){const car=cars.find(v=>v.id===id),p=car?.pit; c.crew.visible=cpu&&p?.phase==='SERVICE';if(c.crew.visible){const wave=Math.sin((p.serviceSeconds??0)*10)*.12;for(const arm of c.arms)arm.rotation.z=wave;}}},crews};
}
export function tyreBands(T,wheels,visualScale){
 const material=new T.MeshBasicMaterial({color:0xf1d36c}),radius=.29/visualScale,width=.014/visualScale;
 for(const w of wheels){const box=new T.Box3().setFromObject(w.spin),size=box.getSize(new T.Vector3());const ring=new T.Mesh(new T.TorusGeometry(radius,width,4,16),material);ring.rotation.y=Math.PI/2;ring.position.x=(w.side??(w.turn.position.x<0?-1:1))*Math.max(.12/visualScale,size.x/2+.002);ring.userData.modelMesh=true;w.spin.add(ring);}
 return material;
}
