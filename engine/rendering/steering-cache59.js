// Shared visual pose samples. Physical steering and the road-wheel angles are
// untouched. Driver hands/wheel use 0.5 road-degree samples (<=0.25 degree error).
export function createSteeringCache59(T){
 const cache=new Map(),stats={solves:0,hits:0,repeats:0,bytes:0,poses:0};
 function bind(rig,body){const nodes=[];rig.added.traverse(o=>nodes.push(o));const attributes=[],seen=new Set(),geometries=[];
  for(const arm of rig.arms)for(const geometry of [arm.surface,arm.cuffGeometry,arm.grip.skin])for(const name of ['position','normal']){const a=geometry.attributes[name];if(a&&!seen.has(a)){seen.add(a);attributes.push(a);}}
  rig.added.traverse(o=>{if(o.isMesh&&seen.has(o.geometry.attributes.position))geometries.push(o.geometry);});
  const shape=nodes.length+':'+attributes.map(a=>a.array.length).join(',');let last=null;
  function capture(){const transforms=new Float64Array(nodes.length*10);for(let i=0;i<nodes.length;i++){const o=nodes[i],j=i*10;transforms.set([...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()],j);}
   const arrays=attributes.map(a=>a.array.slice()),bounds=geometries.map(g=>({box:g.boundingBox?.clone(),sphere:g.boundingSphere?.clone()})),arms=rig.arms.map(a=>({elbow:a.elbow.clone(),handForward:a.handForward.clone(),palmAxis:a.grip.palmAxis.clone(),wristDeflection:a.wristDeflection,torsoProxyClearance:a.torsoProxyClearance,actualPalmBend:a.actualPalmBend}));
   const bytes=transforms.byteLength+arrays.reduce((n,a)=>n+a.byteLength,0);return {transforms,arrays,bounds,arms,bytes};
  }
  function apply(p,angle){for(let i=0;i<nodes.length;i++){const o=nodes[i],j=i*10;o.position.fromArray(p.transforms,j);o.quaternion.fromArray(p.transforms,j+3);o.scale.fromArray(p.transforms,j+7);}for(let i=0;i<attributes.length;i++){attributes[i].array.set(p.arrays[i]);attributes[i].needsUpdate=true;}for(let i=0;i<geometries.length;i++){const g=geometries[i],b=p.bounds[i];if(b.box)g.boundingBox.copy(b.box);if(b.sphere)g.boundingSphere.copy(b.sphere);}for(let i=0;i<rig.arms.length;i++){const a=rig.arms[i],pA=p.arms[i];a.elbow.copy(pA.elbow);a.handForward.copy(pA.handForward);a.grip.palmAxis.copy(pA.palmAxis);for(const k of ['wristDeflection','torsoProxyClearance','actualPalmBend'])a[k]=pA[k];}rig.setValue59(angle);}
  return input=>{const angle=Math.round(T.MathUtils.clamp(input,-18,18)*2)/2;if(angle===last){stats.repeats++;return;}last=angle;const key=shape+':'+angle;let p=cache.get(key);if(!p){rig.setSteering(angle);p=capture();cache.set(key,p);stats.solves++;stats.bytes+=p.bytes;stats.poses=cache.size;}else{apply(p,angle);stats.hits++;}for(let i=0;i<geometries.length;i++)geometries[i].userData.poseCacheKey59='P59:'+key+':'+i;if(!body.userData.deferWorld59)body.updateMatrixWorld(true);};
 }
 return {bind,stats};
}
