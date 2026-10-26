import {circuit} from './track.js';import {pitRoad} from '../pit/pit-lane.js';
export function roadPose33(car){if(!circuit.imported33)return {height:0,grade:0};return car.pit?.active?pitRoad(car.id===7?1:car.id).project(car.state.X,car.state.Y):circuit.project(car.state.X,car.state.Y,car.state.psi);}
