import assert from 'node:assert/strict';
import {passingLanes26,tacticalLimit26} from '../engine/ai/tactical-lanes26.js';
const limit=tacticalLimit26();
// A narrow, unoccupied adjacent corridor must remain usable even when no
// lane from the old fixed grid falls inside it.
const right=passingLanes26(limit,limit,n=>n>limit-2.8&&n<limit-2.4);
assert(right.length,'do not miss the safe corridor immediately beside a rival');
const left=passingLanes26(-limit,-limit,n=>n< -limit+2.8&&n> -limit+2.4);
assert(left.length,'the same opening must work on the opposite side');
for(const own of [-limit,0,limit])for(const rival of [-limit,0,limit])for(const lane of passingLanes26(own,rival,()=>true)){
 assert(Math.abs(lane)<=limit);assert(Math.abs(lane-own)<=4.3);assert(Math.abs(lane-rival)>2.3);
}
assert.deepEqual(passingLanes26(0,0,()=>false),[],'blocked flanks never authorize a pass');
console.log('PASS adjacent-corridor opportunity, mirrored opening, body separation, road limits and blocked-flank veto');
