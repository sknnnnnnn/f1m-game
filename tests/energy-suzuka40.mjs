import assert from 'node:assert/strict';
import {resourcePlan} from '../engine/race/race-resources.js';
import {circuit} from '../engine/tracks/track.js';
import {zonesFor24} from '../engine/drs/drs24.js';
assert.equal(circuit.key,'suzuka');const zone=zonesFor24()[0],a={config:{capacity:8e6},style:{tyreCare:.15},tyreManagement:{exitFactor:1},raceContext:{remaining:circuit.length*3},engineerOrder:{energy:'AUTO'},drsZone40:false},s={time:60,E:2.4e6,wheels:Array.from({length:4},()=>({wear:.05,Ts:80}))},p={own:{s:zone.start+100,k:0},speed:60,cars:[{id:1,pit:false,gap:40,relativeSpeed:-2}]},energy=s.E;
assert.equal(resourcePlan(a,s,p).allowDeploy,false);a.drsZone40=true;assert.equal(resourcePlan(a,s,p).allowDeploy,true);a.drsZone40=false;a.engineerOrder.energy='DEPLOY';assert.equal(resourcePlan(a,s,p).allowDeploy,true,'explicit deployment order remains available');a.engineerOrder.energy='AUTO';assert.equal(resourcePlan(a,{...s,time:2},p).allowDeploy,true,'launch deployment is retained');a.drsZone40=true;assert.equal(resourcePlan(a,{...s,E:8e5},p).allowDeploy,false,'battery reserve still protects finite energy');assert.equal(s.E,energy,'strategy never creates or removes physical energy');
console.log('PASS Suzuka AUTO banks between straights, deploys in the mapped passing zone, retains launch/manual control and respects the physical store');
