#!/usr/bin/env python3
"""Finite travelling-support geometry. A local strip screen is not capacity."""
from pathlib import Path
import argparse, ast, html, json, math, subprocess
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]

def raw_source(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert subprocess.check_output(['git','hash-object','--stdin'],input=raw,cwd=ROOT).decode().strip()==s['blob']
    return raw

def read(s):return json.loads(raw_source(s))

def wall_bands(source,h):
    src=raw_source(source).decode()
    assignments={}
    for q in ast.parse(src).body:
        if isinstance(q,ast.Assign) and isinstance(q.targets[0],ast.Tuple):
            names=[n.id for n in q.targets[0].elts if isinstance(n,ast.Name)]
            if names==['C','E']:assignments.update(zip(names,ast.literal_eval(q.value)))
    axis=assignments['C']
    # These literal producer operations, not a guessed wall recipe, own the bands.
    assert 'wallrect(i,lo,hi,d,140)' in src and 'weatherd=d+inward*281.25' in src
    assert "wallrect(i,lo,hi,weatherd,102.5)" in src and "'court-south':1" in src
    core=[axis-70,axis+70];weather=[axis+281.25-51.25,axis+281.25+51.25]
    assert weather[1]==h['court'][1]
    return core,weather

def end_comparison(c,h):
    e=c['ends'];t=h['southCourtThresholdReference'];p=t['pan']
    core,weather=wall_bands(c['STRwallProducer'],h)
    assert (core,weather)==wall_bands(c['currentSTRwallReconciliation'],h), 'Current STR wall bands changed'
    py=e['pocketY'];pz=e['pocketZ'];challenge=e['relativeMovementBound_mm']+2*e['edgeToleranceEach_mm']
    assert core[1]<py[0]<py[1]<weather[0], 'Pocket must not silently cut either structural/weather leaf'
    assert py[1]<t['jambs']['cavityTray']['leftApron']['y'][0]
    rows=[]
    for i,(rough,edge) in enumerate(zip(t['retained']['roughX'],p['outerX'])):
        outward=-1 if i==0 else 1;inward=-outward
        outer=rough+outward*e['outwardRevealReservation_mm'];liner=outer+inward*e['fixedLinerThickness_mm']
        flange=edge+inward*e['panCornerFlangeInward_mm']
        clear=t['primarySill']['bodyPlan'][0]+(t['primarySill']['bodyPlan'][2] if i else 0)
        assert clear==t['frame']['outerX'][i]+inward*t['frame']['jambEach']
        gap=(edge-liner)*inward-challenge
        clear_gap=(clear-flange)*inward-challenge
        assert gap>0 and clear_gap>0
        assert p['outerX'][0]<=min(edge,flange)<max(edge,flange)<=p['outerX'][1]
        assert p['bodyEnvelope']['z'][0]<=e['panCornerFlangeZ'][0]<e['panCornerFlangeZ'][1]<=p['bodyEnvelope']['z'][1]
        rows.append({'end':'west' if i==0 else 'east','panEndX_mm':edge,'roughRevealX_mm':rough,
          'proposedPocketOuterX_mm':outer,'proposedLinerInnerX_mm':liner,'proposedFlangeX_mm':[min(edge,flange),max(edge,flange)],
          'capX_mm':[min(outer,flange),max(outer,flange)],'minimumPanToLinerClearance_mm':gap,
          'minimumFlangeToClearDoor_mm':clear_gap,'bareRoughWallNegativeControl_mm':abs(edge-rough)-challenge,
          'pocketVolume_m3':e['outwardRevealReservation_mm']*(py[1]-py[0])*(pz[1]-pz[0])/1e9,
          'structuralCoreRemoved_mm2':0,'weatherLeafRemoved_mm2':0,
          'rejectedFullWeatherLeafExtensionArea_mm2':e['outwardRevealReservation_mm']*(weather[1]-weather[0])})
    m=c['ordinaryLeafMechanism'];E=m['modulus_ksi']*6.894757293168361
    tmin=(m['thicknessInch']-m['thicknessToleranceInch'])*25.4
    tmax=(m['thicknessInch']+m['thicknessToleranceInch'])*25.4
    normal_gap=p['dryFold']['y'][0]-e['capFaceY']
    hard_gap=normal_gap-challenge
    assert hard_gap>tmax, 'Cap/pan hard gap must exceed worst leaf thickness through the SAME challenge'
    assert abs(m['freeRiseFromCapFace_mm']-normal_gap-m['preloadDeflection_mm'])<1e-9
    rejected_old_hard_gap=p['dryFold']['y'][0]-4026-challenge
    assert rejected_old_hard_gap-tmax<0
    L=m['freeLength_mm'];delta=[m['preloadDeflection_mm']-challenge,m['preloadDeflection_mm']+challenge]
    assert delta[0]>0
    leaf=[]
    for thickness in [tmin,tmax]:
        for d in delta:
            leaf.append({'thickness_mm':thickness,'normalDeflection_mm':d,
              'linearCantileverStress_MPa':1.5*E*thickness*d/L**2,
              'linearCantileverForce_N':E*m['leafWidth_mm']*thickness**3*d/(4*L**3)})
    # A simple projection envelope, not the deformed elastic curve or a contact proof.
    tip=[m['rootX_left']+math.sqrt(L*L-m['freeRiseFromCapFace_mm']**2),m['rootX_left']+L]
    common=[rows[0]['proposedFlangeX_mm'][0]+challenge,rows[0]['proposedFlangeX_mm'][1]-challenge]
    assert common[0]<tip[0]<tip[1]<common[1]
    centre=sum(p['outerX'])/2
    assert centre==t['primarySill']['meeting']['centreX']
    east_tip=[2*centre-tip[1],2*centre-tip[0]]
    east_common=[rows[1]['proposedFlangeX_mm'][0]+challenge,rows[1]['proposedFlangeX_mm'][1]-challenge]
    assert east_common[0]<east_tip[0]<east_tip[1]<east_common[1]
    release={'capSheetSweptY_mm':[e['capFaceY']-e['capThickness_mm']-e['firstReleaseSouth_mm'],e['capFaceY']],
      'nominalCapToPanNormalGap_mm':normal_gap,'minimumHardCapToPanGap_mm':hard_gap,
      'worstLeafThickness_mm':tmax,'minimumHardSpaceBeyondLeafThickness_mm':hard_gap-tmax,
      'rejected4026FaceHardGap_mm':rejected_old_hard_gap,
      'rejected4026SpaceBeyondWorstLeaf_mm':rejected_old_hard_gap-tmax,
      'maximumFreeLeafYAfterSouthRelease_mm':e['capFaceY']+m['freeRiseFromCapFace_mm']-e['firstReleaseSouth_mm'],
      'minimumLeafToPanClearanceBeforeLift_mm':p['dryFold']['y'][0]-(e['capFaceY']+m['freeRiseFromCapFace_mm']-e['firstReleaseSouth_mm'])-challenge,
      'minimumCapBottomAbovePanEndAfterLift_mm':e['capZ'][0]+e['thenLift_mm']-p['ends']['crestZ']-challenge,
      'maximumRaisedCapZWithChallenge_mm':e['capZ'][1]+e['thenLift_mm']+challenge}
    assert py[0]+challenge<release['capSheetSweptY_mm'][0]
    assert release['minimumLeafToPanClearanceBeforeLift_mm']>0 and release['minimumCapBottomAbovePanEndAfterLift_mm']>0
    assert release['maximumRaisedCapZWithChallenge_mm']<pz[1]
    coverage=[q*25.4 for q in m['stock73CoverageInch']]
    assert coverage[1]-coverage[0]<2*challenge, 'Stock coverage must not be mistaken for this wider authored movement domain'
    return {'source':c['STRwallProducer'],'currentSource':c['currentSTRwallReconciliation'],'currentLiteralWallBandsEqual':True,
      'wallBandsY_mm':{'core':core,'cavity':[core[1],weather[0]],'weatherLeaf':weather},
      'control':e,'sharedAuthoredChallenge_mm':challenge,'ends':rows,
      'separationFromCoreY_mm':py[0]-core[1],'separationFromWeatherLeafY_mm':weather[0]-py[1],
      'separationFromExistingCavityTrayY_mm':t['jambs']['cavityTray']['leftApron']['y'][0]-py[1],
      'firstRelease':release,'leafMechanism':{'control':m,'normalDeflectionRange_mm':delta,'linearSensitivity':leaf,
        'simpleTipProjectionX_mm':{'west':tip,'east':east_tip},
        'commonPanFlangeContactTerritoryX_mm':{'west':common,'east':east_common},
        'stock73CoverageRange_mm':coverage,'stock73RangeInsufficientForFullChallenge':True,
        'scope':'Linear clamped-strip sensitivity only. Large displacement/preforming/contact, actual thin-strip temper, force/leakage, retention, corners, corrosion and retained residues remain unqualified; no rating or strict force/stress bound.'},
      'scope':'Cavity-only pocket is a real thermal/water/reveal alteration, not empty free space. No arch/leaf section loss occurs in this restricted geometric proposal. A pocket extended into either leaf must be redesigned and structurally priced.'}

def produce():
    c=json.loads((HERE/'court-apron-support.json').read_text())
    for field in ['currentHADReconciliation','currentSTRReconciliation','currentSTRwallReconciliation']:
        source=c[field]
        assert subprocess.check_output(['git','rev-parse',c['reconciledMain']+':'+source['path']],cwd=ROOT).decode().strip()==source['blob'], 'Integration main source identity changed: '+field
    h=read(c['HAD'])['model'];p=h['southCourtThresholdReference']['pan'];g=read(c['STR'])['girders']['court-S']
    current=read(c['currentHADReconciliation'])['model']
    for key in ['southCourtThresholdReference','court']:
        assert h[key]==current[key],f'Current HAD projection changed: {key}'
    assert h['northNormalRoute']['floorJoin']==current['northNormalRoute']['floorJoin'], 'Current HAD floor changed'
    current_g=read(c['currentSTRReconciliation'])['girders']['court-S']
    for key in ['axis','datum','extent','width','z']:
        assert g[key]==current_g[key],f'Current STR court-S geometry changed: {key}'
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
    return {'status':c['status'],'sources':{'HAD':c['HAD'],'STR':c['STR'],'currentHAD':c['currentHADReconciliation'],'currentSTR':c['currentSTRReconciliation']},
      'currentNamedInputProjectionsEqual':True,'reconciledMain':c['reconciledMain'],'panProfileYZ':p['dryFold']['profileYZ'],
      'channels':channels,'metalComparison':metal,'authoredLoad':c['localLoad'],
      'channelMassBeforeBendsWeldsRetention_kg':sum(q['idealSharpCornerMass_kg'] for q in channels),
      'channelStockControl':{**c['channelStockControl'],
        'idealSharpCornerBlankArea_m2':sum(q['idealSharpCornerSection_mm2']/q['thickness']*(q['x'][1]-q['x'][0])/1e6 for q in channels),
        'scope':'The nominal developed strip area excludes bend allowance and actual forming/nesting. Charge a full sheet only for this explicit no-offcut-credit procurement control, not an installed-cost lower bound.'},
      'bodyEnvelopeUnchangedByNominalChannelBounds':True,
      'bearing':{**b,'nominalVolume_m3':volume,'southwardExtensionBeyondOwningSeat_mm':extension,
        'extraPlanBeyondOwningSeat_m2':w*extension/1e6,'scope':'Actual new local bearing reservation, not an existing pan support or a new foundation pad. Exact spread/bedding/thermal/capillary properties and service exclusion are unqualified.'},
      'drawNegativeControl':collision,'proposedEndSections':end_comparison(c,h),
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

def end_figure(r):
    e=r['proposedEndSections'];c=e['control'];left=e['ends'][0];release=e['firstRelease']
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1120" viewBox="0 0 1200 1120"><rect width="1200" height="1120" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,s,n=17):out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(s)}</text>')
    def box(x,y,w,h,fill,stroke='#687b82',dash=''):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
    text(30,38,'Two proposed dry-side end releases — actual source territories',25)
    text(30,68,'WORKING GEOMETRY. New cavity/reveal reservation and pan-corner flanges; no owning HAD change or seal admission.',16)
    X=lambda x:80+(x-5070)*3.2
    Y=lambda y:470-(y-3980)*2
    def plan(a,b,u,v,color,stroke='#687b82',dash=''):box(X(a),Y(v),X(b)-X(a),Y(u)-Y(v),color,stroke,dash)
    text(80,104,'A  WEST END PLAN; north is up',19)
    out.append('<defs><clipPath id="plot"><rect x="75" y="115" width="445" height="390"/></clipPath></defs><g clip-path="url(#plot)">')
    plan(5070,5100,3987.5,4147.5,'#e8e5db')
    plan(5070,5100,3970,3987.5,'#b8b0a0')
    plan(5070,5100,4147.5,4180,'#b8b0a0')
    plan(5094,5100,4000,4060,'#e6f0f1','#267b83')
    plan(5094,5095.5,4000,4060,'#59918b')
    plan(5110,5150,4110,4250,'#cbb793')
    plan(5102,5103.5,4030,4250,'#b66550')
    plan(5102,5142,4030,4031.5,'#b66550')
    cap_a,cap_b=left['capX_mm'];cap_y=c['capFaceY'];cap_t=c['capThickness_mm'];south=c['firstReleaseSouth_mm']
    plan(cap_a,cap_b,cap_y-cap_t,cap_y,'#829da7')
    plan(cap_a,cap_b,cap_y-cap_t-south,cap_y-south,'none','#829da7','5 4')
    out.append('</g>')
    text(350,140,'Weather leaf starts 4147.5',14)
    text(350,190,'Frame 5110..5150',14)
    text(350,345,'New flange Y4030',14)
    text(350,385,f'Cap {cap_y:g} → {cap_y-south:g}',14)
    text(350,460,'Core ends 3987.5',14)
    text(80,540,'Green pocket is wholly in the 160 mm cavity band.',16)
    text(80,565,'Red return is a NEW inward flange, not existing pan detail.',16)
    text(600,110,'B  BOTH ENDS, same authored challenge',19)
    for i,q in enumerate(e['ends']):
        y=150+i*125
        text(600,y,q['end'].upper()+' rough / pan: '+str(q['roughRevealX_mm'])+' / '+str(q['panEndX_mm'])+' mm',17)
        text(600,y+30,f'Liner clearance ≥{q["minimumPanToLinerClearance_mm"]:g} mm; flange to door ≥{q["minimumFlangeToClearDoor_mm"]:g} mm.',17)
        text(600,y+60,'Unreserved bare reveal: −2 mm. No fit or material admission.',16)
    text(600,425,'Pocket Y4000..4060 / Z0..225; no core or weather-leaf cut.',16)
    text(600,453,'Existing cavity tray begins Y4090; 30 mm nominal separation.',16)
    text(600,481,'Full-leaf extension would remove 615 mm² per jamb: rejected.',16)
    text(600,511,f'Hard normal gap ≥{release["minimumHardCapToPanGap_mm"]:g} mm; old 4026 face rejected.',16)
    text(600,538,f'Beyond worst leaf: {release["minimumHardSpaceBeyondLeafThickness_mm"]:.3f} mm. Curve fit unproved.',16)
    text(80,625,'C  RELEASE SECTION / Y–Z',19)
    U=lambda y:550+(y-3980)*5
    V=lambda z:1000-z*2
    # End-face plane is shown edge-on. The free spring projection, force and
    # fixed floor/wall joins are not a fabricated or certified assembly.
    box(U(4030),V(75),7.5,150,'#b66550')
    cap_z0,cap_z1=c['capZ'];height=(cap_z1-cap_z0)*2
    box(U(cap_y-cap_t),V(cap_z1),cap_t*5,height,'#829da7')
    box(U(cap_y-cap_t-south),V(cap_z1),cap_t*5,height,'none','#829da7','5 4')
    box(U(cap_y-cap_t-south),V(cap_z1+c['thenLift_mm']),cap_t*5,height,'none','#829da7','5 4')
    out.append(f'<path d="M{U(cap_y-cap_t)-2} 905H{U(cap_y-south)}m8 -5l-8 5 8 5 M{U(cap_y-south)} 790V610m-5 8l5-8 5 8" fill="none" stroke="#267b83" stroke-width="2"/>')
    text(80,680,'1. Remove complete frame/sill as source sequence requires.',16)
    text(80,711,'2. Release actual cornercap/retainer fixings and captures.',16)
    text(80,742,'3. Move cap south 15; then lift 100 inside its reserved pocket.',16)
    text(80,773,f'Free leaf to pan ≥{release["minimumLeafToPanClearanceBeforeLift_mm"]:g} mm before lift.',16)
    text(80,804,f'Cap bottom clears the 75 mm end by ≥{release["minimumCapBottomAbovePanEndAfterLift_mm"]:g} mm.',16)
    text(80,835,'4. Only then draw supported whole pan north 500.',16)
    text(80,885,'Nominal contact/sliding is not a measured first-release pass.',16)
    text(80,916,'Actual capture, floor friction, bends and corner joints remain.',16)
    for z in [0,75,100,200]:text(1050,V(z)+5,f'Z{z}',15)
    text(80,1052,'Leaf mechanism is a linear sensitivity only; actual spring/air/corner/material and independent water/capillary/thermal duties stay open.',16)
    out.append('</g></svg>');return ''.join(out)+'\n'

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--check',action='store_true');args=a.parse_args()
    r=produce();outputs={HERE/'court-apron-support.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n',HERE/'court-apron-support.svg':figure(r),HERE/'court-apron-ends.svg':end_figure(r)}
    for p,s in outputs.items():
        if args.check:assert p.exists() and p.read_text()==s,f'Stale output: {p.name}'
        else:p.write_text(s)
    print('Court apron travelling support: candidate geometry and central-strip sensitivity; not capacity or air/water/material admission.')
