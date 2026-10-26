import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0);
export function createRaceJack(scene){
 const root=new T.Group();root.name='Quick-lift racing jack';
 const alloy=new T.MeshStandardMaterial({color:0xb3bec0,metalness:.85,roughness:.28}),paint=new T.MeshStandardMaterial({color:0x176b67,metalness:.6,roughness:.35}),rubber=new T.MeshStandardMaterial({color:0x172225,roughness:.85}),gold=new T.MeshStandardMaterial({color:0xd8aa42,metalness:.7,roughness:.35});
 const tubes=[],rollers=[];
 function tube(a,b,r,mat=alloy,parent=root){const m=new T.Mesh(new T.CylinderGeometry(r,r,1,12),mat);m.castShadow=true;parent.add(m);tubes.push(m);setTube(m,a,b);return m;}
 function setTube(m,a,b){m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(Y,b.clone().sub(a).normalize());}
 for(const s of [-1,1]){tube(V(s*.20,.12,-.35),V(s*.20,.12,.44),.035,paint);tube(V(s*.20,.12,-.35),V(s*.10,.18,-.5),.028,paint);
  for(const z of [-.25,.33]){const w=new T.Mesh(new T.CylinderGeometry(.072,.072,.055,18),rubber);w.rotation.z=Math.PI/2;w.position.set(s*.24,.072,z);const caster=new T.Group();caster.position.copy(w.position);w.position.set(0,0,0);caster.add(w);root.add(caster);rollers.push({wheel:w,caster});const hub=new T.Mesh(new T.CylinderGeometry(.027,.027,.058,12),alloy);hub.rotation.z=Math.PI/2;hub.position.copy(w.position);caster.add(hub);}}
 tube(V(-.22,.15,-.2),V(.22,.15,-.2),.036);tube(V(-.20,.12,.34),V(.20,.12,.34),.025);
 const pad=new T.Mesh(new T.CylinderGeometry(.09,.10,.055,18),gold);pad.position.set(0,.17,.40);root.add(pad);
 const links=[-1,1].map(s=>tube(V(s*.12,.12,.03),V(s*.12,.18,.40),.026,gold));
 const hinge=V(0,.19,-.2),handle=tube(hinge,V(0,1.12,-.89),.025),grip=tube(V(-.23,1.12,-.89),V(.23,1.12,-.89),.033,rubber),spring=tube(V(0,.17,.03),V(0,.28,-.12),.036,gold);
 const joint=new T.Mesh(new T.SphereGeometry(.06,12,8),alloy);joint.position.copy(hinge);root.add(joint);
 root.userData.handle=V(0,1.12,-.89);root.userData.leverLength=Math.hypot(.93,.69);root.userData.roll=(distance,steer=0)=>{rollers.forEach(({wheel,caster})=>{wheel.rotation.x=-distance/.072;caster.rotation.y=steer;});};
 root.userData.animate=(lift=0,press=0)=>{const length=Math.hypot(1.12-.19,.89-.20),angle=T.MathUtils.lerp(Math.atan2(.93,.69),Math.atan2(.35,Math.sqrt(length*length-.35*.35)),press),point=hinge.clone().add(V(0,length*Math.sin(angle),-length*Math.cos(angle)));root.userData.handle.copy(point);setTube(handle,hinge,point);setTube(grip,point.clone().add(V(-.23,0,0)),point.clone().add(V(.23,0,0)));pad.position.y=.17+lift;links.forEach((m,i)=>setTube(m,V((i?1:-1)*.12,.12,.03),V((i?1:-1)*.12,.17+lift,.40)));setTube(spring,V(0,.17,.03),V(0,.28+.1*press,-.12));};
 scene.add(root);return root;
}
