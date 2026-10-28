import {isAttackConfig} from './attack-drive.js';
// Weekend brake-by-wire allocation: replace part of rear friction braking
// with recovery. Total brake demand, battery size and deploy power stay fixed.
// Keep the saved base config stable; this is applied with the per-car setup.
export function recoveryConfig47(config){
 return isAttackConfig(config)?{...config,regenW:350000,regenFraction:.75}:config;
}
