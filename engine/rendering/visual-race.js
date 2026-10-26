import {intelligenceView} from '../ai/battle-planner.js';
import {Race} from '../race/engine.js';
// Presentation telemetry only; authoritative physics and control inputs are unchanged.
export class VisualRace extends Race {
 reset(){super.reset();for(const c of this.cars)c.visualAngles=[0,0,0,0];}
 commitAdvance(proposed){const old=proposed.map(q=>q.car.state.wheels.map(w=>w.omega));const ok=super.commitAdvance(proposed);if(ok)for(let i=0;i<proposed.length;i++){const q=proposed[i],angles=q.car.visualAngles;let previous=old[i];for(const r of q.result.records){r.state.wheels.forEach((w,k)=>angles[k]+=(previous[k]+w.omega)*.5*r.h);previous=r.state.wheels.map(w=>w.omega);}}return ok;}
 presentation(){const p=super.presentation();p.cars=p.cars.map((car,i)=>{const c=this.cars[i],s=c.state;return {...car,draft:c.draft??0,intelligence:intelligenceView(c.agent),state:{...car.state,time:s.time,delta:s.delta,gear:s.gear,r:s.r,lastAx:s.lastAx,lastAy:s.lastAy,throttle:s.throttle,brake:s.brake,wheels:s.wheels.map(w=>({omega:w.omega})),wheelAngles:[...c.visualAngles]}};});return p;}
}
