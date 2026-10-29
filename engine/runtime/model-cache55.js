// A page owns one decoded source per GLB. Callers clone scene nodes and replace
// materials before painting; immutable geometry is shared by every instance.
export function createModelCache55(){
 const bytes=new Map(),parsed=new Map(),stats={reads:0,byteHits:0,parses:0,parseHits:0};
 function once(map,key,work,hit){if(map.has(key)){stats[hit]++;return map.get(key);}const task=Promise.resolve().then(work).catch(error=>{map.delete(key);throw error;});map.set(key,task);return task;}
 return {stats,bytes(key,read){return once(bytes,key,()=>{stats.reads++;return read();},'byteHits');},scene(key,read,parse){return once(parsed,key,async()=>{const buffer=await this.bytes(key,read);stats.parses++;return parse(buffer);},'parseHits');}};
}
