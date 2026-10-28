import {circuit,clamp} from '../tracks/track.js';
// Strong arcade wake, applied to physical drag only. No rank or speed writes.
// A broad core retains tow during pull-out; it fades at the sides and vanishes
// alongside. Curved sections, pit cars and the Safety Car cannot supply tow.
export function draftFactor(car,field,wet=false){
 const own=car.projection;
 if(car.pit?.active||car.id===7||Math.hypot(car.state.u,car.state.v)<25||Math.abs(own.k)>.003)return 0;
 let strength=0;
 for(const other of field){
  if(other.id===car.id||other.id===7||other.pit?.active)continue;
  const gap=circuit.delta(other.projection.s,own.s),lateral=Math.abs(other.projection.d-own.d);
  if(gap>7&&gap<450&&lateral<6){
   if(wet){strength=Math.max(strength,.56/.90*clamp(1-(gap-12)/268,0,1)*clamp(1-lateral/4.8,0,1));continue;}
   const distance=gap<=130?1:clamp((450-gap)/320,0,1);
   const width=lateral<=2.6?1:clamp((6-lateral)/3.4,0,1);
   strength=Math.max(strength,distance*width);
  }
 }
 return strength;
}
