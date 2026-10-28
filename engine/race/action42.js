// Deliberately amplified game tuning requested for frequent battles.
// Relief is measured from the closed-wing / clear-air drag coefficient.
export const ACTION42=Object.freeze({drsRelief:.56,draftRelief:.56,deployW:600000,motorTorque:900,maxSpeed:103});
export function straightTarget42(agent){
 const base=Math.min(97,agent.personality.pace??92)-rhythmPace42(agent);
 return Math.min(ACTION42.maxSpeed,agent.battle43?.pace??Infinity,base+(agent.drs40?8:0)+(agent.drafting?2:0));
}
// A repeatable driver's rhythm, independent of rank, gaps and race results.
// Some sections suit each driver better. Only the requested cruising pace
// changes; tyre limits, braking, finite ERS and collision checks still win.
export function rhythmPace42(agent){
 if(agent.id===7||!Number.isFinite(agent.id))return 0;
 const progress=agent.raceContext?.progress??0,length=agent.raceContext?.length??5500;
 const phase=progress/length*Math.PI*3+agent.id*1.7+(agent.seed??1)*.17;
 return 16*(.5+.5*Math.sin(phase));
}
