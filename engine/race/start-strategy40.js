// Different visible stint choices create real grip/wear trade-offs. No race
// position, gap or opponent performance enters the starting compound choice.
export function startingCompound40(driver,laps){
 if(laps<3)return 'M';
 if(['TACTICIAN','OPPORTUNIST'].includes(driver.kind))return 'S';
 if(driver.kind==='GUARDIAN')return 'H';
 return 'M';
}
