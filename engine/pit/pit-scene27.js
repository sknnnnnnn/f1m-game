import * as T from 'three';
import {CrewBatch} from './crew/crew-rig.js';
import {CrewMotion} from './crew/crew-motion.js';
import {createRaceJack} from './crew/pit-equipment.js';
import {createPitRoom} from './crew/pit-room.js';
import {createPitCraft} from './crew/pit-craft.js';
import {parkingSpot} from './crew/pit-layout.js';
import {pitClock27,PIT_CYCLE27} from './pit-cycle27.js';
import {circuit} from '../tracks/track.js';
import {pitRoad,stallStation} from './pit-lane.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0),smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const work=[];
for(let i=0;i<4;i++){const side=i%2?1:-1,z=i<2?-1.65:1.95;work.push({pos:V(side*1.65,0,z),yaw:side*Math.PI/2},{pos:V(side*2.32,0,z-.72),yaw:side*Math.PI/2},{pos:V(side*2.32,0,z+.72),yaw:side*Math.PI/2});}
work.push({pos:V(0,0,-3.75),yaw:Math.PI},{pos:V(0,0,3.75),yaw:0},{pos:V(-1.65,0,.1),yaw:-Math.PI/2},{pos:V(1.65,0,.1),yaw:Math.PI/2},{pos:V(-4.3,0,-4.7),yaw:-Math.PI/2},{pos:V(-1.8,0,-4.8),yaw:-Math.PI/2},{pos:V(1.8,0,-4.8),yaw:Math.PI/2},{pos:V(-2.5,0,-5.8),yaw:-Math.PI/2},{pos:V(2.5,0,-5.8),yaw:Math.PI/2},{pos:V(-3.1,0,2.9),yaw:-Math.PI/2});
// The imported navigator supplies right-of-way, separation and planted feet.
function transit27(returning=false){return new CrewMotion(t=>({state:{garage:true,presentation:true,t,carZ:0,releaseAt:Infinity,propObstacles:[]},wheels:[],actors:work.map((w,i)=>{const h=parkingSpot(i),home=V(h.x,0,h.z),u=smooth((t-(i%3)*.55)/12),from=returning?w.pos:home,to=returning?home:w.pos;return {pos:from.clone().lerp(to,u),yaw:w.yaw,crouch:0,hands:null,walkSpeed:2.5};})}),18);}
export function pitScene27(scene,camera){
 const kits=new Map();let deploy=null,returning=null,lastTime=-1,lastGeneration=null;
 async function prepare(models){deploy??=transit27();returning??=transit27(true);for(const [id,m] of models){kit(id,m).root.visible=false;await new Promise(requestAnimationFrame);}}
 function mark(root){root.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){o.userData.modelMesh=true;o.castShadow=true;o.receiveShadow=true;}});}
 function kit(id,m){const root=new T.Group();root.name='PIT_FLOW_06_1_CAR_'+id;scene.add(root);const q=pitRoad(id).at(stallStation(id));root.position.set(q.x,.045,-q.y);root.rotation.y=q.psi-Math.PI/2;
  const crew=new CrewBatch(root,22),garage=createPitRoom(root),craft=createPitCraft(root,camera),front=createRaceJack(root),rear=createRaceJack(root);rear.rotation.y=Math.PI;front.position.set(0,0,-2.65);rear.position.set(0,0,2.85);
  // The main race keeps its accepted shell and FR/RB wings. Loose tyres are
  // clones of that car's own wheels; no demo car is placed over the race car.
  const wheels=m.wheels.map((w,i)=>{const center=w.turn.position.clone().multiplyScalar(m.visualScale),old=w.spin.clone(true),fresh=w.spin.clone(true);for(const o of [old,fresh]){o.scale.setScalar(m.visualScale);root.add(o);}return {center,old,fresh,side:Math.sign(center.x)||1};});
  const tools=Array.from({length:4},()=>{const g=new T.Group(),body=new T.Mesh(new T.CylinderGeometry(.045,.055,.24,10),new T.MeshStandardMaterial({color:0x294c50,metalness:.5}));body.rotation.x=Math.PI/2;g.add(body);const handle=new T.Mesh(new T.BoxGeometry(.055,.13,.065),body.material);handle.position.y=-.07;g.add(handle);root.add(g);return g;});
  const wingMeshes=[];m.detail22.wing.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('FW_'))wingMeshes.push(o);});
  const oldWing=new T.Group(),freshWing=new T.Group();for(const mesh of wingMeshes){for(const g of [oldWing,freshWing]){const c=mesh.clone();mesh.updateWorldMatrix(true,false);m.root.updateWorldMatrix(true,false);c.matrix.copy(m.root.matrixWorld).invert().multiply(mesh.matrixWorld);c.matrixAutoUpdate=false;g.add(c);}}oldWing.scale.setScalar(m.visualScale);freshWing.scale.setScalar(m.visualScale);root.add(oldWing,freshWing);
  const k={root,crew,garage,craft,front,rear,wheels,tools,wingMeshes,oldWing,freshWing,lastService:null,returnAt:null};mark(root);kits.set(id,k);return k;
 }
 function update(p,cars,models,time,cpu,replay=false,audio=null,running=false){if(p.generation!==lastGeneration||time<lastTime){for(const k of kits.values()){k.returnAt=null;k.lastService=null;k.wasActive=false;k.craft.sound.silence();}lastGeneration=p.generation;}lastTime=time;for(const [id,k] of kits){k.root.visible=false;const old=scene.getObjectByName('Legacy_Garage_26_'+id);if(old)old.visible=true;}if(replay||p.ceremony26)return;
  for(const car of cars){const m=models.get(car.id);if(!m||car.id>6)continue;const pit=car.pit,f=pit?.flow27;let k=kits.get(car.id);const needed=f||pit?.active||k?.wasActive||k?.returnAt&&time-k.returnAt<18;if(!needed)continue;
   if(!k){if(!deploy)continue;k=kit(car.id,m);}k.root.visible=true;const oldGarage=scene.getObjectByName('Legacy_Garage_26_'+car.id);if(oldGarage)oldGarage.visible=false;k.crew.setVisible(!cpu);k.craft.setVisible(!cpu);const clock=pitClock27(pit,time),servicing=!!clock&&['SERVICE','RELEASE','PIT_OUT','YIELD','MERGE'].includes(pit.phase),at=servicing?clock.t:0;
   if(servicing&&k.lastService!==f?.serviceAt){k.lastService=f?.serviceAt;k.returnAt=null;}
   if(!pit.active&&!f&&k.wasActive)k.returnAt=time;k.wasActive=!!(f||pit.active);
   let actors,mode='deploy';if(k.returnAt){mode='return';actors=returning.sample(time-k.returnAt);}else if(servicing){actors=deploy.sample(18);}else actors=deploy.sample(Math.max(0,time-(f?.calledAt??time)));
   const lift=servicing?clock.lift:0,withdraw=servicing?clock.withdraw:0,working=servicing&&at>=.8&&withdraw<1;
   // Hands and carried assemblies share anchors. Only service props move;
   // authoritative race-car X/Y and the frozen collision guard are untouched.
   actors.forEach((a,i)=>{if(!a)return;if(servicing&&withdraw>0){const d=i<12?(i%3===0?.45:1.0):.6;a.pos.x+=(Math.sign(a.pos.x)||1)*withdraw*d;a.feet.forEach(f=>f.world.x+=(Math.sign(a.pos.x)||1)*withdraw*d);}
    if(working&&i<12){const wheel=k.wheels[Math.floor(i/3)],side=wheel.side,oldU=smooth((at-1.5)/1.1),newU=smooth((at-3)/1.3),center=wheel.center.clone();center.y+=lift;
     if(i%3===0){const point=center.clone().add(V(side*.22,0,0));a.hands=[point.clone().add(V(0,.035,-.04)),point.clone().add(V(0,-.04,.04))];}
     else if(i%3===1&&oldU>0){center.x+=side*(.12+1.25*oldU);a.hands=[center.clone().add(V(0,.20,-.19)),center.clone().add(V(0,.20,.19))];}
     else if(i%3===2&&newU<1){center.x+=side*(1.37*(1-newU));a.hands=[center.clone().add(V(0,.20,-.19)),center.clone().add(V(0,.20,.19))];}
     a.crouch=.85;
    }
    if(clock?.nose&&servicing&&i>=17&&i<=20&&at>5&&at<10.5){const old=i<19,u=old?smooth((at-5)/2):1-smooth((at-8)/2.5),dx=(old?-2:2)*u,dz=-2*u,side=i%2?-1:1,prior=a.pos.clone();a.pos.set(side*1.55+dx,0,-3.65+dz);const shift=a.pos.clone().sub(prior);a.feet.forEach(f=>f.world.add(shift));a.yaw=side*Math.PI/2;const hand=V(side*.9+dx,.72,-3.15+dz);a.hands=[hand.clone().add(V(0,0,-.055)),hand.clone().add(V(0,0,.055))];a.crouch=.3;}
    k.crew.pose(i,a.pos,a.yaw,{...a,collision:{wheels:[],props:k.garage.obstacles}});
   });for(const part of k.crew.parts.values())part.instanceMatrix.needsUpdate=true;
   k.front.visible=k.rear.visible=!!servicing&&at<clock.duration;k.front.userData.animate(lift,Math.min(1,lift/.11));k.rear.userData.animate(lift,Math.min(1,lift/.11));
   for(let i=0;i<4;i++){const wheel=k.wheels[i],removed=servicing&&at>=1.5&&at<4.3;for(const set of [m.wheels,m.low.wheels])if(set[i])set[i].spin.visible=!removed;
    wheel.old.visible=!!k.returnAt||servicing&&at>=1.5&&at<clock.duration+2;wheel.fresh.visible=!k.returnAt&&(!servicing||at<4.3);
    wheel.old.position.copy(wheel.center);wheel.old.position.x+=wheel.side*(.12+1.25*smooth((at-1.5)/1.1));wheel.old.position.y+=lift;
    wheel.fresh.position.copy(wheel.center);wheel.fresh.position.x+=wheel.side*(servicing?1.37*(1-smooth((at-3)/1.3)):2);wheel.fresh.position.y+=lift;
    if(!servicing){const carrier=actors[i*3+(k.returnAt?1:2)];if(carrier){(k.returnAt?wheel.old:wheel.fresh).position.copy(carrier.pos).add(V(0,.65,-.28));}}
    const a=actors[i*3],point=wheel.center.clone().add(V(wheel.side*.23,lift,0));k.tools[i].visible=!cpu&&at<5.1;k.tools[i].position.copy(working?point:a.pos.clone().add(V(0,.9,-.3)));k.tools[i].rotation.z=working?Math.sin(time*120)*.012:0;
   }
   k.oldWing.visible=k.freshWing.visible=!!clock?.nose&&servicing&&at>5&&at<10.5;if(clock?.nose&&servicing){const hide=at>5&&at<10.5;for(const detail of [m.detail22,m.lowDetail22])detail.wing.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('FW_'))o.visible=!hide;});k.oldWing.position.set(-2*smooth((at-5)/2),.45*smooth((at-5)/2), -2*smooth((at-5)/2));k.freshWing.position.set(2*(1-smooth((at-8)/2.5)),.45*(1-smooth((at-8)/2.5)),-2*(1-smooth((at-8)/2.5)));}
   if(servicing&&lift>0)for(const r of [m.root,m.low.root])r.position.y+=lift;
   // Existing pit radio and engine audio remain; imported Foley is available
   // when enabled through the game's sound control, never autoplayed here.
   if(audio?.context){const sound=k.craft.sound;if(!sound.ctx){sound.ctx=audio.context;sound.master=sound.ctx.createGain();sound.master.gain.value=.5;sound.master.connect(audio.master);}sound.enabled=audio.enabled;
    k.root.updateMatrixWorld(true);const frame={actors:actors.map(a=>a?{...a,feet:a.feet.map(f=>({...f,world:k.root.localToWorld(f.world.clone())}))}:null),tools:k.tools.map(tool=>({position:k.root.localToWorld(tool.position.clone()),visible:tool.visible})),loads:[],crewMode:servicing?null:mode,state:{lift,phase:at,corners:Array.from({length:4},()=>({unlock:servicing&&at>1?1:0,tighten:servicing&&at>4.4?1:0}))}};sound.update(frame,time,running);}

  }
 }
 function restore(models){for(const m of models.values()){for(const set of [m.wheels,m.low.wheels])for(const w of set)w.spin.visible=true;for(const detail of [m.detail22,m.lowDetail22])detail.wing.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('FW_'))o.visible=true;});}}
 return {prepare,update,restore,kits};
}
