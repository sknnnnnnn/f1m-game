from pathlib import Path
import re,os,json
root=Path('.');mapping={}
if Path('engine').exists():raise SystemExit('Engine structure already exists; migration is one-time and no files were changed.')
for p in sorted(Path('racing/src').glob('*.js')):
 name=p.name
 if name in ['engine.js','race-clock.js','race-resources.js','strategy.js','drivers.js']:section='race'
 elif name in ['pit-lane.js','pit-reference.js']:section='pit'
 elif any(v in name for v in ['track','layout','line','catalog']):section='tracks'
 elif name in ['collision.js','vehicle-preset.js','tyres.js','pose-buffer.js','reference-adapter.js','speed-envelope.js']:section='physics'
 else:section='ai'
 mapping[p.as_posix()]=f'engine/{section}/{name}'
for p in sorted(Path('src').rglob('*')):
 if not p.is_file():continue
 name=p.name;rel=p.relative_to('src')
 if rel.parts[0]=='pitflow27':section='pit/crew';suffix='/'.join(rel.parts[1:])
 elif rel.parts[0]=='circuits33':section='tracks/scenery';suffix=name
 else:
  suffix=name
  if name in ['app.js','engine-entry.js']:section='rendering'
  elif name in ['race-worker.js','physics-worker32.js','physics-pool32.js','physics-surface32.js','memory-sentinel.js']:section='runtime'
  elif name.startswith('safety-'):section='safety'
  elif name in ['drs24.js','rear-wing24.js','wing-kits25.js']:section='drs'
  elif name.startswith('pit-') or name.startswith('pitflow'):section='pit'
  elif name=='audio.js':section='audio'
  elif 'ui' in name or name in ['control23.js','engineer-ui.js','setup-controls.js']:section='ui'
  elif name in ['weekend.js','weekend-session.js','living-session26.js','living-race26.js','weekend-race.js','strategy-race.js','weekend-save.js','weekend-environment.js','team-engineer.js','championship23.js','race-format31.js','race-intelligence15.js','driver-response21.js','stability23.js','showtime22.js','race-checkpoint.js']:section='race'
  elif name in ['track-layout28.js','road-height33.js']:section='tracks'
  else:section='rendering'
 mapping[p.as_posix()]=f'engine/{section}/{suffix}'
# Rewrite imports against OLD location and NEW destination, including re-exports.
paths=[p for d in ['src','racing/src','tests','tools'] for p in Path(d).rglob('*') if p.is_file() and p.suffix in ['.js','.mjs','.ts']]
for p in paths:
 old=p.as_posix();dest=Path(mapping.get(old,old));s=p.read_text()
 def repl(m):
  spec=m.group(2)
  if not spec.startswith('.'):return m.group(0)
  target=os.path.normpath(os.path.join(p.parent,spec));mapped=mapping.get(target,target)
  new=os.path.relpath(mapped,dest.parent).replace(os.sep,'/');new=new if new.startswith('.') else './'+new
  return m.group(1)+new+m.group(3)
 s=re.sub(r'((?:from\s*|import\s*\(\s*|import\s*)[\'\"])([^\'\"]+)([\'\"])',repl,s)
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(s)
for old,new in mapping.items():
 if old.endswith('.css'):
  dest=Path(new);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(Path(old).read_bytes())
 Path(old).unlink()
Path('docs').mkdir(exist_ok=True);Path('docs/R33_MODULE_MAP.json').write_text(json.dumps(mapping,indent=2))
# Legacy build path literals, without touching the archived baseline.
p=Path('build.mjs');s=p.read_text()
for old,new in mapping.items():s=s.replace("'"+old+"'","'"+new+"'")
s=s.replace("['src','racing','frozen'","['engine','racing','frozen'")
p.write_text(s)
print('Moved',len(mapping),'source modules; frozen runtime files remain untouched')
