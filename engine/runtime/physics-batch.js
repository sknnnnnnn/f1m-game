import {step as referenceStep56} from '../physics/solver56.js';
import {step as mobileStep57} from '../physics/mobile57.js';
import {surface32} from './physics-surface32.js';
// Reference56 remains the default for existing audit callers; MOBILE57 is an
// explicit alternate model. The live race worker uses mobile-runtime57 directly.
// All results are committed together by Race.commitAdvance after every job finishes.
export function runPhysicsBatch({jobs,environment,compactRecords56=false,model57='REFERENCE56'}){
 const step=model57==='MOBILE57'?mobileStep57:referenceStep56;return jobs.map(job=>{const began=performance.now(),state=job.state,result=step(job.config,state,job.command,{compactRecords56,surface:(x,y)=>surface32(environment,x,y,job.compound,job.pit,state.psi)});return {id:job.id,state,result,ms:performance.now()-began};});
}
