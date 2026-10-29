import {TEAMS52} from './roster52.js';
import {circuit} from '../tracks/track.js';
import {RACE_STYLES} from '../ai/personality.js';

const LEGACY_DRIVERS=[
{name:'KAEW',kind:'DEFENDER',colour:'#b8a3ff',traits:{pace:88.5,headway:.65,risk:.62,braking:6.3,corner:0.985,exit:6.2,defend:.95,bias:0,commit:1.8}},
{name:'ARUN',kind:'ATTACKER',colour:'#ff655c',traits:{pace:91.5,headway:.55,risk:.9,braking:6.5,corner:0.965,exit:6.5,defend:.55,bias:.4,commit:1.5}},
{name:'MALI',kind:'TACTICIAN',colour:'#55d9f4',traits:{pace:85.8,headway:.65,risk:.65,braking:6.2,corner:1.005,exit:6.35,defend:.7,bias:-.4,commit:1.9}},
{name:'SURI',kind:'OPPORTUNIST',colour:'#ffb454',traits:{pace:90,headway:.6,risk:.82,braking:6.35,corner:0.975,exit:6.6,defend:.45,bias:-.7,commit:1.6}},
{name:'NIRAN',kind:'GUARDIAN',colour:'#c8eb73',traits:{pace:86.6,headway:.85,risk:.35,braking:6.0,corner:0.995,exit:6.15,defend:.5,bias:.3,commit:2.1}},
{name:'DAWAN',kind:'SMOOTH',colour:'#e7a4d0',traits:{pace:87,headway:.8,risk:.42,braking:6.1,corner:1.0,exit:6.1,defend:.35,bias:-.3,commit:2.2}}
];


// Sprint field: narrow mechanical pace differences, retain tactical identity.
// Faster cars gain no hidden catch-up force and race position never enters it.
export function closeFieldTraits(driver){
 const p=driver.traits,profile={
 DEFENDER:{pace:89,corner:1.008,braking:6.35,exit:6.35},
 ATTACKER:{pace:96,corner:.955,braking:6.65,exit:7.05},
 TACTICIAN:{pace:91,corner:1.004,braking:6.45,exit:6.75},
 OPPORTUNIST:{pace:94.5,corner:.975,braking:6.55,exit:7.2},
 GUARDIAN:{pace:92,corner:1.000,braking:6.25,exit:6.5},
 SMOOTH:{pace:93,corner:1.006,braking:6.4,exit:6.8}
 }[driver.kind];
 return {...p,headway:circuit.key==='bahrain'?p.headway:.34+(p.headway-.65)*.1,
 ...profile,corner:profile.corner/(RACE_STYLES[driver.kind]?.cornerFactor??1)};
}

const DRIVERS=TEAMS52.flatMap((t,i)=>t.drivers.map((name,j)=>({...LEGACY_DRIVERS[(i*2+j)%6],name,colour:t.colour,team:t.id,traits:{...LEGACY_DRIVERS[(i*2+j)%6].traits,risk:.40+((i*7+j*3)%9)*.035}})));
export {DRIVERS};
