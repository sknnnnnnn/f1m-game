"""Restore this delivered source checkpoint without ZIP. Python3 standard library."""
import base64,hashlib,json,sys
from pathlib import Path
checkpoint=Path(sys.argv[1] if len(sys.argv)>1 else 'F1M_33_Recovery_Checkpoint.json')
destination=Path(sys.argv[2] if len(sys.argv)>2 else 'F1M_33_Source').resolve()
package=json.loads(checkpoint.read_text(encoding='utf-8'))
for relative,item in package['files'].items():
    rel=Path(relative)
    if rel.is_absolute() or '..' in rel.parts:raise ValueError('Unsafe path: '+relative)
    data=base64.b64decode(item['data'],validate=True) if item['encoding']=='base64' else item['data'].encode('utf-8')
    if hashlib.sha256(data).hexdigest()!=item['sha256']:raise ValueError('Hash mismatch: '+relative)
    target=destination/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
print('Restored',len(package['files']),'files to',destination)
