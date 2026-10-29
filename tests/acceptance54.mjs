import {spawnSync} from 'node:child_process';
// Exactly one full racing lap per requested circuit, plus a separate synthetic
// 22-car pit-arrival fixture. Crew-clear proof is supplied by that fixture.
for(const track of ['bahrain','shanghai','suzuka']){
 for(const [file,extra]of [['tests/race46-drive.mjs',{LAPS40:'1',OUT40:`reports/release54/LAP_${track}.json`}],['tests/multipit54.mjs',{}]]){
  const p=spawnSync(process.execPath,[file],{env:{...process.env,F1M_TRACK23:track,...extra},stdio:'inherit'});if(p.status!==0)process.exit(p.status??1);
 }
}
