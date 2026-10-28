import {circuit,clamp} from '../tracks/track.js';
export function resourcePlan(agent,state,p){
 const fraction=clamp(state.E/(agent.config?.capacity??4000000),0,1),front=p.cars.filter(o=>!o.pit&&o.gap>0&&o.gap<180).sort((a,b)=>a.gap-b.gap)[0],rear=p.cars.find(o=>!o.pit&&o.gap<0&&o.gap> -55&&o.relativeSpeed>1);
 const wear=Math.max(...state.wheels.map(w=>w.wear)),heat=Math.max(...state.wheels.map(w=>w.Ts)),care=agent.style.tyreCare,remaining=agent.raceContext?.remaining??Infinity;
 let mode='BALANCED',reserve=.18+.12*care,allowDeploy=true,deploySpeed=12;
 if(fraction<(state.time>30?.08:.15)||(heat>130||wear>.65)&&care>.5&&!front){mode='SAVE';reserve=.4+.12*care;allowDeploy=false;}
 else if((front&&front.gap<160||rear)&&fraction>.15){mode=rear&&!front?'DEFEND':'ATTACK';reserve=state.time<=30?.1+.08*care:mode==='DEFEND'&&Math.abs(rear?.gap??0)>18?.35+.2*care:.08+.08*care;deploySpeed=12;}
 if(remaining<circuit.length*.3&&fraction>.1){mode='FINAL_PUSH';reserve=.06;deploySpeed=12;allowDeploy=true;}
 const order=agent.engineerOrder;if(order?.energy==='SAVE'){mode='ENGINEER_SAVE';reserve=.55;allowDeploy=false;}else if(order?.energy==='DEPLOY'){mode='ENGINEER_DEPLOY';reserve=.08;deploySpeed=40;allowDeploy=fraction>.08;}
 const next=circuit.turns.map(t=>({...t,distance:(t.s-p.own.s+circuit.length)%circuit.length})).filter(t=>Math.abs(t.k)>.018).sort((a,b)=>a.distance-b.distance)[0];
 if(next&&next.distance<Math.max(45,p.speed*2)&&Math.abs(p.own.k)<.006)allowDeploy=false;
 const bank40=circuit.key==='suzuka'&&typeof agent.drsZone40==='boolean'&&(order?.energy??'AUTO')==='AUTO'&&state.time>=6&&!agent.drsZone40&&!agent.duel?.counter&&mode!=='FINAL_PUSH';
 if(bank40)allowDeploy=false;
 // Spend the finite battery on a battle, bank it on clear road.
 if((order?.energy??'AUTO')==='AUTO'&&mode==='BALANCED'&&fraction<.82)allowDeploy=false;
 const exitFactor=Math.min(agent.tyreManagement.exitFactor,1-clamp((heat-120)/80+wear*.1,0,.055)*care);
 return {mode,fraction,reserve,allowDeploy,deploySpeed,exitFactor,wear,heat,reason:mode==='BANK'?'เก็บยางและพลังงาน รอจังหวะสวนกลับ':bank40?'เก็บพลังงานไว้บุกทางตรงหลัก':mode==='ENGINEER_SAVE'?'คำสั่งทีม: เก็บพลังงาน':mode==='ENGINEER_DEPLOY'?'คำสั่งทีม: ใช้พลังงานเมื่อผ่านจุดเบรก':mode==='SAVE'?'เก็บพลังงานและถนอมยาง':mode==='ATTACK'?'ใช้พลังงานไล่คู่แข่ง':mode==='DEFEND'?'รักษาตำแหน่งจากรถหลัง':mode==='FINAL_PUSH'?'ใช้พลังงานช่วงท้ายเรซ':'บริหารพลังงานให้ถึงช่วงบุก'};
}
