from pathlib import Path
s=Path('engine/physics/solver53.js').read_text()
s=s.replace('function evaluate(y         ){','function evaluate(y         ,details56=false){')
s=s.replace('ws      =[],fx=0,fy=0,mz=0;', 'ws      =[],wheelDerivative56=[0,0,0,0],fx=0,fy=0,mz=0;')
s=s.replace('ws.push({Fz:fz,', 'wheelDerivative56[i]=(drive-br-rg-c.R*fxt)/c.Iw;if(details56)ws.push({Fz:fz,')
s=s.replace('...ws.map(w=>(w.drive-w.br-w.rg-c.R*w.fx)/c.Iw)', '...wheelDerivative56')
s=s.replace('loadResidual:Math.abs(ws.reduce((a,w)=>a+w.Fz,0)-(c.m*c.g+down))','loadResidual:details56?Math.abs(ws.reduce((a,w)=>a+w.Fz,0)-(c.m*c.g+down)):0')
s=s.replace('const f=evaluate(y.map((z,i)=>(z+y0[i])/2));','const f=evaluate(y.map((z,i)=>(z+y0[i])/2),true);')
# Retain full diagnostic records by default. Live worker consumers only need
# the audited fields below; physical state, steps and Newton tolerance are same.
a='records.push({...q,substep:j,state:{X:s.X,Y:s.Y,psi:s.psi,u:s.u,v:s.v,r:s.r,E:s.E,delta:s.delta,wheels:structuredClone(s.wheels)}});'
b='records.push(options.compactRecords56?{h:q.h,solverError:q.solverError,qMax:q.qMax,loadMinimum:q.loadMinimum,deployActual:q.deployActual,wheels:q.wheels.map(w=>({k:w.k,Fz:w.Fz})),state:{wheels:s.wheels.map(w=>({omega:w.omega}))}}:{...q,substep:j,state:{X:s.X,Y:s.Y,psi:s.psi,u:s.u,v:s.v,r:s.r,E:s.E,delta:s.delta,wheels:structuredClone(s.wheels)}});'
assert a in s;s=s.replace(a,b)
s='// R56: residuals retain only numeric derivatives; full wheel records are\n// materialized for the accepted solution. Identical equations/order/tolerances.\n'+s
Path('engine/physics/solver56.js').write_text(s)
