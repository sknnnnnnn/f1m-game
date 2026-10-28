import {ACTION42} from '../race/action42.js';
// Actuator overshoot protection, not a velocity clamp. Retain the106m/s
// atomic envelope guard; taper real torque in its physical reaction margin.
export function speedLimit47(config,state,command){
 const speed=Math.hypot(state.u,state.v),start=ACTION42.maxSpeed+1;
 if(!Number.isFinite(speed)||speed<=start)return command;
 const throttle=Math.min(command.throttle??0,Math.max(0,Math.min(1,start+1-speed)));
 return {...command,throttle,energy:false};
}
