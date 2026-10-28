import {zonesFor24} from '../drs/drs24.js';
const cache=new WeakMap();export const TEAM_MAP_COLORS32=[0xe44b59,0xe44b59,0x45b5c9,0x45b5c9,0xe8bc59,0xe8bc59];
export function mapLayout24(track,width=372,height=230){const b=track.bounds,k=Math.min((width-40)/b.width,(height-42)/b.height);return {width,height,point:(x,y)=>[width/2+(x-b.cx)*k,height/2+5-(y-b.cy)*k]};}
export function drawMinimap24(canvas,track,cars,selected,{pitRoad=null,pit=null,colors=TEAM_MAP_COLORS32,living=null}={}){
 const ctx=canvas.getContext('2d'),width=canvas.width,height=canvas.height;let entry=cache.get(canvas);
 if(!entry||entry.track!==track||entry.width!==width||entry.height!==height){const base=document.createElement('canvas');base.width=width;base.height=height;const x=base.getContext('2d'),layout=mapLayout24(track,width,height),point=layout.point;x.lineJoin='round';x.lineCap='round';
  const path=(from,to,color,lw)=>{x.beginPath();for(let s=from;s<to;s+=8){const q=track.at(s),p=point(q.x,q.y);s===from?x.moveTo(...p):x.lineTo(...p);}const q=track.at(to);x.lineTo(...point(q.x,q.y));x.strokeStyle=color;x.lineWidth=lw;x.stroke();};
  path(0,track.length,'#020a10',10);path(0,track.length,'#aab9c5',4);for(const z of zonesFor24(track))path(z.start,z.start+(z.end-z.start+track.length)%track.length,'#81e5bc',5);
  if(pitRoad&&pit){x.beginPath();for(let s=pit.entry;s<=pit.exit;s+=10){const q=pitRoad(1).at(s),p=point(q.x,q.y);s===pit.entry?x.moveTo(...p):x.lineTo(...p);}x.strokeStyle='#668d9f';x.lineWidth=2;x.stroke();}const q=track.at(0),p=point(q.x,q.y);x.fillStyle='#fff';x.fillRect(p[0]-3,p[1]-3,6,6);
  entry={base,track,width,height,layout};cache.set(canvas,entry);
 }
 ctx.clearRect(0,0,width,height);ctx.drawImage(entry.base,0,0);const point=entry.layout.point,hits=[];
 if(living){for(const d of living.debris??[])if(!d.removed){const p=point(d.x,d.y);ctx.fillStyle='#ffc357';ctx.fillRect(p[0]-2,p[1]-2,4,4);}}
 for(const c of cars??[]){if(c.live26?.removed)continue;const p=point(c.state.X,c.state.Y);ctx.fillStyle=c.id===7?'#fff':('#'+(colors[c.id-1]??0x97aabd).toString(16).padStart(6,'0'));ctx.strokeStyle='#07131c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(...p,5,0,Math.PI*2);ctx.fill();ctx.stroke();if(c.id===selected){ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(...p,10,0,Math.PI*2);ctx.stroke();const tip=point(c.state.X+Math.cos(c.state.psi??0)*18,c.state.Y+Math.sin(c.state.psi??0)*18),a=Math.atan2(tip[1]-p[1],tip[0]-p[0]);ctx.beginPath();ctx.moveTo(p[0]+Math.cos(a)*17,p[1]+Math.sin(a)*17);ctx.lineTo(p[0]+Math.cos(a+2.5)*7,p[1]+Math.sin(a+2.5)*7);ctx.lineTo(p[0]+Math.cos(a-2.5)*7,p[1]+Math.sin(a-2.5)*7);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();}hits.push({id:c.id,x:p[0],y:p[1]});}return hits;
}
export function mapHit24(hits,x,y,canvas,rect){const sx=canvas.width/rect.width,sy=canvas.height/rect.height,px=(x-rect.left)*sx,py=(y-rect.top)*sy;return hits.map(h=>({...h,d:Math.hypot((h.x-px)/sx,(h.y-py)/sy)})).filter(h=>h.id!==7&&h.d<19).sort((a,b)=>a.d-b.d)[0]?.id??null;}
