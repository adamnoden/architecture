import base64,copy,hashlib,json,os,re,subprocess,urllib.request
from pathlib import Path
ROOT=Path.cwd()
WITNESSES=['project/ccr/studies/'+n for n in ['roof-pitch-27deg-field-section.svg','ground-wc-condensate-25mm-lowering.svg','east-ground-receiving-20mm-lower.svg','inlet-plant-25mm-raise.svg','inlet-front-rail-rejection.svg','court-intake-25mm-narrowing.svg','study-floor-450mm-plan.svg','study-service-skirting-section.svg','study-stone-steel-section.svg','study-450mm-panelling.svg','study-wall-grille-section.svg','study-window-1020mm-jamb.svg','retained-component-contact.svg']]
METHOD='project/str/studies/continuous_rc_cage_proof.py'
CAGE_RESULT='project/str/studies/continuous-rc-cage-proof.json'
CAGE_DRAW='project/str/studies/continuous-rc-cage.svg'
CAGE_DOC='project/str/continuous-rc-portal-cage.md'
ACCOUNT='project/ccr/studies/source-coverage.json'
DOCUMENT='project/ccr/studies/working-house-comparison.json'
TARGETS=WITNESSES+[METHOD,CAGE_RESULT,CAGE_DRAW,CAGE_DOC,ACCOUNT,DOCUMENT]
PROJECTIONS=['STATUS.md','project/workstream-codes.md','project/control/graph.md','docs/project/dependency-graph.md','docs/project/graph-source.ts']
out=Path(os.environ['RUNNER_TEMP'],'projection-review');out.mkdir()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+bytes([0])+data).hexdigest()
def run(args):subprocess.run(args,check=True)
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()=='b1987fb72769f5b6f5f877e801679c3ca9bc53cd'
assert blob(Path(METHOD).read_bytes())=='3c3cfb643bb8a35e2f8b0e6c9eaa91be1c39b837'
old={p:subprocess.check_output(['git','show','HEAD:'+p]) for p in TARGETS}
account_before=json.loads(old[ACCOUNT]);document_before=json.loads(old[DOCUMENT])
tracked=subprocess.check_output(['git','ls-files','-z']).decode().split(chr(0))
before={p:sha(p) for p in tracked if p and p not in TARGETS+PROJECTIONS and Path(p).is_file()}
def refresh_pins():
    a=json.loads(Path(ACCOUNT).read_text())
    for p in TARGETS:
        if p in account_before['gitBlobs']:a['gitBlobs'][p]=blob(Path(p).read_bytes())
    other=copy.deepcopy(a)
    for p in TARGETS:
        if p in account_before['gitBlobs']:other['gitBlobs'][p]=account_before['gitBlobs'][p]
    assert other==account_before,'Only existing owned output/source pins may change'
    Path(ACCOUNT).write_text(json.dumps(a,indent=2,ensure_ascii=False)+'\n')
def refresh_bindings():
    script="import{readFileSync,writeFileSync}from'node:fs';import{readEngineeringDocument}from'./compiler/reference-house/current-design/engineering-document.ts';const p=process.argv[1],d=JSON.parse(readFileSync(p,'utf8')),r=await readEngineeringDocument(d.design);writeFileSync(p,JSON.stringify({...d,bindings:r.bindings},null,2)+'\\n')"
    run(['node','--import','tsx','--input-type=module','-e',script,DOCUMENT])
    d=json.loads(Path(DOCUMENT).read_text())
    assert {k:v for k,v in d.items() if k!='bindings'}=={k:v for k,v in document_before.items() if k!='bindings'},'Authored design/stages changed'
run(['python','-B',METHOD,'--write'])
c=json.loads(Path(CAGE_RESULT).read_text());c['sourceSHA256'][METHOD]=json.loads(old[CAGE_RESULT])['sourceSHA256'][METHOD]
assert c==json.loads(old[CAGE_RESULT]),'Numerical cage proof or native actions changed'
assert Path(CAGE_DRAW).read_bytes()==old[CAGE_DRAW],'Cage drawing changed'
assert Path(CAGE_DOC).read_bytes()==old[CAGE_DOC],'Superseded-cage warning changed'
refresh_pins();refresh_bindings()
state=None
for iteration in range(4):
    run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--write'])
    refresh_pins();refresh_bindings()
    now=[sha(p) for p in TARGETS]
    if state==now:break
    state=now
else:raise ValueError('Owning witness/account/binding fixedpoint not reached')
run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--check'])
run(['python','-B',METHOD,'--check'])
normal=lambda data:re.sub(rb'data-caseDigest="[0-9a-f]{64}"',b'data-caseDigest="CURRENT"',data)
for p in WITNESSES:assert normal(old[p])==normal(Path(p).read_bytes()),'Unexpected physical witness change: '+p
for p in TARGETS:
    target=out/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(Path(p).read_bytes())
(out/'generated-manifest.json').write_text(json.dumps({p:{'oldSHA256':hashlib.sha256(old[p]).hexdigest(),'newSHA256':sha(p),'bytes':Path(p).stat().st_size} for p in TARGETS},indent=2))
proven=[sha(p) for p in TARGETS]
run(['npm','run','status:update'])
run(['npm','run','check'])
assert [sha(p) for p in TARGETS]==proven,'Full health mutated the verified source/outputs'
assert {p:sha(p) for p in before}==before,'Unexpected authored source changed'
run(['node','--import','tsx','project/ccr/studies/current-projection-witnesses.ts','--check'])
run(['python','-B',METHOD,'--check'])
rows=[]
for p in TARGETS:
    data=Path(p).read_bytes();expected=blob(data)
    body=json.dumps({'content':base64.b64encode(data).decode(),'encoding':'base64'}).encode()
    req=urllib.request.Request('https://api.github.com/repos/adamnoden/architecture/git/blobs',data=body,method='POST',headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json','Content-Type':'application/json'})
    with urllib.request.urlopen(req) as response:result=json.load(response)
    assert result['sha']==expected,'Gitblob preservation differs'
    rows.append({'path':p,'sha':expected,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
(out/'verified-gitblobs.json').write_text(json.dumps(rows,indent=2))
print('VERIFIED_PROJECTION_BLOBS '+json.dumps(rows,separators=(',',':')))
print('PASS complete npm run check; owning witnesses/cage warning reproduced; all physical cage fields/drawings and authored house unchanged')
