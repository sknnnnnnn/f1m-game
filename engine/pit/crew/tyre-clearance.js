// Tyres are cylinders along X. Their conservative horizontal body clearance
// includes the tyre width/radius and a standing or crouching crew body.
export function tyreGap(pos,w){const dx=Math.abs(pos.x-w.x)-.49,dz=Math.abs(pos.z-w.z)-.75;return Math.max(dx,dz);}
export function clearTyres(pos,wheels=[]){return wheels.every(w=>tyreGap(pos,w)>=-1e-5);}
export function projectTyres(pos,wheels=[],preferred=pos){
 for(const w of wheels){if(tyreGap(pos,w)>=0)continue;const dx=.49-Math.abs(pos.x-w.x),dz=.75-Math.abs(pos.z-w.z);
  const side=Math.sign(pos.x-w.x)||Math.sign(preferred.x-w.x)||1;
  if(dx<dz&&Math.abs(w.x+side*.49)>=1.43)pos.x=w.x+(Math.sign(pos.x-w.x)||Math.sign(preferred.x-w.x)||1)*.49;
  else pos.z=w.z+(Math.sign(pos.z-w.z)||Math.sign(preferred.z-w.z)||1)*.75;
 }return pos;
}
