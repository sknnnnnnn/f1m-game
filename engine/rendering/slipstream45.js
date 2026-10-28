import {slipstreamCue45} from './slipstream-cue45.js';
export function mountSlipstream45(){
 const style=document.createElement('style');style.textContent=`
 #tow-fx45{position:fixed;inset:0;z-index:25;pointer-events:none}
 #tow-fx45 canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.65}
 #tow-readout45{position:fixed;top:84px;left:14px;max-width:calc(100vw - 146px);padding:9px 12px;border:1px solid #70e8f5;border-left:4px solid #a0f6ff;border-radius:8px;background:#092a38eb;box-shadow:0 0 24px #51daed30;color:#d5fbff;font:600 12px system-ui}
 #tow-readout45 small{display:block;font:10px system-ui;color:#9ec7d0;margin-top:3px}
 #tow-meter45{height:3px;background:#28515a;margin-top:7px;border-radius:3px;overflow:hidden}
 #tow-meter45 i{display:block;height:100%;width:0;background:#8bf5ff;transition:width .15s}
 #tow-fx45[hidden]{display:none}
 @media(max-height:500px){#tow-readout45{top:63px;padding:6px 10px}}
 @media(prefers-reduced-motion:reduce){#tow-fx45 canvas{display:none}#tow-meter45 i{transition:none}}
 `;document.head.append(style);
 const root=document.createElement('div');root.id='tow-fx45';root.hidden=true;root.setAttribute('aria-hidden','true');
 root.innerHTML='<canvas></canvas><div id="tow-readout45"><span></span><small></small><div id="tow-meter45"><i></i></div></div>';
 document.body.append(root);const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),title=root.querySelector('span'),detail=root.querySelector('small'),bar=root.querySelector('i'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let was=false,entryAt=0,lastDraw=-Infinity,lastText=-Infinity;
 return {update(car,options){
  const cue=slipstreamCue45(car,options),now=options.now??0;
  // The overview remains a clean map; the 3D camera views carry the cue.
  const active=cue.active&&options.camera!=='overview';root.hidden=!active;
  if(!active){was=false;return;}
  if(!was){entryAt=now;lastText=-Infinity;}was=true;
  if(now-lastText>120){title.textContent=cue.label;detail.textContent=`แรงต้าน −${Math.round(cue.relief*100)}% · ${Math.round(cue.speed*3.6)} กม./ชม.`;bar.style.width=Math.round(cue.strength*100)+'%';lastText=now;}
  if(reduced.matches||!ctx||now-lastDraw<33)return;lastDraw=now;
  const w=Math.round(Math.min(700,innerWidth)),h=Math.round(w*innerHeight/Math.max(1,innerWidth));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.clearRect(0,0,w,h);const pulse=Math.max(0,1-(now-entryAt)/700),cx=w*.5,cy=h*.47;
  ctx.strokeStyle=`rgba(139,243,255,${(.12+.2*cue.strength+.12*pulse).toFixed(3)})`;ctx.lineWidth=.7;
  // A fixed count of peripheral rays: no particles, textures or growing arrays.
  for(let i=0;i<26;i++){
   const angle=i*2.39996323,phase=(now*.0007*(.8+cue.strength)+i*.131)%1,r=.65+phase*.55;
   const dx=Math.cos(angle)*w*.72,dy=Math.sin(angle)*h*.85,length=.035+.07*cue.strength;
   const x=cx+dx*r,y=cy+dy*r;if(x>w*.23&&x<w*.77&&y>h*.22&&y<h*.8)continue;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(cx+dx*(r+length),cy+dy*(r+length));ctx.stroke();
  }
 }};
}
