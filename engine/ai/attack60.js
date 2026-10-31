import {legacyWetAttack61,legacyWetEnergy61} from './attack-wet61.js';
import {circuit} from '../tracks/track.js';
import {tacticalLane26} from './tactical-lanes26.js';
import {laneAt} from '../physics/reference-adapter.js';
// Suzuka retains its proven opening-lap plan; the new attack policy applies
// there after lap one. Shanghai/Bahrain can use it after the launch period.
export function attackWindow61(a,s){return s.time>30&&(circuit.key!=='suzuka'||a.raceContext?.progress>a.raceContext?.length);}
// One sustained attack owner. All proposals use the existing corridor gate;
// the following controller and physical collision response retain priority.
export function attack60(a,s,p,safe,decision,runway){
 if(a.wetTow44)return legacyWetAttack61(a,s,p,safe,decision,runway);
 const m=a.assault60??={target:null,lane:null,until:0};
 const permitted=attackWindow61(a,s)&&a.id!==23&&!a.pitApproach&&!a.recovery&&!a.entryCommit25&&(a.raceContext?.flag??'GREEN')==='GREEN'&&a.engineerOrder?.attack!=='ABORT'&&a.engineerOrder?.pace!=='CONSERVE'&&s.time>=(a.passReset47?.until??0);
 if(!permitted){m.target=null;return decision;}
 if(['RECOVER','BOXED_IN','HOLD_SPACE'].includes(decision.mode))return decision;
 if(circuit.key==='shanghai'&&!m.target&&a.duel?.pass&&decision.mode==='PASS_COMMIT')return decision;
 const rival=m.target&&p.cars.find(o=>o.id===m.target&&!o.pit);
 if(rival&&rival.gap> -11&&rival.gap<150&&s.time<m.until&&Math.abs(p.own.k)<.003&&safe(m.lane,1.25))return {...decision,choice:m.lane,mode:'PASS_COMMIT',reason:`OVERTAKE / HOLD CAR ${rival.id}`};
 m.target=null;
 if(Math.abs(p.own.k)>.0025||runway<Math.max(100,p.speed*1.5)||p.speed<25||(s.brake??0)>.35)return decision;
 const front=p.cars.filter(o=>!o.pit&&o.id!==23&&o.gap>12&&o.gap<120).sort((x,y)=>x.gap-y.gap)[0];if(!front)return decision;
 const closing=-front.relativeSpeed,available=(a.resources?.fraction??0)>.2&&a.engineerOrder?.energy!=='SAVE';
 if(closing<.5&&!available&&!a.drs40||closing< -3)return decision;
 const deadline=Math.min(110,Math.max(55,22+p.speed*.18+Math.max(0,closing)*2.7));
 if(front.gap>deadline)return decision;
 const predicted=front.intent?.curve?laneAt(front.intent.curve,s.time+1.5).d:front.lateral;
 const lanes=[predicted-3.15,predicted+3.15,-3.3,0,3.3].map(tacticalLane26).filter(l=>Math.abs(l-p.own.d)<=4.3&&Math.abs(l-predicted)>2.5&&safe(l,2));
 lanes.sort((x,y)=>Math.abs(x-p.own.d)-Math.abs(y-p.own.d));if(!lanes.length)return decision;
 m.target=front.id;m.lane=lanes[0];m.until=s.time+15;
 a.duel??={gaps:new Map(),counter:null,exit:null,passesSuffered:0};a.duel.pass={id:front.id,lane:m.lane,started:s.time,reach42:150,stall42:7};
 return {...decision,choice:m.lane,mode:'PASS_COMMIT',reason:`OVERTAKE / OPEN CORRIDOR CAR ${front.id}`};
}
export function attackEnergy60(a,s,mode=a.state){
 if(a.wetTow44)return legacyWetEnergy61(a,s,mode);
 const r=a.resources,p=a.perception;if(!r||!p||!attackWindow61(a,s)||a.id===23||a.pitApproach||a.recovery||(a.raceContext?.flag??'GREEN')!=='GREEN'||a.engineerOrder?.attack==='ABORT'||a.engineerOrder?.pace==='CONSERVE'||(a.engineerOrder?.energy??'AUTO')!=='AUTO')return;
 const id=a.assault60?.target??a.duel?.pass?.id,front=p.cars.find(o=>o.id===id&&!o.pit&&o.gap> -11&&o.gap<130);
 const attacking=!!front&&['PASS_COMMIT','SLINGSHOT','COUNTER','HOLD_SPACE'].includes(mode);
 const next=p.cars.filter(o=>!o.pit&&o.id!==23&&o.gap>25&&o.gap<160).sort((x,y)=>x.gap-y.gap)[0];
 const building=!attacking&&!!next&&['DRAFT','FOLLOW','COUNTER'].includes(mode)&&(a.tow44??0)>.4&&(a.runway47??0)>Math.max(280,p.speed*3.5)&&r.fraction>.35;
 const rear=p.cars.find(o=>!o.pit&&o.gap<0&&o.gap> -12&&o.relativeSpeed>1);
 const defending=!attacking&&!building&&!!rear&&r.fraction>.45;
 const stable=Math.abs(p.own.k)<.003&&(s.brake??0)<.08;
 r.allowDeploy=stable&&(attacking&&r.fraction>.14||building||defending);
 r.reserve=defending?.35:building?.24:.12;
 r.mode=r.allowDeploy?(attacking?'PASS_DEPLOY':building?'TOW_ACCEL':'DEFEND'):'OVERTAKE_BANK';
 r.reason=building?'สะสมความเร็วในลมดูดก่อนเบี่ยงแซง':attacking?'OVERTAKE · ใช้ ERS จบแซงในช่องที่เปิด':defending?'ป้องกันด้วยพลังงานที่เก็บไว้':'เก็บ ERS สำหรับจังหวะบุกและป้องกัน';
}

// The normal following sensor must not classify an established parallel lane
// as a bumper-to-bumper queue. Curves and heading differences retain its buffer.
export function followWidth60(agent,self,own,other){
 const racing=self.time>60&&agent.raceContext?.progress>agent.raceContext?.length;
 return racing&&Math.abs(own.k)<.003&&Math.abs(other.headingError)<.08?(agent.config?.width??1.9)+.4:2.9;
}
