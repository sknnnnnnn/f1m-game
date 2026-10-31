import {attackWindow61} from '../ai/attack60.js';
// A short overtaking motor map spends the same finite battery faster. It never
// changes a rival, traction, the speed ceiling, vehicle poses or race order.
const burstConfigs60=new WeakMap();
export function overtakeConfig60(base,car,flag='GREEN'){
 const a=car.agent,s=car.state,p=a.perception,r=a.resources,order=a.engineerOrder;
 a.overtake60=false;
 const eligible=flag==='GREEN'&&attackWindow61(a,s)&&!a.wetTow44&&car.id!==23&&!car.pit?.active&&!a.pitApproach&&!a.recovery&&car.finishedAt===null&&order?.energy!=='SAVE'&&order?.pace!=='CONSERVE'&&order?.attack!=='ABORT'&&r?.allowDeploy&&s.E>base.capacity*Math.max(.12,r.reserve??.12)&&(a.runway47??0)>Math.max(240,Math.hypot(s.u,s.v)*3.5)&&Math.abs(s.delta??0)<.035&&Math.abs(s.r??0)<.12&&Math.abs(car.projection.k)<.003&&(s.brake??0)<.02;
 if(!eligible||!['PASS_COMMIT','SLINGSHOT','COUNTER','HOLD_SPACE','DRAFT'].includes(a.state))return base;
 const target=a.assault60?.target??a.duel?.pass?.id;
 let rival=null,nearest=null;
 for(const o of p?.cars??[]){
  if(o.pit||o.id===23)continue;
  if(o.id===target&&o.gap> -base.length-4&&o.gap<120){rival=o;break;}
  if(o.gap>12&&o.gap<120&&(!nearest||o.gap<nearest.gap))nearest=o;
 }
 rival??=nearest;
 if(!rival)return base;
 a.overtake60=true;
 let config=burstConfigs60.get(base);if(!config){config={...base,deployW:base.deployW*1.5,motorTorque:base.motorTorque*1.2};burstConfigs60.set(base,config);}return config;
}
