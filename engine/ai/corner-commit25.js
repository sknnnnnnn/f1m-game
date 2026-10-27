import {circuit} from '../tracks/track.js';
// Commit to a chosen entry line during heavy braking. A driver cannot decide
// to cross from one side of a hairpin to the other after turn-in has begun.
// Existing emergency following, grip recovery and pit commands still win.
export function cornerCommit25(agent,state,own){
 const speed=Math.hypot(state.u,state.v),edge=circuit.width/2-(agent.config?.width??1.9)/2-.7;
 if(agent.pitApproach||agent.recovery||Math.abs(own.d)>edge||speed<12){agent.entryCommit25=null;return null;}
 const turn=circuit.turns.map(t=>({...t,distance:(t.s-own.s+circuit.length)%circuit.length})).filter(t=>t.distance<Math.max(80,speed*2)&&Math.abs(t.k)>.012).sort((a,b)=>a.distance-b.distance)[0];
 if(!agent.entryCommit25&&(state.brake??0)>.18&&(turn||Math.abs(own.k)>.012))agent.entryCommit25={curve:agent.curve,lane:agent.targetLane,s:own.s,apex:turn?.s??own.s};
 const hold=agent.entryCommit25;
 if(hold&&circuit.delta(own.s,hold.apex)>45&&(state.brake??0)<.08&&Math.abs(own.k)<.012){agent.entryCommit25=null;return null;}
 return hold;
}
