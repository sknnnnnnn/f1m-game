import {configureMenuSession49,resetMenuSession53} from '../engine/race/menu-session49.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createCarInstances53} from '../engine/rendering/car-instances53.js';
import {TEAMS52} from '../engine/race/roster52.js';
import {ownsCar53,allowTeamMessage53} from '../engine/race/team-access53.js';
import {LivingSession26} from '../engine/race/living-session26.js';
import {command23,applyPlans23} from '../engine/ui/control23.js';
const r=new LivingSession26().race;
for(const team of TEAMS52){r.selectTeam(team.id);for(const car of r.cars){const own=team.cars.includes(car.id);assert.equal(ownsCar53(r,car.id),own);for(const type of ['BOX','CANCEL_BOX','ORDER','SETUP'])assert.equal(allowTeamMessage53(r,{type,id:car.id}),own);assert.equal(command23(r,{id:car.id,mode:'CANCEL'}).ok,own);}
 assert(allowTeamMessage53(r,{type:'TEAM',id:team.id}));assert(!allowTeamMessage53(r,{type:'TEAM',id:team.id%11+1}));assert(applyPlans23(r,team.cars.map(id=>({id,start:'M',next:'H',pit:false,lap:1}))).ok);
}
const session53=new LivingSession26();configureMenuSession49(session53,{mode:'QUICK',stage:'RACE',team:11,laps:1,weather:'RAIN',setup:'WET'});resetMenuSession53(session53);assert.equal(session53.race.engineer.team,11);assert.equal(session53.race.laps,1);assert.equal(session53.race.weather.mode,'RAIN');configureMenuSession49(session53,{mode:'WEEKEND',stage:'RACE',team:4,laps:10,weather:'DRY',setup:'BALANCED'});session53.advanceStage();resetMenuSession53(session53);assert.equal(session53.stage,'QUALIFYING');assert.equal(session53.menu49.mode,'WEEKEND');assert.equal(session53.menu49.laps,10);assert.equal(session53.race.engineer.team,4);
const scene=new T.Scene(),models=new Map(),geometry=new T.BoxGeometry(1,2,3);
for(let id=1;id<=22;id++){const root=new T.Group(),lowRoot=new T.Group();lowRoot.visible=false;const mesh=new T.Mesh(geometry.clone(),new T.MeshStandardMaterial({color:id%2?'red':'blue',roughness:.33}));mesh.position.x=.5;mesh.castShadow=true;root.position.x=id*4;root.add(mesh);scene.add(root,lowRoot);models.set(id,{root,low:{root:lowRoot}});}
const instancing=createCarInstances53(T,scene,models);instancing.update();assert.equal(instancing.stats.submissions,1);assert.equal(instancing.stats.visibleParts,22);const batch=scene.children.find(c=>c.isInstancedMesh),matrix=new T.Matrix4(),colour=new T.Color();batch.getMatrixAt(0,matrix);assert.equal(matrix.elements[12],4.5);batch.getColorAt(0,colour);assert(colour.equals(new T.Color('red')));
models.get(1).root.visible=false;instancing.update();assert.equal(batch.count,21);models.get(2).root.children[0].geometry.attributes.position.setX(0,99);models.get(2).root.children[0].geometry.attributes.position.needsUpdate=true;instancing.update();assert.equal(instancing.stats.submissions,2);models.get(2).root.visible=false;instancing.update();assert.equal(instancing.stats.submissions,1);
for(let i=0;i<80;i++){const root=new T.Group(),low=new T.Group();low.visible=false;root.add(new T.Mesh(geometry,new T.MeshStandardMaterial()));scene.add(root,low);models.set(i+23,{root,low:{root:low}});}
// Separate pool exercises a batch larger than its initial GPU matrix capacity.
const larger=createCarInstances53(T,new T.Scene(),new Map([...models].slice(22)));larger.update();assert.equal(larger.stats.visibleParts,80);
const result={status:'PASS',all11TeamsRestricted:true,all11TeamPlans:true,restartPreservesTeamWeatherLapsAndWeekendStage:true,instancing:{identicalParts:22,drawSubmissions:1,paintPreserved:true,worldTransformPreserved:true,visibilityAndDamagePreserved:true,capacityGrowth:true}};fs.mkdirSync('reports/grid53',{recursive:true});fs.writeFileSync('reports/grid53/UNIT.json',JSON.stringify(result,null,2));console.log(result);
