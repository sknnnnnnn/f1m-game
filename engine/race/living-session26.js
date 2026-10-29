// Ceremony is a separate non-competitive presentation route; race poses/timing are untouched.
import {Weekend2Session} from './weekend-session.js';
import {circuit,clamp,mod,wrap} from '../tracks/track.js';
import {PIT,pitRoad,stallStation} from '../pit/pit-lane.js';
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
function segment26(t,D,V){if(D<.001)return {distance:0,speed:0,duration:0};const a=2,peak=Math.min(V,Math.sqrt(D*a)),ramp=peak/a,cruise=Math.max(0,(D-peak*peak/a)/peak),duration=2*ramp+cruise;t=Math.max(0,t);if(t>=duration)return {distance:D,speed:0,duration};if(t<ramp)return {distance:.5*a*t*t,speed:a*t,duration};if(t<ramp+cruise)return {distance:.5*peak*ramp+peak*(t-ramp),speed:peak,duration};const tail=duration-t;return {distance:D-.5*a*tail*tail,speed:a*tail,duration};}
export class LivingSession26 extends Weekend2Session {
 reset(){super.reset();this.ceremony26=null;this.preDone26=false;this.postDone26=false;this.ceremonies26=false;}
 advanceStage(){const ok=super.advanceStage();if(ok){this.ceremony26=null;this.preDone26=false;this.postDone26=false;}return ok;}
 start(){if(this.ceremony26){this.running=true;return;}if(this.phase==='GRID'&&!this.preDone26&&this.ceremonies26){this.ceremony26={kind:'PRE',elapsed:0};this.running=true;this.notice='ออกจากโรงรถ · ไปตั้งกริด · ข้ามได้ในเมนูสนามมีชีวิต';return;}super.start();}
 skipCeremony26(){const c=this.ceremony26;if(!c)return false;this.ceremony26=null;if(c.kind==='PRE'){this.preDone26=true;this.phase='GRID';this.clock.reset();super.start();}else{this.postDone26=true;this.phase='FINISHED';this.pause('PARC FERMÉ · จบพิธี');}return true;}
 tick(gap,options={}){if(!this.running)return {steps:0};if(this.ceremony26){if(gap>250){this.pause('พัก: เฟรมขาดช่วงเกิน 250 ms');return {guard:true};}this.ceremony26.elapsed+=Math.max(0,gap)/1000*this.clock.scale;const all=this.race.cars.filter(c=>!c.live26?.retired).every(c=>this.ceremonyPose26(c).done);if(all)this.skipCeremony26();return {steps:0,ceremony:true};}
  const result=super.tick(gap,options);if(this.race.finished&&!this.race.stop&&!this.postDone26&&this.ceremonies26){this.ceremony26={kind:'POST',elapsed:0};this.running=true;this.notice='ธงตราหมากรุก · รอบชะลอและกลับ Parc fermé';}return result;}
 ceremonyPose26(c){const pre=this.ceremony26.kind==='PRE',rank=c.gridPosition??c.id,L=circuit.length,t=this.ceremony26.elapsed;
  let S,speed,distance,remaining,done,q,pit,stage;
  if(pre){
   // One shared convoy progress: followers cannot catch or pass the leader.
   const leadStart=stallStation(22),leadEnd=2*L+circuit.gate-8,total=leadEnd-leadStart,motion=segment26(t,total,16),blend=smooth((motion.distance-(total-250))/250),gridOffset=Math.floor((rank-1)/2)*16+((rank-1)%2)*8,offset=(rank-1)*23*(1-blend)+gridOffset*blend;
   S=leadStart+motion.distance-offset;distance=motion.distance;remaining=total-motion.distance;done=remaining<.001;speed=motion.speed;pit=S<PIT.exit;
   if(pit){const road=pitRoad(23-rank),at=road.at(S);q=at;}else q=circuit.point(S,(rank%2?2.4:-2.4)*blend);
   stage=pit?'GARAGE_ROLLOUT':remaining<250?'GRID_FORMING':'FORMATION';
  }else{const start=c.projection.s,entry=PIT.entry>=start?PIT.entry:PIT.entry+L,end=entry+stallStation(c.id)-PIT.entry,total=end-start,motion=segment26(Math.max(0,t-(rank-1)*2),total,12);distance=motion.distance;S=start+distance;remaining=total-distance;speed=motion.speed;done=remaining<.001;pit=S>=entry;q=pit?pitRoad(c.id).at(PIT.entry+S-entry):circuit.point(S,0);stage=pit?done?'PARC_FERME':'PIT_RETURN':'COOLDOWN';}
  const delta=pit?Math.atan((this.race.config.a+this.race.config.b)*(q.k??0)):Math.atan((this.race.config.a+this.race.config.b)*(circuit.at(S).k??0)),state={...c.state,X:q.x,Y:q.y,psi:q.psi,u:done?0:speed,v:0,r:speed*(q.k??0),delta,throttle:done?0:.3,brake:remaining<60?.4:0,time:(pre?0:this.race.time)+t,wheelAngles:c.state.wheels.map((_,i)=>(c.visualAngles?.[i]??0)+distance/this.race.config.R)};
  return {state,done,pit,stage};}

 presentation(){const p=super.presentation();if(!this.ceremony26)return {...p,ceremony26:null,ceremonies26:this.ceremonies26};const post=this.ceremony26.kind==='POST';p.cars=p.cars.map(c=>{const physical=this.race.cars.find(q=>q.id===c.id);if(!physical||physical.live26?.retired)return c;const pose=this.ceremonyPose26(physical);return {...c,state:pose.state,ceremony26:pose.stage,pit:{...c.pit,active:pose.pit},show22:{...c.show22,wing:false}};});p.snapshot.cars=p.snapshot.cars.map(c=>{const shown=p.cars.find(q=>q.id===c.id);return shown?{...c,speed:shown.state.u,decision:shown.ceremony26,reason:post?'รอบชะลอและกลับพิต':'ขบวนก่อนแข่ง'}:c;});return {...p,phase:post?'PARADE':'FORMATION',ceremonies26:this.ceremonies26,ceremony26:{...this.ceremony26,scope:'Noncompetitive visual route; scoring and race physics unchanged',label:post?'รอบชะลอ → Parc fermé':'โรงรถ → กริด'},running:this.running};}
}
