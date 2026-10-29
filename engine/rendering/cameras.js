import {driveCues26} from './drive-cues26.js';
import {roadPose33} from '../tracks/road-height33.js';
import {CameraSafety30} from './camera-safety30.js';
import {cameraDepth} from './render-policy.js';
export const CAMERA_NAMES={manager:'MANAGER / จัดการเรซ',chase:'FOLLOW / หมุนรอบรถ',cinema:'CINEMA / รถที่เลือก',trackside:'TRACKSIDE / ข้างสนาม',fps:'COCKPIT / คนขับ',nose:'NOSE / จมูกรถ',drone:'DRONE / เฉียงสูง',high:'HIGH / มุมสูง',overview:'MAP / แผนที่ทั้งสนาม',inspect:'INSPECT / หยุดภาพหมุนดู'};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class CameraDirector{
 constructor(T,circuit){this.T=T;this.circuit=circuit;this.safety=new CameraSafety30(T);this.mode='chase';this.distance=1;this.cut=true;this.shot='';this.stationKey=-1;this.anchor=null;this.orbitYaw=.14;this.orbitPitch=.29;this.camera=new T.PerspectiveCamera(50,1,.05,14000);this.target=new T.Vector3();}
 set(mode){this.mode=mode;this.safety.reset();this.cut=true;this.stationKey=-1;}
 orbit(dx,dy){this.orbitYaw=wrap(this.orbitYaw-dx*.006);this.orbitPitch=this.T.MathUtils.clamp(this.orbitPitch+dy*.0045,.08,1.28);}
 zoom(factor){this.distance=this.T.MathUtils.clamp(this.distance*factor,.65,2.5);}
 resetOrbit(){this.orbitYaw=.14;this.orbitPitch=.29;this.distance=1;this.cut=true;}
 update(car,root,time,dt){const T=this.T,s=car.state,p=new T.Vector3(s.X,0,-s.Y),f=new T.Vector3(Math.cos(s.psi),0,-Math.sin(s.psi)),right=new T.Vector3(Math.sin(s.psi),0,Math.cos(s.psi)),at=this.circuit.project(s.X,s.Y,s.psi),portrait=this.camera.aspect<.85,speed=Math.hypot(s.u,s.v);let pos=p.clone(),look=p.clone().addScaledVector(f,3),fov=48,mode=this.mode;this.shot=CAMERA_NAMES[mode];
 if(mode==='cinema'){mode=this.story?.shot??'chase';this.shot='CINEMA / '+(this.story?.title??'RACE LIVE');}
 if(mode==='duel'&&this.story?.partner){const separation=Math.hypot(s.X-this.story.partner.X,s.Y-this.story.partner.Y);if(this.cut)this.duelFar=false;this.duelFar=this.duelFar?separation>(portrait?32:46):separation>(portrait?42:60);if(this.duelFar)mode='front';}
 if(this.mode==='cinema'&&['front','duel','drone'].includes(mode)){
 const entry=this.cut||this.effective!==mode;if(entry||this.cinemaHeading===undefined)this.cinemaHeading=s.psi;
 this.cinemaHeading+=wrap(s.psi-this.cinemaHeading)*(1-Math.exp(-5*Math.min(dt,.1)));
 f.set(Math.cos(this.cinemaHeading),0,-Math.sin(this.cinemaHeading));right.set(Math.sin(this.cinemaHeading),0,Math.cos(this.cinemaHeading));
 }
 if(mode==='grid'){pos.addScaledVector(f,12).addScaledVector(right,7);pos.y=8;look=p.clone().addScaledVector(f,-5);look.y=.6;fov=portrait?57:48;}
 else if(mode==='duel'){const partner=this.story?.partner,q=partner?new T.Vector3(partner.X,0,-partner.Y):p.clone(),mid=p.clone().lerp(q,.3);look=mid.clone();look.y=.6;fov=portrait?56:48;const offset=f.clone().multiplyScalar(-10).addScaledVector(right,car.pit?.active?-10:10);offset.y=4.5;const forward=offset.clone().normalize().negate(),viewRight=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0)).normalize(),viewUp=new T.Vector3().crossVectors(viewRight,forward),tan=Math.tan(fov*Math.PI/360);let fit=offset.length();for(const center of[p,q])for(const dx of[-2.85,2.85])for(const side of[-1.15,1.15])for(const h of[.1,1.4]){const corner=center.clone().addScaledVector(f,dx).addScaledVector(right,side);corner.y=h;corner.sub(look);const depth=corner.dot(forward);fit=Math.max(fit,Math.abs(corner.dot(viewRight))/(tan*this.camera.aspect*.86)-depth,Math.abs(corner.dot(viewUp))/(tan*.82)-depth);}pos=look.clone().addScaledVector(forward,-fit*this.distance);}
 else if(mode==='fps'||mode==='nose'){root.updateMatrixWorld(true);const scale=root.getWorldScale(new T.Vector3()).y;pos=p.clone().addScaledVector(f,(mode==='fps'?-.11:1.75)*scale);pos.y=(mode==='fps'?.855:.96)*scale;look=p.clone().addScaledVector(f,12*scale);look.y=(mode==='fps'?.88:.94)*scale;const yawTarget=car.pit?.active||speed<10?0:T.MathUtils.clamp(wrap(this.circuit.at(at.s+Math.min(40,Math.max(12,speed*.45))).psi-s.psi)*.28,-.07,.07);if(this.cut||this.effective!==mode)this.eyeYaw37=0;this.eyeYaw37+=(yawTarget-(this.eyeYaw37??0))*(1-Math.exp(-5*Math.min(.1,dt)));look.addScaledVector(right,-12*scale*Math.tan(this.eyeYaw37));fov=portrait?94:mode==='fps'?78:82;}
 else if(mode==='chase'||mode==='inspect'){
 // Follow the body heading with a short angular response; translation stays locked
 // to the interpolated car so high speed never increases the follow distance.
 if(mode==='inspect'||this.cut||this.followHeading===undefined)this.followHeading=s.psi;
 this.followHeading+=wrap(s.psi-this.followHeading)*(1-Math.exp(-5*Math.min(dt,.08)));
 const yaw=this.followHeading+this.orbitYaw,radius=(portrait?14.8:11.6)*this.distance,cp=Math.cos(this.orbitPitch);
 pos.add(new T.Vector3(-Math.cos(yaw)*radius*cp,radius*Math.sin(this.orbitPitch)+.65,Math.sin(yaw)*radius*cp));
 if(mode!=='inspect')look.addScaledVector(f,-2.4);look.y=.6;fov=portrait?64:50;
 }
 else if(mode==='front'){pos.addScaledVector(f,12*this.distance).addScaledVector(right,car.pit?.active?-5:5);pos.y=2.7;look=p.clone().addScaledVector(f,1);look.y=.6;fov=portrait?53:42;}
 else if(mode==='manager'){if(this.cut||this.managerHeading57===undefined)this.managerHeading57=s.psi;this.managerHeading57+=wrap(s.psi-this.managerHeading57)*(1-Math.exp(-2.2*Math.min(dt,.1)));const heading57=this.managerHeading57+this.orbitYaw;f.set(Math.cos(heading57),0,-Math.sin(heading57));right.set(Math.sin(heading57),0,Math.cos(heading57));const zoom=car.pit?.active ? .8 : 1;pos.addScaledVector(f,-20*this.distance*zoom).addScaledVector(right,24*this.distance*zoom);pos.y=26*this.distance*zoom*(.71+this.orbitPitch);look=p.clone().addScaledVector(f,6);look.y=.4;fov=portrait?60:48;}
 else if(mode==='drone'){pos.addScaledVector(f,-13*this.distance).addScaledVector(right,12*this.distance);pos.y=10*this.distance;look=p.clone().addScaledVector(f,2);look.y=.3;fov=portrait?65:50;}
 else if(mode==='high'){pos.addScaledVector(f,-7*this.distance);pos.y=(this.mode==='cinema'?24:58)*this.distance;look=p.clone().addScaledVector(f,4);fov=portrait?66:55;}
 else if(mode==='overview'){const b=this.circuit.bounds;const span=Math.max(b.width/(2*Math.tan(67*Math.PI/360)*this.camera.aspect),b.height/(2*Math.tan(67*Math.PI/360)))*1.15;pos.set(b.cx,span,-b.cy+b.height*.25);look.set(b.cx,0,-b.cy);fov=67;}
 else if(mode==='trackside'){
 const key=Math.floor((at.s+100)/220),cinematic=this.mode==='cinema';
 if(!this.anchor||this.cut||this.effective!=='trackside'||!cinematic&&key!==this.stationKey){
  this.stationKey=key;const station=cinematic?at.s+90:key*220+30,q=this.circuit.point(station,Math.abs(this.circuit.delta(station,0))<650?30:-30);this.anchor=new T.Vector3(q.x,2.8,-q.y);this.cut=true;
 }
 // A broadcast camera remains at its chosen trackside post for the whole shot.
 pos.copy(this.anchor);look=p.clone().addScaledVector(f,1.1);look.y=.6;
 fov=T.MathUtils.clamp(2*Math.atan2(portrait?9:5,pos.distanceTo(look))*180/Math.PI,portrait?3:2,portrait?62:48);
 }
 const elevation33=roadPose33(car).height??0;if(mode!=='overview'){pos.y+=mode==='trackside'?(this.circuit.project(pos.x,-pos.z).height??elevation33):elevation33;look.y+=elevation33;}
 if(this.mode==='cinema'){if(this.cut||this.effective!==mode){const safe=this.safety.resolve(pos,look,car,time,mode);this.shotClearance31=safe.clone().sub(pos);}pos.add(this.shotClearance31??new T.Vector3());}
 const shotEntry=this.cut||this.effective!==mode;const snap=shotEntry||['fps','nose','overview'].includes(mode),k=snap?1:1-Math.exp(-11*Math.min(dt,.1));
 if(!this.followOffset){this.followOffset=new T.Vector3();this.aimOffset=new T.Vector3();}this.followOffset.lerp(pos.clone().sub(p),k);this.aimOffset.lerp(look.clone().sub(p),k);this.camera.position.copy(p).add(this.followOffset);if(mode==='trackside')this.camera.position.copy(pos);this.target.copy(p).add(this.aimOffset);this.effective=mode;const depth=cameraDepth(mode);this.camera.near=depth.near;this.camera.far=depth.far;
 this.driveCue26=driveCues26(this.driveCue26,s,dt,shotEntry);
 const cue=['chase','fps','nose'].includes(mode)&&!car.pit?.active?this.driveCue26:{lens:0,aim:0,roll:0};
 this.target.y+=cue.aim;
 const desiredFov=fov+cue.lens;const lensK=mode==='trackside'?1-Math.exp(-3.5*Math.min(dt,.1)):k;this.camera.fov=shotEntry?desiredFov:this.camera.fov+(desiredFov-this.camera.fov)*lensK;
 this.camera.up.set(right.x*cue.roll,1,right.z*cue.roll).normalize();this.camera.lookAt(this.target);this.camera.updateProjectionMatrix();this.cut=false;return this.camera;}
}
