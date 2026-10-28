import {strategyChoices38} from './experience38.js';
import {PIT} from '../pit/pit-lane.js';
import {pitEstimate26} from '../pit/pit-estimate26.js';
import {predictRejoin} from '../ai/rejoin-prediction.js';
import {COMPOUNDS,tyreWear} from '../physics/tyres.js';
import {circuit} from '../tracks/track.js';
export const degradationLoss26=wear=>9*wear+23*Math.max(0,wear-.45)**2;
export function stintLoss26(start,end,laps){let loss=0;for(let i=0;i<8;i++)loss+=degradationLoss26(start+(end-start)*(i+.5)/8);return loss/8*laps;}
export function chooseCompound(car,remainingMetres,weather=null){
 if(car.pit.requestedCompound)return car.pit.requestedCompound;
 const water39=weather?.water??car.surface?.actualWater??0;if(water39>2.5)return 'W';if(water39>.65)return 'I';if(water39>.18&&['I','W'].includes(car.tyres.compound))return car.tyres.compound;
 const laps=remainingMetres/circuit.length,age=Math.max(1000,car.distance-car.tyres.fittedDistance),rate=tyreWear(car.state)/age;
 return ['S','M','H'].map(key=>{const t=COMPOUNDS[key],end=rate*remainingMetres*t.wear/COMPOUNDS[car.tyres.compound].wear;return {key,cost:stintLoss26(0,end,laps)+(1-t.grip)*30*laps};}).sort((a,b)=>a.cost-b.cost)[0].key;
}
export function evaluateStrategy(car,field,laps,options={}){
 const remaining=Math.max(0,laps*circuit.length-car.progress),age=Math.max(1,car.distance-car.tyres.fittedDistance),wear=tyreWear(car.state),rate=wear/Math.max(1000,age),projected=Math.min(1.5,wear+rate*remaining),left=remaining/circuit.length;
 const pitTraffic=field.filter(c=>c.id!==car.id&&c.pit?.active).length,estimate=pitEstimate26(car,{...options,queue:Math.max(options.queue??0,pitTraffic*3)}),pitLoss=estimate.loss;
 const oldLoss=stintLoss26(wear,projected,left);
 const next=chooseCompound(car,remaining,options.weather),ratio=COMPOUNDS[next].wear/COMPOUNDS[car.tyres.compound].wear,newWear=rate*remaining*ratio;
 const newLoss=stintLoss26(0,newWear,left)+(1-COMPOUNDS[next].grip)*30*left+1.2;
 const rejoin=predictRejoin(car,field,pitLoss,estimate.mainMetres),gain=oldLoss-newLoss-pitLoss-rejoin.trafficPenalty;
 const leader=field.filter(c=>c.id!==car.id&&!c.pit?.active&&c.progress>car.progress&&c.progress-car.progress<55).sort((a,b)=>a.progress-b.progress)[0];
 const rivalMoreWorn=leader&&tyreWear(leader.state)>wear+.06;
 const undercut=!rivalMoreWorn&&['TACTICIAN','OPPORTUNIST'].includes(car.kind)&&leader&&wear>.3&&left>2.2&&gain> -8&&pitTraffic===0;
 const distanceToEntry=(PIT.entry-car.projection.s+circuit.length)%circuit.length,worthWindow=remaining-distanceToEntry>circuit.length*.75;
 const life=projected>.94&&wear>.30&&left>1.2,emergency=wear>.78&&left>.7;
 const rivalPitting=field.some(c=>c.id!==car.id&&c.pit?.active&&Math.abs(c.progress-car.progress)<300),holdOut=!car.pit.manual&&!emergency&&!life&&rivalPitting&&wear<.5&&rejoin.trafficPenalty>3;
 const one=Math.min(1,left),after=Math.max(0,left-one),waitLoss=stintLoss26(wear,Math.min(1.5,wear+rate*circuit.length*one),one)+stintLoss26(0,rate*circuit.length*after*ratio,after)+(1-COMPOUNDS[next].grip)*30*after+1.2;
 const choices38=strategyChoices38({waitLoss,oldLoss,newLoss,pitLoss,trafficPenalty:rejoin.trafficPenalty,wear,rate,remaining,length:circuit.length});
 return {choices38,call:car.pit.manual||!holdOut&&worthWindow&&(emergency||life||undercut||gain>5+8*(car.agent.style.tyreCare??.5)&&wear>.25&&left>1.4),rejoin,plan:holdOut?'OVERCUT':undercut?'UNDERCUT':gain>5?'PIT_NOW':'STAY_OUT',reason:car.pit.manual?'คำสั่ง BOX':holdOut?'อยู่ต่อ รอช่องออกพิตโล่ง':!worthWindow?'เก็บตำแหน่งจนถึงเส้นชัย':emergency?'ยางสึกมาก':undercut?'เข้าก่อนคู่แข่ง':life?'รักษายางให้ถึงเส้นชัย':gain>5?'เปลี่ยนยางคุ้มเวลา':'วิ่งต่อคุ้มกว่า',nextCompound:next,projectedWear:projected,estimatedGainSeconds:gain,estimatedPitLoss:pitLoss,rival:leader?.id??null};
}
