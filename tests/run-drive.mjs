import {spawnSync} from 'node:child_process';
for(const track of ['shanghai','suzuka'])for(const file of ['tests/circuits33-drive.mjs','tests/pit33-drive.mjs','tests/pit-bays-drive.mjs']){console.log('DRIVE',track,file);const result=spawnSync(process.execPath,[file],{env:{...process.env,F1M_TRACK23:track,F1M_TEST_TICKS33:'24000'},stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);}

const sc=spawnSync(process.execPath,['tests/safety15-drive.mjs'],{env:{...process.env,F1M_TRACK23:'bahrain'},stdio:'inherit'});if(sc.status!==0)process.exit(sc.status??1);
