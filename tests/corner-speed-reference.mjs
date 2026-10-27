import assert from 'node:assert/strict';
import {circuit} from '../engine/tracks/track.js';
import {CORNER_SPEED_REFS,cornerSpeedReference,referenceGripDemand} from '../engine/tracks/corner-speed-reference.js';
import {highSpeedConfig} from '../engine/physics/vehicle-preset.js';
import {C0} from '../racing/runtime/config.js';
const config=highSpeedConfig(C0),refs=CORNER_SPEED_REFS[circuit.key];
for(const turn of circuit.turns){
 const ref=cornerSpeedReference(circuit,turn.s);
 if(refs[turn.number]){assert(ref&&ref.weight>.999);assert(Math.abs(ref.speed*3.6-refs[turn.number])<1e-7);}
 else assert(!ref||ref.weight<1e-7,'unreferenced turn retains original plan');
}
for(let s=0;s<circuit.length;s+=.7)for(const tyre of [.45,.75,1])for(const k of [.0003,.004,.012,.04]){
 const base=.6*config.mu*tyre,grip=referenceGripDemand(circuit,s,k,base,config,tyre);
 assert(grip>=base&&grip<=.78*config.mu*tyre+1e-10);
 const next=referenceGripDemand(circuit,s+.001,k,base,config,tyre);
 assert(Math.abs(next-grip)<.002,'continuous preference at corners and lap seam');
 const faster=.79*config.mu*tyre;
 assert.equal(referenceGripDemand(circuit,s,k,faster,config,tyre),faster,'reference must not cap a faster safe plan');
}
console.log('PASS',circuit.key,'reference mapping, continuity, tyre scaling, physical budget, no speed cap');
