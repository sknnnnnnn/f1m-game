import suzuka from './reference25/suzuka-layout.json' with {type:'json'};
// C2 periodic road, shared by authored scenery and the imported physics road.
// Source map controls are data, not an invisible faster path outside the road.
export function surveyCurve25(T,old,key){
 if(key!=='suzuka')return old;
 const data=suzuka,N=data.points.length;
 class Road extends T.Curve{
  constructor(){super();this.arcLengthDivisions=16000;this.points=data.points.map(([x,y],i)=>new T.Vector3(x,old.getPointAt(i/N).y,-y));}
  getPoint(t,target=new T.Vector3()){
   const z=((t%1)+1)%1*N,i=Math.floor(z),u=z-i,b=[(1-u)**3/6,(3*u**3-6*u*u+4)/6,(-3*u**3+3*u*u+3*u+1)/6,u**3/6];target.set(0,0,0);
   for(let j=0;j<4;j++)target.addScaledVector(this.points[(i+j-1+N)%N],b[j]);return target;
  }
 }
 const road=new Road(),gate=road.getPoint(0);
 for(let pass=0;pass<2;pass++){const scale=data.length/road.getLength();for(const p of road.points){p.x=gate.x+(p.x-gate.x)*scale;p.z=gate.z+(p.z-gate.z)*scale;}road.updateArcLengths();}
 return road;
}
export function surveyCorners25(curve,samples,key){
 if(key!=='suzuka')return null;
 return suzuka.corners.map(c=>{const p=curve.getPoint(c.fraction);let best=samples[0],distance=Infinity;for(const q of samples){const d=q.p.distanceToSquared(p);if(d<distance){distance=d;best=q;}}return{name:'T'+c.number,u:best.u,point:best.p.clone()};});
}
