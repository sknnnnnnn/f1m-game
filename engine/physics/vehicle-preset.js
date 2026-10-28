import {ACTION42} from '../race/action42.js';
import {isAttackConfig,attackBrake} from './attack-drive.js';

// Isolated development preset. Original C0.json, physics and controller stay frozen.
function highSpeedConfig(base){return {...structuredClone(base),version:'F1M-ATTACK-BRAKE/6-ACTION42',Cs:12000,Cc:60000,Hsc:120,Hst:55,Hca:5,Ky:.9,Kpsi:1,Kr:.18,mu:2.7,steerRate:1.1,steerLag:.05,brakeF:6200,brakeR:2000,deployW:ACTION42.deployW,motorTorque:ACTION42.motorTorque,capacity:8000000,CdA:.65,ratios:[3.3,2.9,2.5,2.15,1.85,1.59,1.37,1.18],pedalRate:16};}
function selectGear(c,s){
  if(s.shiftRemaining>0)return s.shiftTarget;
  const omega=Math.max(0,(s.wheels[2].omega+s.wheels[3].omega)/2);
  const rpm=omega*c.ratios[s.gear-1]*c.finalRatio*60/(2*Math.PI);
  if(rpm>10500&&s.gear<8)return s.gear+1;
  if(rpm<6000&&s.gear>1)return s.gear-1;
  return s.gear;
}

function gearCommand(c,s,requested,box){
 const omega=Math.max(.1,(s.wheels[2].omega+s.wheels[3].omega)/2),wheelSpeed=omega*c.R,speed=Math.max(1,Math.abs(s.u));
 const slip=(wheelSpeed-speed)/Math.max(speed,wheelSpeed,1);
 // P2 driver assist trims throttle on measured rear-wheel slip. It cannot add
 // power and still passes through the original physical pedal slew/tyres.
 let tractionLimit=slip>.13?Math.max(.18,requested.throttle-(slip-.13)*3):requested.throttle;
 // Reapply torque progressively after a traction cut instead of jumping back
 // to full throttle every time rear slip crosses the assist threshold.
 if(isAttackConfig(c)){const previous=box.tractionThrottle??requested.throttle;tractionLimit=Math.min(tractionLimit,previous+c.dt*2.5);box.tractionThrottle=tractionLimit;}
 if(tractionLimit<requested.throttle-.001)box.tractionCuts=(box.tractionCuts??0)+1;const gear=selectGear(c,s);if(gear!==s.gear&&s.shiftRemaining<=0)box.lastShift=s.tick;
 // Deploy the existing finite hybrid store on hard acceleration; braking still
 // regenerates through the original physical energy model.
 const stableTraction=slip<.1&&tractionLimit>=requested.throttle-.03&&Math.abs(s.delta??0)<.035&&Math.abs(s.r??0)<.12;
 const energy=stableTraction&&box.allowDeploy!==false&&requested.throttle>.75&&requested.brake<.02&&speed>(box.deploySpeed??12)&&s.E>c.capacity*(box.hybridReserve??.12);
 return {...requested,gear,energy,brake:attackBrake(c,s,requested.brake??0,box),throttle:Math.min(requested.throttle,tractionLimit)};
}


// Prime the actual actuator before the frozen integrator: it retains its own
// torque interruption and completes the selected gear at the physical substeps.
const SHIFT_SECONDS=.025;
function prepareGearShift(s,cmd){
 if(cmd.gear&&cmd.gear!==s.gear&&s.shiftRemaining<=0){s.shiftTarget=cmd.gear;s.shiftRemaining=SHIFT_SECONDS-1e-12; // avoid a floating residual adding an extra substep
 }
}
export {highSpeedConfig,selectGear,gearCommand,prepareGearShift,SHIFT_SECONDS};
