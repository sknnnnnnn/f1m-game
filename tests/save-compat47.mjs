// Optional comparison against a checkout of the verified R46 source.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {loadWeekend} from '../engine/race/weekend-save.js';
if(!process.env.R46_BASELINE)throw Error('Set R46_BASELINE to an R46 checkout');
const root=process.env.R46_BASELINE;
const {LivingSession26}=await import(pathToFileURL(root+'/engine/race/living-session26.js').href);
const {saveWeekend}=await import(pathToFileURL(root+'/engine/race/weekend-save.js').href);
const old=new LivingSession26(),text=saveWeekend(old),restored=loadWeekend(text);
assert.deepEqual(restored.race.config,old.race.config);
assert.deepEqual(restored.race.cars.map(c=>c.state.E),old.race.cars.map(c=>c.state.E));
assert.equal(restored.race.config.regenW,100000);
assert(restored.race.cars.every(c=>restored.race.configuration(c).regenW===350000));
for(let i=0;i<25;i++)assert(restored.race.advance());assert.equal(restored.race.stop,null);
fs.writeFileSync('reports/battles47/SAVE_COMPAT.json',JSON.stringify({status:'PASS',baselineCommit:'b4e8bb3b303294fef50b06ec4248e05a77ce3148',baseConfigIdentical:true,storedEnergyUnchanged:true,newPerCarRecoveryApplied:true,loadedAdvanceTicks:25,stop:null,scope:'Synthetic R46 standing-grid save loaded and advanced in R47; not every user save or every race phase.'},null,2));
console.log('PASS actual R46 save loads with unchanged base config/energy and receives the new per-car recovery without reset');
