import {SETUPS} from './weekend-environment.js';
export function validateMenuSession49(input){
 if(!input||!['QUICK','WEEKEND'].includes(input.mode)||!['PRACTICE','QUALIFYING','RACE'].includes(input.stage)||!Number.isInteger(input.team)||input.team<1||input.team>3||!Number.isInteger(input.laps)||input.laps<1||input.laps>20||!['DRY','SHOWER','RAIN'].includes(input.weather)||!SETUPS[input.setup])return null;
 return {...input,stage:input.mode==='WEEKEND'?'PRACTICE':input.stage};
}
export function configureMenuSession49(session,input){
 const config=validateMenuSession49(input);if(!config||session.running)return {ok:false,reason:'พักเรซและตรวจค่าตั้งต้นก่อนเริ่มเซสชันใหม่'};
 session.reset();session.stage=config.stage;session.qualifyingFormat='FLYING';session.race.laps=config.stage==='RACE'?config.laps:2;session.race.selectTeam(config.team);session.race.setWeather(config.weather);for(const c of session.race.cars)session.setup(c.id,config.setup,{});session.placeGrid([1,2,3,4,5,6]);session.notice=config.stage==='PRACTICE'?'PRACTICE · เตรียมรถก่อนควอลิฟาย':config.stage==='QUALIFYING'?'QUALIFYING · Out lap แล้ว Flying lap':'RACE · พร้อมออกตัว';return {ok:true,stage:config.stage};
}

export function advanceMenuSession49(session,config){const ok=session.advanceStage();if(ok&&session.stage==='RACE'&&validateMenuSession49(config))session.race.laps=config.laps;return ok;}
