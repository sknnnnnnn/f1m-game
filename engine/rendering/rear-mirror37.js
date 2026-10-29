// Optional rear view. The main image keeps its quality; the extra scene pass is
// disabled by default so the 60 FPS target does not pay for another camera.
export function createRearMirror37(T){
 let enabled=false,target=null,quadScene=null,quadCamera=null,rearCamera=null,last=-Infinity;const stats={updates:0,enabled:false};
 function set(value,renderer){if(value&&(!renderer||renderer.cpu))return false;enabled=!!value;stats.enabled=enabled;last=-Infinity;return true;}
 function render(renderer,scene,car,models,camera,now,refreshInstances=()=>{}){if(!enabled||renderer.cpu||!['fps','nose'].includes(camera)||car.pit?.active)return;
  if(!target){target=new T.WebGLRenderTarget(256,96,{depthBuffer:true,stencilBuffer:false});quadScene=new T.Scene();quadCamera=new T.OrthographicCamera(-1,1,1,-1,.1,10);quadCamera.position.z=1;const quad=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({map:target.texture,depthTest:false,depthWrite:false,toneMapped:true}));quad.scale.x=-1;quadScene.add(quad);rearCamera=new T.PerspectiveCamera(76,256/96,.12,1100);}
  const oldTarget=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),test=renderer.getScissorTest(),clear=renderer.autoClear,shadowAuto=renderer.shadowMap.autoUpdate,counts={...renderer.info.render};let extraCalls=0,extraTriangles=0;
  try{
   if(now-last>=100){const roots=[models.get(car.id)?.root,models.get(car.id)?.low?.root].filter(Boolean),visible=roots.map(o=>o.visible),s=car.state;try{roots.forEach(o=>o.visible=false);refreshInstances();rearCamera.position.set(s.X,.92+(car.height37??0),-s.Y);rearCamera.up.set(0,1,0);rearCamera.lookAt(s.X-Math.cos(s.psi)*30,rearCamera.position.y-.04,-s.Y+Math.sin(s.psi)*30);renderer.shadowMap.autoUpdate=false;renderer.setScissorTest(false);renderer.setRenderTarget(target);renderer.autoClear=true;renderer.render(scene,rearCamera);extraCalls+=renderer.info.render.calls;extraTriangles+=renderer.info.render.triangles;last=now;stats.updates++;}finally{roots.forEach((o,i)=>o.visible=visible[i]);refreshInstances();}}
   renderer.setRenderTarget(oldTarget);const w=Math.min(160,viewport.z*.43),h=w*96/256,x=viewport.x+(viewport.z-w)/2,y=viewport.y+viewport.w-70-h;renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);renderer.setScissorTest(true);renderer.autoClear=false;renderer.render(quadScene,quadCamera);extraCalls+=renderer.info.render.calls;extraTriangles+=renderer.info.render.triangles;
  }catch(error){enabled=false;stats.enabled=false;stats.error=String(error);}finally{renderer.setRenderTarget(oldTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);renderer.autoClear=clear;renderer.shadowMap.autoUpdate=shadowAuto;Object.assign(renderer.info.render,counts,{calls:counts.calls+extraCalls,triangles:counts.triangles+extraTriangles});}
 }
 return {set,render,stats,get enabled(){return enabled;}};
}
