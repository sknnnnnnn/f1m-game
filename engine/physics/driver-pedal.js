import {clamp} from '../tracks/track.js';
import {isAttackConfig} from './attack-drive.js';

// Driver demand is separate from the frozen physical actuator. Ease ordinary
// pedal movement; a braking, traffic, grip or rejected-plan command bypasses it.
export function smoothDriverPedal(c,s,out,car,enabled=true){
 const cmd=out.command,box=car.gearbox,v=Math.hypot(s.u,s.v),a=car.agent;
 const urgent=!enabled||!isAttackConfig(c)||out.trace?.rejection||out.trace?.selected!=='TRACK'||cmd.brake>0||a.corridorDecel<0||(a.trafficLimit??Infinity)<v+.5||out.trace.speedError<-.35||car.stability23?.active||car.live26?.escape||car.live26?.retired||car.live26?.engineFault||car.live26?.puncture>=0||car.mind?.until>s.time||car.contactBrakeUntil32>s.time||car.response21&&car.response21.phase!=='NORMAL';
 if(urgent){box.driverThrottle=cmd.throttle;return out;}
 const previous=box.driverThrottle??s.throttle??0,up=s.time<4?8:4,down=5;
 const throttle=clamp(previous+clamp(cmd.throttle-previous,-down*c.dt,up*c.dt),0,1);
 box.driverThrottle=throttle;
 return {...out,command:{...cmd,throttle},trace:{...out.trace,throttleControl:'PROGRESSIVE',rawThrottle:cmd.throttle}};
}
