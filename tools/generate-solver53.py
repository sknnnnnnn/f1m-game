from pathlib import Path
base=Path('racing/runtime/frozen/physics.js').read_text();s=base.replace("from'./contracts.js'", "from'../../racing/runtime/frozen/contracts.js'")
a='function evaluate(y         )'
s=s.replace(a,"const constants53=xy.map((_,i)=>({co:Math.cos(delta[i]),si:Math.sin(delta[i]),tf:lerpMap(s.wheels[i].Ts,[20,60,90,110,140,180],[.55,.85,1,.92,.65,.35]),wear:Math.max(.4,1-.4*s.wheels[i].wear),damage:Math.max(.3,1-.5*s.wheels[i].damage)}));\n"+a)
a='for(let pass=0;pass<20;pass++)'
b='''const wheel53=xy.map(([x,yi],i)=>{const {co,si}=constants53[i],ux=u-r*yi,vy=v+r*x,ut=ux*co+vy*si,vt=-ux*si+vy*co,omega=y[i+3],k=(c.R*omega-ut)/Math.max(Math.abs(ut),Math.abs(c.R*omega),1),alpha=Math.atan2(vt,Math.max(Math.abs(ut),1)),z=clamp(road[i].water/4,0,1),wet=Math.max(.25,1-.45*z-.20*z*clamp(V/60,0,1)**2);return {x,yi,co,si,ut,vt,omega,k,alpha,wet,sx:Math.sign(k)*lerpMap(Math.abs(k),[0,.04,.10,.18,.40,1],[0,.55,1,.95,.8,.65]),sy:-Math.sign(alpha)*lerpMap(Math.abs(alpha),[0,.02,.06,.12,.25,.50],[0,.4,1,.95,.75,.6]),brakeSign:Math.tanh(omega/.02)};});
for(let pass=0;pass<20;pass++)'''
assert a in s;s=s.replace(a,b)
a='const[x,yi]=xy[i],d=delta[i],co=Math.cos(d),si=Math.sin(d),ux=u-r*yi,vy=v+r*x,ut=ux*co+vy*si,vt=-ux*si+vy*co,omega=y[i+3],fz=loads[i],Fz=Math.max(0,fz),k=(c.R*omega-ut)/Math.max(Math.abs(ut),Math.abs(c.R*omega),1),alpha=Math.atan2(vt,Math.max(Math.abs(ut),1)),w=s.wheels[i],tf=lerpMap(w.Ts,[20,60,90,110,140,180],[.55,.85,1,.92,.65,.35]),z=clamp(road[i].water/4,0,1),wet=Math.max(.25,1-.45*z-.20*z*clamp(V/60,0,1)**2),mu=c.mu*clamp((Math.max(1,Fz)/2500)**c.loadExp,.7,1.15)*tf*Math.max(.4,1-.4*w.wear)*Math.max(.3,1-.5*w.damage)*road[i].mu*wet,lim=mu*Fz;let fxt=Math.sign(k)*lerpMap(Math.abs(k),[0,.04,.10,.18,.40,1],[0,.55,1,.95,.8,.65])*lim,fyt=-Math.sign(alpha)*lerpMap(Math.abs(alpha),[0,.02,.06,.12,.25,.50],[0,.4,1,.95,.75,.6])*lim;'
b='const {x,yi,co,si,ut,vt,omega,k,alpha,wet,sx,sy,brakeSign}=wheel53[i],{tf,wear,damage}=constants53[i],fz=loads[i],Fz=Math.max(0,fz),w=s.wheels[i],mu=c.mu*clamp((Math.max(1,Fz)/2500)**c.loadExp,.7,1.15)*tf*wear*damage*road[i].mu*wet,lim=mu*Fz;let fxt=sx*lim,fyt=sy*lim;'
assert a in s;s=s.replace(a,b)
s=s.replace('const brakeSign=Math.tanh(omega/.02),br=','const br=')
# The original computes the same explicit predictor seven times while building one vector.
a='y0.map((z,i)=>z+h*evaluate(y0).derivative[i])'
s=s.replace('const rolling=(i', 'const rolling=(i') # retain solver guess order
# use one evaluation, without changing numerical order or result
s=s.replace('guesses=[y0,','predictor53=evaluate(y0).derivative,guesses=[y0,').replace(a,'y0.map((z,i)=>z+h*predictor53[i])')
s='// R53 exact solver optimisation. Original stays in racing/runtime/frozen/physics.js.\n// Hoist invariants across the load iteration; Newton equations/tolerances are unchanged.\n'+s
Path('engine/physics/solver53.js').write_text(s)
