// Hold a real passing attempt while it gains ground; stop wasting a straight
// beside a rival who is pulling away. Physical corridor checks retain priority.
export function passProgress26(pass,rival,time,length=5.5){
 if(!rival||rival.pit)return 'LOST';
 if(rival.gap<-(length+4))return 'CLEAR';
 if(rival.gap>85||time-pass.started>18)return 'EXPIRED';
 pass.bestGap??=rival.gap;pass.advancedAt??=pass.started;
 if(rival.gap<pass.bestGap-1){pass.bestGap=rival.gap;pass.advancedAt=time;}
 if(rival.gap>18&&time-pass.advancedAt>4.5)return 'STALLED';
 return 'HOLD';
}
