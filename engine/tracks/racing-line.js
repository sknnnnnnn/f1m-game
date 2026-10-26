import {SHANGHAI_LINE} from './shanghai-line.js';
import {CIRCUIT_LINES23} from './circuit-lines23.js';
import {circuit,clamp,mod} from './track.js';
// Geometric candidate only: minimise bending and distance inside the legal road.
// Opponent corridors, grip and braking decide whether this candidate is usable.
// No vehicle positions, speed, race result or corner pedal commands live here.
import {LINE_OFFSETS} from './racing-line-data.js';
const offsets=(circuit.key==='shanghai'?SHANGHAI_LINE:CIRCUIT_LINES23[circuit.key])??(circuit.imported33?Array(600).fill(0):LINE_OFFSETS);const N=offsets.length,H=circuit.length/N;
function racingOffset(station){
 const z=mod(station,circuit.length)/H,i=Math.floor(z),t=z-i;
 const B=[(1-t)**3/6,(3*t**3-6*t*t+4)/6,(-3*t**3+3*t*t+3*t+1)/6,t**3/6];
 return B.reduce((v,b,j)=>v+b*offsets[mod(i+j-1,N)],0);
}
const smooth=x=>{const t=clamp(x,0,1);return t*t*t*(10-15*t+6*t*t);};
export {racingOffset,smooth};
