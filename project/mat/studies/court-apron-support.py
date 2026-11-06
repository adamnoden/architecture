#!/usr/bin/env python3
"""Finite travelling-support geometry. A local strip screen is not capacity."""
from pathlib import Path
import argparse, hashlib, html, json, subprocess
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]

def read(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert subprocess.check_output(['git','hash-object','--stdin'],input=raw,cwd=ROOT).decode().strip()==s['blob']
    return json.loads(raw)

def produce():
    c=json.loads((HERE/'court-apron-support.json').read_text())
    h=read(c['HAD'])['model'];p=h['southCourtThresholdReference']['pan'];g=read(c['STR'])['girders']['court-S']
    assert not any(c['admission'].values())
    assert p['dryFold']['profileYZ']==[[4030,0],[4060,0],[4060,15],[4090,15]]
    assert h['northNormalRoute']['floorJoin']['layers']==[15,65,100,200]
    b=c['bearing'];x,y,w,d=b['plan'];assert g['axis']=='x' and g['extent'][0]<=x<x+w<=g['extent'][1]
    assert g['datum']-g['width']/2<=y<y+d<=g['datum']+g['width']/2
    assert b['bottom']==g['z'][1] and b['top']==p['fallY'][0][1]-p['thickness']
    channels=[];P=c['localLoad']['force_N'];width=c['localLoad']['print_mm'][0];metal=c['metalComparison']
    for i,q in enumerate(c['channels']):
        assert p['outerX'][0]<q['x'][0]<q['x'][1]<p['outerX'][1]
        a,z=p['dryFold']['profileYZ'][2*i]
        next_y=p['dryFold']['profileYZ'][2*i+1][0]
        assert a<q['y'][0]<q['y'][1]<next_y and q['top']==z-p['thickness']
        assert q['bottom']==b['top'] and y<=q['y'][0]<q['y'][1]<=y+d
        height=q['top']-q['bottom'];t=q['thickness'];span=q['y'][1]-q['y'][0]-2*t
        assert span>0 and q['bottom']>=p['bodyEnvelope']['z'][0]
        area=t*((q['y'][1]-q['y'][0])+2*(height-t))
        I=width*t**3/12;M=P*span/4
        channels.append({**q,'nominalClearTopSpan_mm':span,'idealSharpCornerSection_mm2':area,
          'idealSharpCornerMass_kg':area*(q['x'][1]-q['x'][0])*metal['density_kg_m3']/1e9,
          'centralStripScreen':{'moment_Nmm':M,'elasticStress_MPa':6*M/(width*t*t),
            'elasticDeflection_mm':P*span**3/(48*metal['modulus_MPa']*I),
            'webAverageIfEqualReactions_MPa':P/(2*width*t),
            'scope':'Entire authored 2 kN on one 50 mm-wide simply supported top strip. Not a plate, overhang, bend, web buckling, weld, bearing or combined-design check.'}})
    original=p['permanentSeat']['plan'];extension=max(0,original[1]-y)
    # The actual mineral top under the dry fold is not authored. This comparison
    # sets it at the wet-floor start underside. It is not an existing support.
    volume=w*d*(b['top']-b['bottom'])/1e9
    # A stationary support immediately under the +15 crest blocks the moving
    # 0..15 riser; the travelling channel bottom remains below that swept face.
    collision={'stationaryCrestSupportTop_mm':channels[1]['top'],
      'movingRiserInitialZ_mm':[0,15],'stationarySupportIntersectsRiserSweep':0<channels[1]['top']<15,
      'travellingSupportBottom_mm':b['top'],'fixedBearingBelowRiserSweep':b['top']<0}
    assert collision['stationarySupportIntersectsRiserSweep'] and collision['fixedBearingBelowRiserSweep']
    return {'status':c['status'],'sources':{'HAD':c['HAD'],'STR':c['STR']},'panProfileYZ':p['dryFold']['profileYZ'],
      'channels':channels,'metalComparison':metal,'authoredLoad':c['localLoad'],
      'channelMassBeforeBendsWeldsRetention_kg':sum(q['idealSharpCornerMass_kg'] for q in channels),
      'bodyEnvelopeUnchangedByNominalChannelBounds':True,
      'bearing':{**b,'nominalVolume_m3':volume,'southwardExtensionBeyondOwningSeat_mm':extension,
        'extraPlanBeyondOwningSeat_m2':w*extension/1e6,'scope':'Actual new local bearing reservation, not an existing pan support or a new foundation pad. Exact spread/bedding/thermal/capillary properties and service exclusion are unqualified.'},
      'drawNegativeControl':collision,
      'directGlassBearingControl':{**c['directGlassBearingControl'],
        'equalReactionWebPressure_MPa':P/(2*width*c['channels'][0]['thickness']),
        'ratioToDeclaredMinimumOnly':P/(2*width*c['channels'][0]['thickness'])/c['directGlassBearingControl']['declaredCompressiveStrengthMinimum_MPa'],
        'scope':'Unspread web bearing is not qualified by the slab declaration. A published minimum is not an ultimate upper limit or allowable stress; no measured product failure is asserted.'},
      'renewalScope':'Nominal channel bounds lie inside the pan bounding body; existing conservative whole-body draw bounds remain applicable geometrically. Actual mineral bearing profile, capture, friction, sticking, weld distortion, ends and handling force remain to prove.',
      'air':c['air'],'admission':c['admission']}

def figure(r):
    X=lambda y:100+(y-3980)*4
    Z=lambda z:180-z*2
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820"><rect width="1200" height="820" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,s,n=17):out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(s)}</text>')
    def rect(a,b,z0,z1,fill):out.append(f'<rect x="{X(a)}" y="{Z(z1)}" width="{X(b)-X(a)}" height="{Z(z0)-Z(z1)}" fill="{fill}" stroke="#596b71"/>')
    text(30,38,'One pan support that travels with the renewable body',27)
    text(30,69,'UNSELECTED. Existing stepped profile retained; walking support is separate from the ordinary air retainer.',17)
    rect(3980,4230,-220,-180,'#c7c5bc')
    b=r['bearing'];rect(b['plan'][1],b['plan'][1]+b['plan'][3],b['bottom'],b['top'],'#d7c9a9')
    for q in r['channels']:
        a,b=q['y'];t=q['thickness'];lo,hi=q['bottom'],q['top']
        rect(a,b,hi-t,hi,'#8ca4ad');rect(a,a+t,lo,hi-t,'#8ca4ad');rect(b-t,b,lo,hi-t,'#8ca4ad')
    pts=r['panProfileYZ']+[[4090,-45],[4210,-48.3333]]
    out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(y)} {Z(z)}' for i,(y,z) in enumerate(pts))+'" fill="none" stroke="#a44734" stroke-width="4"/>')
    text(95,120,'Moving pan: apron 0 / crest +15; thickness 1.5 mm.',18)
    text(95,145,'Two 3 mm formed channels, nominal 26 mm wide; same moving body.',18)
    text(95,660,'Fixed mineral bearing: proposed top −46.5 on actual common RC −180; added 30 mm south of owning seat.',17)
    text(95,690,f'Channels ≈{r["channelMassBeforeBendsWeldsRetention_kg"]:.2f} kg before bends/welds/retention; no physical/material pass.',17)
    text(95,720,'Original horizontal draw: stationary +13.5 support blocks the moving 0..15 riser.',17)
    text(95,746,'Travelling supports avoid that collision; actual bearing/capture and end release still need proof.',17)
    text(95,778,'End closure, actual support/contact, web/weld, air, water/capillary, thermal and first-release duties stay open.',16)
    for z,label in [(15,'+15'),(0,'0'),(-46.5,'−46.5'),(-180,'−180 RC')]:text(1100,Z(z)+5,label,14)
    out.append('</g></svg>');return ''.join(out)+'\n'

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--check',action='store_true');args=a.parse_args()
    r=produce();outputs={HERE/'court-apron-support.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n',HERE/'court-apron-support.svg':figure(r)}
    for p,s in outputs.items():
        if args.check:assert p.exists() and p.read_text()==s,f'Stale output: {p.name}'
        else:p.write_text(s)
    print('Court apron travelling support: candidate geometry and central-strip sensitivity; not capacity or air/water/material admission.')
