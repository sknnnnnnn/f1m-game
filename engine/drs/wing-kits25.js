// Independent FR and RB-inspired game wing kits; not measured team CAD. Units match car163.
export const WING_DESIGNS = Object.freeze({FR:{id:"FR",name:"Ferrari-inspired / flip",durationMs:260},RB:{id:"RB",name:"Red Bull-inspired / hinged opening",durationMs:220}});
// Stable per-car assignment: select once when spawning, never randomize per frame.
export function wingDesignForCar(carId, seed=1){let h=2166136261;for(const c of String(seed)+":"+String(carId))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)&1?"RB":"FR";}
export function buildWings(T,car,options={}){
 const variant=options.variant==="RB"?"RB":"FR",rb=variant==="RB",hingeY=rb?1.29:1.225,hingeZ=rb?2.67:2.48,openAngle=rb?.50:Math.PI+.50;
 const root=new T.Group();root.name=variant+'_Wing_Study';car.add(root);
 for(const name of ['Rear_Wing','Front_Wing_Base'])car.getObjectByName(name).visible=false;
 const carbon=new T.MeshStandardMaterial({color:0x17212b,metalness:.32,roughness:.43}),red=new T.MeshStandardMaterial({color:options.accent??(rb?0x164e7b:0xc61735),metalness:.32,roughness:.28}),ivory=new T.MeshStandardMaterial({color:0xe8e3d7,metalness:.25,roughness:.34}),metal=new T.MeshStandardMaterial({color:0x77838d,metalness:.8,roughness:.27});
 for(const m of [carbon,red,ivory,metal])m.side=T.DoubleSide;
 const moving=[],fixed=[];
 function mesh(g,m,parent,name){const o=new T.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;o.userData.modelMesh=true;parent.add(o);(parent===root?fixed:moving).push(o);return o;}
 function foil({span,chord,z,y0,y1,camber=.018,thick=.009,sweep=.03,rise=.025},mat,parent,name){
  const p=[],uv=[],ind=[],S=options.detail==='low'?10:40,N=options.detail==='low'?16:48;
  for(let j=0;j<=S;j++){const u=j/S*2-1,x=u*span/2,taper=1-.09*Math.pow(Math.abs(u),4);for(let k=0;k<N;k++){const a=2*Math.PI*k/N,t=(1-Math.cos(a))/2,side=k<N/2?1:-1,h=Math.sin(Math.PI*t);p.push(x,y0+(y1-y0)*t-camber*h+side*thick*Math.pow(Math.max(0,h),.6)+rise*u*u,z+t*chord*taper+sweep*u*u);uv.push(j/S,t);}}
  for(let j=0;j<S;j++)for(let k=0;k<N;k++){const a=j*N+k,b=j*N+(k+1)%N,c=a+N,e=b+N;ind.push(a,b,c,b,e,c);}
  for(let k=1;k<N-1;k++){ind.push(0,k,k+1);const a=S*N;ind.push(a,a+k+1,a+k);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();return mesh(g,mat,parent,name);
 }
 function panel(x,points,mat,name,thickness=.026){const s=new T.Shape();s.moveTo(...points[0]);for(let i=1;i<points.length;i++)s.lineTo(...points[i]);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:true,bevelSize:.008,bevelThickness:.005,bevelSegments:3,steps:1}); // shape XY = longitudinal Z / height Y; extrusion -> lateral X
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getX(i),y=p.getY(i),xx=p.getZ(i);p.setXYZ(i,x+xx-thickness/2,y,z);}g.computeVertexNormals();return mesh(g,mat,root,name);}
 function rod(a,b,r,mat,parent,name){const A=new T.Vector3(...a),B=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r,r,A.distanceTo(B),12),mat,parent,name);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return o;}
 // Front wing: sculpted fixed mainplane + two separately formed linked active flaps.
 foil({span:rb?2.24:2.20,chord:.235,z:-2.775,y0:.19,y1:.235,camber:.022,thick:.010,sweep:rb?.12:.09,rise:rb?.035:.026},carbon,root,'FW_Mainplane');
 const front=new T.Group();front.name='FW_Active_Hinge';front.position.set(0,.28,-2.51);root.add(front);
 function relativeFoil(p,m,parent,name){const o=foil(p,m,parent,name);o.geometry.translate(0,-parent.position.y,-parent.position.z);return o;}
 relativeFoil({span:rb?2.18:2.14,chord:.215,z:-2.53,y0:.28,y1:.35,camber:.014,thick:.007,sweep:rb?.10:.075,rise:.024},ivory,front,'FW_Active_Flap_1');
 relativeFoil({span:rb?2.14:2.10,chord:.175,z:-2.295,y0:.365,y1:.43,camber:.010,thick:.006,sweep:.058,rise:.021},red,front,'FW_Active_Flap_2');
 for(const side of [-1,1]){
  panel(side*(rb?1.132:1.112),[[-2.77,.19],[-2.73,.32],[-2.53,.43],[-2.20,.48],[-2.08,.40],[-2.07,.23],[-2.26,.18],[-2.66,.17]],carbon,'FW_Endplate');
  rod([side*1.07,.28,-2.51],[side*1.13,.28,-2.51],.014,metal,root,'FW_Bearing');
  rod([side*.14,.34,-2.48],[side*.14,.43,-2.28],.012,carbon,root,'FW_Nose_Stay');
 }
 // Rear mainplane is adjacent to active profiles; no low shelf/beam wing.
 foil({span:rb?1.65:1.59,chord:.24,z:2.04,y0:1.005,y1:1.065,camber:.026,thick:.012,sweep:.025,rise:.045},carbon,root,'RW_Mainplane');
 const rear=new T.Group();rear.name=rb?'RW_Opening_Hinge':'RW_Inverting_Hinge';rear.position.set(0,hingeY,hingeZ);root.add(rear);
 relativeFoil({span:rb?1.63:1.57,chord:.18,z:2.30,y0:1.085,y1:1.18,camber:.013,thick:.008,sweep:.018,rise:.015},red,rear,'RW_Active_Flap_1');
 relativeFoil({span:rb?1.61:1.55,chord:.16,z:2.50,y0:1.205,y1:1.29,camber:.008,thick:.006,sweep:.012,rise:.012},red,rear,'RW_Active_Flap_2');
 for(const side of [-1,1]){
  panel(side*(rb?.85:.82),[[2.04,1.02],[2.12,1.33],[2.24,1.365],[2.68,1.365],[2.76,1.29],[2.77,.92],[2.64,.84],[2.45,.87],[2.28,.97]],carbon,'RW_Endplate');
  panel(side*(rb?.849:.819),[[2.13,1.26],[2.18,1.33],[2.65,1.33],[2.69,1.28],[2.67,1.23],[2.21,1.25]],red,'RW_Endplate_Inlay',.008);
  rod([side*.14,.64,2.08],[side*.14,1.04,2.26],.025,carbon,root,'RW_Pylon');
  rod([side*(rb?.80:.77),hingeY,hingeZ],[side*(rb?.87:.84),hingeY,hingeZ],.018,metal,root,'RW_Bearing');
 }
 rod([rb?-.82:-.79,hingeY,hingeZ],[rb?.82:.79,hingeY,hingeZ],.008,metal,root,'RW_Hinge_Axle');
 const actuator=rod([0,1.055,2.16],[0,1.26,2.55],.012,metal,root,'RW_Actuator'),crank=rod([0,0,0],[0,.07,.07],.014,carbon,rear,'RW_Crank');
 const base=new T.Vector3(0,1.055,2.16),pin=new T.Vector3(0,.07,.07),v=new T.Vector3(),q=new T.Vector3(),axis=new T.Vector3(0,1,0);
 function update(value){const a=Math.max(0,Math.min(1,value));rear.rotation.x=openAngle*a;front.rotation.x=(rb?.25:.27)*a;
  q.copy(pin).applyEuler(rear.rotation).add(rear.position);v.copy(q).sub(base);actuator.position.copy(q).add(base).multiplyScalar(.5);actuator.scale.y=v.length()/Math.hypot(.205,.39);actuator.quaternion.setFromUnitVectors(axis,v.normalize());car.updateMatrixWorld(true);
  return {opening:a,rearAngle:rear.rotation.x,frontAngle:front.rotation.x};}
 update(0);return {variant,openAngle,durationMs:WING_DESIGNS[variant].durationMs,root,front,rear,moving,fixed,update};
}
