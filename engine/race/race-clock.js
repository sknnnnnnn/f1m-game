
// Time multiplier changes how many unchanged physics steps run per wall second.
class RaceClock {
  constructor(){this.scale=1;this.accumulator=0;}
  reset(){this.accumulator=0;}
  setScale(value){if(value!==1&&value!==2)throw new RangeError('Expected time scale 1 or 2');this.scale=value;}
  advance(gapMS,dt,step,budget=6*this.scale){
    // Independently preserve the wall-time guard before multiplying time.
    if(gapMS>250)return {guard:true,steps:0,overload:false,stopped:false};
    this.accumulator+=Math.max(0,gapMS)/1000*this.scale;
    let steps=0,stopped=false;
    while(this.accumulator>=dt&&steps<budget){
      if(!step()){stopped=true;break;}
      this.accumulator-=dt;steps++;
    }
    return {steps,stopped,overload:this.accumulator>.15*this.scale,guard:false};
  }
  async advanceAsync(gapMS,dt,step,budget=6*this.scale){
    if(gapMS>250)return {guard:true,steps:0,overload:false,stopped:false};
    this.accumulator+=Math.max(0,gapMS)/1000*this.scale;let steps=0,stopped=false;
    while(this.accumulator>=dt&&steps<budget){if(!await step()){stopped=true;break;}this.accumulator-=dt;steps++;}
    return {steps,stopped,overload:this.accumulator>.15*this.scale,guard:false};
  }

}


export {RaceClock};
