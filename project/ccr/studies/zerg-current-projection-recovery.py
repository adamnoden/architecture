import base64,hashlib,json,os,subprocess,urllib.request
from pathlib import Path
ROOT=Path.cwd()
REL=[ 'roof-pitch-27deg-field-section.svg','ground-wc-condensate-25mm-lowering.svg','east-ground-receiving-20mm-lower.svg','inlet-plant-25mm-raise.svg','inlet-front-rail-rejection.svg','court-intake-25mm-narrowing.svg','study-floor-450mm-plan.svg','study-service-skirting-section.svg','study-stone-steel-section.svg','study-450mm-panelling.svg','study-wall-grille-section.svg','study-window-1020mm-jamb.svg','retained-component-contact.svg']
TARGETS=['project/ccr/studies/'+n for n in REL]
PROJECTIONS=['STATUS.md','project/workstream-codes.md','project/control/graph.md','docs/project/dependency-graph.md','docs/project/graph-source.ts']
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
tracked=subprocess.check_output(['git','ls-files','-z']).decode().split(chr(0))
before={p:sha(p) for p in tracked if p and p not in TARGETS+PROJECTIONS and Path(p).is_file()}
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()=='b1987fb72769f5b6f5f877e801679c3ca9bc53cd'
old={p:Path(p).read_bytes() for p in TARGETS}
subprocess.run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--write'],check=True)
subprocess.run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--check'],check=True)
out=Path(os.environ['RUNNER_TEMP'],'projection-review');out.mkdir()
(out/'generated-manifest.json').write_text(json.dumps({p:{'oldSHA256':hashlib.sha256(old[p]).hexdigest(),'newSHA256':sha(p),'bytes':Path(p).stat().st_size} for p in TARGETS},indent=2))
for p in TARGETS:
    target=out/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(Path(p).read_bytes())
subprocess.run(['npm','run','status:update'],check=True)
health=subprocess.run(['npm','run','check'])
after={p:sha(p) for p in before}
if before!=after:raise ValueError('Unexpected authored source or binding changed during witness regeneration/full health')
if health.returncode:raise SystemExit(health.returncode)
subprocess.run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--check'],check=True)
rows=[]
for p in TARGETS:
    data=Path(p).read_bytes()
    body=json.dumps({'content':base64.b64encode(data).decode(),'encoding':'base64'}).encode()
    req=urllib.request.Request('https://api.github.com/repos/adamnoden/architecture/git/blobs',data=body,method='POST',headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json','Content-Type':'application/json'})
    with urllib.request.urlopen(req) as response:result=json.load(response)
    expected=hashlib.sha1(b'blob '+str(len(data)).encode()+bytes([0])+data).hexdigest()
    if result['sha']!=expected:raise ValueError('Gitblob preservation identity differs')
    rows.append({'path':p,'sha':expected,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
(out/'verified-gitblobs.json').write_text(json.dumps(rows,indent=2))
print('VERIFIED_PROJECTION_BLOBS '+json.dumps(rows,separators=(',',':')))
print('PASS owning13witnesses and COMPLETE npm run check; all authored sources/bindings unchanged')
