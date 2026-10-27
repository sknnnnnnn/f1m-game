// Reserve the existing controls' real height below the game, so the camera
// composes inside the unobstructed rectangle. UI dimensions stay unchanged.
export function mountRaceViewport36(){
 const body=document.body,stage=document.getElementById('stage');let queued=false,lastInset=-1;
 body.classList.add('viewport-ui36');
 function measure(){queued=false;const height=innerHeight,clean=body.classList.contains('clean-view21');if(!clean&&body.classList.contains('sheet-open21')&&lastInset>=0)return;let top=height,found=false;
  if(!clean)for(const id of ['hud','watch-toolbar24','replay-panel']){const e=document.getElementById(id);if(!e||e.hidden||getComputedStyle(e).display==='none')continue;const r=e.getBoundingClientRect();if(r.width>0&&r.height>0&&r.top>=0){top=Math.min(top,r.top-5);found=true;}}
  // Opening a sheet should not resize the race view underneath it.
  const inset=clean?0:found?Math.max(0,Math.ceil(height-top)):Math.max(0,lastInset);
  if(inset!==lastInset){lastInset=inset;stage.style.setProperty('--race-ui-bottom36',inset+'px');}
 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(measure);}};
 const observer=new ResizeObserver(schedule);for(const id of ['hud','watch-toolbar24','replay-panel']){const e=document.getElementById(id);if(e)observer.observe(e);}
 new MutationObserver(schedule).observe(body,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',schedule);globalThis.visualViewport?.addEventListener('resize',schedule);schedule();
}
