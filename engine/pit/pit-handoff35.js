import {Matrix4} from 'three';
const local=new Matrix4(),reflection=new Matrix4().makeScale(-1,1,1);
// The service car is counter-reflected in its bay. Use the exact displayed
// vehicle matrix (including elevation/scale), not a second station/pose sample.
export function pitHandoff35(bay,vehicle,work){
 bay.updateMatrixWorld(true);vehicle.updateMatrixWorld(true);
 local.copy(bay.matrixWorld).invert().multiply(vehicle.matrixWorld).multiply(reflection);
 local.decompose(work.position,work.quaternion,work.scale);
}
