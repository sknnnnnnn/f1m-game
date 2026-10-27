import assert from 'node:assert/strict';
import {circuit} from '../engine/tracks/track.js';
import {CORNER_SPEED_REFS,referenceGripDemand} from '../engine/tracks/corner-speed-reference.js';
import {racingOffset} from '../engine/tracks/racing-line.js';
import {highSpeedConfig} from '../engine/physics/vehicle-preset.js';
import {C0} from '../racing/runtime/config.js';
import {coastBrakeTrim} from '../engine/physics/attack-drive.js';
assert.equal(Object.values(CORNER_SPEED_REFS).reduce((n,t)=>n+Object.keys(t).length,0),49);
assert.equal(circuit.turns.length,{bahrain:15,suzuka:18,shanghai:16}[circuit.key]);
const c=highSpeedConfig(C0);let last=-Infinity,maxOffset=0;
for(const t of circuit.turns){assert(t.s>last&&t.s<circuit.length);last=t.s;assert(CORNER_SPEED_REFS[circuit.key][t.number]>0);}
for(let s=0;s<circuit.length;s+=2){maxOffset=Math.max(maxOffset,Math.abs(racingOffset(s)));assert(maxOffset<circuit.width/2-c.width/2-.35);}
if(circuit.key==='suzuka'){const q=circuit.at(circuit.turns.find(t=>t.number===15).s);assert(1/Math.abs(q.k)>100,'130R must no longer have the schematic 55 m radius');}
for(const k of [.001,.008,.02]){const base=.6*c.mu,clear=referenceGripDemand(circuit,circuit.turns[4].s,k,base,c,1,0),traffic=referenceGripDemand(circuit,circuit.turns[4].s,k,base,c,1,1);assert(traffic<=clear&&traffic>=base);}
const v=70,s={u:v,v:0},agent={corridorDecel:0,trafficLimit:Infinity,plan:{knots:[{v:70,a:0},{v:70,a:0}]}},out={command:{throttle:0,brake:.04,steer:0},trace:{reference:{k:.003},speedError:-.5}};
assert.equal(coastBrakeTrim(c,s,out,agent).command.brake,0,'small reachable speed trim uses drag');
assert.equal(coastBrakeTrim(c,s,{...out,command:{...out.command,brake:.7}},agent).command.brake,.7,'real braking remains immediate');
assert.equal(coastBrakeTrim(c,s,out,{...agent,trafficLimit:69}).command.brake,.04,'traffic braking may not be removed');
console.log('PASS F125 driving',circuit.key,{turns:circuit.turns.length,maxOffset,coastKeepsEmergencyBrake:true});
// Reproduce an edge connector that used to keep moving outward after abort.
const {Agent}=await import('../engine/ai/agent.js');
const {initial}=await import('../racing/runtime/frozen/physics.js');
const {makeReference,validatePlan}=await import('../engine/physics/reference-adapter.js');
const edge=circuit.width/2-c.width/2-.5,at=circuit.point(circuit.turns[2].s+20,edge);
const state=initial(c,{X:at.x,Y:at.y,psi:at.psi,u:28,time:10}),edgeAgent=new Agent(1,'SMOOTH',edge,19);
edgeAgent.config=c;edgeAgent.curve={t0:state.time,T:3,c:[edge,.9,.2]};edgeAgent.targetLane=edge;
edgeAgent.think(state,[{id:1,state,projection:circuit.project(state.X,state.Y,state.psi)}]);
assert.equal(edgeAgent.state,'RECOVER');const plan=makeReference(c,state,edgeAgent);assert.equal(validatePlan(c,state,plan),null,'aborted outward connector must produce a valid inward recovery plan');
console.log('PASS bounded edge connector',circuit.key);

const {gripSteering25}=await import('../engine/physics/grip-steering25.js');
const understeer={state:{u:22,v:.6,r:.7},pit:{active:false},finishedAt:null};
const harsh={command:{throttle:.2,brake:.4,steer:.45},trace:{selected:'TRACK'}};
const unwind=gripSteering25(understeer,harsh,c);
assert(unwind.command.steer<.2);assert.equal(unwind.command.brake,.4);assert.equal(unwind.command.throttle,.2);
assert.equal(gripSteering25({...understeer,stability23:{active:true}},harsh,c),harsh,'oversteer recovery keeps authority');
console.log('PASS front-slip steering and emergency priority');

const {reachableEntrySpeed,brakingBudget}=await import('../engine/physics/speed-envelope.js');
const brakingAgent={id:1,config:c,personality:{braking:6.5},state:'CRUISE'};
for(const exit of [12,20,40])for(const k of [0,.003,.015]){const entry=reachableEntrySpeed(c,brakingAgent,.85,k,94,exit,6,0,.6);const actualBudget=brakingBudget(c,brakingAgent,.85,k,Math.max(entry,exit),entry,0)*.6;assert(entry*entry<=exit*exit+2*actualBudget*6+.01,'entry must be reachable using its own downforce');}
console.log('PASS speed-consistent braking envelope');
