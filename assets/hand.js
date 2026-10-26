(function(root){
// A dedicated closed-grip mesh. Finger chains are modelled around the wheel first;
// only the short wrist/palm transition deforms to meet the independently solved arm.
root.createSculptedGripHand=function(T,wheel,side,materials){
 const {glove,red,black}=materials,palmFabric=new T.MeshLambertMaterial({color:0x555b61,side:T.DoubleSide}),group=new T.Group();group.name=side<0?'Left closed wheel grip':'Right closed wheel grip';wheel.add(group);
 const wrist=new T.Object3D();wrist.name='Grip wrist attachment';wrist.position.set(side*.225,-.025,.085);group.add(wrist);
 const fingerParts=[],pieces=[];function add(g,m,name){const o=new T.Mesh(g,m);o.name=name;o.userData.modelMesh=true;group.add(o);pieces.push(o);return o;}
 function surface(points,radius,path){const curve=new T.Curve();curve.getPoint=function(t,target=new T.Vector3()){if(path)return target.copy(path(t));const k=Math.min(2,Math.floor(t*3));return target.copy(points[k]).lerp(points[k+1],t*3-k);};curve.getPointAt=curve.getPoint;const g=new T.TubeGeometry(curve,15,radius,10,false),p=g.attributes.position;for(let j=0;j<=15;j++){const c=curve.getPoint(j/15),r=1-.19*j/15;for(let k=0;k<=10;k++){const i=j*11+k;p.setXYZ(i,c.x+(p.getX(i)-c.x)*r,c.y+(p.getY(i)-c.y)*r,c.z+(p.getZ(i)-c.z)*r);}}g.computeVertexNormals();return g;}
 function addChain(points,radius,thumb,path){
  const lengths=points.slice(0,3).map((p,i)=>p.distanceTo(points[i+1]));
  const mesh=add(surface(points,radius,path),thumb?glove:palmFabric,thumb?'Compact curved opposing thumb':'Packed fabric wrapped finger');
  // Rounded fingertip, not separate spheres at every knuckle. The joined cap
  // overlaps only its own tube; the grip exclusion gate includes this surface.
  const cap=add(new T.SphereGeometry(radius*.81,12,8),palmFabric,'Soft closed glove fingertip');cap.position.copy(points[3]);fingerParts.push({mesh,cap,joints:points,lengths,anchor:points[3].clone(),thumb,radius});
 }

 // Offset each centreline from the actual grip surface along its outward normal.
 // A curved path, rather than chords between joints, keeps the finger skin outside.
 for(let f=0;f<4;f++){
  const y=[.025,.008,-.009,-.025][f],r=[.0079,.0081,.0078,.0071][f],scale=Math.sqrt(1-(y/.086)**2),angles=[.64,-.25,-1.18,-2.20];
  const path=t=>{const k=Math.min(2,Math.floor(t*3)),a=T.MathUtils.lerp(angles[k],angles[k+1],t*3-k),d=new T.Vector3(side*.036*scale*Math.cos(a),y,.032*scale*Math.sin(a)),n=new T.Vector3(d.x/(.036*.036),d.y/(.086*.086),d.z/(.032*.032)).normalize();return d.add(new T.Vector3(side*.168,0,.022)).addScaledVector(n,r+.0022);};
  addChain([0,1/3,2/3,1].map(path),r,false,path);
 }
 // The thumb folds inward across the front of the grip, rather than sticking
 // above it like a hook. A smooth centreline makes the web flow into the thumb.
 const thumbPoints=[new T.Vector3(side*.217,-.004,.066),new T.Vector3(side*.211,.008,.065),new T.Vector3(side*.199,.018,.062),new T.Vector3(side*.190,.022,.060)],thumbCurve=new T.CatmullRomCurve3(thumbPoints);
 addChain(thumbPoints,.0090,true,t=>thumbCurve.getPoint(t));
 const web=add(new T.SphereGeometry(1,16,10),glove,'Joined thumb saddle');web.position.set(side*.221,-.003,.065);web.scale.set(.014,.018,.011);
 // A continuous glove back and closely packed fabric fingers; no exposed joint beads.
 const radial=24,rows=12,positions=new Float32Array((rows+1)*(radial+1)*3),indices=[],skin=new T.BufferGeometry();skin.setAttribute('position',new T.BufferAttribute(positions,3));
 const perMaterial=[[],[],[]];for(let j=0;j<rows;j++)for(let k=0;k<radial;k++){const a=j*(radial+1)+k,b=a+radial+1,band=(k>=4&&k<8&&j>=3&&j<10)?1:(k>=14&&k<22&&j>4)?2:0;perMaterial[band].push(a,b,a+1,a+1,b,b+1);}for(let m=0;m<3;m++){skin.addGroup(indices.length,perMaterial[m].length,m);indices.push(...perMaterial[m]);}skin.setIndex(indices);const palmParts=[];for(let m=0;m<3;m++){const g=new T.BufferGeometry();g.setAttribute('position',skin.attributes.position);g.setIndex(perMaterial[m]);palmParts.push(add(g,[glove,red,black][m],'Convex glove region '+m));}
 let palmAxis=new T.Vector3();function update(forearmDirection){const w=wrist.position.clone(),p=new T.Vector3(side*.226,-.004,.068),d=new T.Vector3(side*.211,0,.058),control=[w,w.clone().lerp(p,.28),p,d],curve=new T.CatmullRomCurve3(control),attr=skin.attributes.position;
 const points=[],tangents=[],frames=[];for(let j=0;j<=rows;j++){const t=j/rows,tangent=curve.getTangent(t).normalize();if(j<3)tangent.lerp(forearmDirection,(1-t*4)*.65).normalize();points.push(curve.getPoint(t));tangents.push(tangent);}let u=new T.Vector3(0,1,0).addScaledVector(tangents[rows],-tangents[rows].y).normalize();let v=new T.Vector3().crossVectors(tangents[rows],u).normalize();if(v.z<0)v.negate();frames[rows]={u:u.clone(),v:v.clone()};for(let j=rows-1;j>=0;j--){const q=new T.Quaternion().setFromUnitVectors(tangents[j+1],tangents[j]);u.applyQuaternion(q).normalize();v.applyQuaternion(q).normalize();frames[j]={u:u.clone(),v:v.clone()};}
 for(let j=0;j<=rows;j++){const t=j/rows,c=points[j],{u,v}=frames[j];const width=t<.65?T.MathUtils.lerp(.022,.033,t/.65):T.MathUtils.lerp(.033,.032,(t-.65)/.35),depth=t<.65?T.MathUtils.lerp(.014,.013,t/.65):T.MathUtils.lerp(.013,.011,(t-.65)/.35);
 for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2,q=c.clone().addScaledVector(u,Math.cos(a)*width).addScaledVector(v,Math.sin(a)*depth);attr.setXYZ(j*(radial+1)+k,q.x,q.y,q.z);}}
 attr.needsUpdate=true;skin.computeVertexNormals();skin.computeBoundingSphere();skin.computeBoundingBox();for(const o of palmParts){o.geometry.setAttribute('normal',skin.attributes.normal);o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();}palmAxis.copy(p).sub(w).normalize();}
 update(new T.Vector3(-side,.3,-.1).normalize());
 return {group,wrist,fingerParts,skin,update,palmAxis,triangles:pieces.reduce((n,o)=>n+(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3,0)};
};
})(globalThis);
