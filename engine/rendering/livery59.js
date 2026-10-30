import {TEAMS52} from '../race/roster52.js';
// One shared atlas and one instance tile attribute for the entire grid.
// New paint detail does not create a material/texture draw call per car.
export function createLivery59(T,{cpu=false}={}){
 const tile=512,canvas=document.createElement('canvas');canvas.width=tile*4;canvas.height=tile*3;const x=canvas.getContext('2d'),geometries=new WeakMap(),materials=new Map();
 const palettes=[['#ce0b2f','#ffffff','#23151c'],['#acb6bf','#29e7c9','#101b24'],['#ff831f','#131820','#111820'],['#101d43','#ffd22f','#081020'],['#006758','#d7ee42','#073c37'],['#0759cf','#f3f5fa','#08234c'],['#137caf','#ff91c0','#101e39'],['#f0f1f0','#e3283e','#21252c'],['#f6f7ff','#2362e6','#151b38'],['#b6b8bb','#f22d43','#24282e'],['#20242b','#e8e7df','#a6aab2']];
 const poly=(points,c)=>{x.fillStyle=c;x.beginPath();for(let i=0;i<points.length;i++)x[i?'lineTo':'moveTo'](...points[i]);x.closePath();x.fill();};
 for(let i=0;i<11;i++){const row=Math.floor(i/4),col=i%4,[base,accent,dark]=palettes[i];x.save();x.translate(col*tile,row*tile);x.fillStyle=base;x.fillRect(0,0,tile,tile);
  // Top: painted spine, layered shoulder graphics, exposed carbon boundaries.
  poly([[0,0],[512,0],[512,54],[340,81],[220,62],[0,100]],dark);poly([[0,256],[512,256],[512,202],[340,175],[220,194],[0,156]],dark);
  const sweep=([1,3,4,9].includes(i)?1:-1)*16;
  for(const side of [-1,1]){poly([[12,128+side*30],[190,128+side*24],[335,128+side*(72+sweep)],[505,128+side*70],[505,128+side*87],[325,128+side*(86+sweep)],[180,128+side*35]],accent);}
  x.strokeStyle=accent;x.lineWidth=2;x.beginPath();x.moveTo(0,124);x.lineTo(145,124);x.moveTo(0,132);x.lineTo(145,132);x.stroke();
  // Side: distinct multi-panel sweep, narrow keyline and carbon lower edge.
  poly([[0,480],[512,480],[512,512],[0,512]],dark);poly([[0,350],[180,375],[300,298],[512,279],[512,320],[310,338],[195,417],[0,390]],dark);
  poly([[0,341],[175,367],[299,287],[512,269],[512,281],[303,300],[183,382],[0,356]],accent);
  if(i===3){poly([[310,74],[366,100],[332,131],[391,142],[350,176],[293,155],[321,122],[272,102]],'#ed293e');}
  if(i===2){poly([[280,286],[355,265],[410,304],[353,323]],'#10141c');}
  if(i===6){poly([[235,427],[360,346],[512,338],[512,374],[370,379],[252,452]],'#ff91c0');}
  if(i===8){poly([[0,269],[132,281],[262,354],[232,385],[112,312],[0,301]],'#2362e6');}
  if(i===10){poly([[275,265],[336,265],[480,422],[418,422]],'#f0eee3');}
  // Label blocks are painted into the atlas rather than floating planes.
  const light=[1,7,8,9].includes(i);x.fillStyle=light?'#17202c':'#ffffff';x.font='italic 900 30px sans-serif';x.textAlign='center';x.fillText(TEAMS52[i].name.replace(' Racing','').replace(' F1 Team','').toUpperCase(),345,423,250);
  x.font='bold 12px sans-serif';x.letterSpacing='2px';x.fillText('F1M  •  MOTORSPORT',345,445,220);x.letterSpacing='0px';
  x.save();x.translate(350,128);x.rotate(Math.PI/2);x.font='bold 20px sans-serif';x.fillStyle=light?'#17202c':'#ffffff';x.fillText(TEAMS52[i].name.replace(' Racing','').toUpperCase(),0,0,130);x.restore();
  x.strokeStyle=accent;x.lineWidth=1;for(const y of [292,470]){x.beginPath();x.moveTo(210,y);x.lineTo(490,y-12);x.stroke();}x.fillStyle=light?'#17202c':'#f3f1e8';x.font='bold 10px monospace';x.fillText('HYBRID / '+String(i+1).padStart(2,'0'),425,465,100);x.fillStyle=accent;x.fillRect(84,315,58,4);x.fillStyle=light?'#17202c':'#ffffff';x.font='bold 16px monospace';x.fillText('F1M',112,339);
  for(let j=0;j<9;j++){x.fillStyle=j%2?'#12171d':'#293039';x.fillRect(250+j*19,488,11,3);}
  x.restore();
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.name='F1M 11-team painted atlas R59';
 function shader(shader){shader.uniforms.liveryTile59={value:this.userData.liveryTile59??0};shader.vertexShader=shader.vertexShader.replace('#include <uv_pars_vertex>','#include <uv_pars_vertex>\n#ifdef USE_INSTANCING\nattribute float liveryRow59;\n#endif\nuniform float liveryTile59;');shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nfloat tile59=liveryTile59;\n#ifdef USE_INSTANCING\ntile59=liveryRow59;\n#endif\nvMapUv=vMapUv*vec2(0.25,1.0/3.0)+vec2(mod(tile59,4.0)*0.25,(2.0-floor(tile59/4.0))/3.0);\n#endif');}
 function projected(source,index){let variants=geometries.get(source);if(!variants){variants=new Map();geometries.set(source,variants);}const variant=cpu?index:-1;if(variants.has(variant))return variants.get(variant);const g=source.index?source.toNonIndexed():source.clone(),p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i+=3){let nx=0,ny=0;for(let j=0;j<3;j++){nx+=Math.abs(n.getX(i+j));ny+=Math.abs(n.getY(i+j));}const side=nx>ny;for(let j=0;j<3;j++){const k=i+j,z=p.getZ(k),a=side?p.getY(k):p.getX(k);uv[k*2]=Math.max(.006,Math.min(.994,(z+2.8)/5.6));uv[k*2+1]=side?.015+.46*Math.max(0,Math.min(1,(a-.1)/1.15)):.515+.47*Math.max(0,Math.min(1,(a+1.2)/2.4));}}
  if(cpu)for(let i=0;i<p.count;i++){uv[i*2]=uv[i*2]/4+(index%4)/4;uv[i*2+1]=uv[i*2+1]/3+(2-Math.floor(index/4))/3;}g.setAttribute('uv',new T.BufferAttribute(uv,2));variants.set(variant,g);return g;
 }
 function paint(car,color){const team=TEAMS52.find(t=>parseInt((t.body??t.colour).slice(1),16)===color),index=(team?.id??1)-1;
  car.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const old=o.material,name=old.name,livery=name==='BaseColor',isBody=livery||name==='Bloody Red';let c=old.color;if(isBody)c=livery?0xffffff:color;if(name==='2ndColor')c=team?parseInt(team.accent.slice(1),16):0xffffff;if(name==='3rdColor')c=palettes[index][2];if(name==='Dark Black')c=0x111820;
   const key=name+':'+new T.Color(c).getHexString()+':'+(livery?index:'');let mat=materials.get(key);if(!mat){mat=new T.MeshStandardMaterial({name,color:c,metalness:name==='Dark Black'?.28:.46,roughness:name==='Dark Black'?.52:.29,side:T.DoubleSide});if(livery){mat.map=texture;mat.userData.livery59=true;mat.userData.liveryTile59=index;mat.onBeforeCompile=shader;mat.customProgramCacheKey=()=> 'F1M_LIVERY59';}materials.set(key,mat);}o.material=mat;if(livery){o.geometry=projected(o.geometry,index);o.userData.liveryRow59=index;}o.userData.modelMesh=true;o.castShadow=true;o.receiveShadow=true;
  });
 }
 return {paint,texture,canvas,stats:{teams:11,textures:1,width:canvas.width,height:canvas.height}};
}
