import {TEAMS52} from '../race/roster52.js';
import {clearMain28,clearPit28,triangleClearMain28,triangleClearPit30} from '../tracks/track-layout28.js';
import {pitRoad,pitStopStation} from '../pit/pit-lane.js';
import {brakingZones} from '../ai/braking-zones.js';
// Visual-only Sakhir interpretation. No changes to the circuit or vehicle solver.
export function bahrainScene30(T,scene,track){
 const root=new T.Group();root.name='Bahrain circuit architecture /30';scene.add(root);
 const objects=[],nightMaterials=[],stats={pavilions:0,towers:0,stands:0,tents:0,brakeBoards:0,turnSigns:0,runoffPanels:0,marshalPosts:0},lod=[];
 const colors={stone:0xd9c5a4,cream:0xf2e9d7,glass:0x254f61,dark:0x172c39,metal:0x97a6ab,red:0xc84249,teal:0x3f8586,gold:0xcfab65,asphalt:0x686465};
 const materials=new Map();function mat(name){if(!materials.has(name))materials.set(name,new T.MeshStandardMaterial({color:colors[name]??name,roughness:name==='glass'?.25:.74,metalness:name==='glass'?.48:name==='metal'?.6:.08}));return materials.get(name);}
 const light=new T.MeshStandardMaterial({color:0xffe4af,emissive:0xffd28c,emissiveIntensity:.6,roughness:.5});nightMaterials.push(light);
 function mesh(g,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,typeof material==='string'?mat(material):material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.userData.modelMesh=true;g.add(o);return o;}
 const box=(g,w,h,d,x,y,z,m)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
 const cylinder=(g,rt,rb,h,x,y,z,m,n=24)=>mesh(g,new T.CylinderGeometry(rt,rb,h,n),m,x,y,z);
 function label(g,text,w,h,x,y,z,rotation=0,color='#f1e8d6',background='#18333f'){
  const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.font='600 64px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,67,970);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const material=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});const o=mesh(g,new T.PlaneGeometry(w,h),material,x,y,z);o.rotation.y=rotation;o.castShadow=false;return o;
 }
 // Merge static parts by material inside each landmark; retain one box per landmark
 // for visibility and camera clearance, rather than hundreds of per-part raycasts.
 function batch(g){const groups=new Map();g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert();for(const child of [...g.children]){
  if(!child.isMesh||child.material.map||child.material.transparent)continue;
  const key=child.material;let a=groups.get(key);if(!a){a=[];groups.set(key,a);}a.push(child);
 }for(const [material,parts] of groups){if(parts.length<2)continue;const positions=[],normals=[];for(const o of parts){const geometry=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)),flat=geometry.index?geometry.toNonIndexed():geometry,p=flat.attributes.position,n=flat.attributes.normal;positions.push(...p.array);normals.push(...n.array);flat.dispose();if(flat!==geometry)geometry.dispose();o.removeFromParent();o.geometry.dispose();}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.computeBoundingSphere();mesh(g,geometry,material);}}
 function safe(g,padding=1){g.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(g),x=(b.min.x+b.max.x)/2,y=-(b.min.z+b.max.z)/2,r=Math.hypot(b.max.x-b.min.x,b.max.z-b.min.z)/2;
  return clearMain28(x,y,r+padding)&&clearPit28(x,y,r,padding)&&objects.every(o=>{const a=new T.Box3().setFromObject(o);return b.max.x+.5<a.min.x||b.min.x-.5>a.max.x||b.max.z+.5<a.min.z||b.min.z-.5>a.max.z;});
 }
 function place(name,s,n,build,{padding=1,detail=950}={}){const q=track.point(s,n),g=new T.Group();g.name=name;g.position.set(q.x,0,-q.y);g.rotation.y=q.psi-Math.PI/2;root.add(g);build(g);if(!safe(g,padding)){root.remove(g);g.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material.map){o.material.map.dispose();o.material.dispose();}}});return null;}batch(g);objects.push(g);lod.push({g,detail});return g;}
 function seek(name,s,n,build,options){for(const offset of [0,12,26,42]){const g=place(name,s,n+Math.sign(n||1)*offset,build,options);if(g)return g;}return null;}
 const teamColors=['red','teal','gold'],teamNames=TEAMS52.map(t=>t.name);
 if(track.key==='bahrain'){
  // Rear hospitality buildings keep the original six Pit Flow garages unobstructed.
  for(let team=0;team<3;team++){
   const station=pitStopStation(team*2+1)+11.5,q=pitRoad(team*2+1).at(station),n=track.project(q.x,q.y).d-24;
   const g=seek('Team pavilion '+teamNames[team],station,n,g=>{
    box(g,12,5.5,35,0,2.75,0,'stone');box(g,12.4,.35,36,0,5.65,0,'cream');
    box(g,.13,2.6,32,-6.08,3.8,0,'glass');box(g,.16,.45,33,-6.2,2.5,0,teamColors[team]);
    for(let z=-15;z<=15;z+=5)box(g,.2,3.3,.18,-6.24,3.6,z,'metal');
    for(const z of [-13,0,13]){box(g,8,.16,7,-1,5.95,z,'dark');box(g,.08,.05,7,-5.05,6.05,z,light);}
    label(g,teamNames[team]+'  /  TEAM HQ',25,1.2,-6.21,6.15,0,-Math.PI/2);
   });if(g)stats.pavilions++;
  }
  const tower=seek('Sakhir tiered tower',100,-116,g=>{
   cylinder(g,12.3,13.8,2.6,0,1.3,0,'stone',40);
   for(let level=0;level<8;level++){const y=4+level*3.5,r=11.3-level*.42;cylinder(g,r,r,2.65,0,y,0,'glass',40);cylinder(g,r+1.6,r+1.6,.38,0,y-1.45,0,'cream',40);cylinder(g,r+.12,r+.12,.10,0,y+1.15,0,light,40);for(let j=0;j<16;j++){const a=j*Math.PI/8;box(g,.13,2.7,.13,Math.sin(a)*r,y,Math.cos(a)*r,'metal');}}
   cylinder(g,9.2,9.2,.5,0,31.6,0,'cream',40);cylinder(g,.12,.16,4,0,33.8,0,'metal',8);
   label(g,'BAHRAIN',11,1.2,0,4,12.85,0,'#f4e7cd','#294c59');
  },{detail:1700});if(tower)stats.towers++;
 }
 if(!track.imported33){
 for(const [index,station] of [180,650,track.length*.43,track.length*.76].entries()){
  const stand=seek('Covered grandstand '+(index+1),station,track.width/2+56,g=>{
   for(let row=0;row<7;row++){const x=7-row*1.85,y=.8+row*.72;box(g,1.8,.6,47,x,y,0,'stone');for(let seat=0;seat<38;seat++)box(g,.6,.48,.65,x,y+.52,(seat-18.5)*1.2,seat%5===0?'red':seat%3===0?'teal':'cream');}
   for(const z of [-24,24]){box(g,.35,8.9,.35,-5,4.45,z,'metal');box(g,.35,7.3,.35,8,3.65,z,'metal');}
   const roof=box(g,17,.23,51,1,9,0,'cream');roof.rotation.z=-.09;box(g,.14,.09,49,8.7,8.5,0,light);label(g,index===0?'BAHRAIN GRAND PRIX':'SAKHIR  /  GRANDSTAND '+(index+1),36,1.5,8.9,7.3,0,Math.PI/2);
  });if(stand)stats.stands++;
 }
 for(let i=0;i<9;i++){
  const s=track.length*(.015+i*.014),tent=seek('Sakhir canopy '+i,s,track.width/2+100+(i%2)*16,g=>{
   const geometry=new T.BufferGeometry(),p=[],ix=[],steps=20;
   for(let j=0;j<=steps;j++){const a=j/steps*Math.PI*2;p.push(Math.cos(a)*8,3.7,Math.sin(a)*8);}p.push(0,10,0);for(let j=0;j<steps;j++)ix.push(j,j+1,steps+1);geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setIndex(ix);geometry.computeVertexNormals();const canvasMaterial=new T.MeshStandardMaterial({color:0xeee2c5,roughness:.9,side:T.DoubleSide});mesh(g,geometry,canvasMaterial);
   for(let j=0;j<4;j++){const a=j*Math.PI/2;box(g,.16,3.8,.16,Math.cos(a)*8,1.9,Math.sin(a)*8,'metal');}box(g,.16,10,.16,0,5,0,'metal');
  });if(tent)stats.tents++;
 }
 if(track.key==='bahrain')for(const [station,n,text] of [[track.length-370,-30,'PIT ENTRY'],[track.length-130,-30,'80  /  PIT LIMIT'],[track.length+350,-32,'PIT EXIT']])place('Pit wayfinding '+text,station,n,g=>{box(g,.12,2.2,.12,0,1.1,0,'metal');box(g,4,1.1,.14,0,2.5,0,'dark');label(g,text,3.8,.85,0,2.5,.08);});
 const zones=brakingZones(track);
 for(const zone of zones){
  const bend=track.at(zone.apex),outside=-Math.sign(bend.k||1),station=zone.entry;
  // Signs face approaching traffic: local positive Z is the arrival direction.
  for(const board of zone.boards){const g=place('Brake marker '+board.distance+'m',board.station,outside*(track.width/2+3.2),g=>{
   box(g,.12,1.7,.12,0,.85,0,'metal');box(g,1.5,1.45,.12,0,1.65,0,'cream');label(g,String(board.distance),1.34,.72,0,1.9,.071,0,'#142b38','#f2ebda');for(let k=0;k<board.stripes;k++)box(g,.13,.32,.025,(k-(board.stripes-1)/2)*.25,1.2,.08,'dark');
  },{padding:.4});if(g)stats.brakeBoards++;}
  const sign=place('Turn '+zone.turn,zone.apex,outside*(track.width/2+8),g=>{
   box(g,.15,2,.15,0,1,0,'metal');box(g,3.4,1.05,.15,0,2.05,0,'teal');label(g,'TURN '+zone.turn,3.2,.8,0,2.05,.085);
  });if(sign)stats.turnSigns++;
  // Separate asphalt runoff follows the outside of the corner. Reject triangles
  // crossing any main-road branch or the protected pit corridor.
  const positions=[],uv=[],indices=[];for(let s=station-10;s<zone.apex+70;s+=6){const corners=[];for(const ss of [s,s+6])for(const n of [track.width/2+2.5,track.width/2+15]){const q=track.point(ss,n*outside);corners.push({x:q.x,y:q.y});}
   for(const ids of [[0,2,1],[1,2,3]]){const pts=ids.map(i=>corners[i]);if(!triangleClearMain28(pts,.2)||!triangleClearPit30(pts,1))continue;const base=positions.length/3;for(const p of pts){positions.push(p.x,.027,-p.y);uv.push(p.x/12,p.y/12);}indices.push(base,base+1,base+2);}
  }if(indices.length){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();const material=new T.MeshStandardMaterial({color:0x94887b,roughness:.97,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});const m=mesh(root,geometry,material);m.castShadow=false;stats.runoffPanels++;}
  const post=seek('Marshal station T'+zone.turn,zone.apex+35,outside*(track.width/2+22),g=>{
   box(g,3,2.2,3,0,1.1,0,'stone');box(g,3.3,.2,3.3,0,2.35,0,'cream');box(g,.06,.8,2,-1.54,1.6,0,'glass');label(g,'POST '+zone.turn,2.8,.65,0,2.1,1.52);box(g,.08,1.2,.08,1.6,2.9,0,'metal');
   const panel=box(g,.08,.6,.9,1.65,3,0,new T.MeshBasicMaterial({color:0x4ee3af}));panel.userData.flagPanel30=true;
  });if(post)stats.marshalPosts++;
 }
 }
 // Reusable rear warning lamp, with a bloom-like sprite built from one atlas.
 // User-selected game brake light: red for the complete brake input, no flashing.
 const glow=document.createElement('canvas');glow.width=glow.height=64;const x=glow.getContext('2d'),gradient=x.createRadialGradient(32,32,1,32,32,32);gradient.addColorStop(0,'rgba(255,245,225,1)');gradient.addColorStop(.16,'rgba(255,60,40,.95)');gradient.addColorStop(.4,'rgba(255,25,12,.28)');gradient.addColorStop(1,'rgba(255,20,0,0)');x.fillStyle=gradient;x.fillRect(0,0,64,64);const glowTexture=new T.CanvasTexture(glow),rearLights=new Map();
 function tail(m){const list=[];for(const body of [m.body,m.low.body]){const lamp=new T.Group();lamp.position.set(0,.43,2.47);body.add(lamp);const housing=box(lamp,.22,.13,.08,0,0,0,'dark');housing.castShadow=false;const material=new T.MeshBasicMaterial({color:0xff3929});const leds=box(lamp,.15,.075,.012,0,0,.048,material);leds.castShadow=false;const sprite=new T.Sprite(new T.SpriteMaterial({map:glowTexture,color:0xff6250,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));sprite.position.z=.065;sprite.scale.set(.85,.85,1);lamp.add(sprite);list.push({leds,material,sprite});}rearLights.set(m,list);return list;}
 let lastNight=null,lastFlags=null;
 function update(frame,cars,models,selected,night,time,cpu,quality){
  if(lastNight!==night){lastNight=night;for(const m of nightMaterials)m.emissiveIntensity=night?1.3:.08;}
  const own=cars.find(c=>c.id===selected);if(own)for(const {g,detail} of lod)g.visible=Math.hypot(g.position.x-own.state.X,g.position.z+own.state.Y)<(cpu?Math.min(500,detail):detail);
  const flag=frame.stop?'RED':frame.controlZone?.flag??'GREEN';if(flag!==lastFlags){lastFlags=flag;root.traverse(o=>{if(o.userData.flagPanel30)o.material.color.setHex(flag==='GREEN'?0x4ee3af:flag==='RED'?0xff4657:0xffd45a);});}
  for(const c of cars){const m=models.get(c.id);if(!m)continue;const lights=rearLights.get(m)??tail(m),lit=(c.state.brake??0)>.001;for(const l of lights){l.material.color.setHex(lit?0xff482e:0x3b1215);l.sprite.material.opacity=lit&&!cpu&&quality!=='LOW'?.85:0;l.sprite.visible=lit&&!cpu&&quality!=='LOW';}
  }
 }
 function brandGarages(kits){for(const [id,k] of kits){const team=Math.floor((id-1)/2),color=parseInt(TEAMS52[team].colour.slice(1),16),g=k.garage.room;
  g.traverse(o=>{if(!o.isMesh)return;if(['Door pillar','Working apron boundary'].includes(o.name)){o.material=o.material.clone();o.material.color.setHex(color);}if(o.geometry?.type==='PlaneGeometry'&&o.geometry.parameters.width===7.5){const old=o.material.map,c=document.createElement('canvas');c.width=768;c.height=144;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.fillStyle='#142a34';x.fillRect(0,0,768,144);x.fillStyle='#'+color.toString(16).padStart(6,'0');x.fillRect(0,0,768,12);x.fillStyle='#f2e9d7';x.font='600 54px sans-serif';x.textAlign='center';x.fillText(teamNames[team]+'  /  BAY '+id,384,94);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;o.material.map=texture;old?.dispose();}});
 }}
 return {root,objects,stats,update,brandGarages};
}
