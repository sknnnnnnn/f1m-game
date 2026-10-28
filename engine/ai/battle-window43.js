// Compatibility for old saves: R44 removes rank/gap based regrouping entirely.
export function battleWindow43(agent){
 if(agent.battleWindow43)agent.battleWindow43.saving=false;
 return {saving:false,pace:Infinity,cornerFactor:1,reason:'แข่งตามสมรรถนะและคำสั่งผู้เล่น'};
}
