import {clamp} from '../tracks/track.js';
export const isAttackConfig=c=>c.version?.startsWith('F1M-ATTACK-BRAKE/')&&!c.version.includes('-SC14');
// Sprint ABS modulates the physical brake actuator. It never writes velocity.
export function attackBrake(c,s,requested,box){if(!isAttackConfig(c)||requested<=.01||s.u<.5){box.absLimit=null;return requested;}
 const speed=Math.max(1,s.u),slips=s.wheels.map(w=>clamp((speed-w.omega*c.R)/speed,0,1)),lock=slips.slice().sort((a,b)=>a-b)[1],mechanical=(2*c.brakeF+2*c.brakeR)/(c.R*c.m),tyre=Math.min(...s.wheels.map(w=>Math.max(.5,1-.4*w.wear-.5*w.damage))),feed=clamp(.82*c.mu*tyre*(c.g+.5*c.rho*c.ClA*speed*speed/c.m)/mechanical,.08,1);
 let limit=box.absLimit??feed;if(lock>.18)limit=Math.max(.05,Math.min(limit,s.brake)-c.dt*3);else if(lock<.08)limit=Math.min(feed,limit+c.dt*1.6);box.absLimit=limit;return Math.min(requested,limit);
}
