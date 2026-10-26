import {SETUPS} from '../race/weekend-environment.js';
export const SETUP_RANGES={wing:[.8,1.2],ratio:[.94,1.06],bias:[.53,.64],stiffness:[.7,1.2],pressure:[20.5,24.5]};
export function tunedSetup(car){return {...(SETUPS[car.setup]??SETUPS.BALANCED),...(car.setupAdjust??{})};}
export function validSetupAdjust(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!SETUP_RANGES[k]))return false;return Object.entries(raw).every(([k,v])=>Number.isFinite(v)&&v>=SETUP_RANGES[k][0]&&v<=SETUP_RANGES[k][1]);}
