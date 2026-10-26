"""Draw measured trajectories and a T5 close-up from physics audit JSON."""
import json,numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path
new=json.load(open('reports/PATH_TRACE_FINAL.json'));old=json.load(open('reports/PATH_TRACE_BASELINE.json'))
road=new['road'];trace=new['trace'];before=old['trace'];fig=plt.figure(figsize=(14,8));grid=fig.add_gridspec(2,2,width_ratios=[1.25,1]);axes=[fig.add_subplot(grid[:,0]),fig.add_subplot(grid[0,1]),fig.add_subplot(grid[1,1])];fig.patch.set_facecolor('#0c1821')
for ax in axes:ax.set_facecolor('#0c1821');ax.tick_params(colors='#a7bbc9');[sp.set_color('#40505c') for sp in ax.spines.values()]
for ax,lo,hi in [(axes[0],0,5451),(axes[1],1230,1530)]:
 r=[q for q in road if lo<=q['s']<=hi];a=[q for q in trace if lo<=q['s']<=hi];b=[q for q in before if lo<=q['s']<=hi]
 edge=lambda side:np.array([[q['x']-side*new['width']/2*np.sin(q['psi']),q['y']+side*new['width']/2*np.cos(q['psi'])] for q in r])
 l=edge(1);rr=edge(-1);ax.fill(np.r_[l[:,0],rr[::-1,0]],np.r_[l[:,1],rr[::-1,1]],color='#344652')
 ax.plot([q['x'] for q in r],[q['y'] for q in r],ls=':',color='#8096a6',lw=.7,label='Road centre')
 ax.plot([q['x'] for q in b],[q['y'] for q in b],color='#ffbe72',lw=1.4,label='Previous measured path')
 ax.plot([q['x'] for q in a],[q['y'] for q in a],color='#7df0c5',lw=1.5,label='New measured path')
 ax.set_aspect('equal');ax.set_xlabel('metres',color='#a7bbc9')
axes[0].set_title('Shanghai: measured physical trajectories',color='white');axes[1].set_title('T5: wider entry, smoother turn, wider exit',color='white')
for t in new['turns']:
 q=min(road,key=lambda q:abs(q['s']-t['s']));axes[0].text(q['x']+10,q['y']+12,str(t['number']),color='white',fontsize=8)
axes[0].legend(loc='upper right',facecolor='#142530',labelcolor='white',fontsize=8)
for rows,color,label in [(before,'#ffbe72','Previous'),(trace,'#7df0c5','New')]:
 q=[q for q in rows if 1230<=q['s']<=1530];axes[2].plot([q['s'] for q in q],[q['kph'] for q in q],color=color,label=label)
axes[2].set_title('T5: measured speed',color='white');axes[2].set_ylabel('km/h',color='#a7bbc9');axes[2].set_xlabel('distance around lap (m)',color='#a7bbc9');axes[2].legend(facecolor='#142530',labelcolor='white',fontsize=8);axes[2].grid(alpha=.15)
fig.suptitle(f"Same vehicle and seed | solo rolling-start lap: {old['time']:.2f}s → {new['time']:.2f}s",color='white',fontsize=14)
fig.tight_layout();fig.savefig('reports/SHANGHAI_PATH_COMPARISON.png',dpi=160,facecolor=fig.get_facecolor());plt.close(fig)
