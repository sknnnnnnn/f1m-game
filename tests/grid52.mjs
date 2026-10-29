import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LivingSession26} from '../engine/race/living-session26.js';
import {saveWeekend,loadWeekend} from '../engine/race/weekend-save.js';
import {TEAMS52} from '../engine/race/roster52.js';
import {configureMenuSession49} from '../engine/race/menu-session49.js';
import {slipstreamCue45} from '../engine/rendering/slipstream-cue45.js';
import {resolveContact52} from '../engine/physics/contact52.js';
import {pitStopStation,PIT} from '../engine/pit/pit-lane.js';
const s=new LivingSession26();assert.equal(s.race.cars.length,22);assert.equal(s.race.safetyCar.agent.id,23);assert.equal(new Set(s.race.cars.map(c=>c.name)).size,22);assert(slipstreamCue45({id:7,state:{u:70,v:0},draft:.8},{running:true,phase:'RACE'}).active);assert(!slipstreamCue45({id:23,state:{u:70,v:0},draft:.8},{running:true,phase:'RACE'}).active);
for(const t of TEAMS52){assert.equal(t.cars.length,2);assert(configureMenuSession49(s,{mode:'QUICK',stage:'RACE',team:t.id,laps:1,weather:'DRY',setup:'BALANCED'}).ok);assert.equal(s.race.engineer.team,t.id);assert.equal(pitStopStation(t.cars[0]),pitStopStation(t.cars[1]));assert(pitStopStation(t.cars[0])<PIT.mergeWait-20);}
assert.equal(loadWeekend(saveWeekend(s)).race.cars.length,22);
const config={length:5.5,width:2},proposal=(X,Y,u=50,v=0)=>({next:{X,Y,psi:0,u,v,time:1},car:{agent:{},health:{wing:0}}});
const a=proposal(0,0,50,.1),b=proposal(0,1.98,50,-.1),r=resolveContact52(a,b,config);assert(r.depth>0);assert.equal(a.next.u,50);assert.equal(b.next.u,50);assert(a.next.v<=.1&&b.next.v>=-.1);assert(a.next.Y<0&&b.next.Y>1.98);
const rear=proposal(0,0,52),front=proposal(5.49,0,50);resolveContact52(rear,front,config);assert(rear.next.u<=52&&rear.next.u>=50);assert(front.next.u>=50);assert(Math.abs(rear.next.u+front.next.u-102)<1e-9);
const result={status:'PASS',teams:11,cars:22,uniqueNames:22,safetyId:23,allTeamsSelectable:true,sharedTeamStallsWithinPit:true,saveRoundTrip22:true,sideBrushRetainsForwardSpeed:true,normalMomentumConserved:true};fs.mkdirSync('reports/grid52',{recursive:true});fs.writeFileSync('reports/grid52/UNIT.json',JSON.stringify(result,null,2));console.log(result);
