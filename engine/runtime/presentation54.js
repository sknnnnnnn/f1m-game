import {teamCars53} from '../race/team-access53.js';
// Physics and saves retain full plans/history. The live viewport does not use
// Newton trajectories or opponents' strategy reports, so do not clone them
// across the worker boundary on every frame.
export function compactFrame54(frame){
 const own=new Set(teamCars53(frame));
 const compact=car=>{const value={...car};if(car.agent)value.agent={...car.agent,plan:null};if(!own.has(car.id)){delete value.intelligence;delete value.perception;delete value.tyreManagement;}return value;};
 return {...frame,cars:frame.cars.map(compact),snapshot:{...frame.snapshot,cars:frame.snapshot.cars.map(compact),events:frame.snapshot.events?.slice(-40)},events:frame.events?.slice(-40)};
}
