import {TEAMS52} from './roster52.js';
export function teamCars53(subject){const id=subject?.engineer?.team??subject?.menu49?.team??1;return TEAMS52.find(t=>t.id===id)?.cars??[];}
export const ownsCar53=(subject,id)=>teamCars53(subject).includes(id);
export function allowTeamMessage53(r,m){
 if(m.type==='TEAM')return m.id===r.engineer.team;
 if(['BOX','CANCEL_BOX','ORDER','SETUP'].includes(m.type))return ownsCar53(r,m.id);
 if(m.type==='LIVING26'&&!['SKIP_CEREMONY','CEREMONIES'].includes(m.action))return ownsCar53(r,m.id);
 return true;
}
