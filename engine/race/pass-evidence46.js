// Bounded, measured history. Explanations describe observed contributing cues,
// not an invented counterfactual guarantee about why a pass happened.
export function samplePassEvidence46(car,result){
 const s=car.state,rows=car.passEvidence46??=[];
 if(rows.length&&s.time-rows.at(-1).time<.09)return;
 rows.push({time:s.time,tow:car.draft??0,hybrid:(result?.records??[]).some(r=>r.deployActual>0),brake:s.brake??0,ax:s.lastAx??0,steer:Math.abs(s.delta??0),lock:car.response21?.phase&&car.response21.phase!=='NORMAL'});
 while(rows.length>40||rows[0]?.time<s.time-3.5)rows.shift();
}
export function explainPass46(winner,loser){
 const rows=winner.passEvidence46??[],other=loser.passEvidence46??[],towPeak=Math.max(0,...rows.map(r=>r.tow)),hybrid=rows.some(r=>r.hybrid),lock=other.some(r=>r.lock),braking=(winner.state.brake??0)>.15&&(loser.state.brake??0)>.15,exit=rows.some(r=>r.steer>.04)&&winner.state.lastAx>1&&winner.state.lastAx>(loser.state.lastAx??0)+.5;
 const factors={towPeak,hybrid,opponentLockRecovery:lock,braking,exitAcceleration:exit};
 const text=lock?'คู่แข่งเสียจังหวะหลังล้อล็อก':towPeak>.15&&hybrid?'เกาะลมดูด + ใช้ ERS':towPeak>.15?'สะสมความเร็วจากลมดูด':braking?'ดวลเบรกผ่านช่องว่าง':exit?'ออกโค้งเร่งได้ดีกว่า':hybrid?'ใช้ ERS ช่วงบุก':'ความเร็วและจังหวะผ่านช่องว่าง';
 const counter=winner.agent?.duel?.counter,counter47=!!counter&&counter.id===loser.id&&counter.until>=winner.state.time;
 return {explanation46:text,factors46:factors,counter47:!!counter47};
}
