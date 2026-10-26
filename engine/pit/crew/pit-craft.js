import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);

// Presentation only: no decisions, service gates or traffic state live here.
export function createPitCraft(scene,camera){
 const group=new T.Group();group.name='Garage equipment and suspended air lines';scene.add(group);
 const mats={metal:new T.MeshStandardMaterial({color:0x849695,metalness:.7,roughness:.34}),dark:new T.MeshStandardMaterial({color:0x152c32,roughness:.7}),rubber:new T.MeshStandardMaterial({color:0x131b21,roughness:.9}),cloth:new T.MeshStandardMaterial({color:0x234a4d,roughness:1}),trim:new T.MeshStandardMaterial({color:0xd2dda9,roughness:.5})};
 function box(name,size,pos,mat=mats.dark){const m=new T.Mesh(new T.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function bar(a,b,r=.024,mat=mats.metal){const d=b.clone().sub(a),m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),8),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());group.add(m);return m;}
 function label(text,pos,w=.9){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#173137';x.fillRect(0,0,256,64);x.fillStyle='#d1e1bd';x.textAlign='center';x.font='600 25px sans-serif';x.fillText(text,128,41);const m=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(...pos);m.rotation.y=Math.PI/2;group.add(m);}
 // Compact equipment occupies the existing rear cabinet footprint, outside
 // authored crew routes. It is stored equipment, never a spare visible race part.
 const cx=-13.88,cz=2.55;
 box('Tyre trolley base',[.55,.07,1.05],[cx,.23,cz],mats.metal);
 for(const z of [cz-.43,cz+.43])for(const x of [cx-.21,cx+.21]){const wheel=new T.Mesh(new T.CylinderGeometry(.10,.10,.07,12),mats.rubber);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.16,z);group.add(wheel);}
 for(const x of [cx-.23,cx+.23])bar(V(x,.25,cz+.47),V(x,1.42,cz+.47));bar(V(cx-.23,1.42,cz+.47),V(cx+.23,1.42,cz+.47));
 for(let i=0;i<4;i++){box('Folded tyre blanket',[.48,.115,.78],[cx,.33+i*.13,cz-.03],mats.cloth);box('Blanket retaining strap',[.485,.12,.035],[cx,.33+i*.13,cz-.03],mats.dark);}
 label('TYRE BLANKETS',[-13.54,1.05,cz],.82);
 // A padded service rack, tucked against the rear wall. Active nose assemblies
 // retain their own crew-controlled pickup and storage positions.
 for(const z of [-3.05,-2.12]){bar(V(-14.13,.08,z),V(-14.13,1.32,z));bar(V(-14.13,.55,z),V(-13.61,.55,z));bar(V(-14.13,1.23,z),V(-13.61,1.23,z));box('Rack protective pad',[.46,.065,.13],[-13.85,1.25,z],mats.cloth);}
 label('AERO / SERVICE',[-13.57,1.58,-2.57],.95);
 // Detail the workbench without reducing the walking aisle.
 for(let i=0;i<3;i++){box('Equipment case',[.28,.16,.4],[-12.8,1.015,-1.5+i*.52]);box('Case clasp',[.018,.035,.055],[-12.65,1.02,-1.5+i*.52],mats.metal);}
 const lamp=box('Bench task light',[.035,.045,1.1],[-13.18,1.68,.6],mats.trim);bar(V(-13.18,.94,1.12),V(-13.18,1.68,1.12),.018);
 const hoses=Array.from({length:4},(_,i)=>{const z=i<2?-1.6:1.6,anchor=V(-6.2,3.55,z);bar(V(-12.8,3.55,z),V(5.9,3.55,z),.018,mats.dark);const reel=box('Suspended pneumatic reel',[.24,.24,.17],[i%2?4.8:-2.1,3.53,z]);const pos=new Float32Array(33*3),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const line=new T.Line(g,new T.LineBasicMaterial({color:0x162527}));line.frustumCulled=false;line.visible=false;group.add(line);return {line,anchor,reel};});
 let frame=null;
 const sound=new PitSound(camera);
 return {sound,setVisible(on){group.visible=on;},update(f,time,playing){frame=f;
  for(let i=0;i<4;i++){const h=hoses[i],tool=f.tools[i];h.line.visible=!!tool?.visible;if(!h.line.visible)continue;const end=tool.position.clone().add(V(0,.025,0)),top=V(end.x,3.55,h.anchor.z);h.reel.position.copy(top);const bend=end.clone().add(V((i%2?1:-1)*.24,.72,.03)),curve=new T.CubicBezierCurve3(top,V(end.x,2.75,h.anchor.z),bend,end),a=h.line.geometry.attributes.position;for(let n=0;n<33;n++){const p=curve.getPoint(n/32);a.setXYZ(n,p.x,p.y,p.z);}a.needsUpdate=true;}
  sound.update(f,time,playing);
 },diagnostics(){return {equipment:'trolley, folded blankets, padded rack, workbench cases, 4 suspended air hoses',visibleHoses:hoses.filter(h=>h.line.visible).length,audio:sound.report(),presentationOnly:true};}};
}

