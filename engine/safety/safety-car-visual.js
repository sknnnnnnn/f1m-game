// Original mesh built from the supplied Vantage proportion references.
// Metres, Y up, +Z nose. Scene origin is on the ground midway between axles.
export function createSafetyCar(T,{font=null,lod=0}={}) {
 const root=new T.Group();root.name='F1M_SafetyCar';
 root.userData={version:'SC2.1',units:'metres',forward:'+Z',wheelbase:2.705,wheelRadius:.342,reference:'User supplied Vantage F1 Edition 2021 views',role:'visual asset; race control is external'};
 const pbr=(name,color,metalness=0,roughness=.4,extra={})=>new T.MeshStandardMaterial({name,color,metalness,roughness,...extra});
 const mats={paint:pbr('SC_Paint',0x076762,.68,.25),carbon:pbr('SC_Carbon',0x151c20,.32,.38),rubber:pbr('SC_Tyre',0x181b1e,0,.85),glass:pbr('SC_Glass',0x10232d,.42,.19),rim:pbr('SC_Alloy',0x707c83,.92,.24),black:pbr('SC_Grille',0x060a0d,.16,.55),lime:pbr('SC_Lime',0xd9ed45,.2,.35),red:pbr('SC_Caliper',0xb7262d,.2,.4),white:pbr('SC_Lettering',0xf2f5ed,.05,.5),lamp:pbr('SC_Headlamp',0xd2f4ff,.3,.17,{emissive:0x86c9e8,emissiveIntensity:.6}),tail:pbr('SC_Tail',0x8d0814,.15,.25,{emissive:0xe51524,emissiveIntensity:1}),amberL:pbr('SC_Amber_Left',0xffae12,.1,.2,{emissive:0xff7d00,emissiveIntensity:2.5}),amberR:pbr('SC_Amber_Right',0xffae12,.1,.2,{emissive:0xff7d00,emissiveIntensity:2.5}),green:pbr('SC_Green',0x1c6034,.1,.3,{emissive:0x00ff5a,emissiveIntensity:0})};
 const statics=new T.Group();statics.name='Body_Static';root.add(statics);
 function mesh(name,g,m,parent=statics){const o=new T.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(name,size,pos,m= mats.carbon,parent=statics,r=0){const o=mesh(name,new T.BoxGeometry(...size),m,parent);o.position.set(...pos);o.rotation.y=r;return o;}
 function ellipsoid(name,size,pos,m,parent=statics){const o=mesh(name,new T.SphereGeometry(1,lod?16:28,lod?10:16),m,parent);o.scale.set(...size);o.position.set(...pos);return o;}
 function line(name,points,r,m= mats.carbon,parent=statics){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(name,new T.TubeGeometry(curve,Math.max(8,points.length*4),r,5,false),m,parent);}
 function surface(name,nu,nv,fn,m,parent=statics){const p=[],ix=[];for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++)p.push(...fn(i/nu,j/nv));for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;ix.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();m.side=T.DoubleSide;return mesh(name,g,m,parent);}
 const stations=[[-2.244,.82,.77],[-2.05,.92,.81],[-1.70,.955,.85],[-1.35,.96,.85],[-.85,.91,.81],[0,.89,.79],[.7,.915,.80],[1.35,.95,.79],[1.7,.93,.73],[2.08,.85,.62],[2.244,.76,.57]];
 // Cubic Hermite interpolation keeps a continuous longitudinal tangent. The
 // previous per-section smoothstep flattened every station into a hard ridge.
 function sampleProfile(table,z){let i=0;while(i<table.length-2&&table[i+1][0]<z)i++;const a=table[i],b=table[i+1],prev=table[Math.max(0,i-1)],next=table[Math.min(table.length-1,i+2)],d=b[0]-a[0],t=Math.max(0,Math.min(1,(z-a[0])/d));return [1,2].map(k=>{const ma=(b[k]-prev[k])/(b[0]-prev[0]),mb=(next[k]-a[k])/(next[0]-a[0]);return (2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*d*ma+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*d*mb;});}
 function section(z){return sampleProfile(stations,z);}
 function top(x,z){const [w,h]=section(z),t=Math.min(1,Math.abs(x)/w);return .17+(h+.045-.17)*Math.pow(Math.sqrt(Math.max(0,1-t*t)),.24)+.095*Math.exp(-(((Math.abs(z)-1.35)/.48)**2))*Math.exp(-(((t-.80)/.24)**2));}
 function sculptZ(x,z,w){const front=Math.max(0,(z-1.65)/.594),rear=Math.max(0,(-z-1.82)/.424);return z-.22*front*front*(x/w)**2+.10*rear*rear*(x/w)**2;}
 function archBottom(z){let h=.17;for(const wz of [-1.3525,1.3525]){const d=z-wz;if(Math.abs(d)<.399)h=Math.max(h,.35+Math.sqrt(.399**2-d*d));}return h;}
 // A single continuous transverse shell rolls from door to shoulder to hood.
 // Wheel openings cut the lower edge without a separate flat side panel.
 surface('Continuous_rounded_body_shell',lod?64:112,48,(u,v)=>{const z=-2.244+4.488*u,[w]=section(z),a=(v-.5)*Math.PI,x=w*Math.sin(a);const topY=top(x,z),cut=archBottom(z),y=Math.max(topY,cut);return [x,y,sculptZ(x,z,w)];},mats.paint);
 for(const s of [-1,1]){
 // Actual open wheel arches: this trim follows the same analytic cutout.
 for(const wz of [-1.3525,1.3525]){const pts=[];for(let i=0;i<=32;i++){const a=Math.PI*i/32,z=wz+Math.cos(a)*.399;pts.push([s*(section(z)[0]+.006),.35+Math.sin(a)*.399,z]);}line('Wheel_arch_lip',pts,.013,mats.carbon);}
 line('Sill_carbon',[[s*.86,.165,-1],[s*.865,.15,0],[s*.88,.165,.94]],.047,mats.carbon);
 line('Sill_lime',[[s*.888,.182,-.95],[s*.898,.17,0],[s*.909,.185,.94]],.007,mats.lime);
 line('Door_seam',[[s*.878,.73,-.78],[s*.908,.58,-.76],[s*.901,.255,-.70],[s*.903,.236,.54],[s*.901,.61,.59],[s*.866,.73,.60]],.002,mats.black);
 box('Flush_door_handle',[.012,.023,.16],[s*.893,.66,-.30],mats.carbon);
 const vent=box('Side_vent',[.02,.13,.39],[s*.925,.63,.92],mats.black);vent.rotation.z=s*.05;
 for(let i=0;i<3;i++)box('Side_vent_blade',[.027,.009,.31],[s*.94,.589+i*.032,.92],mats.carbon);
 line('Mirror_stem',[[s*.73,.89,.35],[s*.95,.94,.40]],.018,mats.carbon);
 ellipsoid('Mirror_shell',[.135,.058,.102],[s*1.009,.955,.40],mats.carbon);
 ellipsoid('Mirror_glass',[.10,.041,.007],[s*1.01,.958,.304],mats.rim);
 }
 // Nose and tail fascias close the loft; grille is a separate inset surface.
 for(const z of [-2.244,2.244]){const [w]=section(z);surface('Rounded_bumper_'+z,48,16,(u,v)=>{const x=(u*2-1)*w;return [x,.17+(top(x,z)-.17)*v,sculptZ(x,z,w)+(z>0?.012:-.012)*Math.sin(v*Math.PI)];},mats.paint);}
 surface('Curved_front_grille',40,12,(u,v)=>{const y=.22+v*.285,w=.62-.04*v+.06*Math.sin(v*Math.PI),x=(u*2-1)*w;return [x,y,2.273-.18*(x/.76)**2];},mats.black);
 for(let i=0;i<5;i++){const pts=[];for(let j=0;j<=16;j++){const x=(j/8-1)*(.60-i*.006);pts.push([x,.245+i*.055,2.282-.18*(x/.76)**2]);}line('Curved_grille_blade',pts,.004,mats.carbon);}
 for(let i=-6;i<=6;i++){const x=i*.09;line('Grille_vertical',[[x,.24,2.28-.18*(x/.76)**2],[x,.49,2.28-.18*(x/.76)**2]],.003,mats.carbon);}
 line('Front_splitter',[[-.83,.175,2.02],[-.72,.15,2.25],[0,.145,2.30],[.72,.15,2.25],[.83,.175,2.02]],.035,mats.carbon);
 line('Front_lime',[[-.83,.19,2.02],[-.72,.17,2.25],[0,.166,2.30],[.72,.17,2.25],[.83,.19,2.02]],.007,mats.lime);
 for(const s of [-1,1]){
 surface('Headlight_housing',20,8,(u,v)=>{const x=s*(.49+.31*u),z=2.105-.18*u+(v*2-1)*.069*Math.pow(Math.sin(Math.PI*u),.6);return [x,top(x,z)+.008,z];},mats.black);
 for(let j=0;j<3;j++){const x=s*(.55+j*.072),z=2.07-j*.042;ellipsoid('LED_projector',[.027,.006,.027],[x,top(x,z)+.013,z],mats.lamp);}
 line('DRL_signature',[[.51,2.10],[.64,2.04],[.78,1.96]].map(([x,z])=>[s*x,top(x,z)+.022,z]),.010,mats.lamp);
 line('Bonnet_crease',[[s*.27,.827,.65],[s*.40,.85,1.17],[s*.54,.77,1.72]],.004,mats.carbon);
 surface('Bonnet_vent',12,4,(u,v)=>{const z=.9+.49*u,x=s*(.39+.095*v);return [x,top(x,z)+.007,z];},mats.carbon);
 for(let j=0;j<5;j++){const z=.96+j*.08;line('Bonnet_louvre',[[s*.40,top(.40,z)+.012,z],[s*.47,top(.47,z)+.012,z]],.007,mats.black);}
 for(const x of [s*.54,s*.70]){const pipe=mesh('Exhaust',new T.TorusGeometry(.045,.012,7,20),mats.rim);pipe.position.set(x,.275,-2.27);const hole=mesh('Exhaust_inner',new T.CircleGeometry(.038,20),mats.black);hole.position.set(x,.275,-2.275);hole.rotation.y=Math.PI;}
 box('Wing_stanchion',[.045,.23,.05],[s*.52,.93,-1.87]);
 }
 // Rear lamp is a shallow ribbon fitted to the actual curved fascia, not a
 // freestanding tube. Housing, lens and LED all follow the same surface.
 function rearLampCenter(x){return top(x,-2.244)-.070-.030*Math.exp(-((x/.28)**2));}
 function rearFasciaZ(x,y){const z=-2.244,w=section(z)[0],v=(y-.17)/(top(x,z)-.17);return sculptZ(x,z,w)-.012*Math.sin(v*Math.PI);}
 for(const [name,height,offset,material] of [
  ['Rear_lamp_recess',.043,.002,mats.black],
  ['Rear_lamp_lens',.027,.005,mats.tail],
  ['Rear_LED_signature',.009,.007,mats.tail]
 ]){
  const lamp=surface(name,112,4,(u,v)=>{const x=(u*2-1)*.735,y=rearLampCenter(x)+(v-.5)*height;return [x,y,rearFasciaZ(x,y)-offset];},material);
  lamp.userData.mount='rear-fascia';lamp.userData.maxSurfaceOffsetMetres=offset;
 }
 // A recessed plate and horizontal bumper crease break up the blank tail.
 box('Rear_plate_surround',[.43,.125,.012],[0,.46,-2.262],mats.carbon);
 const crease=[];for(let i=0;i<=24;i++){const x=(i/12-1)*.70,y=.345;crease.push([x,y,rearFasciaZ(x,y)-.003]);}line('Rear_bumper_crease',crease,.003,mats.carbon);
 box('Rear_diffuser',[1.58,.075,.32],[0,.17,-2.14]);for(let i=-3;i<=3;i++)box('Diffuser_fin',[.012,.13,.38],[i*.21,.18,-2.15]);
 const wing=box('Rear_wing',[1.78,.038,.27],[0,1.065,-1.91]);wing.rotation.x=-.09;
 for(const s of [-1,1])box('Wing_endplate',[.018,.11,.31],[s*.895,1.071,-1.91]);
 // Curved cabin glass and separate painted roof / pillars.
 const cabin=[[-1.43,.85,.72],[-1.10,1.035,.685],[-.76,1.225,.625],[-.42,1.272,.61],[-.08,1.24,.625],[.22,1.09,.68],[.56,.855,.745]];
 function cab(z){return sampleProfile(cabin,z);}
 surface('Curved_cabin_glass',56,28,(u,v)=>{const z=-1.43+1.99*u,[h,w]=cab(z),t=v*2-1;return [t*w,h-.075*t*t-.012*t**4,z+.025*(1-t*t)*Math.max(0,z)];},mats.glass);
 surface('Crowned_roof_panel',40,24,(u,v)=>{const z=-.81+.77*u,[h,w]=cab(z),t=(v*2-1)*.96;return [t*w,h-.075*t*t-.012*t**4+.006,z];},mats.paint);
 for(const s of [-1,1]){
 surface('Curved_side_window_'+s,40,14,(u,v)=>{const z=-1.34+1.86*u,[h,w]=cab(z),bottom=.817;return [s*(.776+(w-.776)*v+.018*Math.sin(v*Math.PI)),bottom+(h-.087-bottom)*v,z];},mats.glass);
 const pillar=[];for(let i=0;i<=12;i++){const z=.56-(.56+.08)*i/12,[h,w]=cab(z);pillar.push([s*w,h-.083,z]);}line('Curved_A_pillar',pillar,.018,mats.paint);
 const rail=[];for(let i=0;i<=32;i++){const z=-1.43+1.35*i/32,[h,w]=cab(z);rail.push([s*w,h-.083,z]);}line('Continuous_roof_rail',rail,.020,mats.paint);
 line('B_pillar',[[s*.774,.84,-.66],[s*.645,1.20,-.67]],.022,mats.carbon);
 line('Window_sill',[[s*.75,.849,-1.35],[s*.79,.836,-.5],[s*.77,.845,.5]],.016,mats.paint);
 }
 line('Windscreen_base',[[-.74,.862,.56],[0,.902,.56],[.74,.862,.56]],.012,mats.carbon);
 // Roof light bar: compact supports, enclosed modules, no dynamic point lights.
 for(const s of [-1,1])box('Lightbar_mount',[.075,.055,.19],[s*.34,1.30,-.28]);
 box('Lightbar_base',[1.02,.035,.17],[0,1.342,-.28]);
 for(const s of [-1,1]){const m=s<0?mats.amberL:mats.amberR;box(s<0?'SC_Beacon_Left':'SC_Beacon_Right',[.455,.055,.13],[s*.263,1.384,-.28],m);for(let i=0;i<7;i++)box('Amber_LED',[.035,.03,.136],[s*(.06+i*.061),1.386,-.28],m);}
 box('SC_Pass_Green',[.09,.045,.14],[0,1.381,-.28],mats.green);
 line('Antenna',[[0,1.245,-.77],[0,1.51,-.80]],.005,mats.carbon);
 // Wheels use steering and spin pivots, compatible with physical wheel omega.
 const wheels=[];
 for(const [label,s,z] of [['FL',-1,1.3525],['FR',1,1.3525],['RL',-1,-1.3525],['RR',1,-1.3525]]){
 const turn=new T.Group();turn.name='SC_Steer_'+label;turn.position.set(s*.832,.35,z);root.add(turn);
 const spin=new T.Group();spin.name='SC_Spin_'+label;turn.add(spin);wheels.push({label,turn,spin,front:z>0,side:s});
 const tyre=mesh('SC_Tyre_'+label,new T.TorusGeometry(.268,.074,lod?8:12,lod?32:56),mats.rubber,spin);tyre.rotation.y=Math.PI/2;tyre.scale.z=1.75;
 const rim=mesh('SC_Rim_'+label,new T.CylinderGeometry(.247,.247,.20,32,1,true),mats.rim,spin);rim.rotation.z=Math.PI/2;
 for(const side of [-1,1]){const lip=mesh('Rim_lip',new T.TorusGeometry(.243,.009,6,40),mats.rim,spin);lip.rotation.y=Math.PI/2;lip.position.x=side*.105;}
 const disc=mesh('Brake_disc',new T.CylinderGeometry(.19,.19,.018,32),mats.rim,spin);disc.rotation.z=Math.PI/2;disc.position.x=s*.064;
 const hub=mesh('Wheel_hub',new T.CylinderGeometry(.052,.052,.23,16),mats.carbon,spin);hub.rotation.z=Math.PI/2;
 for(let i=0;i<10;i++)for(const branch of [-1,1]){const a=i*Math.PI/5,pts=[[s*.111,.052*Math.cos(a),.052*Math.sin(a)],[s*.114,.15*Math.cos(a+.035*branch),.15*Math.sin(a+.035*branch)],[s*.106,.232*Math.cos(a+.085*branch),.232*Math.sin(a+.085*branch)]];line('Alloy_Y_spoke',pts,.007,mats.rim,spin);}
 const cal=box('Brake_caliper',[.035,.12,.055],[s*.068,.025,-.17],mats.red,turn);
 // A single contrasting sidewall line makes rotation verifiable without motion blur.
 line('Tyre_sidewall_marker',[[s*.12,.295,0],[s*.125,.325,0]],.006,mats.white,spin);
 }
 if(font){
 const makeText=(text,size,depth=.0007)=>font.generateShapes(text,size).map(sh=>new T.ShapeGeometry(sh,4));
 function label(text,size,pos,rot,name){const g=makeText(text,size);if(!g.length)return;let offset=0;for(let i=0;i<g.length;i++){const b=g[i];b.computeBoundingBox();offset=Math.max(offset,b.boundingBox.max.x);}const group=new T.Group();group.name=name;group.position.set(...pos);group.rotation.set(...rot);statics.add(group);for(const b of g){b.translate(-offset/2,0,0);mesh(name,b,mats.white,group);}}
 label('SAFETY CAR',.092,[0,.883,1.00],[-Math.PI/2,0,Math.PI],'Bonnet_lettering');
 for(const s of [-1,1])label('SAFETY CAR',.095,[s*.899,.47,-.05],[0,s*Math.PI/2,0],'Door_lettering');
 label('F1M',.065,[0,.435,-2.271],[0,Math.PI,0],'Rear_plate');
 }
 root.userData.rigNodes=wheels.map(w=>({steer:w.turn.name,spin:w.spin.name}));
 return {root,wheels,materials:mats};
}

export class SafetyCarRig {
 constructor(root){this.root=root;this.phase=0;this.wheelPhase=0;this.wheels=['FL','FR','RL','RR'].map(label=>({label,turn:root.getObjectByName('SC_Steer_'+label),spin:root.getObjectByName('SC_Spin_'+label)}));this.materials=new Map();root.traverse(o=>{if(o.isMesh){for(const m of (Array.isArray(o.material)?o.material:[o.material]))this.materials.set(m.name,m);}});}
 // dt in seconds, speed in m/s, steer in radians; no race physics changed here.
 update(dt,{speed=0,steer=0,lights='amber',braking=false,wheelAngles=null}={}){
  if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid dt');
  this.phase+=dt;this.wheelPhase=(this.wheelPhase+speed/.342*dt)%(Math.PI*2);
  const L=2.705,track=1.664,R=Math.abs(steer)<1e-6?Infinity:L/Math.tan(steer);
  this.wheels.forEach((w,i)=>{if(w.turn)w.turn.rotation.y=i<2?Math.atan(L/(R+(i===0?track/2:-track/2))):0;if(w.spin)w.spin.rotation.x=wheelAngles?.[i]??this.wheelPhase;});
  const beat=Math.floor(this.phase*8)%8;
  for(const [name,on] of [['SC_Amber_Left',beat===0||beat===2],['SC_Amber_Right',beat===4||beat===6]]){const m=this.materials.get(name);if(m)m.emissiveIntensity=lights==='amber'?(on?4:.05):.02;}
  const green=this.materials.get('SC_Green');if(green)green.emissiveIntensity=lights==='green'?3:0;
  const tail=this.materials.get('SC_Tail');if(tail)tail.emissiveIntensity=braking?4:1;
 }
 // F1M simulation coordinates: X/Y plane, psi points along world +X at zero.
 applyF1MPose(state){this.root.position.set(state.X,0,-state.Y);this.root.rotation.y=state.psi+Math.PI/2;}
 dispose(){const geometries=new Set(),materials=new Set();this.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.root.removeFromParent();}
}
