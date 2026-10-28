// Hold a real passing attempt while it gains ground; stop wasting a straight
// beside a rival who is pulling away. Physical corridor checks retain priority.
export function passProgress26(pass,rival,time,length=5.5){
 if(!rival||rival.pit)return 'LOST';
 if(rival.gap<-(length+4))return 'CLEAR';
 if(rival.gap>(pass.reach42??85)||time-pass.started>(pass.reach42?22:18))return 'EXPIRED';
 pass.bestGap??=rival.gap;pass.advancedAt??=pass.started;
 pass.trendGap40??=rival.gap;pass.trendAt40??=time;
 if(time-pass.trendAt40>=1){if(rival.gap<pass.trendGap40-.4)pass.advancedAt=time;pass.trendGap40=rival.gap;pass.trendAt40=time;}
 if(rival.gap<pass.bestGap-1){pass.bestGap=rival.gap;pass.advancedAt=time;}
 if(rival.gap>18&&time-pass.advancedAt>(pass.stall42??4.5))return 'STALLED';
 return 'HOLD';
}
