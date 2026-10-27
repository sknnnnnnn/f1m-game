import assert from 'node:assert/strict';import fs from 'node:fs';
import {RaceRadio34} from '../engine/ui/race-radio34.js';
import {raceDigest34,digestMarkup34,raceTime34} from '../engine/ui/race-digest34.js';
import {BroadcastDirector} from '../engine/rendering/broadcast.js';
import {LivingSession26} from '../engine/race/living-session26.js';
import {circuit} from '../engine/tracks/track.js';
const pose=(s)=>{const q=circuit.point(s);return {X:q.x,Y:q.y,psi:q.psi,u:55,v:0,brake:0,throttle:1};};
const frame=()=>({time:10,tick:600,running:true,phase:'RACE',controlZone:{flag:'GREEN'},cars:[{id:1,name:'A',state:pose(100),finishedAt:null,tyres:{health:.9,sets:1}},{id:2,name:'B',state:pose(125),finishedAt:null}],snapshot:{cars:[{id:1,name:'A',gridPosition:2,finishedAt:null},{id:2,name:'B',gridPosition:1,finishedAt:null}]},moments:[],radio:[],engineer:{cars:[{id:1,ledger:{won:2,lost:1,pitTransitSeconds:42,queueSeconds:3},sectors:{rows:[{lap:2,pit:true,flag:'GREEN'}]}}]},timing:[{id:1,laps:[120,112,110]}],race15:{positionSummary:{1:{ON_TRACK:1,PIT_CYCLE:-1}},cars:[{id:1,mind:{errors:2}}]}});
const p=frame(),radio=new RaceRadio34(),before=structuredClone(p);
p.radio=[{id:2,time:10,text:'OTHER CAR ONLY'}];assert.equal(radio.update(p,1),null,'Do not announce an unrelated car radio');
p.moments=[{kind:'OVERTAKE',by:1,of:2,time:10}];const first=radio.update(p,1);assert(first.text.includes('B'));const serial=first.serial;
for(let n=0;n<30;n++){p.time=10+n/10;assert.equal(radio.update(p,1).serial,serial);}assert.equal(radio.history.length,1);
p.time=13;p.controlZone.flag='VSC';assert.equal(radio.update(p,1).category,'flag','Flag preempts an ordinary message');
p.time=14;p.controlZone.flag='GREEN';assert(radio.update(p,1).text.includes('ธงเขียว'),'Green flag replaces an expired restriction immediately');
assert.equal(radio.update(p,1,{replaying:true}),null);assert.equal(radio.update(p,1,{running:false}),null);
p.time=30;p.moments=[];p.radio=[];p.controlZone.flag='GREEN';radio.update(p,2);assert(radio.history.every(m=>m.car===2),'Switching focus must not retain another driver message');
p.time=0;p.phase='GRID';assert.equal(radio.update(p,2),null);assert.equal(radio.history.length,0);
const q=frame();q.events=[{kind:'OVERTAKE',time:5,by:1,of:2}];q.moments=[{kind:'OVERTAKE',time:5,by:1,of:2}];const snapshotBeforeDigest=structuredClone(q);const digest=raceDigest34(q,1);assert.equal(digest.events.length,1);assert.equal(digest.best,110);assert.equal(digest.excessOverBest,12);assert.equal(digest.pitTransit,42);assert.equal(digest.queue,3);assert.equal(digest.lapRows[1].pit,true);assert.equal(digest.pitPlaces,-1);assert.equal(raceTime34(65.123),'1:05.123');assert.equal(raceTime34(null),'—');assert.equal(raceTime34(59.9999),'1:00.000');assert.equal(raceTime34(-1),'—');
const escape=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');const html=digestMarkup34({...digest,name:'<script>bad</script>'},escape);assert(!html.includes('<script>'));assert(html.includes('รอบเร็วสุด'));assert(html.includes('รวมรอคิว'));assert.deepEqual(q,snapshotBeforeDigest,'Digest must not alter race telemetry');
const empty=raceDigest34({...q,timing:[],engineer:{cars:[]}},1);assert.equal(empty.best,null);assert.equal(empty.excessOverBest,null);assert.equal(raceDigest34(q,99),null);
const b=new BroadcastDirector(),f=frame();let shot=b.update(f,10,1);assert.equal(shot.id,1);f.time=12.1;f.moments=[{kind:'OVERTAKE',by:1,of:2,time:12}];shot=b.update(f,12.1,1);assert.equal(shot.story.kind,'PASS','Capture a real pass before a long ordinary camera hold expires');assert.equal(shot.story.partnerId,2);assert(shot.switched);assert.equal(b.update(f,12.2,1).switched,false);f.phase='GRID_CLEAR';assert.equal(b.update(f,13,1).story.kind,'GRID');
// Exercise the adapters on an actual simulation presentation; their reads
// must leave authoritative poses, wheel states and commands exactly intact.
const r=new LivingSession26().race;for(let i=0;i<120;i++)assert(r.advance());const states=structuredClone(r.cars.map(c=>c.state)),payload=r.presentation();const live=new RaceRadio34();for(const c of r.cars){live.update({...payload,phase:'RACE',running:true},c.id);assert(raceDigest34(payload,c.id));}assert.deepEqual(r.cars.map(c=>c.state),states);
fs.mkdirSync('reports/story34',{recursive:true});const out={status:'PASS',track:circuit.key,focusedRadio:true,deduplicated:true,criticalPreemption:true,replayMuted:true,resetSafe:true,lapArithmetic:true,queueNotDoubleCounted:true,escapedDriverNames:true,passCameraCapturesEvent:true,selectedCarRetained:true,realPresentationReadOnly:true};fs.writeFileSync('reports/story34/FEATURES_'+circuit.key+'.json',JSON.stringify(out,null,2));console.log(out);
