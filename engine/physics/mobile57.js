import {clamp,validateCommand} from '../../racing/runtime/frozen/contracts.js';
import {engineWheelTorque,thermal,kinetic,event,wallContact,dry} from './solver56.js';
export const MODEL57='MOBILE57-FOUR-WHEEL-SEMI-IMPLICIT';
// A game-oriented approximation: four friction circles, load transfer and
// independent wheel inertia, eliminated into a bounded 3x3 body solve. This is
// deliberately a different model from the reference 7-variable Newton solver.
function solve3(a,b){const q=[...a[0],b[0],...a[1],b[1],...a[2],b[2]];for(let j=0;j<3;j++){let pivot=j;for(let k=j+1;k<3;k++)if(Math.abs(q[k*4+j])>Math.abs(q[pivot*4+j]))pivot=k;if(pivot!==j)for(let k=j;k<4;k++){const t=q[j*4+k];q[j*4+k]=q[pivot*4+k];q[pivot*4+k]=t;}const d=q[j*4+j];for(let k=j;k<4;k++)q[j*4+k]/=d;for(let i=0;i<3;i++)if(i!==j){const z=q[i*4+j];for(let k=j;k<4;k++)q[i*4+k]-=z*q[j*4+k];}}return [q[3],q[7],q[11]];}
const tyreTemperature=T=>T<=20?.55:T<=60?.55+(T-20)*.3/40:T<=90?.85+(T-60)*.15/30:T<=110?1-(T-90)*.08/20:T<=140?.92-(T-110)*.27/30:T<=180?.65-(T-140)*.3/40:.35;
function substep57(c,s,cmd,h,surface){
 const E0=s.E,before=kinetic(c,s),old=[s.u,s.v,s.r],V=Math.hypot(s.u,s.v),coBody=Math.cos(s.psi),siBody=Math.sin(s.psi);
 s.throttle+=clamp(cmd.throttle-s.throttle,-c.pedalRate*h,c.pedalRate*h);s.brake+=clamp(cmd.brake-s.brake,-c.pedalRate*h,c.pedalRate*h);
 s.delta+=clamp((clamp(cmd.steer,-c.steerMax,c.steerMax)-s.delta)*(1-Math.exp(-h/c.steerLag)),-c.steerRate*h,c.steerRate*h);
 if(cmd.gear&&cmd.gear!==s.gear&&cmd.gear!==s.shiftTarget){s.shiftTarget=cmd.gear;s.shiftRemaining=.08;}if(s.shiftRemaining>0){s.shiftRemaining=Math.max(0,s.shiftRemaining-h);if(!s.shiftRemaining)s.gear=s.shiftTarget;}
 const down=.5*c.rho*c.ClA*V*V,front=clamp(c.m*c.g*c.b/(c.a+c.b)-c.h*c.m*s.lastAx/(c.a+c.b)+down*c.aeroFront,0,c.m*c.g+down),rear=c.m*c.g+down-front,Qf=c.rollFront*c.m*c.h*s.lastAy/c.tf,Qr=(1-c.rollFront)*c.m*c.h*s.lastAy/c.tr;
 const loads=[front/2-Qf,front/2+Qf,rear/2-Qr,rear/2+Qr].map(x=>Math.max(0,x)),xy=[[c.a,c.tf/2],[c.a,-c.tf/2],[-c.b,c.tr/2],[-c.b,-c.tr/2]],omegaRear=Math.max(.1,(s.wheels[2].omega+s.wheels[3].omega)/2);
 const engine=s.shiftRemaining>0?0:engineWheelTorque(c,s,omegaRear)*s.throttle,bus=cmd.energy&&s.E>0?Math.min(c.deployW,s.E/h):0,motor=Math.min(c.motorTorque*c.finalRatio,bus*c.deployEff/omegaRear),brakes=[c.brakeF,c.brakeF,c.brakeR,c.brakeR].map(t=>t*s.brake),regen=Math.max(0,Math.min((brakes[2]+brakes[3])*c.regenFraction,c.motorTorque*c.finalRatio,c.regenW/(omegaRear*c.regenEff),(c.capacity-s.E)/(h*omegaRear*c.regenEff)));
 const wheels=xy.map(([x,y],i)=>{const w=s.wheels[i],delta=i<2&&Math.abs(s.delta)>1e-10?Math.atan((c.a+c.b)/((c.a+c.b)/Math.tan(s.delta)-y)):0,co=Math.cos(delta),si=Math.sin(delta),U=[co,si,-y*co+x*si],L=[-si,co,y*si+x*co],road=surface(s.X+x*coBody-y*siBody,s.Y+x*siBody+y*coBody),wet=Math.max(.25,1-.45*clamp(road.water/4,0,1)-.20*clamp(road.water/4,0,1)*clamp(V/60,0,1)**2),Fz=loads[i],lim=c.mu*clamp((Math.max(1,Fz)/2500)**c.loadExp,.7,1.15)*tyreTemperature(w.Ts)*Math.max(.4,1-.4*w.wear)*Math.max(.3,1-.5*w.damage)*road.mu*wet*Fz;
  const ground57=U.reduce((sum,v,j)=>sum+v*old[j],0),sign=Math.tanh((Math.abs(w.omega)>.01?w.omega:ground57/c.R)/.02),rg=i>=2?regen/2*sign:0,br=(i<2?brakes[i]:Math.max(0,brakes[i]-regen/2))*sign,drive=i>=2?(engine+motor)/2:0,torque=drive-br-rg,kx=13.75*lim/Math.max(6,V),ky=20*lim/Math.max(6,V),ke=kx/(1+h*kx*c.R*c.R/c.Iw),target=c.R*w.omega+h*c.R*torque/c.Iw;
  return {i,x,y,U,L,road,Fz,lim,ke,ky,target,torque,drive,br,rg,omega0:w.omega,linear:true,fx:0,fy:0};});
 const drag=.5*c.rho*c.CdA*V,base=[c.m*old[0]+h*(-drag*old[0]+c.m*old[2]*old[1]),c.m*old[1]+h*(-drag*old[1]-c.m*old[2]*old[0]),c.Iz*old[2]];let body=old,solverError=0;
 for(let pass=0;pass<4;pass++){
  const a=[[c.m,0,0],[0,c.m,0],[0,0,c.Iz]],b=[...base];
  for(const w of wheels){const {U,L}=w;if(w.linear){for(let i=0;i<3;i++){b[i]+=h*U[i]*w.ke*w.target;for(let j=0;j<3;j++)a[i][j]+=h*(w.ke*U[i]*U[j]+w.ky*L[i]*L[j]);}}else for(let i=0;i<3;i++)b[i]+=h*(U[i]*w.fx+L[i]*w.fy);}
  body=solve3(a,b);solverError=Math.max(...a.map((row,i)=>Math.abs(row.reduce((sum,v,j)=>sum+v*body[j],0)-b[i])));
  let capped=false;for(const w of wheels)if(w.linear){const ut=w.U.reduce((sum,v,j)=>sum+v*body[j],0),vt=w.L.reduce((sum,v,j)=>sum+v*body[j],0);w.fx=w.ke*(w.target-ut);w.fy=-w.ky*vt;const force=Math.hypot(w.fx,w.fy);if(force>w.lim&&force>0){const k=w.lim/force;w.fx*=k;w.fy*=k;w.linear=false;capped=true;}}if(!capped)break;
 }
 // The last pass may discover another cap: form the body impulse from the
 // bounded accepted forces, so no force outside a friction circle is applied.
 const sum=[0,0,0];for(const w of wheels)for(let i=0;i<3;i++)sum[i]+=w.U[i]*w.fx+w.L[i]*w.fy;
 body=[(base[0]+h*sum[0])/c.m,(base[1]+h*sum[1])/c.m,(base[2]+h*sum[2])/c.Iz];
 if(s.brake>.01&&s.throttle<.01&&old[0]>=0&&body[0]<0)body[0]=0;
 [s.u,s.v,s.r]=body;s.lastAx=sum[0]/c.m;s.lastAy=sum[1]/c.m;
 const yawMid=s.psi+(old[2]+s.r)*h/4;s.X+=((old[0]+s.u)*.5*Math.cos(yawMid)-(old[1]+s.v)*.5*Math.sin(yawMid))*h;s.Y+=((old[0]+s.u)*.5*Math.sin(yawMid)+(old[1]+s.v)*.5*Math.cos(yawMid))*h;s.psi+=(old[2]+s.r)*h/2;
 let deployMechanical=0,regenMechanical=0,driveWork=0,frictionWork=0,slipWork=0,thermalResidual=0;const ws=[];
 for(const w of wheels){const wheel=s.wheels[w.i],ut=w.U.reduce((sum,v,j)=>sum+v*body[j],0),vt=w.L.reduce((sum,v,j)=>sum+v*body[j],0);wheel.omega=w.omega0+h*(w.torque-c.R*w.fx)/c.Iw;if((w.br+w.rg)>0&&ut>=0&&wheel.omega<0)wheel.omega=0;wheel.fx=w.fx;wheel.fy=w.fy;const omega=(w.omega0+wheel.omega)*.5,k=(c.R*omega-ut)/Math.max(Math.abs(ut),Math.abs(c.R*omega),1),alpha=Math.atan2(vt,Math.max(1,Math.abs(ut))),heat=Math.max(0,w.fx*(c.R*omega-ut)-w.fy*vt),t=thermal(c,wheel,h,heat,V,w.road.water,w.road.abrasion);thermalResidual+=t.residual;slipWork+=heat*h;driveWork+=w.drive*omega*h;frictionWork+=w.br*omega*h;if(w.i>=2)deployMechanical+=motor/2*omega*h;regenMechanical+=w.rg*omega*h;ws.push({Fz:w.Fz,fx:w.fx,fy:w.fy,k,alpha,omega,ut,vt,lim:w.lim,q:w.lim>0?Math.hypot(w.fx,w.fy)/w.lim:0,water:w.road.water,abrasion:w.road.abrasion});}
 const deployActual=Math.min(s.E,Math.max(0,deployMechanical/c.deployEff)),regenActual=Math.min(c.capacity-s.E,Math.max(0,regenMechanical*c.regenEff)),aux=Math.min(Math.max(0,s.E-deployActual+regenActual),c.auxW*h);s.E=clamp(s.E-deployActual+regenActual-aux,0,c.capacity);
 return {owner:'Physics',model57:MODEL57,h,solverError,wheels:ws,downForce:down,loadMinimum:Math.min(...loads),qMax:Math.max(...ws.map(w=>w.q)),deployActual,regenActual,aux,Echange:s.E-E0,energyResidual:(s.E-E0)-(regenActual-deployActual-aux),driveWork,frictionWork,slipWork,deltaK:kinetic(c,s)-before,thermalResidual,contact:null};
}
export function step(c,s,command,options={}){const rejection=validateCommand(command,s),applied=rejection?{tick:s.tick,expires:s.tick,throttle:0,brake:.3,steer:0}:command;if(rejection)event(s,'COMMAND_REJECT',{reason:rejection});const records=[];for(let j=0;j<c.substeps;j++){const old=options.wallX!==undefined?structuredClone(s):null,q=substep57(c,s,applied,c.dt/c.substeps,options.surface??dry);if(old)q.contact=wallContact(c,s,old,options.wallX);s.time+=c.dt/c.substeps;records.push(options.compactRecords56?{h:q.h,solverError:q.solverError,qMax:q.qMax,loadMinimum:q.loadMinimum,deployActual:q.deployActual,wheels:q.wheels.map(w=>({k:w.k,Fz:w.Fz})),state:{wheels:s.wheels.map(w=>({omega:w.omega}))}}:{...q,substep:j,state:{X:s.X,Y:s.Y,psi:s.psi,u:s.u,v:s.v,r:s.r,E:s.E,delta:s.delta,wheels:s.wheels.map(w=>({...w}))}});}s.tick++;return {rejection,requested:command,applied,records,model57:MODEL57};}
