import {circuit} from '../engine/tracks/track.js';
import assert from 'node:assert/strict';
import {attack60,attackEnergy60,followWidth60} from '../engine/ai/attack60.js';
const agent=()=>({id:2,config:{length:5.5,width:1.9},raceContext:{flag:'GREEN',remaining:4000,progress:7000,length:5500},resources:{fraction:.5,allowDeploy:false,reserve:.3},personality:{commit:2}});
const s={time:80,brake:0,u:60,v:0,E:4000000},p={speed:60,own:{d:0,k:0},cars:[{id:1,gap:35,lateral:0,relativeSpeed:0,pit:false}]},d={choice:0,mode:'FOLLOW',pace:92};
let a=agent();const before=structuredClone(s);const out=attack60(a,s,p,()=>true,d,300);assert.equal(out.mode,'PASS_COMMIT');assert(Math.abs(out.choice)>2.5);assert.deepEqual(s,before);assert.equal(out.pace,d.pace);a.perception=p;attackEnergy60(a,s,'PASS_COMMIT');assert(a.resources.allowDeploy);assert.equal(a.resources.reserve,.12);assert.equal(s.E,4000000);
for(const patch of [{id:23},{pitApproach:true},{recovery:true},{entryCommit25:{}},{engineerOrder:{attack:'ABORT'}},{engineerOrder:{pace:'CONSERVE'}},{raceContext:{flag:'YELLOW'}},{raceContext:{flag:'RED'}},{raceContext:{flag:'VSC'}},{passReset47:{until:82}}])assert.deepEqual(attack60(Object.assign(agent(),patch),s,p,()=>true,d,300),d);
assert.deepEqual(attack60(agent(),{...s,time:30},p,()=>true,d,300),d);assert.deepEqual(attack60(agent(),s,p,()=>false,d,300),d);assert.deepEqual(attack60(agent(),s,p,()=>true,d,50),d);
const closing=structuredClone(p);closing.cars[0].relativeSpeed=-4;const save=agent();save.engineerOrder={energy:'SAVE'};assert.equal(attack60(save,s,closing,()=>true,d,300).mode,'PASS_COMMIT');save.perception=closing;attackEnergy60(save,s);assert.equal(save.resources.allowDeploy,false);
for(const mode of ['HOLD_SPACE','RECOVER','BOXED_IN'])assert.equal(attack60(agent(),s,p,()=>true,{...d,mode},300).mode,mode);
// A closer target may be passed if its entire transition is independently clear.
const close={...p,cars:[{...p.cars[0],gap:18,relativeSpeed:-2}]};assert.equal(attack60(agent(),s,close,()=>true,d,300).mode,'PASS_COMMIT');
const low=agent();low.resources.fraction=.1;assert.deepEqual(attack60(low,s,p,()=>true,d,300),d);
const second=attack60(a,{...s,time:81},p,()=>true,d,300);assert.equal(second.choice,out.choice,'attack retains its safe corridor across thoughts');
console.log('PASS late attack ownership, close gaps, safe corridor refusal, launch preservation, flags/pit/recovery/orders and finite-energy requests');

assert.equal(followWidth60(agent(),s,p.own,{headingError:0}),2.3);
assert.equal(followWidth60(agent(),{...s,time:20},p.own,{headingError:0}),2.9);
assert.equal(followWidth60(agent(),s,{...p.own,k:.01},{headingError:0}),2.9);
assert.equal(followWidth60(agent(),s,p.own,{headingError:.2}),2.9);
const bank=agent();bank.perception=p;attackEnergy60(bank,s,'FOLLOW');assert.equal(bank.resources.allowDeploy,false);assert.equal(bank.resources.mode,'OVERTAKE_BANK');
const defence=agent();defence.perception={...p,cars:[{id:1,gap:-7,relativeSpeed:3,pit:false}]};attackEnergy60(defence,s,'DEFEND');assert(defence.resources.allowDeploy);assert.equal(defence.resources.reserve,.35);

const firstLap=agent();firstLap.raceContext.progress=1000;const firstState={...s,time:45};const firstOut=attack60(firstLap,firstState,p,()=>true,d,300);assert.equal(firstOut.mode,circuit.key==='suzuka'?'FOLLOW':'PASS_COMMIT');firstLap.perception=p;attackEnergy60(firstLap,firstState,firstOut.mode);assert.equal(firstLap.resources.allowDeploy,circuit.key!=='suzuka');assert.equal(followWidth60(firstLap,firstState,p.own,{headingError:0}),2.9);

const building=agent();building.perception={...p,cars:[{...p.cars[0],gap:100}]};building.tow44=.9;building.runway47=500;attackEnergy60(building,s,'DRAFT');assert(building.resources.allowDeploy);assert.equal(building.resources.mode,'TOW_ACCEL');assert.equal(building.resources.reserve,.24);
const existing=agent();existing.duel={pass:{id:1,lane:3.3,started:70}};if(circuit.key==='shanghai')assert.deepEqual(attack60(existing,s,p,()=>true,{...d,choice:3.3,mode:'PASS_COMMIT'},300),{...d,choice:3.3,mode:'PASS_COMMIT'});

const wetFirst=agent();wetFirst.wetTow44=true;wetFirst.raceContext.progress=1000;assert.deepEqual(attack60(wetFirst,firstState,p,()=>true,d,300),d);wetFirst.perception=p;attackEnergy60(wetFirst,firstState,'DRAFT');assert.equal(wetFirst.resources.allowDeploy,false);
