// Diagnostics only. Absence of browser heap/GPU counters is reported as null.
export class MemorySentinel {
 constructor(){this.samples=[];this.last=-Infinity;}
 sample(time,{heapBytes=null,geometries=null,textures=null,replayFrames=0,replayCapacity=0,poseFrames=0,textureCache=null}={}){if(time<this.last){this.last=-Infinity;this.samples=[];}if(time-this.last<5)return;this.last=time;this.samples.push({time,heapBytes,geometries,textures,replayFrames,replayCapacity,poseFrames,textureCache,withinBounds:replayFrames<=replayCapacity&&poseFrames<=8});if(this.samples.length>120)this.samples.shift();}
 summary(){const first=this.samples[0],last=this.samples.at(-1),growth=last?.heapBytes!==null&&first?.heapBytes!==null&&last&&first?last.heapBytes-first.heapBytes:null;return {samples:this.samples.length,latest:last??null,heapGrowthBytes:growth,bounded:this.samples.every(s=>s.withinBounds),scope:'Browser heap when exposed, renderer resources and bounded replay/interpolation counts; native/GPU memory is not inferred.'};}
}
