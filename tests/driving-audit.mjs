import fs from 'node:fs';
import {StrategyRace} from '../engine/race/strategy-race.js';
import {circuit} from '../engine/tracks/track.js';
const r=new StrategyRace({laps:process.argv.includes('--full')?5:1});r.prepare();
const turns=circuit.turns.map(t=>({turn:t.number,s:t.s,samples:0,braking:0,fullThrottle:0,minKPH:999,maxKPH:0}));
const stats={samples:0,wake:0,wakeFollowing:0,draftState:0,towBraking:0,closeFollowing:0,maxWake:0,modes:{},transitions:[],passes:[],turns};let previous=new Map();
for(let i=0;i<(process.argv.includes('--full')?90000:16000)&&!r.finished&&!r.stop;i++){
 if(!r.advance())break;
 for(const c of r.cars){if(c.pit?.active)continue;const v=Math.hypot(c.state.u,c.state.v),cmd=c.lastCommand,a=c.agent;stats.samples++;stats.modes[a.state]=(stats.modes[a.state]??0)+1;stats.maxWake=Math.max(stats.maxWake,c.draft??0);if(c.draft>.1)stats.wake++;if(a.state==='DRAFT'){stats.draftState++;if(cmd.brake>.02)stats.towBraking++;}const front=a.perception?.leader;if(front&&front.gap>12&&front.gap<45&&Math.abs(front.lateral-c.projection.d)<1.5){stats.closeFollowing++;if(c.draft>.1)stats.wakeFollowing++;}if(previous.get(c.id)!==a.state&&stats.transitions.length<500)stats.transitions.push({t:r.time,id:c.id,mode:a.state,gap:front?.gap,v:v*3.6,brake:cmd.brake,draft:c.draft});previous.set(c.id,a.state);
 for(const t of turns)if(Math.abs(circuit.delta(c.projection.s,t.s))<35){t.samples++;if(cmd.brake>.02)t.braking++;if(cmd.throttle>.9)t.fullThrottle++;t.minKPH=Math.min(t.minKPH,v*3.6);t.maxKPH=Math.max(t.maxKPH,v*3.6);}
 }
 if(i%3600===3599)console.log(JSON.stringify({time:r.time,stop:r.stop,passes:r.overtakes}));
}
stats.endCars=r.cars.map(c=>({id:c.id,s:c.projection.s,n:c.projection.d,v:Math.hypot(c.state.u,c.state.v),cmd:c.lastCommand,mode:c.agent.state,reason:c.agent.reason,traffic:c.agent.trafficLimit,history:c.trace.slice(-8)}));stats.status=r.finished&&!r.stop&&r.controllerRejections===0?'PASS':'FAIL';stats.time=r.time;stats.stop=r.stop;stats.rejections=r.controllerRejections;stats.passes=r.events.filter(e=>e.kind==='OVERTAKE');stats.overtakes=r.overtakes;stats.peak=r.diagnostics.maxSpeed*3.6;stats.maxLateral=r.maxLateral;stats.minClearance=r.minClearance;stats.results=r.results();fs.writeFileSync(process.env.AUDIT_OUTPUT??'evidence/DRIVING_AUDIT_10.json',JSON.stringify(stats,null,2));console.log(JSON.stringify({...stats,transitions:undefined,results:undefined}));
