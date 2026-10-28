import assert from 'node:assert/strict';
import {circuit} from '../engine/tracks/track.js';
import {zonesFor24,wingEligibility24,DRS_GAP_SECONDS} from '../engine/drs/drs24.js';
assert.equal(circuit.key,'suzuka');assert.equal(DRS_GAP_SECONDS,5);const zone=zonesFor24()[0];assert(zone);assert((zone.end-zone.start+circuit.length)%circuit.length>700,'the mapped main straight must not lose its approach section');
const car={id:1,state:{u:70,brake:0,delta:0},projection:{s:zone.start+5,k:circuit.at(zone.start+5).k},progress:zone.start+5,pit:{active:false},finishedAt:null},other={id:2,state:{u:70},projection:{s:zone.start+55},pit:{active:false},finishedAt:null};
const r={cars:[car,other],time:20,tick:1200,controlZone:{flag:'GREEN'},safetyCar:{phase:'PARKED'}};
assert(wingEligibility24(r,car));car.projection={s:480,k:circuit.at(480).k};car.progress=circuit.length+480;other.projection.s=530;r.tick++;assert(wingEligibility24(r,car),'wing remains usable on the straight beyond the former early cutoff');
car.state.brake=.3;r.tick++;assert(!wingEligibility24(r,car));car.state.brake=0;r.tick++;assert(!wingEligibility24(r,car),'braking still locks the wing for the rest of this passage');
console.log('PASS Suzuka main straight coverage, five-second detection and braking lock retained');
