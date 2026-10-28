import {circuit,clamp} from '../tracks/track.js';
// Leave tracking/footprint margin. Tactical proposals share the road limits
// used by the final corridor gate, including Bahrain's narrower usable road.
export const tacticalLimit26=()=>Math.min(circuit.width/2-1.7,circuit.key==='bahrain'?3.3:3.8);
export const tacticalLane26=lane=>clamp(lane,-tacticalLimit26(),tacticalLimit26());
export function passingLanes26(own,rival,safe){
 const limit=tacticalLimit26();
 return [...new Set([rival-2.6,rival+2.6,-limit,-2.6,0,2.6,limit].map(tacticalLane26))]
  .filter(n=>Math.abs(n-own)<=4.3&&Math.abs(n-rival)>2.3&&safe(n));
}
