import assert from 'node:assert/strict';
import {Agent} from '../engine/ai/agent.js';
import {Race} from '../engine/race/engine.js';
import {circuit} from '../engine/tracks/track.js';
import {racingPath,pathOffset} from '../engine/tracks/racing-path.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {wakeDeploy48} from '../engine/ai/wake-deploy48.js';
assert.equal(circuit.key,'suzuka');
const config=new Race().config;
let station=null;
for(let s=0;s<circuit.length;s+=10){if(Math.abs(circuit.at(s).k)<.0004&&Array.from({length:16},(_,i)=>Math.abs(circuit.at(s+i*20).k)).every(k=>k<.003)){station=s;break;}}
assert(station!==null,'fixture needs a real straight');
function scenario(time=60){const a=new Agent(2,'ATTACKER',0,7,{commit:2,risk:.9});a.config=config;a.targetSpeed=90;a.raceContext={remaining:circuit.length*2,flag:'GREEN'};const q=circuit.point(station,0),state=initial(config,{X:q.x,Y:q.y,psi:q.psi,u:60,v:0,r:0,gear:6});state.time=time;state.tick=time*60;state.E=config.capacity*.6;const own=circuit.project(state.X,state.Y,state.psi);a.curve=racingPath(null,state,own);const oq=circuit.point(station+90,1.5),other={...state,X:oq.x,Y:oq.y,psi:oq.psi,u:58};a.think(state,[{id:2,state,projection:own},{id:1,state:other,projection:circuit.project(oq.x,oq.y,oq.psi)}]);return {a,state,own};}
const {a,state,own}=scenario();assert.equal(a.state,'PASS_COMMIT');assert(Math.abs(a.curve.racing.lane40-1.5)>2.3,'closing car requests a free passing corridor before wake braking');assert(Math.abs(pathOffset(a.curve,own.s+280)-a.targetLane)<1e-6,'instruction must reach the actual reference path');assert.equal(a.resources.mode,'PACK_DEPLOY');assert.equal(a.resources.allowDeploy,true);assert.equal(a.resources.reserve,.1);assert.equal(state.E,config.capacity*.6,'strategy never injects battery energy');
const launch=scenario(20);assert.equal(launch.a.curve.racing.lane40,null,'retain existing launch geometry');
function energy(overrides={},stateOverrides={}){const agent={id:2,resources:{fraction:.6,allowDeploy:false,reserve:.3,mode:'BALANCED'},perception:{speed:60,own:{k:0},cars:[{id:1,gap:90,relativeSpeed:0,pit:false}]},tow44:.9,runway47:400,raceContext:{flag:'GREEN'},...overrides};wakeDeploy48(agent,{time:60,brake:0,...stateOverrides});return agent.resources;}
assert.equal(energy().mode,'WAKE_BUILD');
for(const override of [{engineerOrder:{energy:'SAVE'}},{engineerOrder:{pace:'CONSERVE'}},{engineerOrder:{attack:'ABORT'}},{raceContext:{flag:'YELLOW'}},{raceContext:{flag:'VSC'}},{pitApproach:true},{recovery:true},{id:23},{passReset47:{until:62}},{tow44:.3},{runway47:150},{resources:{fraction:.2,allowDeploy:false}},{perception:{speed:60,own:{k:0},cars:[{id:1,gap:90,relativeSpeed:5}]}}])assert.equal(energy(override).allowDeploy,false);
assert.equal(energy({}, {time:30}).allowDeploy,false);assert.equal(energy({}, {brake:.3}).allowDeploy,false);
console.log('PASS actual early passing reference reaches validated corridor; Suzuka long-straight finite-energy deployment; launch, short runway, weak tow, no catch opportunity, caution, recovery and player overrides protected');
