import {ImportedCircuit33} from './imported-track33.js';
import {selectedCircuit23} from './circuit-catalog23.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const mod=(x,n)=>(x%n+n)%n;
// Periodic cubic B-spline: continuous tangent and curvature, arc-length lookup.
import {BAHRAIN_CONTROL} from './bahrain-layout.js';
class Circuit {
 constructor(profile=selectedCircuit23()){if(['shanghai','suzuka'].includes(profile.key))return new ImportedCircuit33(profile);const CONTROL=profile.control??BAHRAIN_CONTROL;this.key=profile.key;this.id=profile.key==='bahrain'?'P2-BAHRAIN-GP':'P2-'+profile.key.toUpperCase();this.name=profile.key==='bahrain'?'BAHRAIN GRAND PRIX':profile.name;this.width=profile.width;this.gate=0;this.cellSize=40;this.grid=new Map();this.samples=[];let length=0,last=null;const N=CONTROL.length,steps=Math.max(8,Math.floor(12000/N));
  for(let i=0;i<=N*steps;i++){const z=i/steps,j=Math.floor(z)%N,t=z-Math.floor(z),p=[CONTROL[(j-1+N)%N],CONTROL[j],CONTROL[(j+1)%N],CONTROL[(j+2)%N]],B=[(1-t)**3/6,(3*t**3-6*t*t+4)/6,(-3*t**3+3*t*t+3*t+1)/6,t**3/6],D=[-((1-t)**2)/2,(3*t*t-4*t)/2,(-3*t*t+2*t+1)/2,t*t/2],DD=[1-t,3*t-2,-3*t+1,t];let x=0,y=0,dx=0,dy=0,ddx=0,ddy=0;for(let k=0;k<4;k++){x+=B[k]*p[k][0];y+=B[k]*p[k][1];dx+=D[k]*p[k][0];dy+=D[k]*p[k][1];ddx+=DD[k]*p[k][0];ddy+=DD[k]*p[k][1];}if(last)length+=Math.hypot(x-last.x,y-last.y);const q={s:length,x,y,psi:Math.atan2(dy,dx),k:(dx*ddy-dy*ddx)/Math.max(1e-12,(dx*dx+dy*dy)**1.5)};this.samples.push(q);last=q;}
  // Normalize the schematic flat centreline to the published GP lap length.
  const scale=profile.length/length;for(const q of this.samples){q.x*=scale;q.y*=scale;q.s*=scale;q.k/=scale;}length=profile.length;
  this.length=length;this.turns=[758,846,966,1560,1722,1916,2036,2284,2658,2742,3470,3836,4142,4910,5010].map((s,i)=>({number:i+1,s,k:this.at(s).k}));if(this.key!=='bahrain'){this.turns=[];for(let z=60;z<this.length;z+=15){const q=this.at(z);if(Math.abs(q.k)>.008&&Math.abs(q.k)>Math.abs(this.at(z-15).k)&&Math.abs(q.k)>=Math.abs(this.at(z+15).k)&&this.turns.every(t=>Math.abs(t.s-z)>75))this.turns.push({number:this.turns.length+1,s:z,k:q.k});}}const xs=this.samples.map(p=>p.x),ys=this.samples.map(p=>p.y);this.bounds={minX:Math.min(...xs)-40,maxX:Math.max(...xs)+40,minY:Math.min(...ys)-60,maxY:Math.max(...ys)+60};this.bounds.width=this.bounds.maxX-this.bounds.minX;this.bounds.height=this.bounds.maxY-this.bounds.minY;this.bounds.cx=(this.bounds.minX+this.bounds.maxX)/2;this.bounds.cy=(this.bounds.minY+this.bounds.maxY)/2;
  for(let i=0;i<this.samples.length-1;i++){const a=this.samples[i],b=this.samples[i+1];for(let x=Math.floor(Math.min(a.x,b.x)/40);x<=Math.floor(Math.max(a.x,b.x)/40);x++)for(let y=Math.floor(Math.min(a.y,b.y)/40);y<=Math.floor(Math.max(a.y,b.y)/40);y++){const key=x+','+y;if(!this.grid.has(key))this.grid.set(key,[]);this.grid.get(key).push(i);}}
 }
 at(z){const s=mod(z,this.length);let l=0,h=this.samples.length-1;while(h-l>1){const m=(l+h)>>1;if(this.samples[m].s>s)h=m;else l=m;}return this.interpolate(l,(s-this.samples[l].s)/(this.samples[h].s-this.samples[l].s));}
 interpolate(i,t){const a=this.samples[i],b=this.samples[i+1],k=a.k+t*(b.k-a.k),s=a.s+t*(b.s-a.s);let section=s<900?'T1–3 / HEAVY BRAKING':s<1600?'T4 / OVERTAKING':s<2450?'T5–8 / S COMPLEX':s<3000?'T9–10 / TRACTION':s<4100?'T11–13 / FLOWING':'T14–15 / MAIN STRAIGHT';if(this.key!=='bahrain')section=this.name+' / SECTOR '+(Math.floor(s/this.length*3)+1);const ds=b.s-a.s,h0=2*t*t*t-3*t*t+1,h1=t*t*t-2*t*t+t,h2=-2*t*t*t+3*t*t,h3=t*t*t-t*t;return{s,x:h0*a.x+h1*ds*Math.cos(a.psi)+h2*b.x+h3*ds*Math.cos(b.psi),y:h0*a.y+h1*ds*Math.sin(a.psi)+h2*b.y+h3*ds*Math.sin(b.psi),psi:wrap(a.psi+t*wrap(b.psi-a.psi)),k,width:this.width,section,phase:s/this.length};}
 point(s,n=0){const a=this.at(s);return{...a,x:a.x-n*Math.sin(a.psi),y:a.y+n*Math.cos(a.psi)};}
 project(x,y){let best=Infinity,index=0,fraction=0;const test=i=>{const a=this.samples[i],b=this.samples[i+1],dx=b.x-a.x,dy=b.y-a.y,f=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1),d=(x-a.x-f*dx)**2+(y-a.y-f*dy)**2;if(d<best){best=d;index=i;fraction=f;}};const gx=Math.floor(x/40),gy=Math.floor(y/40);let found=false;for(let xx=gx-1;xx<=gx+1;xx++)for(let yy=gy-1;yy<=gy+1;yy++){const indices=this.grid.get(xx+','+yy);if(indices){found=true;for(const i of indices)test(i);}}
  if(!found||best>1600){let nearest=0,distance=Infinity;for(let i=0;i<this.samples.length-1;i+=30){const q=this.samples[i],d=(x-q.x)**2+(y-q.y)**2;if(d<distance){distance=d;nearest=i;}}for(let i=Math.max(0,nearest-40);i<Math.min(this.samples.length-1,nearest+41);i++)test(i);}
  const a=this.interpolate(index,fraction);return{...a,d:-(x-a.x)*Math.sin(a.psi)+(y-a.y)*Math.cos(a.psi),distance:Math.sqrt(best)};
 }
 delta(a,b){return mod(a-b+this.length/2,this.length)-this.length/2;}
}
const circuit=new Circuit();


export {clamp,wrap,mod,Circuit,circuit};
