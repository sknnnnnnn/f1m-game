// Tactical preferences act on choices and physical demand, never on car poses.
export const RACE_STYLES={
 ATTACKER:{label:'สายบุก',cornerFactor:1.04,feint:.85,patience:.8,lateApex:.4,cover:.55,tyreCare:.15},
 TACTICIAN:{label:'นักวางแผน',cornerFactor:1.005,feint:.95,patience:1.8,lateApex:1,cover:.65,tyreCare:.55},
 DEFENDER:{label:'สายป้องกัน',cornerFactor:1,feint:.5,patience:1.2,lateApex:.65,cover:1,tyreCare:.35},
 OPPORTUNIST:{label:'ฉวยจังหวะ',cornerFactor:1.025,feint:.7,patience:.6,lateApex:.8,cover:.35,tyreCare:.25},
 GUARDIAN:{label:'ถนอมยาง',cornerFactor:.985,feint:.15,patience:2.5,lateApex:.85,cover:.3,tyreCare:1},
 SMOOTH:{label:'ขับเนียน',cornerFactor:.99,feint:.3,patience:2,lateApex:.95,cover:.45,tyreCare:.9}
};
export function tyreDemand(agent,state){
 const style=RACE_STYLES[agent.kind]??RACE_STYLES.SMOOTH;
 const rear=state.wheels.slice(2),heat=Math.max(...rear.map(w=>w.Ts)),wear=Math.max(...rear.map(w=>w.wear));
 const stress=Math.max(0,(heat-108)/28,wear*1.5),cold=agent.newTyre22?Math.max(0,(68-heat)/35):0;
 return {label:style.label,stress,exitFactor:Math.max(.72,1-Math.min(.18,stress*.12)*style.tyreCare-Math.min(.09,cold*.09)),hybridReserve:.12+.12*style.tyreCare};
}
