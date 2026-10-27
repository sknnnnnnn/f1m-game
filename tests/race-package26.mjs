import fs from 'node:fs';
import assert from 'node:assert/strict';
import {LivingSession26} from '../engine/race/living-session26.js';
import {initial} from '../racing/runtime/frozen/physics.js';
import {duelTactics} from '../engine/ai/duel-tactics.js';
import {circuit} from '../engine/tracks/track.js';
import {closeFieldTraits} from '../engine/race/drivers.js';
import {passingLanes26,tacticalLimit26} from '../engine/ai/tactical-lanes26.js';
import {passProgress26} from '../engine/ai/pass-progress26.js';
import {pitEstimate26} from '../engine/pit/pit-estimate26.js';
import {chooseCompound,evaluateStrategy} from '../engine/race/strategy.js';
import {driveCues26} from '../engine/rendering/drive-cues26.js';
import {RaceAudio,soundTelemetry} from '../engine/audio/audio.js';
const session=new LivingSession26(),r=session.race;
session.placeGrid([6,5,4,3,2,1]);
for(const c of r.cars){const traits=closeFieldTraits(c);assert.equal(c.agent.personality.corner,traits.corner);assert.equal(c.agent.personality.pace,traits.pace);}
const lanes=passingLanes26(0,0,()=>true);assert(lanes.includes(tacticalLimit26()));assert(lanes.every(n=>Math.abs(n)<=tacticalLimit26()));assert.deepEqual(passingLanes26(0,0,()=>false),[]);
const pass={started:0};for(let t=0;t<=12;t++)assert.equal(passProgress26(pass,{gap:50-t*4},t),'HOLD');assert.equal(passProgress26(pass,{gap:-12},13),'CLEAR');assert.equal(passProgress26({started:0,bestGap:40,advancedAt:0},{gap:41},6),'STALLED');
const c=r.cars[0];c.distance=circuit.length;c.state.time=110;
const pit=pitEstimate26(c),queued=pitEstimate26(c,{queue:7});assert(pit.metres>100&&pit.transit>pit.service);assert.equal(queued.transit-pit.transit,7);
c.state.wheels.forEach(w=>w.wear=.08);const healthy=evaluateStrategy(c,r.cars,5);assert.equal(healthy.call,false);
const combined=r.evaluatePitStrategy(c);assert.equal(combined.nextCompound,combined.comparison.compound);
assert.equal(chooseCompound(c,circuit.length*.7),'S');c.pit.requestedCompound='H';assert.equal(chooseCompound(c,circuit.length*.7),'H');c.pit.requestedCompound=null;
c.state.wheels.forEach(w=>w.wear=.84);assert.equal(chooseCompound(c,circuit.length*3),'H');assert(evaluateStrategy(c,r.cars,5).call,'Critical wear requires a pit call');
const follower=r.cars[1],a=circuit.point(100,0),b=circuit.point(109,0);
follower.state=initial(r.config,{X:a.x,Y:a.y,psi:a.psi,u:35});follower.projection=circuit.project(a.x,a.y,a.psi);follower.agent.config=r.configuration(follower);
const lead={id:1,state:initial(r.config,{X:b.x,Y:b.y,psi:b.psi,u:15}),projection:circuit.project(b.x,b.y,b.psi)};
follower.agent.duel={gaps:new Map(),pass:{id:1,lane:3,started:0}};
follower.agent.think(follower.state,[{id:2,state:follower.state,projection:follower.projection},lead]);assert.equal(follower.agent.state,'BRAKE','An attack must not overwrite emergency following braking');
const alongside=duelTactics({personality:{risk:.6},targetLane:-2,config:r.config},{time:20},{own:{s:100,d:-2,k:0},speed:45,cars:[{id:1,gap:1,lateral:1.5,speed:45}]},()=>true,{choice:3.3,pace:85,mode:'PASS_COMMIT',reason:'',corner:false,turn:1});assert.equal(alongside.mode,'HOLD_SPACE');assert(alongside.choice<=1.5-2.35);
let cue=null;for(let i=0;i<120;i++)cue=driveCues26(cue,{u:94,v:0,r:2,lastAx:-40},1/60);assert(cue.lens<=5&&cue.roll>=-.012&&cue.aim>=-.32);
// Real audio graph calls with deterministic Web Audio nodes: ensure rendering
// reuses its graph and all scheduled parameters remain finite during shifts,
// pause/resume and car selection. Listening quality is assessed on a device.
let created=0,calls=0;
const param=()=>({value:0,setTargetAtTime(v){assert(Number.isFinite(v));calls++;},setValueAtTime(v){assert(Number.isFinite(v));},exponentialRampToValueAtTime(v){assert(v>0);},cancelScheduledValues(){}});
const node=()=>{created++;return {connect(){},start(){},setPeriodicWave(){},gain:param(),frequency:param(),Q:param(),pan:param(),threshold:param(),ratio:param()};};
globalThis.AudioContext=class {constructor(){this.currentTime=0;this.sampleRate=100;this.destination={};}resume(){}createGain(){return node();}createBiquadFilter(){return node();}createDynamicsCompressor(){return node();}createOscillator(){return node();}createStereoPanner(){return node();}createBufferSource(){return node();}createPeriodicWave(){return {};}createBuffer(){return{getChannelData:()=>new Float32Array(200)};}};
const audio=new RaceAudio(r.config);await audio.enable();const count=created;
for(let i=0;i<120;i++){audio.context.currentTime=i/60;c.state.gear=i<60?4:5;c.state.throttle=i/120;c.state.u=40+i*.3;audio.update(c,r.cars[1],true,{camera:'chase'});}assert.equal(created,count);assert.equal(audio.shifts,1);assert(soundTelemetry(c.state,r.config).wind>0);audio.mute();audio.update(c,null,false);assert(!audio.enabled);
const report={status:'PASS',track:circuit.key,gridTraitsPreserved:true,emergencyBrakePriority:true,alongsideSpace:true,forecastCompoundConsistent:true,passingLanes:lanes,progressivePassCommit:true,pitRoute:{metres:pit.metres,transit:pit.transit,loss:pit.loss},healthyStaysOut:true,wornCallsPit:true,audioNodes:count,audioParameterUpdates:calls,boundedCameraCue:cue};fs.mkdirSync('reports/race26',{recursive:true});fs.writeFileSync('reports/race26/FEATURES_'+circuit.key+'.json',JSON.stringify(report,null,2));console.log(report);
