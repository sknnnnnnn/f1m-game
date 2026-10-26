import {predictRejoin} from '../ai/rejoin-prediction.js';
import {COMPOUNDS,tyreWear} from '../physics/tyres.js';
import {circuit} from '../tracks/track.js';
export function chooseCompound(car,remainingMetres){
 if(car.pit.requestedCompound)return car.pit.requestedCompound;
 const laps=remainingMetres/circuit.length;return laps>2.4?'H':laps>1.25?'M':'S';
}
export function evaluateStrategy(car,field,laps){
 const remaining=Math.max(0,laps*circuit.length-car.progress),age=Math.max(1,car.distance-car.tyres.fittedDistance),wear=tyreWear(car.state),rate=wear/Math.max(1000,age),projected=Math.min(1.5,wear+rate*remaining),left=remaining/circuit.length;
 const pitTraffic=field.filter(c=>c.id!==car.id&&c.pit?.active).length,pitLoss=52+pitTraffic*3;
 const oldLoss=left*(24*(wear+projected)/2+55*Math.max(0,(wear+projected)/2-.55));
 const next=chooseCompound(car,remaining),ratio=COMPOUNDS[next].wear/COMPOUNDS[car.tyres.compound].wear,newWear=rate*remaining*ratio;
 const newLoss=left*(24*newWear/2+(next==='H'?2:next==='S'?-2:0));
 const rejoin=predictRejoin(car,field,pitLoss),gain=oldLoss-newLoss-pitLoss-rejoin.trafficPenalty;
 const leader=field.filter(c=>c.id!==car.id&&!c.pit?.active&&c.progress>car.progress&&c.progress-car.progress<55).sort((a,b)=>a.progress-b.progress)[0];
 const undercut=['TACTICIAN','OPPORTUNIST'].includes(car.kind)&&leader&&wear>.3&&left>2.2&&gain> -8&&pitTraffic===0;
 const distanceToEntry=(circuit.length-420-car.projection.s+circuit.length)%circuit.length,worthWindow=remaining-distanceToEntry>circuit.length*.75;
 const life=projected>.94&&wear>.30&&left>1.2,emergency=wear>.78&&left>.7;
 const rivalPitting=field.some(c=>c.id!==car.id&&c.pit?.active&&Math.abs(c.progress-car.progress)<300),holdOut=!car.pit.manual&&!emergency&&!life&&rivalPitting&&wear<.5&&rejoin.trafficPenalty>3;
 return {call:car.pit.manual||!holdOut&&worthWindow&&(emergency||life||undercut||gain>5+8*(car.agent.style.tyreCare??.5)&&wear>.25&&left>1.4),rejoin,plan:holdOut?'OVERCUT':undercut?'UNDERCUT':gain>5?'PIT_NOW':'STAY_OUT',reason:car.pit.manual?'คำสั่ง BOX':holdOut?'อยู่ต่อ รอช่องออกพิตโล่ง':!worthWindow?'เก็บตำแหน่งจนถึงเส้นชัย':emergency?'ยางสึกมาก':undercut?'เข้าก่อนคู่แข่ง':life?'รักษายางให้ถึงเส้นชัย':gain>5?'เปลี่ยนยางคุ้มเวลา':'วิ่งต่อคุ้มกว่า',nextCompound:next,projectedWear:projected,estimatedGainSeconds:gain,estimatedPitLoss:pitLoss,rival:leader?.id??null};
}
