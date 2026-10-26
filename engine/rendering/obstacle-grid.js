// Exact XZ broad phase: full 3D box and ray tests remain in CameraSafety30.
export class ObstacleGrid {
 constructor(entries,cellSize=48){this.cellSize=cellSize;this.cells=new Map();this.large=[];entries.forEach((entry,index)=>{const b=entry.box,x0=Math.floor(b.min.x/cellSize),x1=Math.floor(b.max.x/cellSize),z0=Math.floor(b.min.z/cellSize),z1=Math.floor(b.max.z/cellSize),item={entry,index};if((x1-x0+1)*(z1-z0+1)>256){this.large.push(item);return;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=x+','+z;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(item);}});}
 query(box){const s=this.cellSize,found=new Map(this.large.map(v=>[v.index,v]));for(let x=Math.floor(box.min.x/s);x<=Math.floor(box.max.x/s);x++)for(let z=Math.floor(box.min.z/s);z<=Math.floor(box.max.z/s);z++)for(const item of this.cells.get(x+','+z)??[])found.set(item.index,item);return [...found.values()].sort((a,b)=>a.index-b.index).map(v=>v.entry);}
}
