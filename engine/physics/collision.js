
import {circuit,clamp,wrap} from '../tracks/track.js';
const dot=(a,b)=>a.x*b.x+a.y*b.y,sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),add=(a,b,t)=>({x:a.x+b.x*t,y:a.y+b.y*t});
function segmentDistance(p1,q1,p2,q2){const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r);let s,t;
 if(a<=1e-12&&e<=1e-12)return Math.hypot(r.x,r.y);
 if(a<=1e-12){s=0;t=clamp(f/e,0,1);}else{const c=dot(d1,r);if(e<=1e-12){t=0;s=clamp(-c/a,0,1);}else{const b=dot(d1,d2),den=a*e-b*b;s=den!==0?clamp((b*f-c*e)/den,0,1):0;t=(b*s+f)/e;if(t<0){t=0;s=clamp(-c/a,0,1);}else if(t>1){t=1;s=clamp((b-c)/a,0,1);}}}
 const x=add(p1,d1,s),y=add(p2,d2,t);return Math.hypot(x.x-y.x,x.y-y.y);
}
// Full-size oriented rectangles. The old capsule added a width beyond the
// configured length, causing false nose/tail contacts well before the body.
function clearance(a,b,c){if(circuit.key==='suzuka'&&Math.hypot(a.X-b.X,a.Y-b.Y)<20){const pa=circuit.project(a.X,a.Y,a.psi),pb=circuit.project(b.X,b.Y,b.psi),vertical=Math.abs(pa.height-pb.height);if(vertical>3)return vertical-3;}const axes=[a.psi,b.psi].flatMap(p=>[{x:Math.cos(p),y:Math.sin(p)},{x:-Math.sin(p),y:Math.cos(p)}]),dx=b.X-a.X,dy=b.Y-a.Y;
 const radius=(s,n)=>c.length/2*Math.abs(Math.cos(s.psi)*n.x+Math.sin(s.psi)*n.y)+c.width/2*Math.abs(-Math.sin(s.psi)*n.x+Math.cos(s.psi)*n.y);
 return Math.max(...axes.map(n=>Math.abs(dx*n.x+dy*n.y)-radius(a,n)-radius(b,n)));
}
// Deliberately tiny geometric brush allowance, not an impact-force solver.
// Absolute speed may be high; relative speed and stability must both be low.
function brakeBrush(a0,a1,b0,b1,c){if(c.allowBrakeBrush===false)return false;const states=[a0,a1,b0,b1];if(!states.every(s=>(s.brake??0)>=.12&&(s.throttle??0)<.15&&Math.abs(s.v??Infinity)<.55&&Math.abs(s.r??Infinity)<.5&&Math.abs(s.lastAy??0)<10))return false;
 const velocity=s=>({x:s.u*Math.cos(s.psi)-(s.v??0)*Math.sin(s.psi),y:s.u*Math.sin(s.psi)+(s.v??0)*Math.cos(s.psi)});
 return [[a0,b0],[a1,b1]].every(([a,b])=>{const va=velocity(a),vb=velocity(b);return Math.abs(wrap(a.psi-b.psi))<.08&&Math.hypot(va.x-vb.x,va.y-vb.y)<1.2;});
}
const pose=(a,b,f)=>({X:a.X+(b.X-a.X)*f,Y:a.Y+(b.Y-a.Y)*f,psi:a.psi+wrap(b.psi-a.psi)*f});
// Sweep the actual footprint. Stable braking uses <=1 cm motion intervals and
// at most 2.5 cm sampled penetration; unstable/high-relative-speed pairs retain
// conservative pre-contact protection. No teleport or velocity correction.
function sweep(a0,a1,b0,b1,c,fine=false){const motion=s=>Math.hypot(s[1].X-s[0].X,s[1].Y-s[0].Y)+Math.hypot(c.length,c.width)/2*Math.abs(wrap(s[1].psi-s[0].psi));const bound=motion([a0,a1])+motion([b0,b1]),gentle=brakeBrush(a0,a1,b0,b1,c),N=Math.max(2,Math.ceil(bound/(gentle?.01:fine===2?.004:fine?.04:.18))),padding=gentle?-.025:.02+bound/(2*N);let min=Infinity;
 for(let k=0;k<=N;k++){const gap=clearance(pose(a0,a1,k/N),pose(b0,b1,k/N),c);min=Math.min(min,gap);if(gap<=padding){if(!gentle&&fine!==2)return sweep(a0,a1,b0,b1,c,fine?2:1);return{hit:true,clearance:gap,fraction:k/N,padding,samples:N+1,gentle};}}
 return{hit:false,clearance:min,padding,samples:N+1,gentle};
}


export {segmentDistance,clearance,sweep,brakeBrush};
