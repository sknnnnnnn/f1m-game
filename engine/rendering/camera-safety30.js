// Deterministic geometry-aware framing. No random angle changes or subject swaps.
export class CameraSafety30{
 constructor(T){this.T=T;this.entries=[];this.chosen=null;this.clearSince=null;this.lastTime=-Infinity;this.lastMode=null;this.subject=null;this.stats={avoidances:0,active:false,obstacles:0};}
 setObjects(objects){const T=this.T,seen=new Set();this.entries=[];for(const root of objects.filter(Boolean)){root.updateWorldMatrix(true,true);root.traverse(object=>{if(!object.isMesh||seen.has(object.id))return;seen.add(object.id);const box=new T.Box3().setFromObject(object),size=box.getSize(new T.Vector3());if(box.isEmpty()||box.max.y<.25||size.y<.025&&box.min.y<.3)return;this.entries.push({object,box});});}this.stats.obstacles=this.entries.length;this.reset();}
 reset(){this.chosen=null;this.clearSince=null;this.lastMode=null;this.lastTime=-Infinity;}
 blocked(position,look,subject){const T=this.T,near=new T.Box3().setFromPoints([position,look]).expandByScalar(3),d=new T.Vector3().subVectors(look,position),length=d.length();if(length<.01)return false;const right=new T.Vector3(-d.z,0,d.x).normalize(),ray=new T.Ray(),hit=new T.Vector3();
  for(const e of this.entries){if(!e.box.intersectsBox(near))continue;const b=e.box.clone().expandByScalar(.48);if(b.containsPoint(position))return true;for(const shift of [-.9,0,.9]){const target=look.clone().addScaledVector(right,shift);target.y+=shift===0?.12:0;const delta=target.sub(position),distance=delta.length();ray.set(position,delta.normalize());if(ray.intersectBox(b,hit)&&hit.distanceTo(position)<distance-.75)return true;}}
  return false;
 }
 resolve(position,look,car,time,mode){const T=this.T;this.stats.active=false;if(['fps','nose','overview','inspect'].includes(mode)){this.reset();return position;}
  if(time<this.lastTime||mode!==this.lastMode||this.subject!==car.id){this.chosen=null;this.clearSince=null;}this.lastTime=time;this.lastMode=mode;this.subject=car.id;
  const origin=new T.Vector3(car.state.X,0,-car.state.Y),heading=car.state.psi,f=new T.Vector3(Math.cos(heading),0,-Math.sin(heading)),r=new T.Vector3(Math.sin(heading),0,Math.cos(heading));
  const blocked=this.blocked(position,look),saved=this.chosen?origin.clone().add(this.chosen):null;
  if(!blocked){if(saved&&time-(this.clearSince??time)<1.2&&!this.blocked(saved,look)){this.clearSince??=time;this.stats.active=true;return saved;}this.chosen=null;this.clearSince=null;return position;}
  this.clearSince=null;this.stats.active=true;if(saved&&!this.blocked(saved,look))return saved;
  const candidates=[];const base=position.clone().sub(origin),distance=Math.max(14,Math.min(45,base.length()));
  for(const up of [3,7,13,22,36])candidates.push(position.clone().add(new T.Vector3(0,up,0)));
  for(const side of [1,-1])for(const up of [5,10,18,30]){const q=origin.clone().addScaledVector(f,-distance*.65).addScaledVector(r,side*distance*.75);q.y=up;candidates.push(q);}
  candidates.sort((a,b)=>a.distanceToSquared(position)-b.distanceToSquared(position));
  const safe=candidates.find(q=>!this.blocked(q,look));if(safe){this.chosen=safe.clone().sub(origin);this.stats.avoidances++;return safe;}
  // A last-resort overhead position remains on the same selected car.
  const over=origin.clone();over.y=Math.max(48,position.y+25);if(!this.blocked(over,look)){this.chosen=over.clone().sub(origin);return over;}
  this.chosen=null;return position;
 }
}
