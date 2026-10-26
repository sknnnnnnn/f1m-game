                                       
export function snapshot(s      )                {const copy=structuredClone(s);const freeze=(v    )=>{if(v&&typeof v==='object'){for(const z of Object.values(v))freeze(z);Object.freeze(v);}return v;};return freeze(copy);}
