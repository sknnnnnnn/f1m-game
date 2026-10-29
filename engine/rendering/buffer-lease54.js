// Release the inactive scene's large drawing buffer. Geometry/material quality
// is retained; the owner restores its normal size before its next visible draw.
export class BufferLease54{
 constructor(renderer){this.renderer=renderer;this.parked=false;this.parks=0;this.resumes=0;}
 park(){if(this.parked)return false;const r=this.renderer;if(r.cpu)r.setSize(1,1);else r.setDrawingBufferSize(1,1,1);this.parked=true;this.parks++;return true;}
 resume(){if(!this.parked)return false;this.parked=false;this.resumes++;return true;}
 report(){return {parked:this.parked,parks:this.parks,resumes:this.resumes};}
}
