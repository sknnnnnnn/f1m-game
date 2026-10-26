import {runPhysicsBatch} from './physics-batch.js';
self.onmessage=e=>{const m=e.data;try{postMessage({id:m.id,results:runPhysicsBatch(m)});}catch(error){postMessage({id:m.id,error:String(error)});}};
