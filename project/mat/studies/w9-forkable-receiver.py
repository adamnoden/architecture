#!/usr/bin/env python3
"""A forkable raised receiver, with an explicit incomplete whole handover."""
from pathlib import Path
import argparse, hashlib, html, json, math, subprocess

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')

def immutable(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==s['blob']
    return json.loads(raw)

def rhs(section):
    h,b,t=section
    return h*b-(h-2*t)*(b-2*t),(b*h**3-(b-2*t)*(h-2*t)**3)/12

def produce():
    raw=BASE.with_name(BASE.name+'-sources').with_suffix('.json').read_bytes();c=json.loads(raw)
    m=immutable(c['sources']['HAD'])['model'];arch=immutable(c['sources']['balancedArchitecture'])
    folded=immutable(c['sources']['foldedRenewal']);a=c['authoredReceiver'];n=c['nativeNumbers']
    w,d=a['outside_mm'];plate=a['topPlateThickness_mm'];lane=a['nominalForkLaneUnderside_mm']
    rail_h,rail_w,_=a['bottomRailRHS_mm'];beam_h,beam_b,_=a['crossbeamRHS_mm']
    assert lane==rail_h+a['postLength_mm']
    height=lane+beam_h+plate
    volume={'plate':w*d*plate,
      'topCrossbeams':rhs(a['crossbeamRHS_mm'])[0]*a['crossbeamCount']*a['crossbeamLength_mm'],
      'bottomRails':rhs(a['bottomRailRHS_mm'])[0]*a['bottomRailCount']*a['bottomRailLength_mm'],
      'posts':rhs(a['postSHS_mm'])[0]*a['postCount']*a['postLength_mm']}
    mass={k:v/1e9*a['density_kg_per_m3'] for k,v in volume.items()};fixture=sum(mass.values())
    listed=n['W9ListedUnit_kg'];payload=listed+fixture;capacity=n['GL4Capacity_kg']
    assert payload<capacity and height==226
    # Geometry alone is not actual CG. A combined measured loadcentre must satisfy
    # the native chart, including any base mass omitted by the listed unit scope.
    nominal_centre=d/2
    assert nominal_centre<n['GL4MaxLoadCentre_mm']
    inner=w-2*rail_w;fw=n['GL4Fork_mm'][1];toolw=n['GL4FullWidth_mm']
    assert inner>toolw>fw
    release=a['nominalForkReleaseDrop_mm'];deck=n['cartDeck_mm'][2]
    fork_deposit=deck+lane;fork_released=fork_deposit-release
    assert fork_released>deck and lane>release
    assert 0-release<0 # flat plate cannot release forks above a solid deck
    assert n['GL4MinimumLift_mm']>max(n['nativeBaseFootRange_mm'])
    assert fw<600<toolw # fitting only forks does not fit complete tool
    h=arch['W9VestibuleHost'];assert h['unitAndBasePlan']==[9677,2672,1006,597]
    assert m['plantReferenceDoor']['effectiveOpenClearWidth']==742.5
    conservative_native=h['conservativeTotalHeight']
    # Retain the deliberately conservative existing height sum. Do not silently
    # replace it with assembled1417 whose foot/seating datum is not fully bound.
    installed=conservative_native+height;cart_height=installed+deck
    rho_g=n['g_m_per_s2'];P=a['staticPointChallenge_N'];E=a['elasticModulus_N_per_mm2']
    area,I=rhs(a['crossbeamRHS_mm']);Z=I/(beam_h/2)
    post_centre=rail_w/2;support_span=w-2*post_centre
    parked_M=P*support_span/4
    # Authored support-line sensitivity is separate from native521 outside width;
    # actual fork blade width/contact and mounting origins remain unbound.
    overhang=(w-400)/2;lift_M=P*overhang
    structural={'challenge_N':P,'role':a['challengeRole'],'idealCrossbeamArea_mm2':area,
      'idealCrossbeamI_mm4':I,'idealCrossbeamZ_mm3':Z,
      'parkedWorstPoint':{'supportSpan_mm':support_span,'moment_Nmm':parked_M,
        'elasticBendingStress_N_per_mm2':parked_M/Z,'elasticDeflection_mm':P*support_span**3/(48*E*I)},
      'restrainedEndPointNegativeControl':{'authoredSupportLineSpan_mm':400,'endOverhang_mm':overhang,
        'moment_Nmm':lift_M,'elasticBendingStress_N_per_mm2':lift_M/Z,
        'elasticDeflection_mm':P*overhang**2*(overhang+400)/(3*E*I),
        'nearReaction_N':P*(1+overhang/400),'farReaction_N':-P*overhang/400,
        'role':'This isolated end point requires a negative far reaction: free forks cannot supply that hold-down. Elastic component arithmetic is not a stable load case for an unrestrained receiver; actual distributed loads/CG/capture must be proved.'},
      'centredSupportEndMomentSensitivity':[{'authoredSupportLineSpan_mm':v,'endOverhang_mm':(w-v)/2,'elasticBendingStress_N_per_mm2':P*(w-v)/2/Z} for v in [0,300,400,521]],
      'forkSupportRole':'Restrained component models only; unilateral fork bearing cannot provide the isolated end-case negative reaction.400mm bearing-line span and0..521mm sensitivity are authored centred-support models. Native521 is outside fork width, not measured bearing-line spacing. Actual section/contact/local stability must bind.',
      'onePostAxialStress_N_per_mm2':P/rhs(a['postSHS_mm'])[0],
      'grossTwoRailArea_m2':2*rail_w*d/1e6,
      'grossDeadLoadPressure_kPa':payload*rho_g/(2*rail_w*d/1e6)/1000,
      'grossChallengePressure_kPa':P/(2*rail_w*d/1e6)/1000,
      'notProved':['actual RHS corner radii/grade/section properties and tolerances',
        'plate/native-foot load spreading, local bearing, torsion, welds, capture and sliding/overturning',
        'actual uneven tile/screed/insulation/RC contact and movement; gross rail area is not proven effective bearing area',
        'handling impact, fatigue, appliance approval or an installed support rating']}
    old_loaded=listed+n['cart_kg'];new_loaded=payload+n['cart_kg']
    sine=1/math.sqrt(20**2+1)
    assert structural['restrainedEndPointNegativeControl']['farReaction_N']<0
    assert new_loaded>old_loaded and new_loaded<n['cartCapacity_kg']+n['cart_kg']
    bounds=folded['carrier']
    # Do not infer an actual wheel polygon or slope result from this same-envelope
    # comparison: the fixture adds substantial mass and changes the loaded CG.
    sequence=[
      {'state':'Installed','duty':'Native base/adjustable feet on full top plate; actual base capture, independent frame/floor stability, condensate cover withdrawal and port connections must work. Receiver is real additional installed assembly.'},
      {'state':'Prepare and engage','duty':'Isolate power, release actual ducts and condensate with supported parts; optional core removal has unknown mass credit. Bind combined mass/CG, frame capture and configured GL geometry, then engage the140mm fork lane. No native thin-base lifting assumption.'},
      {'state':'Lift and dock','duty':'Lift only enough for the270mm deck plus a trial20mm approach clearance. Positively secure actual cart/dock; complete wheel/leg/cylinder/leaf/operator entry is still unproved. Native raised travel is limited to minor loading/unloading positioning.'},
      {'state':'Set down and withdraw','duty':'Lower receiver bottom to270mm deck. Fork top at410mm supports the beam; lower20mm to390mm and withdraw through the retained lane. Actual tine thickness, vertical geometry, clearances and support handover must be measured; no unsupported slide.'},
      {'state':'Cart route and reverse','duty':'Actual cart restraint/wheel polygon, protected head/closer, all folded flights/turns and positive capture remain required. Incoming installation repeats the supported sequence in reverse; no unattended raised load.'}]
    return {'status':c['status'],'sources':c['sources'],'nativeEvidence':c['nativeEvidence'],
      'sourceExtractSHA256':hashlib.sha256(raw).hexdigest(),
      'decision':'Develop one forkable raised metal receiver which stays with native base during cart handover. Delete a separate stool and avoid trying to pull forks out of a flat plate sitting directly on a solid cart deck. This is a constructive reference design with explicit missing admission evidence, not a handling pass.',
      'receiver':{'authored':a,'height_mm':height,'coarseIdealMemberMass_kg':mass,
        'coarseTotal_kg':fixture,'unpricedResidues':'Weld metal, actual radiused sections, capture/dock parts, fixings and any surface treatment are additional. Native feet/seals/electronics/filter residues remain unapproved; no blanket metal or material exception.',
        'nativeBase_mm':n['nativeBase_mm'],'nativeCabinetPlan_mm':[1000,597],
        'actualBearingHold':'Full plate preserves native-foot support concept; exact foot contacts, base/cabinet attachment and capture/release must bind. It does not qualify lifting directly under the native base skin.'},
      'lift':{'nativeGL4StandardMass_kg':n['GL4Standard_kg'],'nativeCapacity_kg':capacity,
        'listedUnitPlusIdealFixture_kg':payload,'remainingForUnscopedBaseAndAllCaptureHardware_kg':capacity-payload,
        'capacityRole':'Listed156kg unit scope must be reconciled with actual supplied native base and captured fixture.227kg rating is not a whole floor, cart or handling rating.',
        'nativeMaximumCombinedLoadCentre_mm':n['GL4MaxLoadCentre_mm'],
        'geometricDepthMidpointOnly_mm':nominal_centre,'midpointToLimit_mm':n['GL4MaxLoadCentre_mm']-nominal_centre,
        'CGHold':'Actual combined CG measured/bound from load face nearest carriage, load centred laterally, native chart and lifting configuration verified. Geometric midpoint is not actual CG; no core-removal mass credit.',
        'directNativeFloorBaseEntryShortfallAtMaximumFoot_mm':n['GL4MinimumLift_mm']-max(n['nativeBaseFootRange_mm']),
        'nativeForkMinLift_mm':n['GL4MinimumLift_mm'],'nominalEngageTop_mm':lane,'nominalHeightAboveMinimum_mm':lane-n['GL4MinimumLift_mm'],
        'innerRailLaneWidth_mm':inner,'forkOutsideWidth_mm':fw,'nominalEachForkSideGap_mm':(inner-fw)/2,
        'completeGLWidth_mm':toolw,'nominalEachFullToolSideGap_mm':(inner-toolw)/2,
        'wholeToolHold':'629x883 operating outline alone does not locate forks, legs, wheels, winch/handle or operator. Actual complete vertical and plan geometry and safe minor positioning remain to prove.'},
      'handover':{'cartDeck_mm':n['cartDeck_mm'],'palletLengthOverhangEach_mm':(w-n['cartDeck_mm'][0])/2,
        'palletTransverseDeckReserveEach_mm':(n['cartDeck_mm'][1]-d)/2,
        'forkTopAtDeposit_mm':fork_deposit,'forkTopAfterRelease_mm':fork_released,
        'maximumTineThicknessBeforeTolerance_mm':lane-release,
        'flatPlateNegativeControl':'With zero underside lane, fork release below the support face intersects the solid cart deck. A flat lifting plate alone does not solve setdown/withdrawal.',
        'nativeCartPayloadCapacity_kg':n['cartCapacity_kg'],
        'planComparison':'1006x597 receiver fits within the retained1250x609 conservative complete-carrier rectangle only before any added projecting capture hardware.3mm end overhang and1.5mm deck side reserve are nominal dimensions, not a support/tolerance pass.',
        'actualCartWheelAndCaptureHold':'Native200x40 wheels have no dimensioned contact centres here. Complete four-swivel entry, caster sweep, wheel/GL-leg contact, positive restraint/dock and independent support handover remain open.'},
      'height':{'existingConservativeNative_mm':conservative_native,'installedPortTopBound_mm':installed,
        'to3100Ceiling_mm':3100-installed,'cartPortTopBound_mm':cart_height,
        'trialLifted20ClearanceTopBound_mm':cart_height+20,
        'hold':'Actual protected door/closer/head clearance, ports/diverging fittings/insulation/attenuator withdrawal and condensate disconnection/annual access must bind. No complete door-head or duct geometry pass.'},
      'structuralComparison':structural,
      'externalConsequences':{'oldListedUnitPlusCart_kg':old_loaded,'newListedUnitFixtureCart_kg':new_loaded,
        'oneIn20GravityOnlyForceBefore_N':old_loaded*rho_g*sine,'oneIn20GravityOnlyForceAfter_N':new_loaded*rho_g*sine,
        'coarseMassIncrease_fraction':new_loaded/old_loaded-1,
        'uniformSlopeCGShiftExamples_mm':{str(h):h/20 for h in [800,1000,1200]},
        'role':'Gravity-force and authored CG-height challenges only, no rolling resistance/braking/tipping pass. Actual wheel support polygon and complete CG/dynamics unknown. Native TU8 WLL anchor/redirect duties and independent capture remain unchanged; no downrated anchor credit.'},
      'condensate':{'nativeUnitConnection':'Rear under heat exchanger,3/8inch male;minimum12mmID discharge,no horizontal run,second trap or direct drain; supplied looped hose and UVLL option retained',
        'annualDuty':'Actual underside cover opening plus setter/float withdrawal and movement check, and complete supported pipe first release. Raising alone is not a clear access path or qualified metal/seal assembly.'},
      'sequence':sequence,'systemDuties':c['systemDuties'],
      'admission':{'nativeBearingAndCGVerified':False,'frameAndFloorAdmitted':False,'completeToolCartOperatorGeometryProved':False,
        'portsCondensateAndHeadProved':False,'cartOrExteriorHandlingAdmitted':False,'materialException':False,'HADorServicesChanged':False,'packetComplete':False}}

def figure(r):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1120" viewBox="0 0 1200 1120">','<rect width="1200" height="1120" fill="#f4f1e9"/>']
    def text(x,y,s,size=18,color='#21363b'):
      out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-family="Arial,sans-serif">{html.escape(s)}</text>')
    def rect(x,y,w,h,fill='#b4cec4',stroke='#21363b'):
      out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"/>')
    text(35,43,'A raised receiver that can actually release the forks',29)
    text(35,74,'Authored reference design — native CG/support and complete transfer remain OPEN',19)
    text(35,117,'Front section: a retained fork lane, not a flat lifting plate',22)
    scale=.57;ox=40;ground=337
    rect(ox,ground-226*scale,1006*scale,6*scale,'#7e969c')
    rect(ox,ground-220*scale,1006*scale,80*scale)
    for x in [0,906]:
      rect(ox+x*scale,ground-30*scale,100*scale,30*scale,'#7e969c')
      rect(ox+(x+30)*scale,ground-140*scale,40*scale,110*scale)
    text(ox,376,'1006 outside / 806 inner rail lane / 629 complete GL width',17)
    text(ox,402,'140 mm to beam underside; top plate height 226 mm',17)
    text(660,155,'Receiver stays under native base.',19)
    text(660,186,'6 plate + 80×40×3 crossbeams',18)
    text(660,215,'110 posts + 30-high outboard rails',18)
    text(660,245,'Frame bracing/weld rigidity remain unproved.',18)
    text(660,275,'Actual legs/wheels/handle/operator still bind.',18)
    text(660,305,'Native base 1006×593 ≠ cabinet 1000×597.',17)
    text(35,458,'Deposit on cart: preserve the space needed to withdraw',23)
    # Interface elevation only: no false whole-machine or wheel approach proof.
    x=45;y=801;s=.6
    rect(x,y-270*s,510,18,'#8c795f')
    rect(x,y-(270+226)*s,510,6*s,'#7e969c')
    rect(x,y-(270+220)*s,510,80*s)
    for xx in [0,450]:
      rect(x+xx,y-(270+30)*s,60,30*s,'#7e969c')
      rect(x+xx+18,y-(270+140)*s,24,110*s)
    rect(x+180,y-410*s,150,20*s,'#d4a766')
    text(620,496,'Cart deck 270 → fork support 410 mm',19)
    text(620,530,'Release fork top to390; then withdraw.',19)
    text(620,564,'Tine thickness + tolerance must fit120 mm.',18)
    text(620,598,'Flat plate on solid deck fails this handover.',18,'#8c402e')
    text(620,632,'Wheel/leg entry, dock and capture NOT proved.',18,'#8c402e')
    text(35,718,'Interface only — complete native machine and cart approach remain separate obligations.',18)
    a=r['receiver'];l=r['lift'];h=r['height'];e=r['externalConsequences']
    text(35,763,'The receiver has a real whole-system price',24)
    rows=[f"Coarse ideal316L frame {a['coarseTotal_kg']:.2f} kg; unit+frame {l['listedUnitPlusIdealFixture_kg']:.2f} kg vs227 kg GL4.",
      f"Only {l['remainingForUnscopedBaseAndAllCaptureHardware_kg']:.2f} kg remains for unscoped native base and all capture hardware.",
      f"Conservative installed top {h['installedPortTopBound_mm']} mm / on cart {h['cartPortTopBound_mm']} mm; no door-head pass.",
      f"Cart+listed unit+frame {e['newListedUnitFixtureCart_kg']:.2f} kg; gravity-only1:20 force {e['oneIn20GravityOnlyForceAfter_N']:.1f} N.",
      '3kN ideal beam/rail calculation is not local bearing, weld, floor, impact or stability admission.',
      'Actual combined CG ≤350 from load face; nominal298.5 depth midpoint is NOT measured CG.',
      'Native condensate first release and annual cover/float withdrawal must remain accessible.',
      'Keep96/128 capture/control/heat, all residues, port renewal and folded-route capture duties.']
    for i,row in enumerate(rows):text(35,802+i*31,row,18)
    text(35,1084,'No apparatus, material exception, cart/handling pass, selected air target or MAT completion.',19,'#8c402e')
    out.append('</svg>');return '\n'.join(out)+'\n'

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    r=produce();products={BASE.with_suffix('.json'):json.dumps(r,indent=2)+'\n',BASE.with_suffix('.svg'):figure(r)}
    for p,s in products.items():
      if args.check:assert p.read_text()==s,f'Stale {p.name}'
      else:p.write_text(s)
    print('PASS: forkable receiver section/handover negatives, ideal mass/static arithmetic and unchanged whole-system admission holds')

if __name__=='__main__':main()
