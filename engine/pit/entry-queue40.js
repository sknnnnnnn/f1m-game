import {circuit,wrap} from '../tracks/track.js';
import {PIT} from './pit-lane.js';
// A committed follower in the same entry queue is not crossing main-track
// traffic. An uncommitted, misaligned or fast unbraked follower still blocks.
export function samePitQueue40(other,projection,gap,closing){
 return gap<0&&other.pit?.phase==='APPROACH'&&!!other.pit.nextCompound&&projection.s>PIT.entry-360&&projection.s<PIT.entry+70&&Math.abs(projection.d)<1.4&&Math.abs(other.agent.targetLane)<.2&&Math.abs(wrap(other.state.psi-circuit.at(projection.s).psi))<.08&&(closing<=5||(other.state.brake??0)>.2&&-gap>6.5+closing*.25+closing*closing/16);
}
