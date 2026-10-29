import {PoseBuffer} from '../physics/pose-buffer.js';
// PoseBuffer already interpolates telemetry and wheel phases in the same sample.
export class VisualBuffer extends PoseBuffer {}

export function pose3D(state){return {x:state.X,y:0,z:-state.Y,yaw:state.psi-Math.PI/2};}
export function frontAngles(delta,c){if(Math.abs(delta)<1e-10)return [0,0];return [1,-1].map(y=>Math.atan((c.a+c.b)/((c.a+c.b)/Math.tan(delta)-y*c.tf/2)));}

// Requested stronger steering readability; vehicle delta itself stays authoritative.
export const VISUAL_STEER_GAIN=1.35;
export function displayFrontAngles(delta,c){const d=Math.max(-.48,Math.min(.48,delta*VISUAL_STEER_GAIN));return frontAngles(d,c);}
