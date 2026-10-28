import {RENDER_HEARTBEAT_GRACE_MS} from '../runtime/render-health.js';

// Time multiplier changes how many unchanged physics steps run per wall second.
class RaceClock {
  constructor(){this.scale=1;this.accumulator=0;}
  reset(){this.accumulator=0;}
  setScale(value){if(value!==1&&value!==2)throw new RangeError('Expected time scale 1 or 2');this.scale=value;}
  advance(gapMS,dt,step,budget=6*this.scale){
    // Independently preserve the wall-time guard before multiplying time.
    if(gapMS>RENDER_HEARTBEAT_GRACE_MS)return {guard:true,steps:0,overload:false,stopped:false};
    this.accumulator+=Math.min(100,Math.max(0,gapMS))/1000*this.scale;
    let steps=0,stopped=false;
    while(this.accumulator>=dt&&steps<budget){
      if(!step()){stopped=true;break;}
      this.accumulator-=dt;steps++;
    }
    return {steps,stopped,overload:this.accumulator>.15*this.scale,guard:false};
  }
  async advanceAsync(gapMS,dt,step,budget=6*this.scale){
    if(gapMS>RENDER_HEARTBEAT_GRACE_MS)return {guard:true,steps:0,overload:false,stopped:false};
    this.accumulator+=Math.min(100,Math.max(0,gapMS))/1000*this.scale;let steps=0,stopped=false;
    while(this.accumulator>=dt&&steps<budget){if(!await step()){stopped=true;break;}this.accumulator-=dt;steps++;}
    return {steps,stopped,overload:this.accumulator>.15*this.scale,guard:false};
  }

}


export {RaceClock};
