import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mapLayout24,mapHit24} from '../engine/rendering/minimap24.js';
import {slipstreamCue45} from '../engine/rendering/slipstream-cue45.js';
import {ACTION42} from '../engine/race/action42.js';
import {draftFactor} from '../engine/ai/draft.js';
import {C0} from '../racing/runtime/config.js';
import {highSpeedConfig} from '../engine/physics/vehicle-preset.js';
import {initial,step} from '../racing/runtime/frozen/physics.js';
const track={bounds:{width:100,height:100,cx:0,cy:0}},map=mapLayout24(track,372,230);
const p=map.point(0,0),forward=map.point(10,0),left=map.point(10,10);
assert(forward[0]>p[0]);assert(left[1]<forward[1],'world left bend must turn up from east in the map, not mirror down');
const cross=(forward[0]-p[0])*(left[1]-forward[1])-(forward[1]-p[1])*(left[0]-forward[0]);assert(cross<0);
assert.equal(mapHit24([{id:1,x:left[0],y:left[1]}],left[0],left[1],{width:372,height:230},{left:0,top:0,width:372,height:230}),1);
const car={id:1,draft:.8,state:{u:70,v:0},pit:{active:false},finishedAt:null};
const opts={running:true,phase:'RACE'},cue=slipstreamCue45(car,opts);assert(cue.active);assert(Math.abs(cue.relief-.72)<1e-10);
for(const options of [{running:false,phase:'RACE'},{running:true,phase:'GRID'},{...opts,flag:'YELLOW'}])assert(!slipstreamCue45(car,options).active);
for(const patch of [{id:7},{pit:{active:true}},{finishedAt:100},{draft:NaN},{state:{u:0,v:0}},{live26:{retired:true}}])assert(!slipstreamCue45({...car,...patch},opts).active);
assert.equal(slipstreamCue45({...car,draft:0},opts).strength,0,'switching to a car outside the wake clears the effect');
const self={id:1,state:{u:70,v:0},projection:{s:100,d:0,k:0}},front={id:2,projection:{s:500,d:0,k:0}};
assert(draftFactor(self,[front])>0,'useful wake reaches beyond 400m');
front.projection.s=160;const wetRelief=draftFactor(self,[front],true)*ACTION42.draftRelief;assert(Math.abs(wetRelief-.56*(1-48/268))<1e-10,'wet physical drag relief remains identical to the verified R44 fallback');
function coast(relief){const c=highSpeedConfig(C0),cfg={...c,CdA:c.CdA*(1-relief)},s=initial(cfg,{u:70,X:0,Y:0,psi:0,gear:7,shiftTarget:7});for(let i=0;i<120;i++)step(cfg,s,{tick:s.tick,expires:s.tick,throttle:1,brake:0,steer:0,gear:7,energy:false});return s.u;}
const speeds={clear:coast(0),r44:coast(.82),r45:coast(ACTION42.draftRelief)};assert(speeds.r45>speeds.r44&&speeds.r44>speeds.clear);
fs.writeFileSync('reports/tow45/MECHANICS.json',JSON.stringify({status:'PASS',mapLeftTurnCross:cross,speedsAfter2SecondsMS:speeds,cue,scope:'World/map handedness and cue fixtures; frozen integrator acceleration with identical throttle, no DRS/ERS. Audio perception and Android FPS remain device checks.'},null,2));
console.log('PASS minimap handedness and hit selection, telemetry-bound wake cue, pause/grid/flag/pit/finish/car-switch gating, stronger physical tow and unchanged wet fallback');

// Render the actual overlay against a tiny DOM/canvas adapter. Exercise updates,
// selection changes and reduced motion without a synthetic physics wake.
const globals=['document','matchMedia','innerWidth','innerHeight'],saved=new Map(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
let strokes=0,reduced=false;const ctx={clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){strokes++;}};
const canvas={width:0,height:0,getContext:()=>ctx};const vars={};
let root;globalThis.document={head:{append(){}},body:{append(n){root=n;}},createElement(tag){return tag==='style'?{}:{hidden:true,style:{setProperty(k,v){vars[k]=v;}},setAttribute(){},querySelector(q){return q==='canvas'?canvas:null;}};}};
globalThis.matchMedia=()=>({get matches(){return reduced;}});globalThis.innerWidth=1200;globalThis.innerHeight=800;
try{
 const {mountSlipstream45}=await import('../engine/rendering/slipstream45.js');const ui=mountSlipstream45();
 ui.update(car,{...opts,now:100,camera:'chase'});assert.equal(root.hidden,false);assert(!root.innerHTML.includes('tow-readout'));assert.equal(vars['--wake50'],'0.000','entry starts with a smooth fade');assert.equal(canvas.width,720);assert(strokes>0);
 ui.update({...car,draft:0},{...opts,now:200,camera:'chase'});assert.equal(root.hidden,false,'high-speed rays remain after leaving the tow');assert.equal(vars['--wake50'],'0.000');
 reduced=true;const oldStrokes=strokes;ui.update(car,{...opts,now:300,camera:'chase'});assert.equal(root.hidden,false);assert.equal(strokes,oldStrokes,'reduced motion retains the edge tint without moving rays');
 ui.update(car,{...opts,now:400,camera:'overview'});assert.equal(root.hidden,true);
 console.log('PASS actual overlay visibility, text-free wind, bounded canvas, wake exit, speed continuity and reduced-motion rendering');
}finally{for(const [key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
