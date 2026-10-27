import {circuit} from './track.js';import {pitRoad} from '../pit/pit-lane.js';
const cache37=new WeakMap();
export function roadPose33(car){const s=car.state,old=cache37.get(s);if(old&&old.id===car.id&&old.pit===!!car.pit?.active&&old.X===s.X&&old.Y===s.Y&&old.psi===s.psi)return old.pose;const pose=compute37(car);cache37.set(s,{id:car.id,pit:!!car.pit?.active,X:s.X,Y:s.Y,psi:s.psi,pose});return pose;}
function compute37(car){if(!circuit.imported33)return {height:0,grade:0};return car.pit?.active?pitRoad(car.id===7?1:car.id).project(car.state.X,car.state.Y):circuit.project(car.state.X,car.state.Y,car.state.psi);}
