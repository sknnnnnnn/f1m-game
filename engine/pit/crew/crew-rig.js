import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {fitContactPose,contactPoseAt} from './contact-pose.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0),ONE=V(1,1,1),Q=new T.Quaternion(),M=new T.Matrix4();
export function twoBone(a,b,l1,l2,pole){
 const ab=b.clone().sub(a),distance=ab.length(),d=Math.max(.001,Math.min(l1+l2-.0001,distance)),axis=ab.normalize();
 const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
 let side=pole.clone().sub(a);side.addScaledVector(axis,-side.dot(axis));if(side.lengthSq()<.001)side=V(0,0,1).cross(axis);side.normalize();
 return a.clone().addScaledVector(axis,along).addScaledVector(side,height);
}
export function obstacleGap(p,radius,collision){
 let gap=Infinity;
 for(const w of collision?.wheels??[]){const x=Math.abs(p.x-w.x)-.17,r=Math.hypot(p.y-w.y,p.z-w.z)-.42;gap=Math.min(gap,Math.hypot(Math.max(0,x),Math.max(0,r))+Math.min(0,Math.max(x,r))-radius);}
 for(const r of collision?.props??[]){const dx=Math.max(0,Math.abs(p.x-r.x)-r.hx),dz=Math.max(0,Math.abs(p.z-r.z)-r.hz),dy=Math.max(0,p.y-(r.h??.855),-p.y);gap=Math.min(gap,Math.hypot(dx,dy,dz)-radius);}
 return gap;
}
function clearJoint(a,b,l1,l2,pole,world,collision,radius){
 const preferred=twoBone(a,b,l1,l2,pole);if(!collision)return preferred;
 const axis=b.clone().sub(a).normalize(),center=a.clone().addScaledVector(axis,preferred.clone().sub(a).dot(axis)),offset=preferred.clone().sub(center);
 const clearance=k=>{let g=obstacleGap(world(k),radius,collision);for(const end of [a,b])for(const u of [.35,.65])g=Math.min(g,obstacleGap(world(k.clone().lerp(end,u)),radius*.85,collision));return g;};
 let best=preferred,score=clearance(best);if(score>=.005)return best;
 for(let n=1;n<=24;n++){const turn=(n%2?1:-1)*Math.ceil(n/2)*Math.PI/12,k=center.clone().add(offset.clone().applyAxisAngle(axis,turn)),g=clearance(k),s=Math.min(.005,g)-Math.abs(turn)*.0003;if(s>score){score=s;best=k;}}
 return best;
}
function build_torsoGeometry(){
 const p=[],uv=[],ix=[],n=24,rings=[];
 const curve=new T.CatmullRomCurve3([V(.142,0,.10),V(.156,.10,.112),V(.18,.30,.12),V(.214,.43,.113),V(.198,.51,.10),V(.105,.56,.075)]);
 for(let j=0;j<=24;j++){const q=curve.getPoint(j/24);rings.push([q.y,q.x,q.z]);}
 for(let j=0;j<rings.length;j++){const [y,w,d]=rings[j];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,fold=.0018*Math.sin(a*7+y*65)*Math.exp(-(((y-.12)/.11)**2));p.push(Math.cos(a)*(w+fold),y,Math.sin(a)*(d+fold));uv.push(i/n,j/(rings.length-1));}}
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=r*(n+1)+i,b=a+n+1;ix.push(a,b,a+1,a+1,b,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function build_limbGeometry(start,end){const profile=[V(0,-.51),V(start*.72,-.50),V(start*.97,-.43),V(start,-.28),V((start+end)*.54,.08),V(end,.35),V(end*.90,.46),V(end*.65,.50),V(0,.51)],g=new T.LatheGeometry(profile.map(p=>new T.Vector2(p.x,p.y)),16);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);if(r<.01)continue;const fold=.0011*Math.sin(y*76+Math.atan2(z,x)*3)*(Math.exp(-(((y+.30)/.14)**2))+.5*Math.exp(-(((y-.30)/.12)**2)));p.setXYZ(i,x*(1+fold/r),y,z*(1+fold/r));}g.computeVertexNormals();return g;}
function build_helmetGeometry(){return new T.LatheGeometry([new T.Vector2(0,-.14),new T.Vector2(.071,-.14),new T.Vector2(.111,-.10),new T.Vector2(.127,-.025),new T.Vector2(.126,.045),new T.Vector2(.110,.105),new T.Vector2(.070,.146),new T.Vector2(0,.158)],24);}
function build_visorGeometry(){const p=[],ix=[];for(let j=0;j<=4;j++)for(let i=0;i<=24;i++){const a=(i/24*2-1)*1.18,y=-.012+j/4*.076;p.push(.133*Math.sin(a),y,-.133*Math.cos(a));}for(let j=0;j<4;j++)for(let i=0;i<24;i++){const a=j*25+i;ix.push(a,a+25,a+1,a+1,a+25,a+26);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;}
function merged(shapes){return mergeGeometries(shapes.map(g=>g.index?g.toNonIndexed():g));}
function build_gloveGeometry(side=1,closed=true){const gs=[];const oval=(x,y,z,sx,sy,sz)=>{const g=new T.SphereGeometry(1,12,8);g.scale(sx,sy,sz);g.translate(x,y,z);gs.push(g);};oval(0,-.006,0,.042,.046,.027);for(let i=0;i<4;i++){const x=side*(-.029+i*.019),tip=closed?.018:.061,depth=closed?-.041:-.012,curve=new T.CatmullRomCurve3([V(x,.018,-.005),V(x,.044,-.009),V(x,.052,depth*.7),V(x,tip,depth)]);gs.push(new T.TubeGeometry(curve,9,.0095,7,false));oval(x,tip,depth,.0095,.010,.0095);}const thumb=new T.CatmullRomCurve3([V(side*.033,-.017,-.004),V(side*.049,.003,-.017),V(side*.041,.024,-.034),V(side*.022,.026,-.039)]);gs.push(new T.TubeGeometry(thumb,10,.013,8,false));return merged(gs);}
function build_bootGeometry(){const upper=new RoundedBoxGeometry(.137,.083,.242,3,.025);upper.translate(0,.004,-.005);const heel=new RoundedBoxGeometry(.125,.075,.105,2,.018);heel.translate(0,.008,.073);const ankle=new RoundedBoxGeometry(.102,.064,.099,2,.015);ankle.translate(0,.039,.064);return merged([upper,heel,ankle]);}
function build_soleGeometry(){const base=new RoundedBoxGeometry(.145,.025,.265,2,.013);base.translate(0,-.045,-.004);const gs=[base];for(let k=0;k<7;k++){const g=new T.BoxGeometry(.114,.006,.013);g.translate(0,-.059,-.105+k*.034);gs.push(g);}return merged(gs);}
function build_bodyDetail(){const gs=[];for(const [size,pos]of [[[.009,.37,.005],[0,.26,-.121]],[[.12,.018,.006],[0,.083,-.112]],[[.036,.042,.007],[-.12,.37,-.111]],[[.036,.042,.007],[.12,.37,-.111]]]){const g=new T.BoxGeometry(...size);g.translate(...pos);gs.push(g);}const collar=new T.TorusGeometry(.081,.008,6,24);collar.rotateX(Math.PI/2);collar.scale(1.25,1,.85);collar.translate(0,.539,0);gs.push(collar);return merged(gs);}
function build_badgeGeometry(){const front=new T.PlaneGeometry(.115,.050);front.rotateY(Math.PI);front.translate(-.095,.33,-.122);const back=new T.PlaneGeometry(.235,.105);back.translate(0,.33,.124);return merged([front,back]);}
function build_labelTexture(){const c=document.createElement('canvas');c.width=256;c.height=112;const x=c.getContext('2d');x.fillStyle='#17393c';x.fillRect(0,0,256,112);x.fillStyle='#d6e2d5';x.textAlign='center';x.font='bold 62px sans-serif';x.fillText('F1M',128,64);x.font='19px sans-serif';x.fillText('P I T   C R E W',128,94);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;}
function build_fabricTexture(){const n=64,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=((x+y)%2?147:109)+Math.round(9*Math.sin(x*1.9+y*.7)),i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}const t=new T.DataTexture(data,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(6,7);t.needsUpdate=true;return t;}
function build_helmetTrim(){const gs=[];const lip=new T.CatmullRomCurve3(Array.from({length:21},(_,i)=>{const a=(i/20*2-1)*1.18;return V(.134*Math.sin(a),.067,-.134*Math.cos(a));}));gs.push(new T.TubeGeometry(lip,20,.0045,5,false));for(const x of [-.028,0,.028]){const g=new T.BoxGeometry(.018,.006,.004);g.translate(x,-.086,-.115);gs.push(g);}for(const side of [-1,1]){const g=new T.SphereGeometry(1,8,6);g.scale(.006,.028,.026);g.translate(side*.125,-.025,.005);gs.push(g);}return merged(gs);}
// Bounded cross-garage pose reuse: identical local contacts share solved matrices.
const sharedCrew39=new Map(),sharedLimit39=4096;
export class CrewBatch{
 constructor(scene,count=20){
  this.count=count;this.poseCache37=new Map();this.dirtyParts37=new Set();this.cacheStats37={hits:0,solves:0,uploads:0,sharedHits39:0};this.parts=new Map();this.scene=scene;this.metrics={maxArmError:0,maxLegError:0,actors:count};
  const mat=(name,color,roughness=.85)=>new T.MeshStandardMaterial({name,color,roughness,metalness:0});
  this.mats={suit:mat('Crew fabric',0x235b5c),dark:mat('Stretch panels',0x20494d),light:mat('Shoulder fabric',0x3d6968),helmet:mat('Helmet shell',0xd9dfd8,.43),visor:mat('Visor',0x0a1c26,.25),glove:mat('Nomex gloves',0xc5c5b6),sole:mat('Rubber boots',0x17252a)};
  this.mats.visor.side=T.DoubleSide;this.mats.visor.metalness=.45;this.mats.visor.roughness=.17;this.mats.suit.bumpMap=fabricTexture();this.mats.suit.bumpScale=.0013;this.mats.light.bumpMap=this.mats.suit.bumpMap;this.mats.light.bumpScale=.0008;this.mats.glove.roughness=.96;this.mats.boot=mat('Fireproof shoe upper',0x263a3d);this.mats.piping=mat('Muted suit piping',0x71938b);this.mats.badge=mat('Printed team patch',0xffffff);this.mats.badge.map=labelTexture();this.mats.badge.side=T.DoubleSide;
  const sphere=new T.SphereGeometry(1,18,12),cyl=limbGeometry;
  this.add('torso',torsoGeometry(),this.mats.suit);this.add('bodyDetail',bodyDetail(),this.mats.dark);this.add('badge',badgeGeometry(),this.mats.badge);this.add('helmetTrim',helmetTrim(),this.mats.dark);this.add('pelvis',sphere,this.mats.dark);this.add('helmet',helmetGeometry(),this.mats.helmet);this.add('visor',visorGeometry(),this.mats.visor);this.add('neck',sphere,this.mats.dark);
  const stripePoints=[V(0,.058,-.119),V(0,.135,-.07),V(0,.158,0),V(0,.130,.075),V(0,.045,.12)];
  const stripe=new T.TubeGeometry(new T.CatmullRomCurve3(stripePoints),20,.012,6,false);this.add('helmetStripe',stripe,mat('Crew role helmet stripe',0xeeeadd,.55));
  for(const s of ['L','R']){
   this.add('upperArm'+s,cyl(.082,.068),this.mats.suit);this.add('foreArm'+s,cyl(.069,.047),this.mats.suit);this.add('shoulder'+s,sphere,this.mats.light);this.add('elbow'+s,sphere,this.mats.suit);
   this.add('thigh'+s,cyl(.105,.076),this.mats.suit);this.add('shin'+s,cyl(.076,.051),this.mats.suit);this.add('knee'+s,sphere,this.mats.suit);this.add('boot'+s,bootGeometry(),this.mats.boot);this.add('sole'+s,soleGeometry(),this.mats.sole);this.add('hand'+s,gloveGeometry(s==='L'?-1:1,true),this.mats.glove);this.add('handRelaxed'+s,gloveGeometry(s==='L'?-1:1,false),this.mats.glove);const cuff=new T.CylinderGeometry(.045,.050,.038,12);this.add('cuff'+s,cuff,this.mats.dark);const pad=new RoundedBoxGeometry(.044,.042,.009,2,.006);pad.translate(0,-.005,.026);this.add('glovePad'+s,pad,this.mats.dark);const lace=merged([-.04,-.01,.02].map(z=>{const g=new T.BoxGeometry(.073,.004,.007);g.translate(0,.048,z);return g;}));this.add('lace'+s,lace,this.mats.piping);
  }
  const colors=[0x7fc8b4,0x7fabc7,0xd0b875,0xc68b80];for(let i=0;i<count;i++){const col=new T.Color(i<12?colors[Math.floor(i/3)]:0xc1d4cc);this.parts.get('helmetStripe').setColorAt(i,col);this.parts.get('shoulderL').setColorAt(i,col);this.parts.get('shoulderR').setColorAt(i,col);}
 }
 setBounds37(box){this.bounds37??=box.clone();this.bounds37.union(box);const sphere=this.bounds37.getBoundingSphere(new T.Sphere());for(const m of this.parts.values()){m.boundingSphere=sphere.clone();m.frustumCulled=true;m.updateMatrix();m.matrixAutoUpdate=false;}}
 setVisible(visible){for(const m of this.parts.values())m.visible=visible;}
 add(key,g,mat){const o=new T.InstancedMesh(g,mat,this.count);o.name='Crew '+key;o.instanceMatrix.setUsage(T.DynamicDrawUsage);o.castShadow=true;o.frustumCulled=false;this.scene.add(o);this.parts.set(key,o);}
 set(key,i,pos,scale=ONE,quat=null){M.compose(pos,quat??Q.identity(),scale);this.parts.get(key).setMatrixAt(i,M);this.dirtyParts37.add(key);}
 hide(i){this.poseCache37.delete(i);M.makeScale(0,0,0);for(const [key,m] of this.parts){m.setMatrixAt(i,M);this.dirtyParts37.add(key);}}
 link(key,i,a,b){Q.setFromUnitVectors(Y,b.clone().sub(a).normalize());this.set(key,i,a.clone().add(b).multiplyScalar(.5),V(1,a.distanceTo(b),1),Q);}
 pose(i,anchor,yaw,{crouch=0,hands=null,feet=null,walk=0,stride=0,speed=0,posture=null,sideLean=0,lean=.09,look=0,collision=null}={}){
  const signature=[anchor.x,anchor.y,anchor.z,yaw,crouch,walk,stride,speed,sideLean,lean,posture?.height,posture?.bend,hands?.length??-1,feet?.length??-1];
  for(const h of hands??[])signature.push(h.x,h.y,h.z);
  for(const f of feet??[])signature.push(f.world.x,f.world.y,f.world.z,f.yaw,f.roll);
  const collisionKey=collision?.cacheKey37??JSON.stringify([collision?.wheels,collision?.props]);
  const cached=this.poseCache37.get(i);
  if(cached&&cached.collisionKey===collisionKey&&cached.signature.length===signature.length&&signature.every((v,n)=>v===cached.signature[n])){
   this.cacheStats37.hits++;this.debug??=[];this.debug[i]=cached.debug;
   if(cached.look===look)return;cached.look=look;
   const headQ=cached.rotation.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(cached.pitch,cached.yaw+look,0)));
   for(const part of ['helmet','visor','helmetStripe','helmetTrim'])this.set(part,i,cached.head,ONE,headQ);
   return;
  }
  const round39=v=>typeof v==='number'?Math.round(v*1e6)/1e6:v,shareKey39=JSON.stringify(signature.map(round39))+':'+(collision?.sharedKey39??collisionKey);
  const shared39=sharedCrew39.get(shareKey39);
  if(shared39){this.debug??=[];this.cacheStats37.sharedHits39++;for(const [key,matrices] of shared39.matrices){const part=this.parts.get(key);part.instanceMatrix.array.set(matrices,i*16);this.dirtyParts37.add(key);}this.debug[i]=shared39.meta.debug;const meta39={...shared39.meta,signature,collisionKey,look},head39=meta39.rotation.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(meta39.pitch,meta39.yaw+look,0)));for(const part of ['helmet','visor','helmetStripe','helmetTrim'])this.set(part,i,meta39.head,ONE,head39);this.poseCache37.set(i,meta39);return;}
  this.cacheStats37.solves++;
  const rot=new T.Quaternion().setFromAxisAngle(Y,yaw),world=p=>p.clone().applyQuaternion(rot).add(anchor),local=p=>p.clone().sub(anchor).applyQuaternion(rot.clone().invert());
  const c=Math.max(0,Math.min(1.15,crouch)),fit=posture?contactPoseAt(anchor,yaw,posture,hands):fitContactPose(anchor,yaw,c,hands,feet);
  const pelvisY=fit.height,pelvis=V(0,pelvisY,0),chest=fit.chest.clone(),chestQ=fit.q.clone();
  chestQ.multiply(new T.Quaternion().setFromAxisAngle(V(0,0,1),sideLean));
  this.set('pelvis',i,world(pelvis),V(.17,.13,.12),rot);this.set('torso',i,world(chest),ONE,rot.clone().multiply(chestQ));this.set('bodyDetail',i,world(chest),ONE,rot.clone().multiply(chestQ));this.set('badge',i,world(chest),ONE,rot.clone().multiply(chestQ));
  const neck=V(0,.56,0).applyQuaternion(chestQ).add(chest),head=V(0,.69,0).applyQuaternion(chestQ).add(chest),attention=hands&&speed<.35?hands[0].clone().add(hands[1]).multiplyScalar(.5):null;let pitch=.015,headYaw=look;if(attention){const aim=local(attention).sub(head).applyQuaternion(chestQ.clone().invert()),weight=T.MathUtils.clamp(1-speed/.35,0,1);pitch=T.MathUtils.clamp(Math.atan2(aim.y,Math.hypot(aim.x,aim.z)),-.60,.12)*weight;headYaw+=T.MathUtils.clamp(Math.atan2(-aim.x,-aim.z),-.38,.38)*weight;}const headQ=rot.clone().multiply(chestQ).multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch,headYaw,0)));
  this.set('neck',i,world(neck),V(.069,.065,.069),rot);this.set('helmet',i,world(head),ONE,headQ);this.set('visor',i,world(head),ONE,headQ);this.set('helmetStripe',i,world(head),ONE,headQ);this.set('helmetTrim',i,world(head),ONE,headQ);
  this.debug??=[];this.debug[i]={maxReachError:0,legError:0,handTargets:hands?.map(h=>h.toArray())??[],actualHands:[],actualElbows:[],bodyPoints:[{p:world(pelvis).toArray(),r:.17},{p:world(V(0,.28,0).applyQuaternion(chestQ).add(chest)).toArray(),r:.19},{p:world(head).toArray(),r:.14}]};
  for(const [j,s]of [[-1,'L'],[1,'R']]){
   const shoulder=V(j*.195,.445,0).applyQuaternion(chestQ).add(chest),hip=V(j*.105,pelvisY-.02,.015);
   const phase=walk+(j<0?0:Math.PI),swing=Math.sin(phase)*stride,lift=Math.max(0,Math.cos(phase))*stride*.36;
   const footInfo=feet?.[j<0?0:1];
   const foot=footInfo?local(footInfo.world):V(j*(.145+.025*c),.075+lift,(j<0?-.10:.12)+swing+(j>0?.30*c:0));
   const ankle=foot.clone().add(V(0,.025,.035)),knee=clearJoint(hip,ankle,.445,.435,V(j*.15,.20,-.55),world,collision,.075);
   const hand=hands?local(hands[j<0?0:1]):V(j*.25,pelvisY-.08,-.07+Math.sin(phase+Math.PI)*stride*.50);
   const reach=hand.clone().sub(shoulder),reachError=Math.max(0,reach.length()-.585);if(reachError>0)hand.copy(shoulder).add(reach.setLength(.585));
   this.debug[i].actualHands.push(world(hand).toArray());this.debug[i].maxReachError=Math.max(this.debug[i].maxReachError,reachError);
   const elbow=clearJoint(shoulder,hand,.305,.295,V(j*(hands?.33:.28),pelvisY+.22,hands?-.20:-.10),world,collision,.06);
   this.debug[i].actualElbows.push(world(elbow).toArray());
   this.link('upperArm'+s,i,world(shoulder),world(elbow));this.link('foreArm'+s,i,world(elbow),world(hand));
   this.set('shoulder'+s,i,world(shoulder),V(.077,.077,.075),rot);this.set('elbow'+s,i,world(elbow),V(.059,.061,.059),rot);
   this.link('thigh'+s,i,world(hip),world(knee));this.link('shin'+s,i,world(knee),world(ankle));this.set('knee'+s,i,world(knee),V(.078,.081,.083),rot);
   const footQ=footInfo?new T.Quaternion().setFromEuler(new T.Euler(footInfo.roll,footInfo.yaw,0)):rot;const bootCenter=footInfo?footInfo.world.clone().add(V(0,-.018,-.055).applyQuaternion(footQ)):world(foot.clone().add(V(0,-.018,-.055)));this.set('boot'+s,i,bootCenter,ONE,footQ);this.set('sole'+s,i,bootCenter,ONE,footQ);this.set('lace'+s,i,bootCenter,ONE,footQ);
   this.debug[i].bodyPoints.push({p:world(knee).toArray(),r:.075},{p:world(ankle).toArray(),r:.05});
   this.debug[i].legError=Math.max(this.debug[i].legError,Math.abs(knee.distanceTo(ankle)-.435));
   const handQ=rot.clone().multiply(new T.Quaternion().setFromUnitVectors(Y,hand.clone().sub(elbow).normalize()));const closed=!!hands;this.set('hand'+s,i,world(hand),closed?ONE:V(),handQ);this.set('handRelaxed'+s,i,world(hand),closed?V():ONE,handQ);this.set('glovePad'+s,i,world(hand),ONE,handQ);const cuffCenter=world(hand).add(V(0,-.047,0).applyQuaternion(handQ));this.set('cuff'+s,i,cuffCenter,ONE,handQ);
  }
  this.poseCache37.set(i,{signature,collisionKey,head:world(head),rotation:rot.clone().multiply(chestQ),pitch,look,yaw:headYaw-look,debug:this.debug[i]});
  const meta39=this.poseCache37.get(i);sharedCrew39.set(shareKey39,{meta:{...meta39},matrices:[...this.parts].map(([key,part])=>[key,part.instanceMatrix.array.slice(i*16,i*16+16)])});if(sharedCrew39.size>sharedLimit39)sharedCrew39.delete(sharedCrew39.keys().next().value);
 }
 flush(){for(const key of this.dirtyParts37){this.parts.get(key).instanceMatrix.needsUpdate=true;this.cacheStats37.uploads++;}this.dirtyParts37.clear();}
}

