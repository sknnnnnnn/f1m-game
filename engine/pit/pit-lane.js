import {circuit,clamp,mod,wrap} from '../tracks/track.js';
export const PIT={entry:circuit.data33?.pit.entry??circuit.length-420,limit:80/3.6,target:80/3.6-.025,mergeWait:circuit.data33?.pit.mergeWait??circuit.length+420,exit:circuit.data33?.pit.exit??circuit.length+560,serviceSeconds:3.2,width:7};
const smooth=t=>{t=clamp(t,0,1);return t*t*t*(10+t*(-15+6*t));};
export const stallStation=id=>circuit.length+70+(id-1)*23;
export const pitStopStation=id=>stallStation(id)-1;
export function pitBayOffset(S,id){if(id>6)return 0;const box=stallStation(id);return -6*smooth((S-(box-20))/18)*(1-smooth((S-(box+4))/18));}
export function pitOffset(S,id){const inBlend=smooth((S-(PIT.entry+35))/210),outBlend=smooth((S-(circuit.length+300))/260),lane=-16*inBlend*(1-outBlend),box=stallStation(id);return lane+pitBayOffset(S,id);}
function importedPit33(S,id){const rows=circuit.data33.pit.samples,N=rows.length-1,z=clamp((S-PIT.entry)/(PIT.exit-PIT.entry)*N,0,N),i=Math.min(N-1,Math.floor(z)),t=z-i,a=rows[i],b=rows[i+1],prev=rows[Math.max(0,i-1)],next=rows[Math.min(N,i+2)],h0=2*t*t*t-3*t*t+1,h1=t*t*t-2*t*t+t,h2=-2*t*t*t+3*t*t,h3=t*t*t-t*t;
 const values=[1,2,3].map(k=>h0*a[k]+h1*(b[k]-prev[k])/(i===0?1:2)+h2*b[k]+h3*(next[k]-a[k])/(i===N-1?1:2)),dx=(6*t*t-6*t)*a[1]+(3*t*t-4*t+1)*(b[1]-prev[1])/(i===0?1:2)+(-6*t*t+6*t)*b[1]+(3*t*t-2*t)*(next[1]-a[1])/(i===N-1?1:2),dy=(6*t*t-6*t)*a[2]+(3*t*t-4*t+1)*(b[2]-prev[2])/(i===0?1:2)+(-6*t*t+6*t)*b[2]+(3*t*t-2*t)*(next[2]-a[2])/(i===N-1?1:2),len=Math.hypot(dx,dy)||1,box=stallStation(id),bay=pitBayOffset(S,id);return {x:values[0]-dy/len*bay,y:values[1]+dx/len*bay,height:values[2]};}