// Synthesized spatial Foley: self-contained and silent until a user opts in.
// Seeks are discontinuities; they never replay an accumulated event backlog.
class PitSound{
 constructor(camera){this.camera=camera;this.enabled=false;this.wanted=true;this.previous=null;this.counts={gun:0,jack:0,step:0,setdown:0};this.voices=new Set();this.error='';this.nextStepAt=0;this.gunUntil=0;this.stepMix=.18;this.gunMix=.75;}
 setup(){const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)throw Error('เบราว์เซอร์นี้ไม่มีระบบเสียง');if(this.ctx&&this.ctx.state!=='closed')return;this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=.9;const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.15;this.master.connect(limiter);limiter.connect(this.ctx.destination);}
 async enable(confirm=false){this.wanted=true;this.setup();await this.ctx.resume();this.enabled=this.ctx.state==='running';this.previous=null;if(!this.enabled)throw Error('แตะลองเสียงเพื่อเปิดระบบเสียง');this.error='';if(confirm)this.preview();return true;}
 async toggle(){if(this.enabled){this.wanted=false;this.enabled=false;this.silence();return false;}return this.enable(true);}
 preview(){const c=this.ctx,n=c.currentTime,g=c.createGain(),o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(660,n);o.frequency.setValueAtTime(880,n+.11);g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(.22,n+.012);g.gain.exponentialRampToValueAtTime(.0001,n+.26);o.connect(g);g.connect(this.master);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};this.voices.add(o);o.start(n);o.stop(n+.28);}
 silence(){for(const s of this.voices){try{s.stop();}catch{}}this.voices.clear();this.previous=null;this.nextStepAt=0;this.gunUntil=0;}
 burst(kind,pos,action='unlock'){if(!this.enabled||this.ctx?.state!=='running')return;const c=this.ctx,n=c.currentTime,duration={gun:action==='tighten'?.19:.27,jack:.15,step:.075,setdown:.18}[kind],g=c.createGain();
 // Mild screen-space stereo and a gain floor keep Foley audible on a phone
 // even when the overview camera is tens of metres from the service bay.
 const delta=pos.clone().sub(this.camera.position),right=V(1,0,0).applyQuaternion(this.camera.quaternion),pan=Math.max(-.8,Math.min(.8,delta.dot(right)/12)),distance=delta.length(),attenuation=kind==='step'?Math.max(0,1-distance/14):Math.max(.55,1/(1+Math.max(0,distance-5)*.018)),stereo=c.createStereoPanner?.();if(stereo){stereo.pan.value=pan;g.connect(stereo);stereo.connect(this.master);}else g.connect(this.master);
 const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),a=buffer.getChannelData(0);let body=0,motorPhase=0;const impactRate=action==='tighten'?78:64;for(let i=0;i<a.length;i++){const t=i/c.sampleRate,noise=Math.random()*2-1;body=.86*body+.14*noise;if(kind==='gun'){
 // Soft pneumatic spin, followed by damped mechanical impacts and a brief
 // air release. Avoid the previous continuous band-passed white-noise buzz.
 const u=t/duration,spin=Math.sin(Math.PI*Math.min(1,t/.055)/2),age=Math.max(0,t-.035)%(1/impactRate),impact=t>.035?Math.exp(-age*235)*(Math.sin(age*Math.PI*2*740)+.32*Math.sin(age*Math.PI*2*1540)):0;motorPhase+=Math.PI*2*(760+480*Math.min(1,t/.045)-280*u)/c.sampleRate;const release=u>.78?(u-.78)/.22:0;a[i]=(.45*body+.045*noise+.055*Math.sin(motorPhase))*spin*(1-release)+.24*impact*(1-.6*release)+.12*body*release;
 }else if(kind==='step'){a[i]=.58*body+.13*Math.sin(t*Math.PI*2*240)*Math.exp(-t*65);}else a[i]=noise;}
 const source=c.createBufferSource(),filter=c.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value={gun:3600,jack:1600,step:650,setdown:1100}[kind];filter.Q.value=.55;source.connect(filter);filter.connect(g);const level={gun:.55*this.gunMix,jack:.45,step:.32*this.stepMix,setdown:.52}[kind]*attenuation;g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(Math.max(.0001,level),n+.012);if(kind==='gun'){g.gain.setValueAtTime(Math.max(.0001,level*.8),n+duration*.68);this.gunUntil=n+duration+.12;}g.gain.exponentialRampToValueAtTime(.0001,n+duration);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();g.disconnect();stereo?.disconnect();};this.voices.add(source);this.counts[kind]++;source.start(n);source.stop(n+duration);
 }
 update(f,t,playing){if(!playing||!this.enabled){if(this.previous)this.silence();return;}if(this.ctx.state!=='running'){this.previous=null;return;}
 const now={t,lift:f.state.lift,phase:f.state.phase,mode:f.crewMode,corners:f.state.corners.map(x=>({unlock:x.unlock,tighten:x.tighten})),feet:f.actors.map(a=>a?.feet.map(x=>({stance:x.stance,p:x.world.clone()}))),loads:f.loads.map(x=>({name:x.name,held:x.gripHeld,center:V(...x.center)}))};const old=this.previous;this.previous=now;
 // Frame gaps and speed-up must not suppress every effect. Explicit seeking
 // is silent at the caller; only large/discontinuous playback jumps reset.
 if(!old||t<=old.t||t-old.t>3)return;
 if(!now.mode&&now.phase>=old.phase)for(let i=0;i<4;i++){const a=old.corners[i],b=now.corners[i];if(a.unlock===0&&b.unlock>0)this.burst('gun',f.tools[i].position,'unlock');if(a.tighten===0&&b.tighten>0)this.burst('gun',f.tools[i].position,'tighten');}
 if((old.lift>.02&&now.lift<=.02)||(old.lift<.02&&now.lift>=.02))this.burst('jack',V(0,.15,-2.4));
 // One quiet foreground footfall at most every 0.32 real seconds. Distant
 // crew and active wheel guns do not contribute a crowd of overlapping steps.
 const clock=this.ctx.currentTime;if(clock>=this.nextStepAt&&clock>=this.gunUntil){const candidates=[];now.feet.forEach((feet,i)=>{if((f.actors[i]?.speed??0)<.5)return;feet?.forEach((foot,k)=>{const distance=foot.p.distanceTo(this.camera.position);if(distance<14&&foot.stance&&!old.feet[i]?.[k]?.stance)candidates.push({p:foot.p,distance});});});candidates.sort((a,b)=>a.distance-b.distance);if(candidates.length){this.burst('step',candidates[0].p);this.nextStepAt=clock+.32;}}
 for(const x of now.loads)if(!x.held&&old.loads.some(y=>y.name===x.name&&y.held))this.burst('setdown',x.center);
 }
 report(){return {enabled:this.enabled,wanted:this.wanted,state:this.ctx?.state??'not started',error:this.error,events:{...this.counts},activeVoices:this.voices.size,stepMix:this.stepMix,gunMix:this.gunMix,type:'soft pneumatic spin and damped impacts; sparse foreground footsteps'};}
}
