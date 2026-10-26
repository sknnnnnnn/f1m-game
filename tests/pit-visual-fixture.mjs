// INTERNAL paused service fixture for visual browser QA only. This does not
// stand in for the physical race/traffic tests and is not the delivered game.
import fs from 'node:fs';import {build} from 'esbuild';
const options={bundle:true,format:'iife',platform:'browser',target:'es2020',write:false,legalComments:'none'};
const worker=(await build({...options,stdin:{resolveDir:process.cwd(),contents:`
import {StrategyRace} from './src/strategy-race.js';import {WeekendSession} from './src/weekend.js';import {initial} from './racing/runtime/frozen/physics.js';import {pitRoad,stallStation} from './racing/src/pit-lane.js';
const session=new WeekendSession({laps:5,raceFactory:o=>new StrategyRace(o)}),r=session.race,c=r.cars[0],q=pitRoad(1).at(stallStation(1)-.17);
c.state=initial(r.configuration(c),{X:q.x,Y:q.y,psi:q.psi,u:0});c.projection=pitRoad(1).project(q.x,q.y);Object.assign(c.pit,{active:true,phase:'SERVICE',serviceElapsed:1.5,serviceStarted:-1.5,nextCompound:'H',enteredAt:-30,cycle:{stopPose:{X:q.x,Y:q.y}}});r.raceMoments=[{kind:'PIT_STOP',car:1,by:1,time:0,tick:0}];session.phase='RACE';session.notice='INTERNAL VISUAL FIXTURE · paused service snapshot';
postMessage({type:'FRAME',generation:0,...session.presentation()});self.onmessage=()=>{};
`}})).outputFiles[0].text;
const app=(await build({...options,entryPoints:['engine/rendering/app.js'],define:{RACE_WORKER_SOURCE:JSON.stringify(worker),BUILD:fs.readFileSync('evidence/BUILD.json','utf8')}})).outputFiles[0].text;
let html=fs.readFileSync('index.template.html','utf8');for(const[tag,path]of[['ENGINE','vendor/engine.bundle.js'],['CPU','engine/rendering/cpu-track-renderer.js'],['HAND','engine/rendering/grip-hand.js'],['RIG','engine/rendering/driver-rig.js']])html=html.replace('/*'+tag+'*/',()=>fs.readFileSync(path,'utf8').replace(/<\/script/gi,'<\\/script'));html=html.replace('__MODEL__',fs.readFileSync('models/car163.glb').toString('base64')).replace('/*APP*/',()=>app.replace(/<\/script/gi,'<\\/script'));fs.writeFileSync('dist/qa-pit.html',html);console.log('Paused visual fixture ready; not a live race.');
