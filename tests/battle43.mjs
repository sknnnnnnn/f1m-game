import assert from 'node:assert/strict';
import {battleWindow43} from '../engine/ai/battle-window43.js';
for(const gap of [-599,-100,-20,8,50,300])for(const time of [0,50,150]){
 const a={id:1,battleWindow43:{saving:true},raceContext:{remaining:9000}};
 const plan=battleWindow43(a,{time},{own:{d:0},cars:[{gap,lateral:0}]});
 assert.equal(plan.saving,false);assert.equal(plan.pace,Infinity);assert.equal(plan.cornerFactor,1);assert.equal(a.battleWindow43.saving,false);
}
console.log('PASS no regrouping slowdown, including old saving state');
