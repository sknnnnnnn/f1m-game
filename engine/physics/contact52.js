// Equal-mass, inelastic normal response. Tangential speed survives a brush.
// The small bounded separation only removes real body penetration, never race gaps.
export function resolveContact52(a,b,c){
 const x=a.next,y=b.next,dx=y.X-x.X,dy=y.Y-x.Y;
 const radius=(s,n)=>c.length*.5*Math.abs(Math.cos(s.psi)*n.x+Math.sin(s.psi)*n.y)+c.width*.5*Math.abs(-Math.sin(s.psi)*n.x+Math.cos(s.psi)*n.y);
 const axes=[x.psi,y.psi].flatMap(p=>[{x:Math.cos(p),y:Math.sin(p)},{x:-Math.sin(p),y:Math.cos(p)}]);
 let best=null,gap=-Infinity;for(const n of axes){const d=dx*n.x+dy*n.y,g=Math.abs(d)-radius(x,n)-radius(y,n);if(g>gap){gap=g;const sign=d<0?-1:1;best={x:n.x*sign,y:n.y*sign};}}
 const world=s=>({x:s.u*Math.cos(s.psi)-s.v*Math.sin(s.psi),y:s.u*Math.sin(s.psi)+s.v*Math.cos(s.psi)}),v=world(x),w=world(y),closing=Math.max(0,(v.x-w.x)*best.x+(v.y-w.y)*best.y);
 if(gap>.12)return {impact:0,depth:0};
 const j=closing*.5;v.x-=j*best.x;v.y-=j*best.y;w.x+=j*best.x;w.y+=j*best.y;
 for(const [s,q]of [[x,v],[y,w]]){s.u=q.x*Math.cos(s.psi)+q.y*Math.sin(s.psi);s.v=-q.x*Math.sin(s.psi)+q.y*Math.cos(s.psi);}
 const depth=Math.max(0,-gap+.005),push=Math.min(.25,depth*.5);x.X-=best.x*push;x.Y-=best.y*push;y.X+=best.x*push;y.Y+=best.y*push;
 for(const [p,sign] of [[a,-1],[b,1]]){p.car.agent.lastThoughtTick=-1;p.car.contact52={time:p.next.time,impact:closing,depth,away:sign*(-Math.sin(p.next.psi)*best.x+Math.cos(p.next.psi)*best.y)};if(closing>8&&p.car.health)p.car.health.wing=Math.min(1,p.car.health.wing+(closing-8)*.005);}
 return {impact:closing,depth};
}
