// Damped visual chassis response driven by actual tyre/body telemetry.
// Physics owns X/Y/psi and wheel contact; these bounded offsets never feed it.
export class ChassisDynamics {
 constructor(){this.reset();}
 reset(){this.roll={x:0,v:0};this.pitch={x:0,v:0};this.heave={x:0,v:0};this.lastTime=null;}
 update(s,time){let dt=this.lastTime===null?0:Math.max(0,Math.min(.1,time-this.lastTime));this.lastTime=time;
 const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
 const targets={roll:clamp(-(s.lastAy??0)*.0055+((s.travel?.[0]??0)-(s.travel?.[1]??0))*.25,-.07,.07),pitch:clamp((s.lastAx??0)*.0048,-.06,.06),heave:-clamp((s.u*s.u+s.v*s.v)*.0000055,0,.045)+(s.surface?.bump??0)+(s.flat??0)*.003*Math.sin(time*Math.max(0,s.u)/.34)};
 const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
 for(let j=0;j<steps;j++)for(const [name,target] of Object.entries(targets)){const q=this[name],omega=name==='heave'?18:12;q.v+=(omega*omega*(target-q.x)-2*.74*omega*q.v)*h;q.x+=q.v*h;}
 return {roll:this.roll.x,pitch:this.pitch.x,heave:this.heave.x};
 }
}
export function attachRollingWheels(T,vehicle,body,rig){
 body.updateMatrixWorld(true);const assemblies=[];
 for(const n of ['FL_Tire','FR_Tire','RL_Tire','RR_Tire']){const tyre=body.getObjectByName(n),front=rig.front.find(f=>f.pivot.children.includes(tyre));let turn;
 if(front){turn=front.pivot;vehicle.attach(turn);}else{const center=vehicle.worldToLocal(new T.Box3().setFromObject(tyre).getCenter(new T.Vector3()));turn=new T.Group();turn.position.copy(center);vehicle.add(turn);turn.attach(tyre);}
 const spin=new T.Group();turn.add(spin);spin.attach(tyre);assemblies.push({turn,spin,side:turn.position.x<0?-1:1});
 }
 for(const f of rig.front)if(!f.wheel)vehicle.attach(f.pivot);
 return assemblies;
}
