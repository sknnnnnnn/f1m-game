// Keep every vertex of terrain triangles near the road below its lower deck.
// A vertex-only nearest-height lookup cannot stop a coarse triangle bridging
// over a dip or choosing the elevated branch at the Suzuka crossover.
export function clearTerrainUnderRoad(geometry,samples,halfWidth=8.4){
 const p=geometry.attributes.position,index=geometry.index;
 let reach=0;
 for(let i=0;i<index.count;i+=3){
  const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];
  for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)reach=Math.max(reach,Math.hypot(p.getX(ids[a])-p.getX(ids[b]),p.getZ(ids[a])-p.getZ(ids[b])));
 }
 const radius=reach+halfWidth+2,cell=radius,buckets=new Map();
 for(const {p:q} of samples){const key=Math.floor(q.x/cell)+','+Math.floor(q.z/cell);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(q);}
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),cx=Math.floor(x/cell),cz=Math.floor(z/cell);let height=p.getY(i);
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const q of buckets.get((cx+dx)+','+(cz+dz))??[])
   if(Math.hypot(q.x-x,q.z-z)<=radius)height=Math.min(height,q.y-.5);
  p.setY(i,height);
 }
 p.needsUpdate=true;
}
