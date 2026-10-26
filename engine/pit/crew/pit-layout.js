export const PIT_LAYOUT={boxX:0,fastX:8,fastHalf:1.55,trackX:14,garage:{doorX:-6.6,backX:-14.5,zMin:-6,zMax:6},deploy:8.5,turnaround:2.5,return:8.5};
export function parkingSpot(i){
 if(i<12)return {x:[-9.6,-11,-8][i%3],z:-1.3+Math.floor(i/3)*1.7};
 const special={12:[-11.5,4.7],13:[-11.5,-4.75],14:[-8,-4.75],15:[-9.8,-4.75],16:[-9.6,4.8],17:[-11,-2.46],18:[-11,-3.9],19:[-8.6,-2.46],20:[-8.6,-3.9],21:[-11.2,1.25]};
 return {x:special[i][0],z:special[i][1]};
}
