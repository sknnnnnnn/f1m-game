
// Presentation only. All samples bracket received authoritative physics poses.
// No prediction, no writes to simulation states, and no scripted racing path.
class PoseBuffer {
 constructor(delayMS=90){this.delayMS=delayMS;this.clear();}
 clear(){this.frames=[];this.metrics={received:0,samples:0,interpolated:0,held:0};}
 push(cars,at,running,tick){const last=this.frames.at(-1);this.metrics.received++;if(!running||!last||tick<=last.tick)this.frames=[];this.frames.push({cars,at,tick});if(this.frames.length>8)this.frames.shift();}
 sample(now,running){this.metrics.samples++;const frames=this.frames,last=frames.at(-1);if(!last)return null;if(!running){this.metrics.held++;return last.cars;}const target=now-this.delayMS;if(target<=frames[0].at){this.metrics.held++;return frames[0].cars;}
  for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];if(target>b.at)continue;const t=Math.max(0,Math.min(1,(target-a.at)/Math.max(.001,b.at-a.at))),old=new Map(a.cars.map(c=>[c.id,c]));this.metrics.interpolated++;return b.cars.map(car=>{const prev=old.get(car.id);if(!prev)return car;const p=prev.state,q=car.state,angle=Math.atan2(Math.sin(q.psi-p.psi),Math.cos(q.psi-p.psi));return {...car,state:{...q,X:p.X+(q.X-p.X)*t,Y:p.Y+(q.Y-p.Y)*t,psi:p.psi+angle*t,u:p.u+(q.u-p.u)*t,v:p.v+(q.v-p.v)*t}};});}
  this.metrics.held++;return last.cars;
 }
}


export {PoseBuffer};
