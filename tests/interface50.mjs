import assert from 'node:assert/strict';
import fs from 'node:fs';
import {speedWind50} from '../engine/rendering/slipstream45.js';
import {loadingCar50,setLoading50} from '../engine/ui/loading50.js';
const options={running:true,phase:'RACE',flag:'GREEN',camera:'fps'};
const car={id:1,state:{u:80,v:0},draft:0,pit:{active:false}};
const fast=speedWind50(car,options);assert(fast.active);assert(fast.speed>.8);assert.equal(fast.wake,0);
const tow=speedWind50({...car,draft:.9},options);assert(tow.active);assert.equal(tow.wake,.9);assert(tow.strength>fast.strength);
for(const patch of [{running:false},{phase:'GRID'},{flag:'YELLOW'},{camera:'overview'}])assert.equal(speedWind50(car,{...options,...patch}).active,false);
for(const patch of [{id:7},{pit:{active:true}},{live26:{retired:true}},{finishedAt:100},{state:{u:0,v:0}},{state:{u:NaN,v:0}}])assert.equal(speedWind50({...car,...patch},options).active,false);
assert.equal(speedWind50(null,options).active,false);
assert(speedWind50({...car,state:{u:35,v:0},draft:.8},options).active,'actual tow remains visible below the speed-only threshold');
const markup=loadingCar50();assert(markup.includes('<svg'));assert(markup.includes('<progress'));assert(markup.includes('load50-wheel'));
const meter={},vars={};const root={querySelector:q=>q==='#menu49-progress'?meter:{style:{setProperty:(k,v)=>vars[k]=v}}};for(const [v,expected] of [[.5,.5],[-1,0],[2,1],[NaN,0]]){setLoading50(root,v);assert.equal(meter.value,expected);assert.equal(vars['--load50'],expected);}
const fx=fs.readFileSync('engine/rendering/slipstream45.js','utf8');assert(!fx.includes('tow-readout45'));assert(fx.includes('prefers-reduced-motion'));
const result={status:'PASS',speedBasedWind:true,wakeIncreasesEffect:true,noSlipstreamTextBox:true,pausedGridFlagsPitRetiredSafetyCarOverviewSuppressed:true,reducedMotionSupported:true,sideProfileCarLoader:true,progressClamped:true,scope:'Pure presentation-state tests; Android visual performance remains device dependent.'};fs.mkdirSync('reports/interface50',{recursive:true});fs.writeFileSync('reports/interface50/UNIT.json',JSON.stringify(result,null,2));console.log(result);
