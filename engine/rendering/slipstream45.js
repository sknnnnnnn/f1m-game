import {slipstreamCue45} from './slipstream-cue45.js';
// Presentation only. Speed and wake come from the selected car's measured state.
export function speedWind50(car,options={}){
 const cue=slipstreamCue45(car,options),speed=cue.speed;
 const moving=Number.isFinite(speed)&&options.running&&(options.phase??'RACE')==='RACE'&&(options.flag??'GREEN')==='GREEN'&&car&&car.id!==23&&!car.pit?.active&&!car.live26?.retired&&car.finishedAt==null;
 const velocity=moving?Math.max(0,Math.min(1,(speed*3.6-140)/180)):0;
 return {active:options.camera!=='overview'&&!!moving&&(velocity>.015||cue.active),speed:velocity,wake:cue.strength,strength:Math.max(velocity*.58,cue.strength)};
}
export function mountSlipstream45(){
 const style=document.createElement('style');style.textContent=`
 #tow-fx45{position:fixed;inset:0;z-index:25;pointer-events:none;--wind50:0;--wake50:0;background:transparent}
 #tow-fx45 canvas{position:absolute;inset:0;width:100%;height:100%}
 #tow-fx45[hidden],.menu49-open #tow-fx45,.sheet-open21 #tow-fx45{display:none!important}
 @media(prefers-reduced-motion:reduce){#tow-fx45 canvas{display:none}}
 `;document.head.append(style);
 const root=document.createElement('div');root.id='tow-fx45';root.hidden=true;root.setAttribute('aria-hidden','true');root.innerHTML='<canvas></canvas>';document.body.append(root);
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let lastDraw=-Infinity,lastNow=null,travel=0,smoothWake=0,smoothSpeed=0;
 return {update(car,options){
  const cue=speedWind50(car,options),now=options.now??0;root.hidden=!cue.active;if(!cue.active){lastNow=null;smoothWake=0;smoothSpeed=0;return;}
  const dt=lastNow===null?0:Math.min(.05,Math.max(0,(now-lastNow)/1000));lastNow=now;const blend=1-Math.exp(-dt/.3);smoothWake+=(cue.wake-smoothWake)*blend;smoothSpeed+=(cue.speed-smoothSpeed)*blend;travel=(travel+dt*.42*(.6+smoothSpeed*1.7+smoothWake*.6))%1;
  root.style.setProperty('--wake50',(smoothWake*.075).toFixed(3));root.style.setProperty('--wind50',cue.strength.toFixed(3));
  if(reduced.matches||!ctx||now-lastDraw<33)return;lastDraw=now;
  const w=Math.round(Math.min(720,innerWidth)),h=Math.round(w*innerHeight/Math.max(1,innerWidth));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.clearRect(0,0,w,h);
  const cx=w*.5,cy=h*.44;
  // Rays stay in the outer 16% and accelerate with measured speed. The road stays clear.
  for(let i=0;i<24;i++){
   const side=i%2?-1:1,phase=(travel+i*.137)%1;
   const y=((i*.6180339)%1)*h,edge=side<0?w*.06:w*.94,dx=edge-cx,dy=y-cy;
   const r=.94+phase*.40,len=.055+cue.strength*.11,x=cx+dx*r,py=cy+dy*r;
   ctx.strokeStyle=`rgba(${'188,222,237'},${(.025+Math.max(smoothSpeed*.58,smoothWake)*.2)*Math.sin(phase*Math.PI)})`;ctx.lineWidth=.55+phase*.8;
   ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(cx+dx*(r+len),cy+dy*(r+len));ctx.stroke();
  }
 }};
}
