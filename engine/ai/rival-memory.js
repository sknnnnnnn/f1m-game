import {circuit,mod} from '../tracks/track.js';
// Only observed cars, bounded per-rival summaries. Confidence counts different
// corner visits, not repeated samples of the same defensive movement.
export function observeRivals(agent,state,p){
 const memory=agent.rivals??(agent.rivals=new Map());
 for(const o of p.cars){if(o.pit||Math.abs(o.gap)>200)continue;
  let m=memory.get(o.id);if(!m){m={id:o.id,lastS:o.s,totalS:o.s,visits:new Map(),covers:0,coverSamples:0,brakingDistance:120,brakingSamples:0,exitAcceleration:4,exitSamples:0};memory.set(o.id,m);}
  m.totalS+=circuit.delta(o.s,m.lastS);m.lastS=o.s;
  for(const turn of circuit.turns){const distance=circuit.delta(turn.s,o.s),key=Math.floor((m.totalS+distance)/circuit.length)+':'+turn.number;
   let visit=m.visits.get(key);if(!visit){visit={};m.visits.set(key,visit);if(m.visits.size>24)m.visits.delete(m.visits.keys().next().value);}
   if(distance>60&&distance<170&&!visit.cover){visit.cover=true;m.coverSamples++;if(Math.sign(o.lateral)===Math.sign(turn.k)&&Math.abs(o.lateral)>1.2)m.covers++;}
   if(distance>15&&distance<300&&o.brake>.15&&!visit.braked){visit.braked=true;m.brakingDistance=m.brakingSamples?m.brakingDistance*.7+distance*.3:distance;m.brakingSamples++;}
   if(distance< -25&&distance> -95&&o.throttle>.6&&!visit.exit){visit.exit=true;m.exitAcceleration=m.exitSamples?m.exitAcceleration*.7+o.ax*.3:o.ax;m.exitSamples++;}
  }
 }
 return memory;
}
export function rivalSummary(agent,id){const m=agent.rivals?.get(id);return m?{id,insideRate:m.coverSamples?m.covers/m.coverSamples:.5,observedCorners:m.coverSamples,brakingDistance:m.brakingDistance,brakingSamples:m.brakingSamples,exitAcceleration:m.exitAcceleration,confidence:Math.min(1,m.coverSamples/5)}:{id,insideRate:.5,observedCorners:0,brakingDistance:120,brakingSamples:0,exitAcceleration:4,confidence:0};}
