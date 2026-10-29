import {readPlan58,writePlan58} from './plan-cache58.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {PitLoads} from './pit-loads.js';
import {CrewPresentation,blendActor} from './crew-presentation.js';
import {PIT_LAYOUT as PIT} from './pit-layout.js';
import {BRAKE as B} from './brake-service.js';
import {supportContacts} from './garage-support.js';
import {gripError,fitContactPose} from './contact-pose.js';
import {phaseAt,wallAt,addHold,actionGates,crewParked,workReleased,departureClear} from './service-clock.js';
import {createRaceJack} from './pit-equipment.js';
import {clearTyres,tyreGap} from './tyre-clearance.js';
import {CrewBatch} from './crew-rig.js';
import {CrewMotion,outside,obstruction,propGap} from './crew-motion.js';
import {MODES,sampleProcedure as baseProcedure,ramp,clamp} from './procedure.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const geometryPlans29=new Map();export const pitPlanStats58={built:0,reused:0};
// Source: Pit Flow 06.2 app.js. Original layout, IK motion gates, loads and
// deployment/return choreography are retained; browser/demo controls removed.
export function racePitRuntime28(scene,car,props=[]){
 let flowCombined=false,externalPose=null,flowReady=true,time=0,mode='tyres',traffic=false,fault=false;
 function sampleProcedure(m,t,o){const s=baseProcedure(m,t,o);if(flowCombined&&m==='nose')s.corners=baseProcedure('tyres',t,o).corners;return s;}
 const crew=new CrewBatch(scene,22),scenery={signal:[{emissiveIntensity:0},{emissiveIntensity:0}]};
 const newNose=car.nose.clone(true),newRear=car.rear.root.clone(true);car.root.add(newNose,newRear);
 const bareHubs=[];for(const w of car.wheels){const hub=new T.Group();hub.position.copy(w.center);const disk=new T.Mesh(new T.CylinderGeometry(.25,.25,.07,28),new T.MeshStandardMaterial({color:0x667477,metalness:.75,roughness:.55}));disk.rotation.z=Math.PI/2;hub.add(disk);const cal=new T.Mesh(new RoundedBoxGeometry(.10,.19,.12,2,.02),new T.MeshStandardMaterial({color:0x982937,metalness:.3,roughness:.5}));cal.position.set(w.center.x<0?-.045:.045,.03,.17);hub.add(cal);car.root.add(hub);bareHubs.push({root:hub,disk,cal});}
 const tools=[];
 function tool(){const group=new T.Group(),metal=new T.MeshStandardMaterial({color:0x71848a,metalness:.8,roughness:.3}),dark=new T.MeshStandardMaterial({color:0x20363b,roughness:.5}),barrel=new T.Mesh(new T.CylinderGeometry(.044,.044,.23,14),metal);barrel.rotation.z=Math.PI/2;group.add(barrel);const grip=new T.Mesh(new RoundedBoxGeometry(.065,.14,.055,2,.015),dark);grip.position.set(.04,-.08,0);group.add(grip);const battery=new T.Mesh(new RoundedBoxGeometry(.11,.05,.09,2,.015),dark);battery.position.set(.04,-.155,0);group.add(battery);scene.add(group);tools.push(group);return group;}
 for(let i=0;i<4;i++)tool();
 const frontJack=createRaceJack(scene),rearJack=createRaceJack(scene),sideJack=createRaceJack(scene);
 const standMat=new T.MeshStandardMaterial({color:0xd8b86a,metalness:.4,roughness:.45}),standContacts=supportContacts(car.root),stands=standContacts.map(c=>{const o=new T.Mesh(new T.CylinderGeometry(.045,.14,c.height,4),standMat);o.position.set(c.x,c.height/2,c.z);scene.add(o);return o;});
 function brakeAssembly(){const g=new T.Group(),disk=new T.Mesh(new T.CylinderGeometry(.25,.25,.07,28),new T.MeshStandardMaterial({color:0x657477,metalness:.7,roughness:.5}));disk.rotation.z=Math.PI/2;g.add(disk);const cal=new T.Mesh(new RoundedBoxGeometry(.10,.19,.12,2,.02),new T.MeshStandardMaterial({color:0x982937,metalness:.3,roughness:.5}));cal.position.set(.045,.03,.17);g.add(cal);scene.add(g);return g;}
 const brakeOld=brakeAssembly(),brakeNew=brakeAssembly();
 const looseParts=new Map([...car.wheels.flatMap(w=>[w.root,w.newRoot]),car.nose,newNose].map(source=>{const clone=source.clone(true);clone.matrixAutoUpdate=false;clone.visible=false;scene.add(clone);return [source,clone];}));
 const logistics=new PitLoads({car,newNose,looseParts,tools,scene});
 let requests=[],wheelObstacles=[];
 function poseActor(i,pos,target,crouch,hands=null,sideLean=0){const aim=hands&&(i>=12&&i!==16||i<12&&i%3!==0)?hands[0].clone().add(hands[1]).multiplyScalar(.5):target;const d=aim.clone().sub(pos),yaw=Math.atan2(-d.x,-d.z);requests[i]={pos:pos.clone(),yaw,crouch,hands,sideLean,target:target.clone()};}
 function wheelGrip(center,s){return [center.clone().add(V(s*.11,.10,s*.215)),center.clone().add(V(s*.11,.10,-s*.215))];}
 const panelCenter=car.panels.center.clone(),rearCenter=car.rear.center.clone(),noseMinY=new T.Box3().setFromObject(car.nose).min.y,rearMinY=new T.Box3().setFromObject(car.rear.root).min.y,panelMinY=new T.Box3().setFromObject(car.panels.root).min.y;
 const rackMat=new T.MeshStandardMaterial({color:0x44585d,metalness:.6,roughness:.5});
 function rack(x,z,w,d,h){const g=new T.Group();g.userData={w,d,h};g.position.set(x,0,z);scene.add(g);const beam=(px,py,pz,sx,sy,sz)=>{const m=new T.Mesh(new RoundedBoxGeometry(sx,sy,sz,2,.018),rackMat);m.position.set(px,py,pz);m.castShadow=true;g.add(m);};for(const sx of [-1,1])for(const sz of [-1,1])beam(sx*w*.43,h*.5,sz*d*.43,.045,h,.045);beam(0,h-.035,0,w,.07,d);return g;}
 const rearRacks=[rack(-3.4,rearCenter.z+1.25,1.1,.80,.55),rack(3.4,rearCenter.z+1.25,1.1,.80,.55)],panelRack=rack(-3.4+panelCenter.x,panelCenter.z,.85,.72,.60),brakeRack=rack(car.wheels[1].center.x+3.2,car.wheels[1].center.z-.80,.50,.42,.65),brakeFreshRack=rack(car.wheels[1].center.x+3.2,car.wheels[1].center.z+.80,.50,.42,.65);

 const tablet=new T.Mesh(new RoundedBoxGeometry(.30,.19,.018,2,.015),new T.MeshStandardMaterial({color:0x132a31,roughness:.35}));tablet.position.set(5.16,1.02,-4.85);tablet.rotation.x=-.25;scene.add(tablet);
 const boundedPlans37=new WeakSet();let current=null,activeHolds=[],activeTiming={crewReadyAt:0,releasePermitAt:0};
 function layoutPose(wallTime){
  const time=phaseAt(wallTime,activeHolds);
  requests=Array(22).fill(null);wheelObstacles=[];
  const state=sampleProcedure(mode,time,{traffic,fault,...activeTiming});state.phase=time;state.wallTime=wallTime;state.duration+=activeHolds.reduce((s,h)=>s+h.duration,0);current=state;car.root.rotation.y=0;car.nose.visible=true;car.wheels.forEach(w=>w.root.visible=true);car.root.position.set(0,state.lift,state.carZ);
  const base=V(0,state.lift,state.carZ),retreat=state.crewRetreat,activeCar=Math.abs(state.carZ)<.15;
  car.wheels.forEach((w,i)=>{
   if(mode!=='tyres'&&!flowCombined&&!(mode==='brakes'&&i===1)){w.root.position.copy(w.center);w.newRoot.visible=false;wheelObstacles.push({id:i+'-fixed',x:w.center.x,z:w.center.z+state.carZ,y:w.center.y+state.lift});bareHubs[i].root.visible=false;tools[i].visible=false;for(let j=0;j<3;j++)requests[i*3+j]=null;return;}tools[i].visible=true;
   const s=w.center.x<0?-1:1,c=state.corners[i],center=w.center.clone().add(base);
   const oldOffset=V(s*(.95*c.pull+.65*c.oldAway),.12*c.oldAway,-(mode==='brakes'?2.20:.95)*c.oldAway);
   const spareX=mode==='brakes'?2.6-1.5*c.preload:1.40-.30*c.preload,spareZ=mode==='brakes'?2.6-1.65*c.preload:1.50;
   const newOffset=V(s*spareX*(1-c.mount),.12*(1-c.mount),spareZ*(1-c.mount));
   w.root.position.copy(w.center).add(oldOffset);w.root.position.z-=state.carZ*c.pull;w.root.position.y+=(.085-state.lift)*c.oldAway;
   w.newRoot.position.copy(w.center).add(newOffset);w.newRoot.position.z-=state.carZ*(1-c.mount);w.newRoot.position.y+=(.085-state.lift)*(1-c.mount);w.newRoot.visible=true;
   w.root.rotation.x=-state.carZ/.417*(1-c.pull);w.newRoot.rotation.x=-state.carZ/.417*c.mount;
   const wheelSetDown=state.garage?ramp(time,3.30,3.70):ramp(time,2.75+[0,.035,.055,.08][i]+2.45,2.75+[0,.035,.055,.08][i]+2.95);w.root.position.y=T.MathUtils.lerp(w.root.position.y,.43-state.lift,wheelSetDown);
   let oldWorld=w.root.position.clone().add(base),newWorld=w.newRoot.position.clone().add(base);
   if(mode==='brakes'){
    const parked=V(w.center.x+s*1.60,.43,w.center.z-2.20),staged=w.center.clone().add(V(s*1.10,.12,.95)).add(base);
    const returning=parked.clone().lerp(staged,c.preload).lerp(center,c.mount);newWorld=returning;
    if(time>=B.wheelPrepare){w.root.position.copy(returning).sub(base);oldWorld=returning.clone();}
    w.root.rotation.x=0;w.newRoot.visible=false;
   }
   for(const [key,p]of (mode==='brakes'?[['original',oldWorld]]:[['old',oldWorld],['new',newWorld]]))wheelObstacles.push({id:i+'-'+key,x:p.x,z:p.z,y:p.y});
   const duck=c.dodge*(1-c.gunReturn),exit=c.exit??0;
   const a0=state.garage?0:2.75+[0,.035,.055,.08][i],cross=state.garage?ramp(time,2.7,3.6):ramp(time,a0+1.45,a0+2.40+(fault&&i===1?1.25:0));
   const gunAnchor=V(w.center.x+s*(.84+.80*exit+.65*Math.sin(Math.PI*cross)*(1-c.gunReturn)),0,w.center.z+.95*duck*(1-2*cross));
   const a=state.garage?0:2.75+[0,.035,.055,.08][i],delay=fault&&i===1?1.25:0;
   const engage=activeCar?(state.garage?ramp(time,.82,1)*(1-ramp(time,1.40,1.75))+ramp(time,B.gunReady-.25,B.gunReady+.05)*(1-ramp(time,B.tightEnd,B.exitStart+.25)):ramp(time,a+.02,a+.16)*(1-ramp(time,a+.38,a+.65))+ramp(time,a+2.80+delay,a+3.0+delay)*(1-ramp(time,a+3.25+delay,a+3.45+delay))):0;
   const gunPos=gunAnchor.clone().add(V(-s*.25,.70,0)).lerp(center.clone().add(V(s*.27,.02,0)),engage);
   const gunHands=[gunPos.clone().add(V(s*.13,-.10,0)),gunPos.clone().add(V(s*.01,0,0))];
   tools[i].position.copy(gunPos);tools[i].rotation.z=s<0?Math.PI:0;
   poseActor(i*3,gunAnchor,center,T.MathUtils.lerp(.54+.26*duck,1.02,engage),gunHands,-s*.23*duck*(1-engage));requests[i*3].scripted=true;requests[i*3].carContact=engage>.05;requests[i*3].toolAttach=1-engage;requests[i*3].requiresGrip=c.unlock>0&&c.unlock<1||c.gunReturn>0&&c.exit===0;
   const reachOld=state.garage?ramp(time,1.40,2.02):ramp(time,a+.36,a+.92);
   const offWork=oldWorld.clone().add(V(s*.65,-oldWorld.y,-.40));
   const offAnchor=V(w.center.x+s*1.55,0,w.center.z-.95).lerp(offWork,reachOld);
   const carrierExit=state.garage?ramp(time,B.wheelMountEnd-.02,B.wheelMountEnd+.30):ramp(time,a+2.38+(fault&&i===1?1.25:0),a+2.70+(fault&&i===1?1.25:0));
   const onAnchor=newWorld.clone().sub(V(0,0,state.carZ*c.mount)).add(V(s*(.65+.60*carrierExit),-newWorld.y,.15+.85*carrierExit));
   if(mode==='brakes')onAnchor.copy(V(5.2,0,w.center.z+.6).lerp(onAnchor,ramp(time,4.9,B.wheelPrepare-.25)));
   const oldHeld=activeCar&&reachOld>.85&&exit<.1&&(mode!=='brakes'||time<3.70),newHeld=carrierExit<.15&&(mode!=='brakes'||time>=B.wheelPrepare-.22);
   if(mode==='brakes'&&time>3.7)offAnchor.lerp(V(4.8,0,w.center.z-3.3),ramp(time,3.7,4.5));
   poseActor(i*3+1,offAnchor,oldWorld,.85*(1-c.oldAway)+.25,oldHeld?wheelGrip(oldWorld,s):null);
   requests[i*3+1].scripted=true;requests[i*3+1].carContact=oldHeld&&c.pull<.99;requests[i*3+1].requiresGrip=(c.pull>0&&c.pull<1||c.oldAway>0&&c.oldAway<1)&&(mode!=='brakes'||time<3.7);
   poseActor(i*3+2,onAnchor,c.mount>=.999?w.center:newWorld,.45+.42*c.mount*(1-carrierExit),newHeld?wheelGrip(newWorld,s):null);requests[i*3+2].scripted=true;requests[i*3+2].carContact=newHeld&&c.mount>.95;requests[i*3+2].requiresGrip=c.mount>0&&c.mount<1;
   // Original brake work stays inside garage; the wheel remains off during the task.
   bareHubs[i].root.visible=mode==='brakes'||(activeCar&&c.pull>.1&&c.mount<.96);bareHubs[i].disk.visible=!(mode==='brakes'&&i===1);bareHubs[i].cal.visible=!(mode==='brakes'&&i===1);
  });
  const jackRetreat=ramp(time,state.downAt+.10,state.downAt+.70);
  frontJack.position.set(mode==='nose'?2.0*ramp(time,3.10,4.20):1.65*jackRetreat,0,-2.83-(mode==='nose'?ramp(time,3.10,4.20)*2.4:jackRetreat*.45));frontJack.rotation.y=0;
  rearJack.position.set(-1.9+.47*ramp(time,1.25,1.95)+1.43*ramp(time,1.96,2.50)-1.65*jackRetreat,0,2.83+jackRetreat*.45);rearJack.rotation.y=Math.PI;
  sideJack.position.set(-3+1.64*ramp(time,2.2,2.85)-1.25*ramp(time,state.downAt+.10,state.downAt+.70),0,-.75);sideJack.rotation.y=Math.PI/2;sideJack.visible=mode==='nose';
  const frontDistance=Math.hypot(frontJack.position.x,frontJack.position.z+2.83);frontJack.userData.roll(frontDistance,Math.atan2(frontJack.position.x,frontJack.position.z+2.83));
  rearJack.userData.roll(1.9*ramp(time,1.25,2.25)+Math.hypot(1.65,.65)*jackRetreat,time<2.25?-Math.PI/2:Math.atan2(1.65,-.65));
  sideJack.userData.roll(1.64*ramp(time,2.2,2.85)+1.25*ramp(time,state.downAt+.10,state.downAt+.70),time<state.downAt+.15?0:Math.PI);
  frontJack.visible=!state.garage;rearJack.visible=!state.garage;stands.forEach(o=>o.visible=state.garage);
  const press=ramp(time,2.55,2.85)*(1-ramp(time,state.downAt+.70,state.downAt+1.00));
  frontJack.userData.animate(state.lift*(mode==='nose'?1-ramp(time,3.10,4.20):1),mode==='nose'?press*(1-ramp(time,3.05,3.75)):press);rearJack.userData.animate(state.lift,press);sideJack.userData.animate(state.lift,ramp(time,2.85,3.05)*(1-ramp(time,state.downAt,state.downAt+.15)));
  for(const [i,j,root]of [[12,-1,frontJack],[13,1,rearJack]]){
   if(state.garage){requests[i]=null;continue;}
   const grip=root.userData.handle.clone().applyAxisAngle(V(0,1,0),root.rotation.y).add(root.position);
   const pos=grip.clone().add(V(0,0,j*.54));pos.y=0;
   const stance=.15+.62*(i===12&&mode==='nose'?press*(1-ramp(time,3.05,3.75)):press);poseActor(i,pos,grip,stance,[grip.clone().add(V(-.18,0,0)),grip.clone().add(V(.18,0,0))]);requests[i].scripted=true;
  }
  const steadyRetreat=ramp(time,2.55,3.55);
  for(const [i,s]of [[14,-1],[15,1]]){if(state.garage){requests[i]=null;continue;}const pos=V(s*(1.50+2.0*steadyRetreat),0,.50+.60*steadyRetreat),hands=[V(s*.90,.98+state.lift,.50+s*.10),V(s*.90,1.04+state.lift,.50-s*.10)];const steady=activeCar&&time>2&&time<2.55;poseActor(i,pos,V(0,.8,.5),.15,steady?hands:null);requests[i].carContact=steady;requests[i].scripted=true;}
  const chief=V(5.2,0,-4.6);poseActor(16,chief,V(5,1,-7),0,[V(5.02,1.04,-4.85),V(5.30,1.04,-4.85)]);
  // Detachable assemblies follow clearance paths: axial extraction before carrying sideways.
  const p=state.part,r=p.remove,k=p.install;let oldOffset=V(),newOffset=V(3.1,.3,-1.6),partWorld=V(0,.52,-2.38),newWorld=partWorld.clone().add(newOffset);
  car.nose.position.set(0,0,0);newNose.visible=mode==='nose';car.rear.root.position.copy(rearCenter);newRear.visible=mode==='rear';car.panels.root.position.copy(panelCenter);
  if(mode==='nose'){
   oldOffset=V(-3.60*clamp((r-.35)/(1-.35)),.2*clamp(r/.3),-1.35*clamp((r-0)/(.55-0)));newOffset=V(3.60*(1-clamp((k-0)/(.68-0))),.24*(1-k),-1.6*(1-clamp((k-.68)/(1-.68))));
   car.nose.position.copy(oldOffset);car.nose.position.z-=state.carZ*r;car.nose.position.y+=(.085-state.lift)*r;newNose.position.copy(newOffset);newNose.position.z-=state.carZ*(1-k);newNose.position.y+=(.085-state.lift)*(1-k);partWorld=V(0,.34+.085*r+state.lift*(1-r),-2.65).add(oldOffset);newWorld=V(0,.34+.085*(1-k)+state.lift*k,-2.65).add(newOffset);
  }else if(mode==='rear'){
   const resting=.55-rearMinY-state.lift;
   oldOffset=V(-3.4*clamp((r-.25)/.75),.32*Math.sin(Math.PI*r)+resting*r,1.25*clamp(r/.5));newOffset=V(3.4*(1-clamp(k/.7)),.32*Math.sin(Math.PI*k)+resting*(1-k),1.25*(1-clamp((k-.55)/.45)));
   car.rear.root.position.copy(rearCenter).add(oldOffset);newRear.position.copy(rearCenter).add(newOffset);partWorld=car.rear.root.position.clone().add(base);newWorld=newRear.position.clone().add(base);
  }else if(mode==='panels'){
   const open=r*(1-k);oldOffset=V(-3.4*open,(.60-panelMinY-state.lift)*ramp(open,.18,1),0);car.panels.root.position.copy(panelCenter).add(oldOffset);partWorld=panelCenter.clone().add(oldOffset).add(base);newWorld=partWorld.clone();
  }
  rearRacks.forEach(o=>o.visible=mode==='rear');panelRack.visible=mode==='panels';brakeRack.visible=mode==='brakes';brakeFreshRack.visible=mode==='brakes';
  const partActive=['nose','rear','panels'].includes(mode),rearJob=mode==='rear',zsign=rearJob?1:-1;
  for(let pair=0;pair<2;pair++)for(let side=0;side<2;side++){
   const i=17+pair*2+side,s=side===0?-1:1,target=pair===0?partWorld:newWorld;
   if(partActive&&(mode!=='panels'||pair===0)){
    const spread=mode==='rear'?.43:.72,partRoot=rearJob?(pair===0?car.rear.root:newRear):(pair===0?car.nose:newNose),handCenter=(rearJob?car.rearGrips:car.noseGrips)[side].clone().add(partRoot.position).add(base);
    if(!state.garage&&pair===0&&time<2)handCenter.z-=state.carZ;
    const anchor=V(handCenter.x,0,handCenter.z+zsign*(rearJob?.77:.48));const hands=[handCenter.clone().add(V(-.05,0,-.04)),handCenter.clone().add(V(.05,0,.04))];if(flowReady&&mode==='nose'&&pair===0)anchor.z-=.75*(1-ramp(time,2.1,3.4));
    const progress=pair===0?r:k;
    if(mode==='panels'){handCenter.copy(car.panelGrips[side]).add(car.panels.root.position).add(base);anchor.set(Math.min(handCenter.x-.68,-1.45),0,handCenter.z+(side?.50:-.50));hands[0].copy(handCenter).add(V(0,0,-.045));hands[1].copy(handCenter).add(V(0,0,.045));}
    const finished=mode==='panels'?r>=1-1e-9&&k===0&&time<9.5||p.fasten>=1-1e-9:pair===0?r>=1-1e-9:p.fasten>=1-1e-9;
    const finishAt=pair===0?(mode==='nose'?7.7:mode==='rear'?7.1:7.2):(mode==='nose'?10.7:mode==='rear'?13.2:15.3),stepAway=ramp(time,finishAt,finishAt+.55);
    if(finished&&mode!=='panels'&&!(flowReady&&mode==='nose'&&pair===0)){anchor.x+=s*.28*stepAway+ (pair===0?-.45:.45)*retreat;anchor.z+=zsign*.55*retreat;}
    
    // After the work the people stay in pit coordinates even as fitted parts leave.
    if((mode!=='panels'||p.fasten>=1)&&!(flowReady&&mode==='nose'&&pair===0)){const park=V(pair===0?-5.1:s*3.4,0,pair===0?(rearJob?2.8+side*1.3:-4.8+side*1.2):-2.4+side*.80);const parkAt=Math.max(state.serviceEnd-.35,finishAt);anchor.lerp(park,ramp(time,parkAt,parkAt+1.25));}
    if(mode==='nose'&&pair===1&&finished){handCenter.z-=state.carZ;const clear=ramp(time,finishAt,finishAt+.45);anchor.set(T.MathUtils.lerp(handCenter.x,s*1.80,clear),0,handCenter.z-.48);anchor.lerp(V(s*3.4,0,-2.4+side*.8),ramp(time,finishAt+.45,finishAt+1.35));}
    poseActor(i,anchor,target,.35,(flowReady&&mode==='nose'&&pair===0&&time<3.05)||(finished&&!(flowReady&&mode==='nose'&&pair===0))||(!state.garage&&!activeCar&&pair===0)?null:hands);requests[i].carContact=!finished&&p.active;requests[i].scripted=mode==='panels';requests[i].requiresGrip=mode==='panels'?r>0&&r<1||k>0&&k<1:pair===0?r>0&&r<1:k>0&&k<1;
   }else{const anchor=V((side?1:-1)*(pair===0?3.15:3.8),0,pair===0?-4.6:3.5);poseActor(i,anchor,V(0,.8,0),.10);}
  }
  const sideGrip=sideJack.userData.handle.clone().applyAxisAngle(V(0,1,0),sideJack.rotation.y).add(sideJack.position),sidePos=sideGrip.clone().add(V(-.54,0,0));sidePos.y=0;poseActor(21,sidePos,sideJack.position,.2+.5*(state.sideSupport?1:0),mode==='nose'?[sideGrip.clone().add(V(0,0,-.18)),sideGrip.clone().add(V(0,0,.18))]:null);
  brakeOld.visible=mode==='brakes';brakeNew.visible=mode==='brakes';
  if(mode==='brakes'){
   const hub=car.wheels[1].center.clone().add(base),out=p.remove,fit=p.install,trayY=.90;
   brakeOld.position.copy(hub).add(V(3.2*out,0,-.80*out));brakeOld.position.y=T.MathUtils.lerp(hub.y,trayY,ramp(out,0,.75))+.10*Math.sin(Math.PI*out);
   state.brakeSupport={old:out===0?'hub':out===1?'tray':'crew',fresh:fit===0?'tray':fit===1?'hub':'crew'};
   brakeNew.position.copy(hub).add(V(3.2*(1-fit),0,.80*(1-fit)));brakeNew.position.y=T.MathUtils.lerp(trayY,hub.y,ramp(fit,.25,1))+.12*Math.sin(Math.PI*fit);
   for(const [i,part]of [[19,brakeOld],[20,brakeNew]]){const target=part.position.clone(),turn=i===19?ramp(out,.10,.60):ramp(fit,.70,1),work=i===19?V(target.x+.68*(1-turn),0,target.z-.15-.50*turn):V(target.x+.68*turn,0,target.z+.65-.50*turn),waiting=i===19?V(2.6,0,hub.z+1.50):V(4.7,0,hub.z+1.8);
    const handling=i===19?time>=3.25&&time<B.removeEnd+.18:time>=B.pickup&&time<B.verifyEnd;
    const enter=i===19?ramp(time,2.80,3.45):ramp(time,B.prepareStart,B.pickup),leave=i===19?ramp(time,B.removeEnd+.18,B.removeEnd+1.05):ramp(time,B.verifyEnd,B.wheelReady+.3),anchor=waiting.clone().lerp(work,enter).lerp(i===19?V(4.8,0,hub.z-1.5):waiting,leave);
    const toward=anchor.clone().sub(V(target.x,0,target.z)).normalize(),grip=target.clone().add(V(toward.x*.04,.10,toward.z*.20)),spread=V(toward.z*.035,0,-toward.x*.13);
    poseActor(i,anchor,target,handling?.5:.10,handling?[grip.clone().add(spread),grip.clone().sub(spread)]:null);requests[i].scripted=true;requests[i].requiresGrip=i===19?out>0&&out<1:fit>0&&fit<1;requests[i].carContact=handling&&(i===19?out<.1:fit>.99);
   }
  }
  if(mode!=='nose')requests[21]=null;else requests[21].scripted=true;
  scenery.signal[0].emissiveIntensity=state.signal==='red'?2:.05;scenery.signal[1].emissiveIntensity=state.signal==='green'?2:.02;
  state.jacksClear=Math.abs(frontJack.position.x)>=1.50&&Math.abs(rearJack.position.x)>=1.50&&(mode!=='nose'||sideJack.position.x<=-1.65);
  state.propObstacles=[...rearRacks,panelRack,brakeRack,brakeFreshRack].filter(o=>o.visible).map(o=>({x:o.position.x,z:o.position.z,hx:o.userData.w/2,hz:o.userData.d/2,h:o.userData.h})).concat([-3.5,3.5].map(x=>({x,z:5.3,hx:.7,hz:.325})),[0,1,2,3].map(i=>({x:-4.5+i*1.5,z:5.9,hx:.35,hz:.26})));
  if(flowReady)state.propObstacles=presentationProps;
  state.support={front:Math.abs(frontJack.position.x)<.20,rear:Math.abs(rearJack.position.x)<.20,side:mode==='nose'&&Math.abs(sideJack.position.x+1.36)<.05};
  return {actors:requests,state,wheels:wheelObstacles};
 }
 const motionCache=new Map();let rigSignature29=null;let presentationProps=props;let posed=[],gateChecks=[];
 function flowWorkStart(e){const a=e.motion.sample(2);
  if((mode==='tyres'||flowCombined)&&a[10]){const p=a[10],old=p.pos.clone(),yaw=Math.PI/2,d=yaw-p.yaw;p.pos.set(3.7,0,1.15);p.yaw=yaw;p.feet.forEach(f=>{f.world.sub(old).applyAxisAngle(V(0,1,0),d).add(p.pos);f.yaw+=d;});p.hands=null;p.contactTargets=null;p.crouch=.15;p.speed=0;const fit=fitContactPose(p.pos,p.yaw,p.crouch,null,p.feet);p.posture={height:fit.height,bend:fit.bend};}
  return a;
 }
 function buildMotion(){
  activeHolds=[];activeTiming={crewReadyAt:0,releasePermitAt:0};let motion;
  const gates=actionGates(mode,fault).concat(flowCombined?actionGates('tyres',fault).filter(g=>g.phase!==2.55):[]).sort((a,b)=>a.phase-b.phase);
  for(let pass=0;pass<18;pass++){
   const duration=sampleProcedure(mode,0,{traffic,fault,...activeTiming}).duration+activeHolds.reduce((s,h)=>s+h.duration,0);
   motion=new CrewMotion(layoutPose,duration);
   let changed=false;gateChecks=[];
   for(const gate of gates){const wall=wallAt(gate.phase,activeHolds),actorFrame=motion.sample(wall);let distance=0,error=0;
    for(const i of gate.actors){const a=actorFrame[i];if(!a)continue;
     const parkedGun=i<12&&i%3===0&&!a.carContact;
     const e=gripError(a);error=Math.max(error,e);
     if(!a.hands||parkedGun)distance=Math.max(distance,a.pos.distanceTo(a.desired));
    }
    gateChecks.push({...gate,distance,error,ready:distance<.25&&error<.035});
    if((distance>.25||error>.035)&&pass<17){addHold(activeHolds,gate.phase,Math.min(.8,.18+distance/2));changed=true;break;}

   }
   if(changed)continue;
   if(!sampleProcedure(mode,0).garage){
    let stable=0,serviceReady=Infinity,allReady=Infinity;
    for(const frame of motion.frames){if(frame.state.phase<frame.state.serviceEnd)continue;if(workReleased(frame))stable++;else stable=0;if(stable>=1){serviceReady=frame.state.phase;break;}}
    stable=0;for(const frame of motion.frames){if(frame.state.phase<frame.state.downAt+.10)continue;if(departureClear(frame)&&frame.state.jacksClear)stable++;else stable=0;if(stable>=1){allReady=frame.state.phase;break;}}
    const target={crewReadyAt:Math.max(activeTiming.crewReadyAt,Number.isFinite(serviceReady)?serviceReady:motion.frames.at(-1).state.phase),releasePermitAt:Math.max(activeTiming.releasePermitAt,Number.isFinite(allReady)?allReady:motion.frames.at(-1).state.phase)};
    if(target.crewReadyAt>activeTiming.crewReadyAt+.025||target.releasePermitAt>activeTiming.releasePermitAt+.025){activeTiming=target;if(pass<17)continue;}
   }
   break;
  }
  return {motion,blocked:gateChecks.some(g=>!g.ready),holds:activeHolds.map(h=>({...h})),timing:{...activeTiming},gates:gateChecks,parkEnd:motion.frames.at(-1).actors.map((a,i)=>a&&!crewParked({actors:[a]})?{i,pos:a.pos.toArray(),speed:a.speed,contact:a.carContact}:null).filter(Boolean)};
 }
 function renderPose(){
  const key=mode+':'+traffic+':'+fault+':'+flowCombined;
  if(!motionCache.has(key))motionCache.set(key,buildMotion());
  const entry=motionCache.get(key);activeHolds=entry.holds;activeTiming={...entry.timing,releaseEnabled:!entry.blocked&&!externalPose};gateChecks=entry.gates;
  const {state}=layoutPose(time);posed=entry.motion.sample(time);if(externalPose?.crewMode){if(!entry.presentation)entry.presentation=new CrewPresentation(flowWorkStart(entry),entry.motion.sample(entry.flowEnd??(entry.motion.frames.length-1)/60),presentationProps,flowCombined?'combined':mode);posed=entry.presentation.sample(externalPose.crewMode,externalPose.crewTime??0);}
  if(externalPose){if(!entry.presentation)entry.presentation=new CrewPresentation(flowWorkStart(entry),entry.motion.sample(entry.flowEnd??(entry.motion.frames.length-1)/60),presentationProps,flowCombined?'combined':mode);const home=entry.presentation.home();posed=posed.map((a,i)=>entry.presentation.active(i)?a:home[i]);}


  if(externalPose&&!externalPose.crewMode&&(mode==='tyres'||flowCombined)&&state.phase<3.65)posed[10]=blendActor(entry.presentation.workStart[10],posed[10],ramp(state.phase,2.9,3.65));
  if(!state.garage){const frame={actors:posed};state.crewClear=workReleased(frame);state.departureClear=departureClear(frame)&&state.jacksClear;state.released=state.released&&state.departureClear&&gateChecks.every(g=>g.ready);state.signal=state.released?'green':'red';}
  crew.debug=[];
  for(let i=0;i<4;i++){const actor=posed[i*3],raw=requests[i*3],c=state.corners[i];if(actor&&raw){const correction=actor.pos.clone().sub(raw.pos).multiplyScalar(actor.toolAttach??1);tools[i].position.add(correction);}}
  if(externalPose?.crewMode)for(const [i,jack]of [[12,frontJack],[13,rearJack],[21,sideJack]]){
   const a=posed[i];if(!a||i===21&&mode!=='nose'){jack.visible=false;continue;}jack.visible=true;jack.rotation.y=a.yaw+Math.PI;
   const forward=V(-Math.sin(a.yaw),0,-Math.cos(a.yaw)),grip=a.pos.clone().addScaledVector(forward,.54);grip.y=jack.userData.handle.y;
   jack.position.copy(grip).sub(jack.userData.handle.clone().applyAxisAngle(V(0,1,0),jack.rotation.y));jack.position.y=0;jack.userData.roll((externalPose.crewTime??0)*1.5,a.yaw);
   const side=V(.18,0,0).applyAxisAngle(V(0,1,0),a.yaw);a.hands=[grip.clone().sub(side),grip.clone().add(side)];const fit=fitContactPose(a.pos,a.yaw,.1,a.hands,a.feet);a.posture={height:fit.height,bend:fit.bend};a.carContact=false;
  }
  if(externalPose){
   car.root.updateMatrixWorld(true);
   logistics.apply({actors:posed,entry,state,pose:externalPose,job:flowCombined?'combined':mode,phase:state.phase});
   for(let i=0;i<4;i++)for(const [source,label]of [[car.wheels[i].root,'old'],[car.wheels[i].newRoot,'new']]){const clone=looseParts.get(source);if(!clone.visible)continue;const center=V().setFromMatrixPosition(clone.matrix),w=wheelObstacles.find(w=>w.id===i+'-'+label);if(w)Object.assign(w,{x:center.x,y:center.y,z:center.z});}

   if(!externalPose.started){for(const w of car.wheels){w.root.visible=true;w.root.position.copy(w.center);w.root.rotation.x=-externalPose.travel/.417;w.newRoot.visible=false;}car.nose.visible=true;car.nose.position.set(0,0,0);newNose.visible=false;}
   if(externalPose.done){if(flowCombined||mode==='tyres')for(const w of car.wheels){w.newRoot.visible=true;w.newRoot.position.copy(w.center);w.newRoot.rotation.x=-externalPose.travel/.417;}if(mode==='nose'){newNose.visible=true;newNose.position.set(0,0,0);}}
   car.root.position.set(externalPose.x,state.lift,externalPose.z);car.root.rotation.y=externalPose.yaw;
  }
  const collision37={wheels:wheelObstacles,props:state.propObstacles,cacheKey37:JSON.stringify([wheelObstacles,state.propObstacles]),sharedKey39:JSON.stringify([wheelObstacles,state.propObstacles],(key,value)=>typeof value==='number'?Math.round(value*1e6)/1e6:value)};
  posed.forEach((a,i)=>{if(!a){crew.hide(i);return;}crew.pose(i,a.pos,a.yaw,{crouch:a.crouch,hands:a.hands,posture:a.posture,sideLean:a.sideLean,collision:collision37,feet:a.feet,walk:a.gait,stride:Math.min(.08,a.speed*.035),speed:a.speed,look:a.look??.04*Math.sin((externalPose?.idleTime??time)*1.7+i*1.9)});});
  crew.flush();return state;
 }

 function signature58(job){
   const box=o=>{const b=new T.Box3().setFromObject(o);return [b.min.toArray(),b.max.toArray()];};
   return job+':'+(rigSignature29??=JSON.stringify([car.wheels.map(w=>[w.center.toArray(),box(w.root)]),car.noseGrips,car.rearGrips,car.panelGrips,box(car.nose),box(car.rear.root),box(car.panels.root),presentationProps],(key,value)=>typeof value==='number'?Math.round(value*1e6)/1e6:value));
 }
 async function prepareAsync58(job){const signature=signature58(job);if(!geometryPlans29.has(signature)){const cached=await readPlan58(signature);if(cached)geometryPlans29.set(signature,cached);}const existed=geometryPlans29.has(signature),profile=prepare(job);if(!existed)await writePlan58(signature,geometryPlans29.get(signature));return profile;}
 function prepare(job){flowCombined=job==='combined';mode=flowCombined?'nose':'tyres';const key=mode+':'+traffic+':'+fault+':'+flowCombined;
  if(!motionCache.has(key)){
   // Only share generated motion when all contact geometry and obstacles match.
   const signature=signature58(job);
   let e=geometryPlans29.get(signature);if(!e){pitPlanStats58.built++;e=buildMotion();
    const clearIndex=e.motion.frames.findIndex(f=>f.state.phase>=e.timing.releasePermitAt&&f.state.phase>=f.state.serviceEnd&&f.state.jacksClear&&workReleased(f)&&departureClear(f));
    if(clearIndex<0)e.blocked=true;
    e.flowEnd=Math.max(wallAt(e.timing.releasePermitAt,e.holds)+.45,Math.max(0,clearIndex)*e.motion.dt+.2);
    activeHolds=e.holds;activeTiming=e.timing;e.presentation=new CrewPresentation(flowWorkStart(e),e.motion.sample(e.flowEnd),presentationProps,job);geometryPlans29.set(signature,e);
   }else pitPlanStats58.reused++;motionCache.set(key,e);
  }
  const e=motionCache.get(key);
  if(!e.bounds37){const b=new T.Box3();for(const motion of [e.motion,e.presentation.deploy,e.presentation.returning,e.presentation.turnaround])for(const frame of motion.frames)for(const actor of frame.actors)if(actor)b.expandByPoint(actor.pos);e.bounds37=b.expandByScalar(3);}
  if(!boundedPlans37.has(e)){crew.setBounds37(e.bounds37);boundedPlans37.add(e);}activeHolds=e.holds;activeTiming=e.timing;return {start:wallAt(2.05,e.holds),release:wallAt(e.timing.releasePermitAt,e.holds),end:e.flowEnd,deploy:e.presentation.readyAt,return:e.presentation.returnAt,blocked:e.blocked};
 }
 return {prepare,prepareAsync58,render(job,t,pose){prepare(job);time=t;externalPose={...pose,skipRender:true};return renderPose();},releaseClear(){return !!current&&current.jacksClear===true&&workReleased({actors:posed})&&departureClear({actors:posed});},frame(){return {actors:posed,tools,state:current,loads:logistics.report,crewMode:externalPose?.crewMode};},crew,car,logistics};
}
