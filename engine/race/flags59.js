// A local yellow affects the existing 220 m caution area, not every car.
// VSC and all other global controls keep their original scope.
export function flagForCar59(race,car){const flag=race.controlZone?.flag??'GREEN';return flag==='YELLOW'&&typeof race.inCaution==='function'&&!race.inCaution(car)?'GREEN':flag;}
