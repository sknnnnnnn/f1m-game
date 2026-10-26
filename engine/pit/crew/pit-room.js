import * as T from 'three';
import {PIT_LAYOUT as L} from './pit-layout.js';
export function createPitRoom(scene){
 const materials={wall:new T.MeshStandardMaterial({color:0x3e555b,roughness:.85}),floor:new T.MeshStandardMaterial({color:0x6a7a7c,roughness:.82}),dark:new T.MeshStandardMaterial({color:0x172e35,roughness:.5}),metal:new T.MeshStandardMaterial({color:0x7d969b,metalness:.65,roughness:.4}),teal:new T.MeshStandardMaterial({color:0x166e69}),light:new T.MeshStandardMaterial({color:0xc9e9e4,emissive:0xb4ddd7,emissiveIntensity:1.5})};
 const room=new T.Group();room.name='Team garage and protected crew standby';scene.add(room);
 function box(name,size,pos,mat){const o=new T.Mesh(new T.BoxGeometry(...size),mat);o.name=name;o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;room.add(o);return o;}
 box('Garage floor',[8,.06,12],[-10.55,.03,0],materials.floor);box('Garage rear wall',[.18,3.9,12],[-14.55,1.95,0],materials.wall);
 for(const z of [-6,6])box('Garage side wall',[8,3.9,.16],[-10.55,1.95,z],materials.wall);
 for(const z of [-5.65,5.65])box('Door pillar',[.22,3.9,.35],[-6.55,1.95,z],materials.teal);
 box('Open garage header',[.35,.45,11.7],[-6.55,3.9,0],materials.dark);
 for(const z of [-4.8,0,4.8])box('Ceiling light',[6,.035,.12],[-10.5,3.7,z],materials.light);
 for(const z of [-4,0,4]){box('Equipment cabinet',[.7,1.7,1.6],[-13.9,.85,z],materials.dark);for(let n=0;n<4;n++)box('Cabinet pull',[.03,.025,1.2],[-13.53,.35+n*.3,z],materials.metal);}
 box('Worktop',[.85,.09,4.4],[-12.8,.88,0],materials.metal);
 for(const z of [-2,2])box('Worktop foot',[.06,.85,.06],[-12.8,.425,z],materials.dark);
 for(const z of [-5.4,5.4]){box('Crew rest bench',[3.6,.12,.46],[-9.6,.42,z],materials.dark);for(const x of [-11,-8.3])box('Bench foot',[.08,.35,.38],[x,.18,z],materials.metal);}
 for(const z of [-5.0,5.0])box('Garage threshold marking',[.08,.012,1.0],[-6.38,.075,z],materials.light);
 for(const x of [-5.85,5.85])box('Working apron boundary',[.055,.013,13],[x,.04,0],materials.teal);
 const c=document.createElement('canvas');c.width=768;c.height=144;const ctx=c.getContext('2d');ctx.fillStyle='#122c33';ctx.fillRect(0,0,768,144);ctx.fillStyle='#c6e4d6';ctx.font='600 66px sans-serif';ctx.textAlign='center';ctx.fillText('F1M   /   TEAM GARAGE',384,96);
 const sign=new T.Mesh(new T.PlaneGeometry(7.5,1.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));sign.position.set(-14.43,2.8,0);sign.rotation.y=Math.PI/2;room.add(sign);
 // A single transparent floor atlas names real storage positions without
 // adding obstacles or loose props to the crew's existing walking routes.
 const floorCanvas=document.createElement('canvas');floorCanvas.width=1024;floorCanvas.height=1536;const fx=floorCanvas.getContext('2d'),px=x=>(x+14.55)/8*1024,pz=z=>(z+6)/12*1536;
 function floorText(text,x,z,color='#b8d6c2',size=22){fx.save();fx.translate(px(x),pz(z));fx.rotate(Math.PI/2);fx.fillStyle=color;fx.font=`600 ${size}px sans-serif`;fx.textAlign='center';fx.fillText(text,0,0);fx.restore();}
 for(const [row,label]of ['FL','FR','RL','RR'].entries()){const z=-1.3+row*1.7;for(const [x,used]of [[-7.45,false],[-10.45,true]]){fx.strokeStyle=used?'#ceb78f99':'#a2d8c299';fx.lineWidth=3;fx.beginPath();fx.ellipse(px(x),pz(z),.46/8*1024,.46/12*1536,0,0,Math.PI*2);fx.stroke();floorText(label+(used?' / USED':' / READY'),x+.08,z+.59,used?'#d4bc96':'#c3e2d1',18);}}
 for(const [x,text]of [[-7.45,'READY TYRES'],[-10.45,'RETURN / USED']])floorText(text,x,-.0-2.2,'#c3d8cc',24);
 for(const [x,name]of [[-8.12,'NEW NOSE'],[-10.52,'RETURN NOSE']]){fx.strokeStyle='#99bab580';fx.lineWidth=2;fx.strokeRect(px(x-.45),pz(-4.42),.90/8*1024,2.48/12*1536);floorText(name,x+.03,-4.64,'#b4c9bd',18);}
 floorText('KEEP AISLE CLEAR',-11.8,.8,'#a0b9b0',20);
 const floorTexture=new T.CanvasTexture(floorCanvas);floorTexture.colorSpace=T.SRGBColorSpace;const markings=new T.Mesh(new T.PlaneGeometry(8,12),new T.MeshBasicMaterial({map:floorTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));markings.name='Labelled ready and return storage positions';markings.rotation.x=-Math.PI/2;markings.position.set(-10.55,.067,0);room.add(markings);
 const boardCanvas=document.createElement('canvas');boardCanvas.width=1024;boardCanvas.height=256;const bx=boardCanvas.getContext('2d');bx.fillStyle='#112b32';bx.fillRect(0,0,1024,256);const roleColors=['#7fc8b4','#7fabc7','#d0b875','#c68b80'];for(let i=0;i<4;i++){bx.fillStyle=roleColors[i];bx.fillRect(14+i*256,26,5,194);bx.font='bold 58px sans-serif';bx.fillText(['FL','FR','RL','RR'][i],34+i*256,88);bx.fillStyle='#d2e0d6';bx.font='24px sans-serif';bx.fillText('GUN / OFF / ON',34+i*256,144);bx.font='20px sans-serif';bx.fillText('CHECK • PREPARE',34+i*256,190);}
 const boardTexture=new T.CanvasTexture(boardCanvas);boardTexture.colorSpace=T.SRGBColorSpace;const boardGeometry=new T.PlaneGeometry(5.5,1.375),boardMaterial=new T.MeshBasicMaterial({map:boardTexture,side:T.FrontSide});for(const side of [-1,1]){const board=new T.Mesh(boardGeometry,boardMaterial);board.position.set(-6.58+side*.004,2.91,0);board.rotation.y=side*Math.PI/2;board.name=side>0?'Corner crew board facing apron':'Corner crew board facing garage';room.add(board);}
 const light=new T.PointLight(0xc5ede4,35,16,2);light.position.set(-10,3.4,0);room.add(light);
 return {room,obstacles:[{x:-12.8,z:0,hx:.425,hz:2.2,h:.93},...[-4,0,4].map(z=>({x:-13.9,z,hx:.35,hz:.8,h:1.7})),...[-5.4,5.4].map(z=>({x:-9.6,z,hx:1.8,hz:.23,h:.5}))]};
}
