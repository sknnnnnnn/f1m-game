// Hide scenery crossing the camera-to-car corridor; simulation states stay untouched.
export class CameraOcclusion {
 constructor(T,objects){this.T=T;this.objects=objects.map(object=>({object,box:new T.Box3().setFromObject(object),blocked:false}));this.hidden=0;}
 update(camera,car){const T=this.T,center=car.getWorldPosition(new T.Vector3());center.y+=.65;this.hidden=0;
 for(const entry of this.objects){const {object,box}=entry;object.visible=true;const expanded=box.clone().expandByScalar(entry.blocked?1.4:.8);let blocks=expanded.distanceToPoint(camera.position)<3;
 for(const offset of [new T.Vector3(),new T.Vector3(1.1,0,0),new T.Vector3(-1.1,0,0),new T.Vector3(0,0,2),new T.Vector3(0,0,-2)]){if(blocks)break;const target=center.clone().add(offset),direction=target.sub(camera.position),distance=direction.length(),ray=new T.Ray(camera.position,direction.normalize()),hit=ray.intersectBox(expanded,new T.Vector3());blocks=!!hit&&camera.position.distanceTo(hit)<distance-.5;}
 entry.blocked=blocks;if(blocks){object.visible=false;this.hidden++;}}
 }
}
export function clearOfRoad(circuit,x,y,radius,margin=18){return circuit.project(x,y).distance>circuit.width/2+radius+margin;}
