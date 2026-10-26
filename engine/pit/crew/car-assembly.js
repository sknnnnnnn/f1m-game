import * as T from 'three';
// Clip the existing shell on a real seam so its nose travels with the wing.
// Triangles are clipped, not hidden by an animation or replaced by a box.
export function splitMeshAtZ(mesh,cut){
 const g=mesh.geometry,attrs=g.attributes,idx=g.index;const front=[],rear=[],frontGroups=[],rearGroups=[];
 const groups=g.groups.length?g.groups:[{start:0,count:idx?.count??attrs.position.count,materialIndex:0}];
 function vertex(i){const k=idx?idx.getX(i):i;return {p:new T.Vector3().fromBufferAttribute(attrs.position,k),n:new T.Vector3().fromBufferAttribute(attrs.normal,k),uv:attrs.uv?new T.Vector2().fromBufferAttribute(attrs.uv,k):new T.Vector2()};}
 function clip(poly,negative){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=negative?a.p.z<=cut:a.p.z>=cut,next=negative?b.p.z<=cut:b.p.z>=cut;if(inside)out.push(a);if(inside!==next){const t=(cut-a.p.z)/(b.p.z-a.p.z);out.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),uv:a.uv.clone().lerp(b.uv,t)});}}return out;}
 function append(out,poly){for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]])out.push(v);}
 for(const group of groups){const a=front.length,b=rear.length;for(let i=group.start;i<group.start+group.count;i+=3){const p=[vertex(i),vertex(i+1),vertex(i+2)];append(front,clip(p,true));append(rear,clip(p,false));}if(front.length>a)frontGroups.push({start:a,count:front.length-a,materialIndex:group.materialIndex});if(rear.length>b)rearGroups.push({start:b,count:rear.length-b,materialIndex:group.materialIndex});}
 function geometry(vertices,groups){const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(vertices.flatMap(v=>v.p.toArray()),3));o.setAttribute('normal',new T.Float32BufferAttribute(vertices.flatMap(v=>v.n.toArray()),3));o.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap(v=>v.uv.toArray()),2));groups.forEach(g=>o.addGroup(g.start,g.count,g.materialIndex));return o;}
 return {front:geometry(front,frontGroups),rear:geometry(rear,rearGroups)};
}
export function prepareCar(scene){
 scene.updateMatrixWorld(true);
 function pivot(name,object){scene.updateMatrixWorld(true);const center=new T.Box3().setFromObject(object).getCenter(new T.Vector3()),p=new T.Group();p.name=name;p.position.copy(center);scene.add(p);p.attach(object);return {root:p,center};}
 const wheels=['FL','FR','RL','RR'].map(label=>{const o=scene.getObjectByName(label+'_Tire');const item=pivot('Service_'+label,o);item.label=label;item.newRoot=item.root.clone(true);item.newRoot.name='Fresh_'+label;scene.add(item.newRoot);return item;});
 const body=scene.getObjectByName('Base_Unsubsurfed'),nose=new T.Group();nose.name='Detachable_nose_and_front_wing';scene.add(nose);
 const cover=new T.Group();cover.name='Left_damage_service_panel';scene.add(cover);scene.updateMatrixWorld(true);
 body.traverse(mesh=>{if(!mesh.isMesh)return;const toScene=scene.matrixWorld.clone().invert().multiply(mesh.matrixWorld),back=toScene.clone().invert(),world=mesh.geometry.clone().applyMatrix4(toScene),g=splitMeshAtZ(new T.Mesh(world,mesh.material),-1.85);mesh.geometry=g.rear.clone().applyMatrix4(back);const n=new T.Mesh(g.front,mesh.material);n.name='Nose_shell';n.castShadow=true;n.receiveShadow=true;nose.add(n);
});
 const fw=scene.getObjectByName('Front_Wing_Base');if(fw)nose.attach(fw);
 const bulkhead=new T.Mesh(new T.BoxGeometry(.37,.23,.024),new T.MeshStandardMaterial({color:0x283337,roughness:.65}));bulkhead.position.set(0,.39,-1.845);bulkhead.name='Front_bulkhead';scene.add(bulkhead);
 const rear=scene.getObjectByName('Rear_Wing');const rearRig=pivot('Detachable_rear_wing',rear);
 const side=scene.getObjectByName('Sidepod');scene.updateMatrixWorld(true);
 // Only the damaged left outboard skin detaches. The central spine, right side
 // and entire cockpit/airbox shell retain their original geometry.
 side.traverse(mesh=>{if(!mesh.isMesh)return;const toScene=scene.matrixWorld.clone().invert().multiply(mesh.matrixWorld),back=toScene.clone().invert(),g=mesh.geometry.clone().applyMatrix4(toScene).rotateY(-Math.PI/2),halves=splitMeshAtZ(new T.Mesh(g,mesh.material),-.14);mesh.geometry=halves.rear.rotateY(Math.PI/2).applyMatrix4(back);const skin=new T.Mesh(halves.front.rotateY(Math.PI/2),mesh.material);skin.name='Damaged_left_sidepod_skin';skin.castShadow=true;skin.receiveShadow=true;cover.add(skin);});
 const panelRig=pivot('Detachable_left_damage_panel',cover);
 const metal=new T.MeshStandardMaterial({color:0x7e898d,metalness:.75,roughness:.4}),dark=new T.MeshStandardMaterial({color:0x242e32,metalness:.6,roughness:.5}),bronze=new T.MeshStandardMaterial({color:0x92704e,metalness:.75,roughness:.5});
 const internals=new T.Group();internals.name='Power_unit_and_cooling';scene.add(internals);
 function box(name,x,y,z,w,h,d,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;internals.add(m);return m;}
 box('Carbon survival floor',0,.29,.85,.76,.12,1.75,dark);box('V6 crankcase',0,.53,.93,.36,.38,.78,dark);
 for(const sign of [-1,1]){const bank=box('Cylinder bank',sign*.15,.72,.90,.19,.18,.65,metal);bank.rotation.z=sign*-.45;for(let i=0;i<6;i++)box('Cam cover ribs',sign*.17,.82,.65+i*.09,.14,.025,.025,dark);
 const rad=box('Side radiator',sign*.43,.48,.56,.14,.32,.88,metal);rad.rotation.z=sign*.25;for(let i=0;i<12;i++)box('Cooling fins',sign*.515,.48,.18+i*.067,.016,.28,.013,dark);
 for(let i=0;i<3;i++){const tube=new T.Mesh(new T.TorusGeometry(.115,.024,8,16,Math.PI),bronze);tube.position.set(sign*.27,.57,.72+i*.18);tube.rotation.y=Math.PI/2;internals.add(tube);}}
 box('Air intake plenum',0,.91,.93,.24,.13,.48,dark);box('Gearbox casing',0,.48,1.75,.27,.30,.53,metal);const turbo=new T.Mesh(new T.TorusGeometry(.11,.045,10,20),metal);turbo.position.set(0,.64,1.43);internals.add(turbo);
 function surfaceGrip(root,point){let best=point.clone(),distance=Infinity;root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();root.traverse(m=>{if(!m.isMesh)return;const x=inverse.clone().multiply(m.matrixWorld),g=m.geometry,a=g.attributes.position,idx=g.index,n=idx?idx.count:a.count;for(let i=0;i<n;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(x)),near=new T.Triangle(...v).closestPointToPoint(point,new T.Vector3()),d=near.distanceToSquared(point);if(d<distance){best=near;distance=d;}}});return best;}
 const noseGrips=[new T.Vector3(-.72,.34,-2.65),new T.Vector3(.72,.34,-2.65)].map(p=>surfaceGrip(nose,p));
 const rearGrips=[new T.Vector3(-.43,.84,2.32),new T.Vector3(.43,.84,2.32)].map(p=>surfaceGrip(rearRig.root,p.sub(rearRig.center)));
 const panelGrips=[new T.Vector3(-.72,.62,.12),new T.Vector3(-.72,.62,.82)].map(p=>p.sub(panelRig.center));
 for(const p of panelGrips){const onSkin=surfaceGrip(panelRig.root,p),bar=new T.Mesh(new T.CylinderGeometry(.012,.012,.12,10),dark);bar.rotation.x=Math.PI/2;bar.position.copy(p);panelRig.root.add(bar);const bridge=new T.Mesh(new T.CylinderGeometry(.014,.014,onSkin.distanceTo(p),10),metal);bridge.position.copy(onSkin).add(p).multiplyScalar(.5);bridge.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),p.clone().sub(onSkin).normalize());panelRig.root.add(bridge);}
 scene.updateMatrixWorld(true);
 return {root:scene,wheels,nose,rear:rearRig,panels:panelRig,internals,noseGrips,rearGrips,panelGrips};
}
