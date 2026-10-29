import {freezeScenery55} from './static-scene55.js';
import {BufferLease54} from './buffer-lease54.js';
import {TEAMS52} from '../race/roster52.js';
import * as T from 'three';
import {CrewBatch} from '../pit/crew/crew-rig.js';
import {modelScene55} from '../runtime/assets.js';
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Mechanics remain planted at their own workstations: no sliding feet or path flips.
export function garageWorkPose50(t,i){
 const x=i===0?-3.35:3.35,z=2.9,yaw=i===0?-.35:.35,anchor=new T.Vector3(x,.025,z),rot=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw);
 const hand=(side)=>new T.Vector3(side*.13,1.12+.004*Math.sin(t*1.2+i),-.32).applyQuaternion(rot).add(anchor);
 return {anchor,yaw,options:{crouch:0,stride:0,speed:0,walk:0,hands:[hand(-1),hand(1)],look:.035*Math.sin(t*.42+i)}};
}
export function createGarageMenu49(host,{onStatus=()=>{},reducedMotion=()=>false}={}){
 let lease54,renderer,scene,camera,crew,car,loading=null,active=false,last=0,start=0,screen='garage',team=1,paint=[],accentPaint=[],copies=[],tablets=[];
 let fromPos=new T.Vector3(),fromLook=new T.Vector3(),toPos=new T.Vector3(8,2.7,-10),toLook=new T.Vector3(2.1,.5,0),look=toLook.clone(),moveAt=0,moveDuration=.8;
 const mats={},palette=TEAMS52.map(t=>parseInt((t.body??t.colour).slice(1),16));
 function box(name,size,pos,mat){const o=new T.Mesh(new T.BoxGeometry(...size),mat);o.name=name;o.userData.modelMesh=true;o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 function colour(){const c=palette[team-1];for(const m of paint)m.color.setHex(c);for(const m of accentPaint)m.color.set(TEAMS52[team-1].accent);if(crew){crew.mats.suit.color.setHex(0x25303b);crew.mats.light.color.setHex(c);crew.mats.helmet.color.setHex(0x45505b);crew.mats.glove.color.setHex(0x343940);}}
 async function load(){if(loading)return loading;loading=(async()=>{onStatus('โรงรถ',.12);scene=new T.Scene();scene.background=new T.Color(0x090d13);scene.fog=new T.Fog(0x090d13,20,45);camera=new T.PerspectiveCamera(42,1,.05,65);camera.position.copy(toPos);camera.lookAt(toLook);
 try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});}catch{renderer=new TexturedCPURenderer(T);}
 lease54=new BufferLease54(renderer);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=!renderer.cpu;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-label','รถแข่งสามมิติในโรงรถ');host.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xe5efff,0x272831,2));const light=new T.DirectionalLight(0xf4f6ff,4.2);light.position.set(-3,7,-5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:7,bottom:-7});light.shadow.normalBias=.02;scene.add(light);
 const rim=new T.DirectionalLight(0x779ee0,2.4);rim.position.set(5,3,4);scene.add(rim);const fill=new T.DirectionalLight(0xffdbb3,1.1);fill.position.set(6,3,-5);scene.add(fill);
 const material=(color,roughness=.5,metalness=.15)=>new T.MeshStandardMaterial({color,roughness,metalness});
 mats.floor=material(0x222a34,.38,.32);mats.wall=material(0x111822,.72);mats.panel=material(0x19232e,.45,.3);mats.metal=material(0x667485,.3,.7);mats.dark=material(0x080d14,.55,.2);mats.team=material(palette[0],.38,.35);mats.strip=new T.MeshBasicMaterial({color:0xcbdcf4});paint.push(mats.team);
 box('Garage floor',[22,.1,24],[0,-.08,0],mats.floor);box('Rear wall',[16,4,.18],[0,2,5.3],mats.wall);box('Side wall',[.16,4,14],[-8,2,-1],mats.wall);
 for(let i=-3;i<=3;i++){box('Wall panel',[1.96,3.5,.1],[i*2,1.8,5.14],mats.panel);box('Panel inlay',[.025,3.5,.025],[i*2+.92,1.8,5.07],mats.dark);}
 box('Rear light',[13,.045,.045],[0,2.85,5.02],mats.strip);box('Team wall trim',[7,.085,.03],[0,.48,5.04],mats.team);
 // Low floor rails frame the car without crossing the camera view.
 for(const x of [-2.15,2.15]){box('Bay side rail',[.028,.008,6.8],[x,.004,0],mats.metal);box('Bay colour light',[.035,.012,2.8],[x,.009,-.5],mats.team);}
 for(const x of [-5.8,5.8]){box('Workbench',[2.6,.08,.9],[x,.94,4.5],mats.metal);box('Tool drawer',[2.35,.8,.76],[x,.45,4.55],mats.dark);for(let i=0;i<3;i++)box('Drawer handle',[1.8,.025,.025],[x,.3+i*.22,4.15],mats.metal);box('Monitor',[.85,.5,.06],[x,1.36,4.7],mats.dark);box('Monitor screen',[.76,.39,.015],[x,1.37,4.657],new T.MeshBasicMaterial({color:0x2b4b62}));}
 const label=document.createElement('canvas');label.width=512;label.height=128;const ctx=label.getContext('2d');ctx.fillStyle='#19232e';ctx.fillRect(0,0,512,128);ctx.fillStyle='#ced5de';ctx.font='italic 900 76px sans-serif';ctx.textAlign='center';ctx.fillText('F1M',256,91);const tex=new T.CanvasTexture(label);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(2.5,.625),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));sign.position.set(0,2.15,5.03);sign.rotation.y=Math.PI;sign.userData.modelMesh=true;scene.add(sign);
 // A soft contact patch also works on devices using the existing CPU renderer.
 const shadow=document.createElement('canvas');shadow.width=shadow.height=128;const sc=shadow.getContext('2d'),g=sc.createRadialGradient(64,64,6,64,64,64);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(.5,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=g;sc.fillRect(0,0,128,128);const patch=new T.Mesh(new T.PlaneGeometry(4,7),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadow),transparent:true,depthWrite:false}));patch.rotation.x=-Math.PI/2;patch.position.y=.012;patch.userData.modelMesh=true;scene.add(patch);
 onStatus('เตรียมรถ',.4);car=await modelScene55('model',new F1M_ENGINE.GLTFLoader());car.traverse(o=>{if(!o.isMesh)return;o.userData.modelMesh=true;o.castShadow=true;o.receiveShadow=true;const old=o.material;o.material=old.clone();o.material.roughness=old.name==='Dark Black'?.7:.3;o.material.metalness=old.name==='Dark Black'?.06:.45;if(['BaseColor','Bloody Red'].includes(old.name))paint.push(o.material);if(['2ndColor','3rdColor'].includes(old.name))accentPaint.push(o.material);});const bounds=new T.Box3().setFromObject(car),size=bounds.getSize(new T.Vector3()),scale=5.65/size.z;car.scale.setScalar(scale);const b=new T.Box3().setFromObject(car),center=b.getCenter(new T.Vector3());car.position.set(-center.x,-b.min.y+.035,-center.z);scene.add(car);
 scene.updateMatrixWorld(true);scene.matrixAutoUpdate=false;for(const object of scene.children)freezeScenery55(object);
 onStatus('เตรียมทีม',.8);crew=new CrewBatch(scene,2);colour();
 for(let i=0;i<2;i++){const p=garageWorkPose50(0,i),tablet=box('Engineer tablet',[.34,.23,.022],[p.anchor.x,1.16,p.anchor.z-.32],mats.dark);tablet.rotation.set(-.6,p.yaw,0);tablets.push(tablet);}
 if(renderer.cpu){for(const part of crew.parts.values()){part.visible=false;for(let i=0;i<2;i++){const mesh=new T.Mesh(part.geometry,part.material);mesh.matrixAutoUpdate=false;mesh.userData.modelMesh=true;scene.add(mesh);copies.push({mesh,part,i});}}}
 resize();if(!active)lease54.park();new ResizeObserver(resize).observe(host);onStatus('พร้อม',1);return true;})().catch(e=>{loading=null;renderer?.dispose?.();host.replaceChildren();onStatus('โหลดไม่สำเร็จ',0);throw e;});return loading;}
 function resize(){if(!renderer||!active)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;if(renderer.cpu)renderer.setSize(w,h);else renderer.setDrawingBufferSize(w,h,Math.min(devicePixelRatio||1,1.5));renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';camera.aspect=w/h;camera.updateProjectionMatrix();setView(screen,true);}
 function setView(view,instant=false){screen=view;if(!camera)return;const portrait=host.clientWidth/Math.max(1,host.clientHeight)<1;const positions={garage:[7.6,2.8,-9.3],mode:[7,2.9,-9],circuit:[8,3.8,-10],setup:[6,2.5,-8],pre:[6.5,2.3,-8.5],inspect:[5.5,2.5,-8],title:[8,3,-10]};const p=positions[view]??positions.garage;fromPos.copy(camera.position);fromLook.copy(look);toPos.set(...p);toLook.set(portrait?0:2.3,.5,0);camera.fov=portrait?43:40;if(portrait){toPos.set(8,4,-12);toLook.set(0,.25,0);}camera.updateProjectionMatrix();moveAt=performance.now();moveDuration=instant||reducedMotion()?0:.85;if(!moveDuration){camera.position.copy(toPos);look.copy(toLook);camera.lookAt(look);}}
 function render(now){if(!active||!renderer)return;const interval=renderer.cpu?200:33;if(now-last<interval)return;last=now;if(!start)start=now;const t=reducedMotion()?0:(now-start)/1000,blend=moveDuration?ease((now-moveAt)/(moveDuration*1000)):1;camera.position.lerpVectors(fromPos,toPos,blend);look.lerpVectors(fromLook,toLook,blend);camera.lookAt(look);
 const showCrew=['inspect','pre'].includes(screen);for(let i=0;i<2;i++){if(showCrew){const p=garageWorkPose50(t,i);crew.pose(i,p.anchor,p.yaw,p.options);}else crew.hide(i);tablets[i].visible=showCrew;}crew.flush();if(renderer.cpu){const m=new T.Matrix4();for(const copy of copies){copy.part.getMatrixAt(copy.i,m);copy.mesh.matrix.copy(m);copy.mesh.matrixWorldNeedsUpdate=true;}}
 renderer.render(scene,camera);}
 return {load,setView,render,setTeam(id){team=id;colour();},setActive(value){active=!!value;if(active){lease54?.resume();resize();last=0;}else lease54?.park();},skip(){moveDuration=0;},get ready(){return !!car&&!!crew;},get renderer(){return renderer?.cpu?'CPU':'WebGL';}};
}
