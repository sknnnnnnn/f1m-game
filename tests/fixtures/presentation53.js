import {PoseBuffer} from '../../engine/physics/pose-buffer.js';
export class VisualBuffer extends PoseBuffer {
 sample(now,running){const cars=super.sample(now,running);if(!cars||!running||this.frames.length<2)return cars;const target=now-this.delayMS;for(let i=1;i<this.frames.length;i++){const a=this.frames[i-1],b=this.frames[i];if(target>b.at)continue;const t=Math.max(0,Math.min(1,(target-a.at)/Math.max(.001,b.at-a.at)));return cars.map(c=>{const p=a.cars.find(v=>v.id===c.id)?.state,q=b.cars.find(v=>v.id===c.id)?.state;if(!p||!q)return c;return {...c,state:{...c.state,time:(p.time??0)+((q.time??0)-(p.time??0))*t,delta:p.delta+(q.delta-p.delta)*t,lastAx:(p.lastAx??0)+((q.lastAx??0)-(p.lastAx??0))*t,lastAy:(p.lastAy??0)+((q.lastAy??0)-(p.lastAy??0))*t,wheelAngles:q.wheelAngles.map((x,k)=>p.wheelAngles[k]+(x-p.wheelAngles[k])*t)}};});}return cars;}
}
export function pose3D(state){return {x:state.X,y:0,z:-state.Y,yaw:state.psi-Math.PI/2};}
export function frontAngles(delta,c){if(Math.abs(delta)<1e-10)return [0,0];return [1,-1].map(y=>Math.atan((c.a+c.b)/((c.a+c.b)/Math.tan(delta)-y*c.tf/2)));}

// Requested stronger steering readability; vehicle delta itself stays authoritative.
export const VISUAL_STEER_GAIN=1.35;
export function displayFrontAngles(delta,c){const d=Math.max(-.48,Math.min(.48,delta*VISUAL_STEER_GAIN));return frontAngles(d,c);}
