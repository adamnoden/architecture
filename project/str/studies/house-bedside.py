"""Exact cross-sections distinguish named bedside access from full-side comfort."""
from pathlib import Path
import json
OUT=Path(__file__).resolve().parent

import sys, io, tempfile, hashlib
def emit(name, data):
    target = OUT / name
    if '--check' in sys.argv:
        if target.read_text() != data:
            raise SystemExit('STALE: ' + str(target))
    else:
        target.write_text(data)
def emit_svg(fig, name):
    buffer = io.StringIO()
    fig.savefig(buffer, format='svg', metadata={'Date': '2026-10-30'})
    emit(name, buffer.getvalue())
def preview(fig, name):
    if '--preview' in sys.argv:
        fig.savefig(Path(tempfile.gettempdir()) / name, dpi=170)
d=json.loads((OUT/'house-plan.json').read_text())
E=417.5
def rects():
    out=[]
    for w in d['first_walls']:
        x,y=w['a'];xx,yy=w['b'];h=y==yy;lo=x if h else y;hi=xx if h else yy;at=y if h else x
        cuts=sorted({lo,hi,*[v for z in w['holes']for v in z if lo<=v<=hi]})
        for a,b in zip(cuts,cuts[1:]):
            if b<=a or any(a>=p and b<=q for p,q in w['holes']):continue
            out.append((w['id'],(a,at-w['t']/2,b-a,w['t'])if h else(at-w['t']/2,a,w['t'],b-a)))
    out+=list(d['first_objects'].items())+[('court-envelope',(3832.5,3832.5,4335,4335)),('stair',d['stair']),('void',d['void'])]
    return out
out={}
for name in['bed2','bed3','bed4','principal']:
    x,y,w,h=d['first_objects'][name]
    obs=[(k,r)for k,r in rects()if k!=name]
    cuts=sorted({y,y+h,*[v for k,r in obs for v in[r[1],r[1]+r[3]]if y<v<y+h]})
    rows=[]
    for a,b in zip(cuts,cuts[1:]):
        z=(a+b)/2;left=E;right=12000-E;li=ri='outer finished face'
        for k,(xx,yy,ww,hh)in obs:
            if not yy<z<yy+hh:continue
            if xx+ww<=x and xx+ww>left:left=xx+ww;li=k
            if xx>=x+w and xx<right:right=xx;ri=k
            assert not(xx<x+w and xx+ww>x),('actual bed overlap',name,k,a,b)
        row={'y_interval':[a,b],'left_clear':x-left,'right_clear':right-x-w,'left_limit':li,'right_limit':ri}
        if rows and all(rows[-1][k]==row[k]for k in['left_clear','right_clear','left_limit','right_limit']):rows[-1]['y_interval'][1]=b
        else:rows.append(row)
    out[name]={'bed_rectangle':[x,y,w,h],'sections':rows,'minimum_full_length_left':min(r['left_clear']for r in rows),'minimum_full_length_right':min(r['right_clear']for r in rows),
      'length_with_less_than600_on_left':sum(b-a for r in rows for a,b in[r['y_interval']]if r['left_clear']<600),
      'length_with_less_than600_on_right':sum(b-a for r in rows for a,b in[r['y_interval']]if r['right_clear']<600)}
result={'basis':'Exact horizontal sections at all finite wall/object boundaries over each2000 bed length. Side clearances are nominal rectangles, not person/product design.',
 'meaning':'Reachable lower-side stations in house-plan.json do not establish full-length bilateral access.600 is the existing diagnostic comparator, not a universal bedroom-compliance limit. The front L rooms retain explicit head-nook compromises.',
 'beds':out}
emit('house-bedside.json',json.dumps(result,indent=2)+'\n')
print(json.dumps({k:{z:v for z,v in r.items()if z!='sections'}for k,r in out.items()},indent=2))
