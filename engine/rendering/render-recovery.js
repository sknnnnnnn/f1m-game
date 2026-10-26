// Presentation lifecycle only. Simulation resumes solely through the Start button.
export class RenderRecovery {
 constructor(){this.phase='READY';this.losses=0;this.restores=0;this.hasFrame=false;this.reason='';}
 lost(){this.phase='LOST';this.losses++;this.reason='กำลังกู้คืนภาพ 3D · การแข่งขันพักไว้';}
 restored(){if(this.phase!=='LOST')return false;this.phase='REPAINT';this.restores++;return true;}
 painted(){this.hasFrame=true;if(this.phase!=='REPAINT')return false;this.phase='READY';this.reason='';return true;}
 get canRender(){return this.phase!=='LOST';}
 get canStart(){return this.phase==='READY';}
 view(){return {phase:this.phase,losses:this.losses,restores:this.restores,hasFrame:this.hasFrame};}
}
