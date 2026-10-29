import {createModelCache55} from './model-cache55.js';
export const modelCache55=createModelCache55();
export const assetBase=()=>new URL('./',document.baseURI).href;
const modelFiles55={'model':'models/car163.glb','safety-model':'models/F1M_SafetyCar_SC1.glb'};
function modelSource55(id){const element=document.getElementById(id),path=element?.dataset.src??modelFiles55[id];if(path)return {key:new URL(path,assetBase()).href,read:async()=>{const response=await fetch(new URL(path,assetBase()));if(!response.ok)throw Error('โหลดโมเดลไม่สำเร็จ: '+response.status+' '+path);return response.arrayBuffer();}};if(!element)throw Error('Missing model '+id);return {key:'inline:'+id,read:()=>Uint8Array.from(atob(element.textContent.trim()),c=>c.charCodeAt(0)).buffer};}
export function modelBuffer(id){const source=modelSource55(id);return modelCache55.bytes(source.key,source.read);}
export async function modelScene55(id,loader){const source=modelSource55(id),gltf=await modelCache55.scene(source.key,source.read,bytes=>loader.parseAsync(bytes,''));return gltf.scene.clone(true);}
export function raceWorker(source,track,profiles){const base=assetBase(),body=source??`importScripts(${JSON.stringify(new URL('workers/race-worker.js',base).href)});`,url=URL.createObjectURL(new Blob(['globalThis.F1M_TRACK23='+JSON.stringify(track)+';globalThis.F1M_PIT_PROFILE28='+JSON.stringify(profiles)+';globalThis.F1M_ASSET_BASE='+JSON.stringify(base)+';\n'+body],{type:'text/javascript'}));const worker=new Worker(url);URL.revokeObjectURL(url);return worker;}
