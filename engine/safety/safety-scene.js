import {roadPose33} from '../tracks/road-height33.js';
import {SafetyCarRig,createSafetyCar} from './safety-car-visual.js';
// SC2.1, the user's approved sculpted body and thin rear lamps. Physics remains
// owned by safety-car.js; this rig never writes to authoritative vehicle state.
export function safetyScene(T,scene){let root=null,rig=null,lastTime=null;return {
 async load(loader,buffer){const gltf=await loader.parseAsync(buffer,'');root=gltf.scene;root.name='Approved_Safety_Car_SC2_1';root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});rig=new SafetyCarRig(root);root.visible=false;scene.add(root);},
 update(c,time,own=null){if(!root)return;root.visible=!!c&&(!own||Math.hypot(c.state.X-own.state.X,c.state.Y-own.state.Y)<180);if(!c){lastTime=null;return;}rig.applyF1MPose(c.state);root.position.y+=roadPose33(c).height??0;const dt=lastTime===null||time<lastTime?0:Math.min(.1,time-lastTime);lastTime=time;rig.update(dt,{speed:Math.hypot(c.state.u,c.state.v),steer:c.state.delta,lights:c.scLights??'amber',braking:c.state.brake>.12,wheelAngles:c.state.wheelAngles});},
 get root(){return root;},get assetVersion(){return 'SC2.1';}
};}
