// Explicit arcade race strategy: on clear road, bank tyres and energy until
// a nearby challenger returns. All gains/losses still use the physical pedals.
// No ranks, position writes, velocity writes or catch-up engine forces.
export function battleWindow43(agent,state,p){
 const memory=agent.battleWindow43??={saving:false,until:0,raceUntil:0};
 const rivals=p.cars.filter(o=>!o.pit),front=rivals.filter(o=>o.gap>0&&o.gap<140).sort((a,b)=>a.gap-b.gap)[0],rear=rivals.filter(o=>o.gap<0&&o.gap> -600).sort((a,b)=>b.gap-a.gap)[0];
 const alongside=rivals.some(o=>Math.abs(o.gap)<12&&Math.abs(o.lateral-p.own.d)>1.8);
 const active=agent.raceContext?.battleEnabled43!==false&&agent.id!==7&&state.time>30&&!agent.pitApproach&&!agent.recovery&&(agent.raceContext?.remaining??Infinity)>300&&(agent.engineerOrder?.pace??'AUTO')!=='ATTACK'&&(agent.engineerOrder?.energy??'AUTO')!=='DEPLOY';
 if(!active||alongside||front&&front.gap<45){if(memory.saving)memory.raceUntil=state.time+8;memory.saving=false;}
 else if(memory.saving&&!rear){memory.saving=false;memory.raceUntil=state.time+8;}
 else if(!memory.saving&&!front&&rear&&rear.gap< -45&&state.time>=memory.raceUntil){memory.saving=true;memory.until=state.time+6;}
 return {saving:memory.saving,pace:memory.saving?72:Infinity,cornerFactor:memory.saving?.85:1,reason:memory.saving?'เก็บยางและพลังงาน รอจังหวะสวนกลับ':'บุกและป้องกันเต็มกำลัง'};
}
