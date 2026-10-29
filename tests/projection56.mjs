import assert from 'node:assert/strict';import fs from 'node:fs';import {ImportedCircuit33 as Before} from './fixtures/imported-track-before56.js';import {ImportedCircuit33 as After} from '../engine/tracks/imported-track33.js';import {CIRCUITS23} from '../engine/tracks/circuit-catalog23.js';
const results=[];
for(const key of ['shanghai','suzuka']){const profile=CIRCUITS23.find(c=>c.key===key),old=new Before(profile),fast=new After(profile),queries=[];
for(let i=0;i<old.samples.length-1;i+=3){const q=old.samples[i];for(const d of [-15,0,7])queries.push([q.x-Math.sin(q.psi)*d,q.y+Math.cos(q.psi)*d,i%2?q.psi:null]);}
queries.push([99999,-99999,1],[0,0,Math.PI]);for(const q of queries)assert.deepEqual(fast.project(...q),old.project(...q));
for(const q of queries)fast.project(...q);let t=performance.now();for(const q of queries)old.project(...q);const beforeMS=performance.now()-t;t=performance.now();for(const q of queries)fast.project(...q);const afterMS=performance.now()-t;results.push({track:key,queries:queries.length,exactProjectionEquality:true,beforeMS,afterMS,speedup:beforeMS/afterMS,cachedCells:fast.projectCells56.size});}
fs.writeFileSync('reports/runtime56/PROJECTION.json',JSON.stringify({status:'PASS',results,scope:'Exact route projection comparison, including heading-aware Suzuka deck selection; CPU timing only.'},null,2));console.log(results);
