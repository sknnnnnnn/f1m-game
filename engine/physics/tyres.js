import {circuit} from '../tracks/track.js';
// Tuned for this five-lap sprint; not licensed real-world compound data.
export const COMPOUNDS=Object.freeze({
 S:Object.freeze({name:'SOFT',label:'นุ่ม',colour:'#f56b72',grip:1.055,wear:250}),
 M:Object.freeze({name:'MEDIUM',label:'กลาง',colour:'#f1d36c',grip:1,wear:160}),
 I:Object.freeze({name:'INTERMEDIATE',label:'ฝนกลาง',colour:'#6bd28b',grip:.91,wear:180}),
 W:Object.freeze({name:'WET',label:'ฝนหนัก',colour:'#6eb4ef',grip:.83,wear:210}),
 H:Object.freeze({name:'HARD',label:'แข็ง',colour:'#e3e7e8',grip:.965,wear:85})
});
export function tyreWear(state){return Math.max(...state.wheels.map(w=>w.wear));}
export function tyreConfig(base,compound){const t=COMPOUNDS[compound];if(!t)throw Error('UNKNOWN_COMPOUND');return {...base,version:base.version+'/TYRE-'+compound,mu:base.mu*t.grip,wearK:base.wearK*t.wear};}
export function tyreInfo(car){const t=car.tyres;if(!t)return null;const wear=tyreWear(car.state),compound=COMPOUNDS[t.compound];const age=Math.max(0,car.distance-t.fittedDistance),rate=age>400?wear/age:0;return {estimatedLapsToBox:rate>1e-8?Math.max(0,(.8-wear)/rate/circuit.length):null,compound:t.compound,name:compound.name,colour:compound.colour,health:Math.max(0,1-wear),wear,ageMetres:Math.max(0,car.distance-t.fittedDistance),ageLaps:Math.max(0,car.distance-t.fittedDistance)/circuit.length,sets:t.sets,temperature:car.state.wheels.reduce((v,w)=>v+w.Ts,0)/4};}
