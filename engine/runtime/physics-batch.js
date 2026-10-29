import {step} from '../physics/solver56.js';
import {surface32} from './physics-surface32.js';
// Transport batching only: each car uses the same step, config and timestep.
// All results are committed together by Race.commitAdvance after every job finishes.
export function runPhysicsBatch({jobs,environment,compactRecords56=false}){
 return jobs.map(job=>{const began=performance.now(),state=job.state,result=step(job.config,state,job.command,{compactRecords56,surface:(x,y)=>surface32(environment,x,y,job.compound,job.pit,state.psi)});return {id:job.id,state,result,ms:performance.now()-began};});
}
