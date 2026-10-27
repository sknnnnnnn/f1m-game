import {PIT} from '../pit/pit-lane.js';
import {circuit,clamp} from '../tracks/track.js';
export function predictRejoin(car,field,pitLoss=52,mainMetres=PIT.exit-PIT.entry){
 const average=c=>clamp(c.distance/Math.max(1,c.state.time),25,55),ownAverage=average(car),transit=mainMetres/ownAverage+pitLoss,station=car.progress+mainMetres;
 const projected=field.filter(c=>c.id!==car.id&&!c.pit?.active&&c.finishedAt==null).map(c=>({id:c.id,gap:c.progress+average(c)*transit-station,speed:average(c)}));
 const ahead=projected.filter(c=>c.gap>=0).sort((a,b)=>a.gap-b.gap)[0]??null,behind=projected.filter(c=>c.gap<0).sort((a,b)=>b.gap-a.gap)[0]??null;
 const penalty=(ahead&&ahead.gap<180?(180-ahead.gap)/30:0)+(behind&&behind.gap> -100?(100+behind.gap)/40:0);
 return {estimatedSeconds:transit,projectedProgress:station,ahead,behind,trafficPenalty:penalty,scope:'Average observed pace projection; estimate rescored every strategy check, not a guaranteed pit position'};
}
