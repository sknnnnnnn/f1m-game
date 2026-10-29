import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const maps={};
for(const key of ['bahrain','shanghai','suzuka','canal','ridge']){
 const code=`import {circuit as c} from './engine/tracks/track.js';const b=c.bounds,k=Math.min(174/b.width,82/b.height),p=[];for(let s=0;s<c.length;s+=20){const q=c.at(s);p.push([(100+(q.x-b.cx)*k).toFixed(1),(50-(q.y-b.cy)*k).toFixed(1)].join(','));}console.log('M'+p.join('L')+'Z');`;
 maps[key]=execFileSync(process.execPath,['--input-type=module','-e',code],{env:{...process.env,F1M_TRACK23:key},encoding:'utf8'}).trim();
}
fs.writeFileSync('engine/ui/circuit-maps50.js','// Generated from actual circuit centerlines by tools/generate-menu-maps50.mjs.\nexport const circuitMaps50='+JSON.stringify(maps)+';\n');
console.log('Generated five circuit previews from the playable layouts');
