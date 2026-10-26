// AI buffers are separate from the physical footprint and the impact monitor.
export function trafficSpace(agent,state,other){
 const length=agent.config?.length??5.5,width=agent.config?.width??1.9;
 const closing=Math.max(0,-other.relativeSpeed),speed=Math.hypot(state.u,state.v);
 const corner=Math.min(1,Math.abs(state.r??0)/Math.max(5,speed)/.004),heading=Math.min(.8,Math.abs(other.headingError??0));
 const controlled=(state.brake??0)>.12&&(other.brake??0)>.12&&Math.abs(state.v)<.55&&Math.abs(other.sideSpeed??Infinity)<.55&&Math.abs(state.r)<.5&&Math.abs(other.yawRate??Infinity)<.5&&Math.abs(other.headingError??Infinity)<.08&&closing<2;
 return {lateral:width+.4+heading*length*.5,longitudinal:length+.65,reserve:controlled?length+.35+speed*.035+closing*.5:length+.9+speed*(.18+.30*corner)+closing*.8+heading*length,controlled};
}
