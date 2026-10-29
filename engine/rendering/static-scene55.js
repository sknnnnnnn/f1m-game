// Freeze authored scenery transforms once. Dynamic branches and their ancestor
// paths remain traversable; geometry/material/visibility updates still work.
export function freezeScenery55(root,dynamicRoots=[]){
 const dynamic=new Set(dynamicRoots.filter(Boolean));
 root.updateWorldMatrix(true,true);
 const stats={frozen:0,dynamicBranches:0};
 function visit(node){
  if(dynamic.has(node)){stats.dynamicBranches++;return true;}
  let moving=false;for(const child of node.children)moving=visit(child)||moving;
  node.matrixAutoUpdate=false;node.matrixWorldAutoUpdate=moving;
  node.matrixWorldNeedsUpdate=false;stats.frozen++;return moving;
 }
 visit(root);return stats;
}
