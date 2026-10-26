import {BRAKE as B} from './brake-service.js';
export function phaseAt(time,holds=[]){let spent=0;for(const h of holds){const begin=h.phase+spent;if(time<begin)return time-spent;if(time<begin+h.duration)return h.phase;spent+=h.duration;}return time-spent;}
export function wallAt(phase,holds=[]){return phase+holds.filter(h=>h.phase<=phase+1e-8).reduce((s,h)=>s+h.duration,0);}
export function addHold(holds,phase,duration){const h=holds.find(h=>Math.abs(h.phase-phase)<1e-5);if(h)h.duration+=duration;else holds.push({phase,duration});holds.sort((a,b)=>a.phase-b.phase);}
export function actionGates(mode,fault=false){
 const gates=[];const add=(phase,actors,label)=>gates.push({phase,actors,label});
 if(mode==='tyres'||mode==='nose')add(2.55,[12,13],'jack grips ready');
 if(mode==='tyres'){
  add(3.70,[0,1,3,4,6,7,9,10],'gun clear / old-wheel grips ready');
  for(let i=0;i<4;i++){const a=2.75+[0,.035,.055,.08][i],d=fault&&i===1?1.25:0;add(a+1.65+d,[i*3+2],'fresh wheel staged');add(a+3.0+d,[i*3],'gun aligned to nut');}
 }
 if(mode==='nose'){add(3.10,[21],'side-jack handover');add(4.40,[17,18],'old nose grips ready');add(5.0,[19,20],'fresh nose staged');}
 if(mode==='rear'){add(3.10,[17,18],'old rear wing grips ready');add(4.20,[19,20],'new rear wing staged');}
 if(mode==='panels'){add(3.60,[17,18],'cowling grips ready');add(10,[17,18],'cowling return grips ready');}
 if(mode==='brakes'){add(2.05,[3,4],'gun clear / wheel grip');add(3.5,[19],'brake removal grip');add(B.installStart,[20],'fresh brake grip');add(B.wheelReady,[5],'original wheel staged');add(B.gunReady+.05,[3],'gun aligned to nut');}
 return gates.sort((a,b)=>a.phase-b.phase);
}
export function crewParked(frame,{includeJacks=true}={}){
 if(!frame)return false;
 return frame.actors.every((a,i)=>!a||(!includeJacks&&[12,13,21].includes(i))||((Math.abs(a.pos.x)>=1.55||a.pos.z>=3.5)&&a.speed<.08&&!a.carContact));
}

// Returning to a parking mark is independent from release clearance.
export function workReleased(frame){return frame.actors.every((a,i)=>!a||[12,13,21].includes(i)||!a.carContact);}
export function departureClear(frame){return frame.actors.every(a=>!a||!a.carContact&&(Math.abs(a.pos.x)>=1.55||a.pos.z>=3.5));}
