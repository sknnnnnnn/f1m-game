import {mountCircuit as shanghai} from '../tracks/scenery/shanghai.js';
import {mountCircuit as suzuka} from '../tracks/scenery/suzuka.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CameraOcclusion} from './occlusion.js';
import {gridSlot28} from '../tracks/track-layout28.js';
// Reuse the accepted authored architecture, terrain, flags and crowds in the race.
export function importedScene33(T,scene,track){const api=(track.key==='shanghai'?shanghai:suzuka)({scene,renderer:{toneMappingExposure:1},environment:false,quality:'high'});api.circuit.pit.visible=false;
 // The working Pit Flow garages own the ground floor. Keep the authored upper
 // hospitality/glass/roof silhouette, instead of drawing two garages together.
 for(const o of api.architecture.pit.children){if(o.isMesh){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;if(o.position.y+(b?.max.y??0)<8)o.visible=false;}}
 api.root.traverse(o=>{if(o.name==='Pit ceiling strip')o.visible=false;if(o.isMesh)o.userData.modelMesh=true;});
 const markings=new T.Group();markings.name='Race grid markings';api.root.add(markings);const white=new T.MeshStandardMaterial({color:0xe8e4d9,roughness:.88});for(let i=0;i<6;i++){const slot=gridSlot28(i),q=track.point(slot.line,slot.lane),g=new T.Group();g.position.set(q.x,q.height+.07,-q.y);g.rotation.y=q.psi;markings.add(g);for(const [w,d,x,z] of [[.12,2.8,0,0],[6,.07,-3,-1.4],[6,.07,-3,1.4]]){const m=new T.Mesh(new T.BoxGeometry(w,.012,d),white);m.position.set(x,0,z);g.add(m);}}
 // Merge static scenery by material and spatial tile, keeping every triangle.
 // The wheel and waving flags stay separate so their animations remain intact.
 const groups=new Map(),dynamic=api.architecture.wheelRoot,flags=new Set();api.finish?.root.traverse(o=>{if(o.userData.base)flags.add(o);});api.root.updateMatrixWorld(true);const inv=api.root.matrixWorld.clone().invert();let before=0;api.root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.visible||flags.has(o)||Array.isArray(o.material))return;let p=o;while(p&&p!==api.root){if(p===dynamic||!p.visible)return;p=p.parent;}if(o.material.transparent)return;before++;const center=new T.Box3().setFromObject(o).getCenter(new T.Vector3()),key=o.material.uuid+':'+Math.floor(center.x/220)+':'+Math.floor(center.z/220);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);});let merged=0;for(const list of groups.values()){if(list.length<2)continue;const geometries=list.map(o=>{const g=o.geometry.clone().applyMatrix4(inv.clone().multiply(o.matrixWorld));return g.index?g.toNonIndexed():g;});const geometry=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();if(!geometry)continue;geometry.computeBoundingSphere();const m=new T.Mesh(geometry,list[0].material);m.name='Circuit static batch';m.castShadow=list.some(o=>o.castShadow);m.receiveShadow=true;m.userData.modelMesh=true;api.root.add(m);for(const o of list)o.removeFromParent();merged+=list.length-1;}
 const roofs=api.architecture.roofs.filter(o=>o.parent),occlusion=new CameraOcclusion(T,roofs),empty=new CameraOcclusion(T,[]);let last=0;
 return {api,roadMaterial:api.materials.asphalt,cameraBarriers:[],structuresOcclusion:occlusion,occlusion:empty,length:track.length,width:track.width,treeCount:track.key==='suzuka'?650:500,structures:before,stats33:{source:track.data33.source,staticMeshesBefore:before,drawCallsSaved:merged},update33(time,camera,focus){api.update({time,dt:Math.max(0,Math.min(.1,time-last)),camera,focus});last=time;}};
}
