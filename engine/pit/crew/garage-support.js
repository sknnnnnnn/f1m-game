import * as T from 'three';
// Four supports under the continuous chassis floor, measured against the
// actual model rather than a guessed height or the suspension arms.
export function supportContacts(root,lift=.14){
 root.updateMatrixWorld(true);const floor=root.getObjectByName('Bottom');
 if(!floor)throw Error('Chassis floor missing');
 const probe=floor.clone();probe.matrixAutoUpdate=false;probe.matrix.copy(floor.matrixWorld);probe.matrix.elements[13]+=lift-root.position.y;
 probe.material=new T.MeshBasicMaterial({side:T.DoubleSide});probe.updateMatrixWorld(true);
 const ray=new T.Raycaster(),contacts=[];
 for(const x of [-.25,.25])for(const z of [-.60,.90]){ray.set(new T.Vector3(x,0,z),new T.Vector3(0,1,0));const hit=ray.intersectObject(probe,false)[0];if(!hit)throw Error('Unsupported chassis stand');contacts.push({x,z,height:hit.point.y});}
 probe.material.dispose();return contacts;
}
