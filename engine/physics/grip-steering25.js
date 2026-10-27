import {isAttackConfig} from './attack-drive.js';
// Front-axle velocity determines slip angle. More steering beyond the tyre's
// lateral-force peak reduces grip in the actual frozen tyre curve. A driver
// unwinds the wheel there instead of holding full lock and sliding wide.
export function gripSteering25(car,out,c){
 const s=car.state,cmd=out.command;
 if(!isAttackConfig(c)||car.pit?.active||car.finishedAt!==null||out.trace?.rejection||out.trace?.selected!=='TRACK'||Math.hypot(s.u,s.v)<12||car.stability23?.active)return out;
 const axleAngle=Math.atan2(s.v+s.r*c.a,Math.max(4,s.u)),slipReserve=.08;
 const steer=Math.max(-c.steerMax,Math.min(c.steerMax,Math.max(axleAngle-slipReserve,Math.min(axleAngle+slipReserve,cmd.steer))));
 if(Math.abs(steer-cmd.steer)<1e-8)return out;
 car.gripSteering25??={corrections:0};car.gripSteering25.corrections++;
 return {...out,command:{...cmd,steer},trace:{...out.trace,steeringControl:'FRONT_SLIP_RESERVE',rawSteer:cmd.steer,axleAngle}};
}
