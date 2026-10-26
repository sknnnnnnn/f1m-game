import fs from 'node:fs';
import {circuit,mod,clamp} from '../engine/tracks/track.js';
const N=902,H=circuit.length/902,A=Array.from({length:N},(_,i)=>{const q=circuit.at(i*H);return{...q,nx:-Math.sin(q.psi),ny:Math.cos(q.psi)}}),n=new Float64Array(N),x=new Float64Array(N),y=new Float64Array(N),next=new Float64Array(N);
function cost(i){const m=mod(i-1,N),p=mod(i+1,N),ax=x[i]-x[m],ay=y[i]-y[m],bx=x[p]-x[i],by=y[p]-y[i],la=Math.hypot(ax,ay),lb=Math.hypot(bx,by),lc=Math.hypot(ax+bx,ay+by),k=2*(ax*by-ay*bx)/Math.max(1e-9,la*lb*lc);return (200*k*k+.0002)*(la+lb)/2;}
for(let it=0;it<2400;it++){
 for(let i=0;i<N;i++){x[i]=A[i].x+n[i]*A[i].nx;y[i]=A[i].y+n[i]*A[i].ny;}
 for(let i=0;i<N;i++){const m=mod(i-1,N),p=mod(i+1,N),X=x[i],Y=y[i],eps=.02; x[i]=X+eps*A[i].nx;y[i]=Y+eps*A[i].ny;const plus=cost(m)+cost(i)+cost(p);x[i]=X-eps*A[i].nx;y[i]=Y-eps*A[i].ny;const minus=cost(m)+cost(i)+cost(p);x[i]=X;y[i]=Y;next[i]=clamp(n[i]-.035*((plus-minus)/(2*eps)+.00002*n[i]),-3.1,3.1);}
 n.set(next);
}
fs.writeFileSync('../audit23/line-'+circuit.key+'.json',JSON.stringify(Array.from(n,v=>+v.toFixed(6))));
