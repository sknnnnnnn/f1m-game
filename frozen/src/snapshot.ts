import type{State}from'./contracts.ts';
export function snapshot(s:State):Readonly<State>{const copy=structuredClone(s);const freeze=(v:any)=>{if(v&&typeof v==='object'){for(const z of Object.values(v))freeze(z);Object.freeze(v);}return v;};return freeze(copy);}
