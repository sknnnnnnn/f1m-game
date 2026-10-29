import {circuit} from './track.js';
import {pitRoad} from '../pit/pit-lane.js';
export function gridSlot28(index,length=5.5){const station=circuit.gate-8-Math.floor(index/2)*16-index%2*8,lane=index%2?-2.4:2.4;return {station,lane,line:station+length/2+.30};}
function distance2(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
function candidates(minX,minY,maxX,maxY){const ids=new Set();for(let x=Math.floor(minX/40);x<=Math.floor(maxX/40);x++)for(let y=Math.floor(minY/40);y<=Math.floor(maxY/40);y++)for(const i of circuit.grid.get(x+','+y)??[])ids.add(i);return ids;}
export function clearMain28(x,y,margin=0){const r=circuit.width/2+margin+.15,p={x,y};for(const i of candidates(x-r,y-r,x+r,y+r))if(distance2(p,circuit.samples[i],circuit.samples[i+1])<=r*r)return false;return true;}
export function clearPit28(x,y,radius=0,margin=.5){const r=3.5+radius+margin,p={x,y};for(let id=1;id<=22;id+=2){const samples=pitRoad(id).samples;for(let i=0;i<samples.length-1;i++)if(distance2(p,samples[i],samples[i+1])<=r*r)return false;}return true;}
const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
function inside(p,t){const d=t.map((a,i)=>cross(a,t[(i+1)%3],p));return d.every(x=>x>=0)||d.every(x=>x<=0);}
function segmentsMeet(a,b,c,d){const u=cross(a,b,c),v=cross(a,b,d),w=cross(c,d,a),z=cross(c,d,b);if(u*v>0||w*z>0)return false;return Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))&&Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))<=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y));}
export function triangleClearMain28(points,margin=.10){
 const r=circuit.width/2+margin+.15,xx=points.map(p=>p.x),yy=points.map(p=>p.y),area=cross(points[0],points[1],points[2]);if(Math.abs(area)<1e-8)return false;
 for(const i of candidates(Math.min(...xx)-r,Math.min(...yy)-r,Math.max(...xx)+r,Math.max(...yy)+r)){
  const a=circuit.samples[i],b=circuit.samples[i+1];if(inside(a,points)||inside(b,points))return false;
  for(let j=0;j<3;j++){const c=points[j],d=points[(j+1)%3];if(segmentsMeet(a,b,c,d)||Math.min(distance2(c,a,b),distance2(d,a,b),distance2(a,c,d),distance2(b,c,d))<=r*r)return false;}
 }return true;
}

// Decorative geometry must not bridge over a pit lane when its vertices are clear.
export function triangleClearPit30(points,margin=1){const r=3.5+margin,xx=points.map(p=>p.x),yy=points.map(p=>p.y),minX=Math.min(...xx)-r,maxX=Math.max(...xx)+r,minY=Math.min(...yy)-r,maxY=Math.max(...yy)+r;
 for(let id=1;id<=22;id+=2){const samples=pitRoad(id).samples;for(let i=0;i<samples.length-1;i++){const a=samples[i],b=samples[i+1];if(Math.max(a.x,b.x)<minX||Math.min(a.x,b.x)>maxX||Math.max(a.y,b.y)<minY||Math.min(a.y,b.y)>maxY)continue;if(inside(a,points)||inside(b,points))return false;
  for(let j=0;j<3;j++){const c=points[j],d=points[(j+1)%3];if(segmentsMeet(a,b,c,d)||Math.min(distance2(c,a,b),distance2(d,a,b),distance2(a,c,d),distance2(b,c,d))<=r*r)return false;}
 }}return true;
}
