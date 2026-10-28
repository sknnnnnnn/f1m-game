import {circuit} from '../tracks/track.js';
// Use the existing finite store on Suzuka's long non-DRS straights when
// the measured wake and closing opportunity justify spending it.
export function wakeDeploy48(agent,state){
 const r=agent.resources,p=agent.perception,order=agent.engineerOrder;
 if(circuit.key!=='suzuka'||!r||!p||state.time<=30||agent.id===7||agent.pitApproach||agent.recovery||(order?.energy??'AUTO')!=='AUTO'||order?.pace==='CONSERVE'||order?.attack==='ABORT'||['YELLOW','VSC'].includes(agent.raceContext?.flag)||state.time<(agent.passReset47?.until??0))return;
 const front=p.cars.filter(c=>!c.pit&&c.id!==7&&c.gap>18&&c.gap<120).sort((a,b)=>a.gap-b.gap)[0];
 if(!front||front.relativeSpeed>=4||r.fraction<=.28||(agent.tow44??0)<.65||Math.abs(p.own.k)>.001||(state.brake??0)>.08||(agent.runway47??0)<=Math.max(240,p.speed*3.2))return;
 r.allowDeploy=true;r.reserve=.18;r.mode='WAKE_BUILD';r.reason='ใช้ ERS ในลมดูดบนทางตรงยาว เตรียมเบี่ยงแซง';
}
