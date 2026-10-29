import {SETUPS} from './weekend-environment.js';
export function validateMenuSession49(input){
 if(!input||!['QUICK','WEEKEND'].includes(input.mode)||!['PRACTICE','QUALIFYING','RACE'].includes(input.stage)||!Number.isInteger(input.team)||input.team<1||input.team>11||!Number.isInteger(input.laps)||input.laps<1||input.laps>20||!['DRY','SHOWER','RAIN'].includes(input.weather)||!SETUPS[input.setup])return null;
 return {...input,stage:input.mode==='WEEKEND'?'PRACTICE':input.stage};
}
export function configureMenuSession49(session,input){
 const config=validateMenuSession49(input);if(!config||session.running)return {ok:false,reason:'พักเรซและตรวจค่าตั้งต้นก่อนเริ่มเซสชันใหม่'};
 session.reset();session.menu49={...config};session.stage=config.stage;session.qualifyingFormat='FLYING';session.race.laps=config.stage==='RACE'?config.laps:2;session.race.selectTeam(config.team);session.race.setWeather(config.weather);for(const c of session.race.cars)session.setup(c.id,config.setup,{});session.placeGrid(Array.from({length:22},(_,i)=>i+1));session.notice=config.stage==='PRACTICE'?'PRACTICE · เตรียมรถก่อนควอลิฟาย':config.stage==='QUALIFYING'?'QUALIFYING · Out lap แล้ว Flying lap':'RACE · พร้อมออกตัว';return {ok:true,stage:config.stage};
}

export function advanceMenuSession49(session,config=session.menu49){const ok=session.advanceStage();if(ok&&session.stage==='RACE'&&validateMenuSession49(config))session.race.laps=config.laps;return ok;}

// Restart the current stage with the team/settings chosen at session entry.
// Preserve Weekend progression settings without sending it back to Practice.
export function resetMenuSession53(session){
 const menu=session.menu49?{...session.menu49}:null,team=session.race.engineer.team,stage=session.stage,weather=session.race.weather.mode;
 session.pause();
 if(menu){configureMenuSession49(session,{...menu,mode:'QUICK',stage,team,weather});session.menu49={...menu,team};}
 else{session.reset();session.race.selectTeam(team);}
}
