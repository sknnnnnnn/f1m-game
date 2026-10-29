import * as T from 'three';
import {CrewMotion} from './crew-motion.js';
import {CrewPresentation} from './crew-presentation.js';
const revision=typeof PIT_PLAN_REVISION58==='undefined'?'test58':PIT_PLAN_REVISION58;
export const planCacheStats58={hits:0,misses:0,writes:0,errors:0};
let database;
function open(){return database??=new Promise((resolve,reject)=>{if(!globalThis.indexedDB){resolve(null);return;}const r=indexedDB.open('f1m-pit-plans58',1);r.onupgradeneeded=()=>r.result.createObjectStore('plans',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>resolve(null);}).catch(()=>null);}
const motion=m=>({frames:m.frames,dt:m.dt});
export function packPlan58(e){const p=e.presentation;return {...e,bounds37:undefined,motion:motion(e.motion),presentation:{...p,active:undefined,deploy:motion(p.deploy),returning:motion(p.returning),turnaround:motion(p.turnaround)}};}
export function restorePlan58(e){
 if(!e?.motion?.frames?.length||!e?.presentation?.deploy?.frames?.length||!Number.isFinite(e.flowEnd)||!Number.isFinite(e.timing?.releasePermitAt))throw Error('Invalid cached pit plan');
 const seen=new WeakSet();function revive(v){if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);if(Object.keys(v).length===3&&['x','y','z'].every(k=>typeof v[k]==='number')){Object.setPrototypeOf(v,T.Vector3.prototype);return;}for(const child of Object.values(v))revive(child);}revive(e);
 for(const m of [e.motion,e.presentation.deploy,e.presentation.returning,e.presentation.turnaround])Object.setPrototypeOf(m,CrewMotion.prototype);
 const p=e.presentation;Object.setPrototypeOf(p,CrewPresentation.prototype);p.active=i=>i>=12&&i<=16||i<12&&p.job!=='nose'||i>=17&&p.job!=='tyres';return e;
}
// Stream small frame groups through gzip. Never stringify or clone the entire
// motion graph: two uncompressed plans can exceed 130 MB on a mobile device.
const numberOut58=(key,v)=>typeof v==='number'&&!Number.isFinite(v)?{$number58:String(v)}:v;
const numberIn58=(key,v)=>v&&typeof v==='object'&&'$number58' in v?Number(v.$number58):v;
async function encode(plan){
 const data=packPlan58(plan),motions=[data.motion,data.presentation.deploy,data.presentation.returning,data.presentation.turnaround],frames=motions.map(m=>m.frames);for(const m of motions)m.frames=[];
 const stream=new CompressionStream('gzip'),result=new Response(stream.readable).arrayBuffer(),writer=stream.writable.getWriter(),encoder=new TextEncoder();
 await writer.write(encoder.encode(JSON.stringify({header:data},numberOut58)+'\n'));
 for(let i=0;i<frames.length;i++)for(let f=0;f<frames[i].length;f+=4)await writer.write(encoder.encode(JSON.stringify({i,frames:frames[i].slice(f,f+4)},numberOut58)+'\n'));
 await writer.close();return new Uint8Array(await result);
}
async function decode(bytes){
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).pipeThrough(new TextDecoderStream()).getReader();let pending='',data,motions;
 function line(text){const part=JSON.parse(text,numberIn58);if(part.header){data=part.header;motions=[data.motion,data.presentation.deploy,data.presentation.returning,data.presentation.turnaround];}else motions[part.i].frames.push(...part.frames);}
 while(true){const {done,value}=await reader.read();if(done)break;pending+=value;let n;while((n=pending.indexOf('\n'))>=0){line(pending.slice(0,n));pending=pending.slice(n+1);}}if(pending)line(pending);return restorePlan58(data);
}
export async function readPlan58(signature){try{const db=await open();if(!db)return null;const record=await new Promise((resolve,reject)=>{const r=db.transaction('plans').objectStore('plans').get(revision+':'+signature);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});if(!record){planCacheStats58.misses++;return null;}const plan=await decode(record.plan);planCacheStats58.hits++;return plan;}catch{planCacheStats58.errors++;return null;}}
export async function writePlan58(signature,plan){try{const db=await open();if(!db||typeof CompressionStream==='undefined')return;const bytes=await encode(plan),key=revision+':'+signature;await new Promise((resolve,reject)=>{const t=db.transaction('plans','readwrite'),s=t.objectStore('plans');s.put({key,at:Date.now(),plan:bytes});const r=s.getAllKeys();r.onsuccess=()=>{const keys=r.result;for(const old of keys.filter(k=>!k.startsWith(revision+':')))s.delete(old);const current=keys.filter(k=>k.startsWith(revision+':')&&k!==key);while(current.length>3)s.delete(current.shift());};t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});planCacheStats58.writes++;}catch{planCacheStats58.errors++;}}
