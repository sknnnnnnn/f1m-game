import {ACTION42} from '../race/action42.js';
const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
// All cues use the selected car's measured wake, including replay frames.
export function slipstreamCue45(car,{running=false,phase='RACE',flag='GREEN'}={}){
 const speed=Math.hypot(car?.state?.u??0,car?.state?.v??0);
 const valid=running&&phase==='RACE'&&flag==='GREEN'&&Number.isFinite(speed)&&car&&car.id!==23&&!car.pit?.active&&!car.live26?.retired&&car.finishedAt==null&&speed>=25;
 const strength=valid?clamp(car.draft):0,active=strength>.08;
 return {active,strength:active?strength:0,relief:active?strength*ACTION42.draftRelief:0,speed,
  label:strength>.72?'แรงดูดเต็ม · เตรียมแซง':'เข้าลมดูด · กำลังไล่'};
}
