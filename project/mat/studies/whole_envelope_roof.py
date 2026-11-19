"""Add only the new secondary valley load to STR's existing 22-head response."""
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
import json, runpy, sys

HERE=Path(__file__).resolve().parent
STR=HERE.parents[1]/'str'/'studies'


def readback(roof):
    source=json.loads((STR/'reconciled-corner-portals.json').read_text())['slateRoof']
    original=source['roofSupportOrigins']
    keys={tuple(map(float,k.split(','))):v[0] for k,v in original.items()}
    assert source['fullLeadMassKg']==roof['leadReferenceKg']
    # The native module has historical reproduction guards in its top level.
    # Its read-only --check runtime preserves them and does not regenerate STR.
    argv=sys.argv
    try:
        sys.argv=[str(STR/'current-house-roof-bracing.py'),'--check']
        with redirect_stdout(StringIO()):
            p=runpy.run_path(str(STR/'current-house-roof-bracing.py'))
    finally:
        sys.argv=argv
    solve,_,_=p['build'](False,True)
    g=[0.]*p['spaceSize']; mid=(p['A']+p['C'])/2; end=4525
    L=roof['valleyLength']
    # 150 at head and 100 at toe are placed there; the main valley is uniform.
    f=(L/2+100)/(L+250)*(end-mid)/(p['C']-mid)
    mass=(roof['lowerTraysKg']+roof['steelSupportBedsKg'])/4
    for face in range(4):
        heel=p['pt'](face,p['C'],p['C'])
        crown=p['pt'](face,mid,mid)
        g[p['vDO'](heel,0)]+=f*mass*9.81
        g[p['highD'](crown,2)]-=(1-f)*mass*9.81
    d=solve(g); ratio=roof['steelSpecialsKg']/roof['leadReferenceKg']
    rows=[]
    for xy in sorted(keys):
        added=40*d[p['vDO'](xy,0)]
        new=ratio*keys[xy]+added
        rows.append({'xy':list(xy),'priorLeadKN':keys[xy],'extraValleyKN':round(added,5),
                     'newSpecialsKN':round(new,5),'deltaKN':round(new-keys[xy],5)})
    total=sum(row['newSpecialsKN'] for row in rows)
    assert len(rows)==22 and abs(total-(roof['steelSpecialsKg']+mass*4)*.00981)<.001
    assert all(abs(sum(row['newSpecialsKN']*(row['xy'][j]-6000) for row in rows))<.1 for j in (0,1))
    return {'source':'reconciled-corner-portals.json / slateRoof.roofSupportOrigins; unchanged native roof stiffness',
            'rows':rows,'totalNewKN':round(total,5),'totalPriorKN':round(sum(keys.values()),5),
            'maxSignedDeltaKN':max(r['deltaKN'] for r in rows),'minSignedDeltaKN':min(r['deltaKN'] for r in rows)}
