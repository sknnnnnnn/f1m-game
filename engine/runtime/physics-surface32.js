import {circuit,clamp} from '../tracks/track.js';
import {surfaceAt} from '../race/weekend-environment.js';
export function surface32(env,x,y,compound,pit,heading=null){const at=circuit.project(x,y,heading),base=surfaceAt(env.weather,x,y,compound,pit,at),w=env.live,si=Math.floor(at.s/circuit.length*180)%180,li=clamp(Math.floor((at.d+circuit.width/2)/circuit.width*7),0,6),dry=w.drying[si*7+li]??0,puddle=(.5+.5*Math.sin(at.s*.027))**8*(Math.abs(at.d)>circuit.width*.27?1:.15),water=clamp(env.weather.water*(1-dry)*(1+.32*puddle),0,4),drain=compound==='W'?.17:compound==='I'?.38:1;
 let escape=false;for(const r of w.roads){for(let i=0;i<r.points.length-1;i++){const a=r.points[i],b=r.points[i+1],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1);if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<3.1){escape=true;break;}}if(escape)break;}
 return {...base,kind:escape&&Math.abs(at.d)>circuit.width/2?'ESCAPE':base.kind,mu:escape?Math.max(.86,base.mu):base.mu,water:water*drain,actualWater:water,puddle,dryLine:dry};
}
