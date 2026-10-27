"""Derive smoothed track-control coordinates from public telemetry map coordinates.
Retain the existing start/pit corridor, orient to the authored world, and retain
source provenance. This is an approximation of factual track geometry, not EA code.
"""
import json,pathlib,gzip,numpy as np
from scipy.interpolate import splprep,splev
root=pathlib.Path(__file__).resolve().parents[1]
for key in ['bahrain','suzuka']:
 d=json.loads((root/'engine/tracks/reference25'/f'{key}-map.json').read_text());old=json.loads(gzip.decompress((root/'engine/tracks/reference25'/f'{key}-old.json.gz').read_bytes()))
 src=np.array([[c['x'],c['y']] for c in d['corners']]);dst=np.array([[c['x'],c['y']] for c in old['corners']]);X=src-src.mean(0);Y=dst-dst.mean(0);U,S,V=np.linalg.svd(X.T@Y);R=U@V;scale=S.sum()/(X*X).sum()
 world=(np.array(d['points'])-src.mean(0))@R*scale+dst.mean(0);world=np.vstack([world,world[0]]);knots,u=splprep(world.T,s=len(world)*.5**2,per=True)
 dense=np.array(splev(np.linspace(0,1,16001),knots)).T;arc=np.r_[0,np.cumsum(np.linalg.norm(np.diff(dense,axis=0),axis=1))];L=old['length'];physical=L/arc[-1];base=dense[0].copy();gate=np.array([old['samples'][0]['x'],old['samples'][0]['y']]);dense=(dense-base)*physical+gate;arc*=physical
 def ease(t):
  t=np.clip(t,0,1);return t*t*t*(10-15*t+6*t*t)
 rows=[]
 for s in np.linspace(0,L,round(L/12),endpoint=False):
  new=np.array([np.interp(s,arc,dense[:,i]) for i in [0,1]])
  oldxy=np.array([np.interp(s,[a['s'] for a in old['samples']],[a[i] for a in old['samples']]) for i in ['x','y']])
  # Pin start straight and pit corridor; blend gradually into the revised road.
  weight=ease((s-500)/200)*ease((L-180-s)/220)
  p=oldxy+(new-oldxy)*weight;rows.append([round(float(v),6) for v in p])
 markers=[]
 for i,a in enumerate(src):
  target=(((a-src.mean(0))@R*scale+dst.mean(0))-base)*physical+gate;j=np.argmin(np.sum((dense-target)**2,axis=1));markers.append({'number':i+1,'fraction':float(arc[j]/L)})
 out={'source':'https://driverdojo.app/tracks/'+key+'.html','sourceKind':'Public F1 25 telemetry map coordinates; reconstructed approximation, not LiDAR or licensed EA physics','length':L,'points':rows,'corners':markers}
 (root/'engine/tracks/reference25'/f'{key}-layout.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
 print(key,'points',len(rows))