// Join the pit exit over 120 metres with matching position, tangent and
// curvature at both ends. The imported short S-bend previously forced a lift.
let exitBlend35;
function importedExit35(S,id){
 const start=PIT.mergeWait-30,L=PIT.exit-start;
 if(S<=start)return importedPit33(S,id);
 if(!exitBlend35){
  const h=.2,a=importedPit33(start,1000),am=importedPit33(start-h,1000),ap=importedPit33(start+h,1000);
  const end=v=>{const q=circuit.point(v);return {x:q.x,y:q.y,height:circuit.imported33?circuit.project(q.x,q.y,q.psi).height??0:0};},b=end(PIT.exit),bm=end(PIT.exit-h),bp=end(PIT.exit+h);
  exitBlend35=Object.fromEntries(['x','y','height'].map(k=>{
   const c0=a[k],c1=(ap[k]-am[k])/(2*h)*L,c2=(ap[k]-2*a[k]+am[k])/(h*h)*L*L/2;
   const d=b[k]-c0-c1-c2,e=(bp[k]-bm[k])/(2*h)*L-c1-2*c2,f=(bp[k]-2*b[k]+bm[k])/(h*h)*L*L-2*c2;
   return [k,[c0,c1,c2,10*d-4*e+f/2,-15*d+7*e-f,6*d-3*e+f/2]];
  }));
 }
 if(S>PIT.exit){const q=circuit.point(S);return {x:q.x,y:q.y,height:circuit.project(q.x,q.y,q.psi).height??0};}
 const t=(S-start)/L;return Object.fromEntries(Object.entries(exitBlend35).map(([k,c])=>[k,c.reduceRight((v,a)=>v*t+a,0)]));
}
function position(S,id){if(circuit.imported33)return importedExit35(S,id);const p=circuit.point(S,pitOffset(S,id));return {x:p.x,y:p.y,height:0};}
class PitRoad {
 constructor(id){this.id='P2-BAHRAIN-PIT-'+id;this.stallId=id;this.width=PIT.width;this.length=circuit.length;this.samples=[];for(let S=PIT.entry-15;S<=PIT.exit+20;S+=2)this.samples.push(this.at(S));}
 at(S){S=clamp(S,PIT.entry-15,PIT.exit+20);const a=position(S-.2,this.stallId),b=position(S,this.stallId),c=position(S+.2,this.stallId),dx=(c.x-a.x)/.4,dy=(c.y-a.y)/.4,ddx=(c.x-2*b.x+a.x)/.04,ddy=(c.y-2*b.y+a.y)/.04;return {s:S,mainS:mod(S,circuit.length),x:b.x,y:b.y,height:b.height,psi:Math.atan2(dy,dx),k:(dx*ddy-dy*ddx)/Math.max(1e-12,(dx*dx+dy*dy)**1.5),width:this.width};}
 project(x,y){let best=Infinity,index=0,f=0;for(let i=0;i<this.samples.length-1;i++){const a=this.samples[i],b=this.samples[i+1],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1),d=(x-a.x-t*dx)**2+(y-a.y-t*dy)**2;if(d<best){best=d;index=i;f=t;}}const a=this.samples[index],b=this.samples[index+1],p=this.at(a.s+f*(b.s-a.s));return {...p,d:-(x-p.x)*Math.sin(p.psi)+(y-p.y)*Math.cos(p.psi),distance:Math.sqrt(best)};}
}
const roads=new Map();export function pitRoad(id){if(!roads.has(id))roads.set(id,new PitRoad(id));return roads.get(id);}
export function canMerge(car,field){
 const own=circuit.project(car.state.X,car.state.Y,car.state.psi),duration=8;
 for(const other of field){if(other.id===car.id||other.pit?.active||other.live26?.removed)continue;const p=circuit.project(other.state.X,other.state.Y,other.state.psi),gap=circuit.delta(p.s,own.s),speed=Math.hypot(other.state.u,other.state.v);if(gap>=0&&gap<55)return false;if(gap<0&&-gap<Math.max(80,(speed-12)*duration+65))return false;}
 return true;
}

let limitLines;
// Start the limiter only once the pit corridor separates from the race road.
export function pitSpeedLimitLines(){
 if(limitLines)return limitLines;let start=PIT.entry+180;
 for(let s=PIT.entry+10;s<Math.min(circuit.length,stallStation(1)-100);s+=2){const q=pitRoad(1).at(s);if(Math.abs(circuit.project(q.x,q.y).d)>=circuit.width/2+PIT.width/2){start=s;break;}}
 return limitLines=Object.freeze({start,end:PIT.exit});
}
// Start slowing before the line to allow physical pedal/tyre response.
export function pitRouteSpeedCap(station){const lines=pitSpeedLimitLines(),distance=station<lines.start?Math.max(0,lines.start-station-14):station>lines.end?station-lines.end:0;return Math.min(60,Math.sqrt(PIT.target**2+8*distance));}

// A clear exit is a rolling merge. Only budget a stop while traffic actually
// occupies the joining corridor; recomputed by both the planner and pedal servo.
export function pitMergeStop35(car,field){return canMerge(car,field)?Infinity:PIT.mergeWait;}
