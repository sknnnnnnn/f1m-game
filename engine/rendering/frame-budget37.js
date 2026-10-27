// Render at a steady 60 Hz on fast displays without changing physics cadence.
export class FrameBudget37{
 constructor(){this.reset();}
 reset(){this.next=null;this.lastPaint=null;this.paintTimes=[];this.longFrames=0;}
 due(now){if(this.next===null||now-this.next>100){this.next=now;return true;}return now+.5>=this.next;}
 painted(now){const interval=1000/60;if(this.lastPaint!==null){const gap=now-this.lastPaint;this.paintTimes.push(gap);if(this.paintTimes.length>180)this.paintTimes.shift();if(gap>interval*2)this.longFrames++;}this.lastPaint=now;this.next=Math.max((this.next??now)+interval,now-interval*.25);}
 report(){const a=[...this.paintTimes].sort((x,y)=>x-y),mean=a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);return {target:60,paintedFPS:mean?1000/mean:0,p50:a[Math.floor(a.length*.5)]??0,p95:a[Math.floor(a.length*.95)]??0,longFrames:this.longFrames,samples:a.length};}
}
