import {particles23} from './particles23.js';
// Brighter and longer sparks plus an additive glow core. Hard bounded pool;
// emission still follows actual speed, deceleration and kerb telemetry.
export function particles24(T,scene,c){return particles23(T,scene,c,{capacity:512,sparkLife:.46,sparkBurst:12,interval:.035,trail:.075,rearEmit:true,glow:true});}
