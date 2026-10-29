// Keep the existing car geometry, paint, steering pivots, wheel spin, DRS,
// damage and pit animations. Submit identical parts together on the GPU.
export function createCarInstances53(T,scene,models){
 const sources=[],roots=[],batches=new Map(),fingerprints=new WeakMap();
 const stats={sources:0,batches:0,visibleParts:0,submissions:0,savedSubmissions:0};
 const attributeKey=g=>Object.entries(g.attributes).map(([n,a])=>n+':'+a.version).join(',')+':'+(g.index?.version??0);
 function geometryKey(g){const revision=attributeKey(g),cached=fingerprints.get(g);if(cached?.revision===revision)return cached.key;
  let h=2166136261,j=5381;const feed=a=>{const bytes=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(let i=0;i<bytes.length;i++){h=Math.imul(h^bytes[i],16777619);j=Math.imul(j,33)^bytes[i];}};
  const shape=[];for(const [name,a]of Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b))){shape.push(name+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name+':'+a.count);feed(a.array);}if(g.index)feed(g.index.array);
  const key=shape.join('|')+':'+(g.index?.count??0)+':'+g.drawRange.start+':'+g.drawRange.count+':'+(h>>>0)+':'+(j>>>0);fingerprints.set(g,{revision,key});return key;
 }
 function materialKey(m){return [m.type,m.transparent,m.opacity,m.side,m.metalness,m.roughness,m.emissive?.getHex(),m.emissiveIntensity,m.vertexColors,m.depthWrite,m.depthTest,m.alphaTest,m.blending,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,m.map?.uuid,m.normalMap?.uuid,m.roughnessMap?.uuid,m.metalnessMap?.uuid,m.envMap?.uuid,m.toneMapped,m.flatShading,m.fog].join(':');}
 for(const model of models.values())for(const root of [model.root,model.low.root]){roots.push(root);root.traverse(o=>{
  if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||o.material.transparent||!o.geometry.attributes.position||o.onBeforeRender!==T.Object3D.prototype.onBeforeRender)return;
  // Leave transparent surfaces to Three's depth sorting. These opaque source
  // nodes remain as the authoritative animation/rig hierarchy on layer 31.
  const source={mesh:o,batch:null};sources.push(source);o.layers.set(31);
 });}
 function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
 function batchFor(o){const key=geometryKey(o.geometry)+'|'+materialKey(o.material)+'|'+o.castShadow+':'+o.receiveShadow+':'+o.renderOrder;
  let batch=batches.get(key);if(!batch){const material=o.material.clone();material.color.set(0xffffff);const mesh=new T.InstancedMesh(o.geometry,material,64);mesh.name='Shared car parts R53';mesh.count=0;mesh.frustumCulled=false;mesh.castShadow=o.castShadow;mesh.receiveShadow=o.receiveShadow;mesh.renderOrder=o.renderOrder;mesh.userData.modelMesh=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(mesh);batch={mesh,count:0,key};batches.set(key,batch);}return batch;
 }
 function update(){for(const b of batches.values())b.count=0;let count=0;
  for(const r of roots)if(r.visible)r.updateWorldMatrix(true,true);
  for(const s of sources){const o=s.mesh;if(!visible(o))continue;const b=batchFor(o),i=b.count++;if(i>=b.mesh.instanceMatrix.count){const capacity=b.mesh.instanceMatrix.count*2,matrix=new T.InstancedBufferAttribute(new Float32Array(capacity*16),16);matrix.array.set(b.mesh.instanceMatrix.array);matrix.setUsage(T.DynamicDrawUsage);b.mesh.instanceMatrix=matrix;if(b.mesh.instanceColor){const colour=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);colour.array.set(b.mesh.instanceColor.array);b.mesh.instanceColor=colour;}}b.mesh.setMatrixAt(i,o.matrixWorld);b.mesh.setColorAt(i,o.material.color);count++;}
  let submissions=0;for(const [key,b]of batches){b.mesh.count=b.count;b.mesh.visible=b.count>0;if(!b.count){b.mesh.removeFromParent();b.mesh.dispose();b.mesh.material.dispose();batches.delete(key);continue;}if(b.count){b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;submissions++;}}
  stats.sources=sources.length;stats.batches=batches.size;stats.visibleParts=count;stats.submissions=submissions;stats.savedSubmissions=count-submissions;
 }
 return {update,stats};
}