// Immutable authored geometry/atlases shared across the six garages and grid.
const crewAssetCache10=new Map();
function torsoGeometry(...args){const key="torsoGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_torsoGeometry(...args));return crewAssetCache10.get(key);}
function limbGeometry(...args){const key="limbGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_limbGeometry(...args));return crewAssetCache10.get(key);}
function helmetGeometry(...args){const key="helmetGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_helmetGeometry(...args));return crewAssetCache10.get(key);}
function visorGeometry(...args){const key="visorGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_visorGeometry(...args));return crewAssetCache10.get(key);}
function gloveGeometry(...args){const key="gloveGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_gloveGeometry(...args));return crewAssetCache10.get(key);}
function bootGeometry(...args){const key="bootGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_bootGeometry(...args));return crewAssetCache10.get(key);}
function soleGeometry(...args){const key="soleGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_soleGeometry(...args));return crewAssetCache10.get(key);}
function bodyDetail(...args){const key="bodyDetail:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_bodyDetail(...args));return crewAssetCache10.get(key);}
function badgeGeometry(...args){const key="badgeGeometry:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_badgeGeometry(...args));return crewAssetCache10.get(key);}
function labelTexture(...args){const key="labelTexture:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_labelTexture(...args));return crewAssetCache10.get(key);}
function fabricTexture(...args){const key="fabricTexture:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_fabricTexture(...args));return crewAssetCache10.get(key);}
function helmetTrim(...args){const key="helmetTrim:"+JSON.stringify(args);if(!crewAssetCache10.has(key))crewAssetCache10.set(key,build_helmetTrim(...args));return crewAssetCache10.get(key);}
