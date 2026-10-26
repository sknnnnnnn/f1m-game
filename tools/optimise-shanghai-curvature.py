"""Offline curvature + path-length optimisation of periodic spline controls.
Run from the repository root with numpy/scipy installed. The existing road
is exported via Node; runtime uses only the generated JS array.
"""
import json,os,subprocess,numpy as np
from scipy.sparse import coo_matrix
from scipy.optimize import minimize
from pathlib import Path
q=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {circuit} from './engine/tracks/track.js';console.log(JSON.stringify(Array.from({length:Math.ceil(circuit.length/2)},(_,i)=>circuit.at(i*circuit.length/Math.ceil(circuit.length/2)))));"],env={**os.environ,'F1M_TRACK23':'shanghai'}));m=len(q);N=902;L=5451
xy=np.array([[p['x'],p['y']] for p in q]);norm=np.array([[-np.sin(p['psi']),np.cos(p['psi'])] for p in q]);s=np.array([p['s'] for p in q]);k=np.array([p['k'] for p in q]);z=s/L*N;i=np.floor(z).astype(int);t=z-i
weights=np.array([(1-t)**3/6,(3*t**3-6*t*t+4)/6,(-3*t**3+3*t*t+3*t+1)/6,t**3/6]).T
B=coo_matrix((weights.ravel(),(np.repeat(np.arange(m),4),((i[:,None]+np.arange(-1,3))%N).ravel())),shape=(m,N)).tocsr()
def fn(n):
 p=xy+(B@n)[:,None]*norm;u=p-np.roll(p,1,axis=0);v=np.roll(p,-1,axis=0)-p
 a=np.linalg.norm(u,axis=1);b=np.linalg.norm(v,axis=1);w=u+v;c=np.linalg.norm(w,axis=1);a=np.maximum(a,1e-7);b=np.maximum(b,1e-7);c=np.maximum(c,1e-7)
 cross=u[:,0]*v[:,1]-u[:,1]*v[:,0];D=a*a*b*b*c*c;f=2*cross*cross*(a+b)/D
 cu=np.c_[v[:,1],-v[:,0]];cv=np.c_[-u[:,1],u[:,0]]
 gu=4*(cross*(a+b)/D)[:,None]*cu+f[:,None]*(u/(a*(a+b))[:,None]-2*u/(a*a)[:,None]-2*w/(c*c)[:,None])
 gv=4*(cross*(a+b)/D)[:,None]*cv+f[:,None]*(v/(b*(a+b))[:,None]-2*v/(b*b)[:,None]-2*w/(c*c)[:,None])
 ksq=4*cross*cross/D
 gu4=2*ksq[:,None]*gu-.5*(ksq*ksq)[:,None]*u/a[:,None];gv4=2*ksq[:,None]*gv-.5*(ksq*ksq)[:,None]*v/b[:,None]
 gu=200*gu+200000*gu4+.0001*u/a[:,None];gv=200*gv+200000*gv4+.0001*v/b[:,None]
 gp=gu-gv-np.roll(gu,-1,axis=0)+np.roll(gv,1,axis=0)
 return float(np.sum(200*f+200000*f*ksq+.0001*(a+b))),B.T@np.sum(gp*norm,axis=1)
bounds=[]
for j in range(N):
 mask=np.abs((s-j*L/N+L/2)%L-L/2)<10
 pos=max(0,float(max(k[mask])));neg=max(0,float(max(-k[mask])))
 bounds.append((-min(5.4,.45/neg) if neg else -5.4,min(5.4,.45/pos) if pos else 5.4))
x=np.zeros(N);val,g=fn(x)
for j in [0,120,400,800]:
 xp=x.copy();xm=x.copy();xp[j]+=.0001;xm[j]-=.0001
 assert abs((fn(xp)[0]-fn(xm)[0])/.0002-g[j])<.0001
warm=json.loads(Path('engine/tracks/shanghai-line.js').read_text().split('export const SHANGHAI_LINE=')[1].rstrip(';\n'));x=np.clip(np.array(warm),np.array(bounds)[:,0],np.array(bounds)[:,1])
r=minimize(fn,x,jac=True,method='L-BFGS-B',bounds=bounds,options={'maxiter':5000,'ftol':1e-10,'gtol':1e-6,'maxcor':30})
assert r.fun<val
Path('engine/tracks/shanghai-line.js').write_text('// Offline curvature-optimised spline on unchanged Shanghai road; max offset 5.4 m.\nexport const SHANGHAI_LINE='+json.dumps(np.round(r.x,7).tolist(),separators=(',',':'))+';\n')
print(dict(initial=val,final=r.fun,iterations=r.nit,converged=bool(r.success),message=str(r.message)))
