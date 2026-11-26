import base64,copy,hashlib,json,os,re,subprocess,urllib.request
from pathlib import Path
ROOT=Path.cwd()
REL=[ 'roof-pitch-27deg-field-section.svg','ground-wc-condensate-25mm-lowering.svg','east-ground-receiving-20mm-lower.svg','inlet-plant-25mm-raise.svg','inlet-front-rail-rejection.svg','court-intake-25mm-narrowing.svg','study-floor-450mm-plan.svg','study-service-skirting-section.svg','study-stone-steel-section.svg','study-450mm-panelling.svg','study-wall-grille-section.svg','study-window-1020mm-jamb.svg','retained-component-contact.svg']
TARGETS=['project/ccr/studies/'+n for n in REL]
PROJECTIONS=['STATUS.md','project/workstream-codes.md','project/control/graph.md','docs/project/dependency-graph.md','docs/project/graph-source.ts']
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
tracked=subprocess.check_output(['git','ls-files','-z']).decode().split(chr(0))
ACCOUNT='project/ccr/studies/source-coverage.json'
DOCUMENT='project/ccr/studies/working-house-comparison.json'
BASE_TARGETS=list(TARGETS)
before={p:sha(p) for p in tracked if p and p not in TARGETS+PROJECTIONS+[ACCOUNT,DOCUMENT] and Path(p).is_file()}
account_before=json.loads(Path(ACCOUNT).read_text())
document_before=json.loads(Path(DOCUMENT).read_text())
out=Path(os.environ['RUNNER_TEMP'],'projection-review');out.mkdir()
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()=='b1987fb72769f5b6f5f877e801679c3ca9bc53cd'
old={p:Path(p).read_bytes() for p in TARGETS}
state=None
for iteration in range(4):
    subprocess.run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--write'],check=True)
    account=json.loads(Path(ACCOUNT).read_text())
    for p in BASE_TARGETS:
        data=Path(p).read_bytes()
        if p in account_before['gitBlobs']:
            account['gitBlobs'][p]=hashlib.sha1(b'blob '+str(len(data)).encode()+bytes([0])+data).hexdigest()
        target=out/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    other=copy.deepcopy(account)
    for p in BASE_TARGETS:
        if p in account_before['gitBlobs']:other['gitBlobs'][p]=account_before['gitBlobs'][p]
    if other!=account_before:raise ValueError('Non-witness account authority changed')
    Path(ACCOUNT).write_text(json.dumps(account,indent=2)+'\n')
    script="import{readFileSync,writeFileSync}from'node:fs';import{readEngineeringDocument}from'./compiler/reference-house/current-design/engineering-document.ts';const p=process.argv[1],d=JSON.parse(readFileSync(p,'utf8')),r=await readEngineeringDocument(d.design);writeFileSync(p,JSON.stringify({...d,bindings:r.bindings},null,2)+'\\n')"
    subprocess.run(['node','--import','tsx','--input-type=module','-e',script,DOCUMENT],check=True)
    document=json.loads(Path(DOCUMENT).read_text())
    if {k:v for k,v in document.items() if k!='bindings'}!={k:v for k,v in document_before.items() if k!='bindings'}:raise ValueError('Authored design/stages changed')
    now=[sha(p) for p in BASE_TARGETS+[ACCOUNT,DOCUMENT]]
    if now==state:break
    state=now
else:raise ValueError('Owning witness/account/binding fixedpoint not reached')
subprocess.run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--check'],check=True)
for p in BASE_TARGETS:
    normal=lambda data:re.sub(rb'data-caseDigest="[0-9a-f]{64}"',b'data-caseDigest="CURRENT"',data)
    if normal(old[p])!=normal(Path(p).read_bytes()):raise ValueError('Unexpected physical drawing change: '+p)
TARGETS=BASE_TARGETS+[ACCOUNT,DOCUMENT]
old[ACCOUNT]=subprocess.check_output(['git','show','HEAD:'+ACCOUNT])
old[DOCUMENT]=subprocess.check_output(['git','show','HEAD:'+DOCUMENT])
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
