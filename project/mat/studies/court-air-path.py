#!/usr/bin/env python3
"""Joined air-path working constraints; contact and material performance unearned."""
from pathlib import Path
import argparse,html,json,math,subprocess
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]

def read(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert subprocess.check_output(['git','hash-object','--stdin'],input=raw,cwd=ROOT).decode().strip()==s['blob'],s['path']
    return json.loads(raw)

def contact_challenge(c,m):
    """Partial flat contact; quadrature substitution removes the endpoint singularity."""
    e=m['proposedEndSections'];l=e['leafMechanism'];a=l['control']
    length=a['freeLength_mm'];rise=a['freeRiseFromCapFace_mm']
    thickness=e['firstRelease']['worstLeafThickness_mm']
    hard=e['firstRelease']['minimumHardCapToPanGap_mm'];gap=hard-thickness
    theta=math.acos(rise/length);end=math.sqrt(math.pi/2-theta)
    n=c['straightLeafContactChallenge']['quadraturePanels'];assert n>=32 and n%2==0
    def integral(first):
        def f(u):
            if u==0:return 0 if first else 2
            return 2*u*math.sqrt(math.sin(u*u)) if first else 2*u/math.sqrt(math.sin(u*u))
        step=end/n
        return step/3*(f(0)+f(end)+sum((4 if i%2 else 2)*f(i*step) for i in range(1,n)))
    i1=integral(True);i0=integral(False)
    free=gap*i0/i1;critical=length*i1/i0
    assert gap>0 and free<length,'Partial-contact formula requires a flat-contact tail'
    modulus=a['modulus_ksi']*6.894757293168
    curvature=i1/gap*math.sqrt(math.cos(theta))
    start=2*gap*math.sqrt(math.cos(theta))/i1;tip=start+length-free
    contact=[a['rootX_left']+start,a['rootX_left']+tip]
    common=l['commonPanFlangeContactTerritoryX_mm']['west']
    return {'control':c['straightLeafContactChallenge'],'length_mm':length,'freeRise_mm':rise,
      'thickness_mm':thickness,'hardGap_mm':hard,'centrelineGap_mm':gap,
      'criticalCentrelineGapForFlatTail_mm':critical,'freePortionLength_mm':free,
      'idealElasticRootStress_MPa':modulus*thickness/2*curvature,
      'idealReactionPerWidth_N_per_mm':modulus*thickness**3/24*(i1/gap)**2,
      'idealWestContactX_mm':contact,'commonWestFlangeX_mm':common,
      'minimumContactEdgeClearance_mm':min(contact[0]-common[0],common[1]-contact[1]),
      'oldMaximumLinearStress_MPa':max(x['linearCantileverStress_MPa'] for x in l['linearSensitivity']),
      'scope':'Different authored natural-shape/contact idealization: not actual preformed leaf or strict stress bound. Contact can fit at this corner; no flange failure claimed. High elastic stress may itself invalidate the linear material law; supplied thin-strip properties remain unbound.'}

def produce():
    c=json.loads((HERE/'court-air-path.json').read_text());s=c['sources']
    h=read(s['HAD'])['model'];m=read(s['mechanicalResearch']);b=read(s['mineralBaseResearch'])['bondedMineralBase']
    st=read(s['STRweatherPocket'])['groundCourtWeatherJambPocket'];t=h['southCourtThresholdReference'];p=t['pan']
    assert not any(c['admission'].values())
    assert h['northNormalRoute']['floorJoin']['layers']==[15,65,100,200]
    assert p['dryFold']['profileYZ']==m['panProfileYZ']==[[4030,0],[4060,0],[4060,15],[4090,15]]
    bands=m['proposedEndSections']['wallBandsY_mm'];axis=sum(bands['core'])/2
    header=c['headerContinuation'];assert header['width']==b['headerWidth']==215
    dpc_z=[b['fromZ'],b['fromZ']+sum(b['beds']+b['courses'])]
    assert dpc_z==h['northNormalRoute']['floorJoin']['innerDpc']==[-180,-30]
    faces=[axis-header['width']/2,axis+header['width']/2]
    room_face=h['court'][1]-h['envelope'];length=header['x'][1]-header['x'][0];rough=t['retained']['roughX']
    assert header['x'][0]<rough[0]<rough[1]<header['x'][1]
    intrusion=max(0,room_face-faces[0]);door_width=rough[1]-rough[0]
    course_setting=[{'unitLength_mm':u,'17Units16PerpendsLength_mm':17*u+16*10,'differenceFrom1900_mm':17*u+160-length} for u in [102,102.5]]
    header_result={'control':header,'axisY_mm':axis,'facesY_mm':faces,'DPCz_mm':dpc_z,
      'finishedRoomFaceY_mm':room_face,'projectionIntoRoomField_mm':intrusion,
      'localRoomStripArea_m2':length*intrusion/1e6,'completeDpcTerritory_m3':length*header['width']*(dpc_z[1]-dpc_z[0])/1e9,
      'doorOnlyTerritory_m3':door_width*header['width']*(dpc_z[1]-dpc_z[0])/1e9,
      'endJointOverlapTerritory_m3':(length-door_width)*header['width']*(dpc_z[1]-dpc_z[0])/1e9,
      'settingOutOnly':course_setting,'scope':'Room-strip intersection is geometry, not an actual Services route or empty threshold. End overlaps are not all new material. Setting-out toys are not a bonded or purchased unit schedule.'}
    q=c['fitChallenge'];challenge=q['relativeMovement_mm']+2*q['edgeToleranceEach_mm'];r=c['lowerReveal'];sp=st['lowerPocket']
    assert r['outwardEach_mm']==sp['openingSideRebateEach']==6 and r['z']==sp['z']==[-65,100]
    assert sp['normalY']==bands['weatherLeaf'] and sp['removedBaseMM2Each']==615
    assert st['partialGravityCase']['signedOverturningMarginKNmAtFloor']<0
    rows=[]
    for i,(wall,edge) in enumerate(zip(rough,p['outerX'])):
        outward=-1 if i==0 else 1;inward=-outward
        formed=wall+outward*r['outwardEach_mm'];liner=formed+inward*q['linerThickness_mm']
        pan_inner=edge+inward*p['thickness']
        rows.append({'end':'west' if i==0 else 'east','preformedRevealX_mm':formed,'lowerLinerInnerX_mm':liner,
          'bareOriginalRevealNegativeControl_mm':abs(edge-wall)-challenge,
          'minimumPanToLowerLiner_mm':(edge-liner)*inward-challenge,
          'minimumPanInnerToFrameOuter_mm':(t['frame']['outerX'][i]-pan_inner)*inward-challenge})
    assert all(v['minimumPanToLowerLiner_mm']>0 and v['minimumPanInnerToFrameOuter_mm']>0 for v in rows)
    reveal={'control':r,'sharedAuthoredChallenge_mm':challenge,'ends':rows,
      'minimumBottomClearance_mm':p['bodyEnvelope']['z'][0]-challenge-r['z'][0],
      'minimumTopClearance_mm':r['z'][1]-p['bodyEnvelope']['z'][1]-challenge,
      'owningSTRProposal':st,'scope':'Full lower weather-reveal geometry, not a capacity or as-built draw pass. Isolated jamb restraint already unresolved before the rebate; present arch rise is300, not historical600.'}
    assert reveal['minimumBottomClearance_mm']>0 and reveal['minimumTopClearance_mm']>0
    f=c['frontDownfold'];assert f['panThickness_mm']==p['thickness'] and f['y']==p['dryFold']['y'][0]
    outer_r=f['innerBendRadius_mm']+f['panThickness_mm'];cy=f['y']+outer_r;cz=-outer_r
    old=m['channels'][0];old_y=old['y'][0]
    inner_under=cz+math.sqrt(f['innerBendRadius_mm']**2-(old_y-cy)**2)
    clash=old['top']-inner_under
    assert clash>0,'New bend must not silently retain the old sharp-top carrier'
    new=c['revisedLowCarrier'];gap=new['y'][0]-cy-2*new['edgeToleranceEach_mm']
    assert gap>0 and new['topZ']==-p['thickness'] and new['bottomZ']==old['bottom']
    assert new['y'][1]<p['dryFold']['profileYZ'][1][0]
    downfold={'control':f,'outerRadius_mm':outer_r,'flatApronStartsY_mm':cy,'oldSharpTopUnderfaceAt4032Z_mm':inner_under,
      'oldSharpTopInterference_mm':clash,'revisedLowCarrier':new,'minimumToNewFlatStart_mm':gap,
      'newFeatureWithinOldBodyBounds':p['bodyEnvelope']['z'][0]<=f['bottomZ']<0,
      'fixedAirFaceY_mm':c['frontContactLead']['fixedFaceY'],
      'minimumRigidNormalClearance_mm':f['y']-c['frontContactLead']['fixedFaceY']-challenge,
      'scope':'Radius/low-carrier necessary clearance only. High-carrier bends, walking edge, whole contact contours and fixed-frame/door/sill release still need the joined design; no bounding-box shortcut.'}
    assert downfold['minimumRigidNormalClearance_mm']>0
    bend=c['stepBendTrial'];step=p['dryFold']['profileYZ'][1][0];crest=p['dryFold']['profileYZ'][2][1]
    assert [bend[k] for k in ['lowerExposedRadius_mm','upperExposedRadius_mm','backExposedRadius_mm']]==[3,4.5,4.5],'Drawing and trial support this declared radius family only'
    assert bend['upperExposedRadius_mm']-p['thickness']==bend['lowerExposedRadius_mm']
    low_end=step-bend['lowerExposedRadius_mm'];high_start=step+bend['upperExposedRadius_mm']
    high_end=p['rear']['planeY']-bend['backExposedRadius_mm'];hy=bend['highCarrierY_mm']
    edge_bound=2*new['edgeToleranceEach_mm'];lap=c['ordinaryTopLapTrial']
    bend_result={'control':bend,'lowerFlatY_mm':[cy,low_end],'crestFlatY_mm':[high_start,high_end],
      'minimumLowCarrierEndClearance_mm':low_end-new['y'][1]-edge_bound,
      'minimumHighCarrierEndClearances_mm':[hy[0]-high_start-edge_bound,high_end-hy[1]-edge_bound],
      'lapTrial':lap,'rejectedLapEdgeToBend_mm':low_end-lap['rejectedEdgeY']-challenge,
      'revisedLapEdgeToBend_mm':low_end-lap['revisedEdgeY']-challenge,
      'minimumBodyOverlap_mm':lap['revisedEdgeY']-f['y']-challenge,
      'minimumActualFlatOverlap_mm':lap['revisedEdgeY']-cy-challenge,
      'scope':'Exposed-face tangent geometry with sheet underside offset, not a formed-part inspection. New lap normal travel/height/contact and both actual end-top/frame joins remain open.'}
    # Upper inside R3 lies below the sharp top13.5 at both old carrier ends.
    old_high=m['channels'][1];inner_r=bend['upperExposedRadius_mm']-p['thickness']
    centre_z=crest-bend['upperExposedRadius_mm']
    old_under=centre_z+math.sqrt(inner_r**2-(old_high['y'][0]-high_start)**2)
    bend_result['oldHighCarrierInterferenceEachEnd_mm']=old_high['top']-old_under
    assert bend_result['oldHighCarrierInterferenceEachEnd_mm']>0
    assert bend_result['minimumLowCarrierEndClearance_mm']>0 and min(bend_result['minimumHighCarrierEndClearances_mm'])>0
    assert bend_result['rejectedLapEdgeToBend_mm']<0< bend_result['revisedLapEdgeToBend_mm']
    metal=m['metalComparison'];load=m['authoredLoad'];trial_channels=[]
    for old,yr in zip(m['channels'],[new['y'],hy]):
        gauge=bend['carrierGauge_mm'];width=yr[1]-yr[0];height=old['top']-old['bottom'];run=old['x'][1]-old['x'][0]
        clear=width-2*gauge;area=width*gauge+2*gauge*(height-gauge);print_width=load['print_mm'][0]
        trial_channels.append({'id':old['id'],'y_mm':yr,'flatBlankWidths_mm':[width,height-gauge,height-gauge],
          'sectionBeforeWelds_mm2':area,'massBeforeWelds_kg':area*run*metal['density_kg_m3']/1e9,
          'centralClearSpan_mm':clear,
          'centralStripStress_MPa':3*load['force_N']*clear/(2*print_width*gauge**2),
          'centralStripDeflection_mm':load['force_N']*clear**3/(4*metal['modulus_MPa']*print_width*gauge**3),
          'webAverageIfEqualReactions_MPa':load['force_N']/(2*print_width*gauge),
          'longitudinalTopWebJointLength_m':2*run/1000})
    bend_result['trialCarriers']=trial_channels
    bend_result['carrierMassBeforeWelds_kg']=sum(x['massBeforeWelds_kg'] for x in trial_channels)
    bend_result['priorNominalCarrierMass_kg']=m['channelMassBeforeBendsWeldsRetention_kg']
    bend_result['stockPurchaseControl']=m['channelStockControl']
    bend_result['quantityScope']='Narrower welded-flat pieces, not formed U profiles. Old full-sheet dated purchase reference is retained; no weight-proportional saving or installed cost. Top/web joint lengths are interface quantities, not a weld specification. Central strip/equal web screens confer no walking-edge, plate/web/weld, mineral bearing, load-spread, fatigue or combined-design pass.'
    leaf=contact_challenge(c,m)
    cap=c['joinedCapTrial'];ends=m['proposedEndSections'];old_cap=ends['ends'][0]['capX_mm'];old_liner=ends['ends'][0]['proposedLinerInnerX_mm']
    assert cap['pocketY_mm']==ends['control']['pocketY'] and cap['pocketZ_mm']==ends['control']['pocketZ']
    new_outer=rough[0]-cap['cavityFrontPocketOutwardEach_mm'];new_inner=new_outer+q['linerThickness_mm']
    root_shift=cap['rootX_west_mm']-ends['leafMechanism']['control']['rootX_left']
    shifted=[x+root_shift for x in leaf['idealWestContactX_mm']]
    cap_result={'control':cap,'oldNominalCapWestX_mm':old_cap,'oldFixedLinerInnerX_mm':old_liner,
      'oldNominalCapLinerOverlapWidth_mm':old_liner-old_cap[0],
      'newCavityPocketOuterWestX_mm':new_outer,'newCavityLinerInnerWestX_mm':new_inner,
      'minimumCapToLinerHardClearance_mm':old_cap[0]-new_inner-challenge,
      'minimumPanToFrontCavityLiner_mm':p['outerX'][0]-new_inner-challenge,
      'rootRetentionTerritory_mm':cap['rootX_west_mm']-old_cap[0],
      'shiftedMinimumGapIdealContactWestX_mm':shifted,
      'minimumShiftedContactToCommonFlange_mm':min(shifted[0]-leaf['commonWestFlangeX_mm'][0],leaf['commonWestFlangeX_mm'][1]-shifted[1]),
      'additionalCavityReservationEach_m3':(cap['cavityFrontPocketOutwardEach_mm']-ends['control']['outwardRevealReservation_mm'])*(cap['pocketY_mm'][1]-cap['pocketY_mm'][0])*(cap['pocketZ_mm'][1]-cap['pocketZ_mm'][0])/1e9,
      'separationFromCoreY_mm':cap['pocketY_mm'][0]-bands['core'][1],
      'separationFromCavityTrayY_mm':t['jambs']['cavityTray']['leftApron']['y'][0]-cap['pocketY_mm'][1],
      'scope':'West case mirrors east. Same4 mm hard-clearance challenge, no tighter tolerance substitution. Cavity-only reservation is distinct from full lower weather6. Actual liner must jog back inside the lower-weather boundary; no fabrication, cap restraint, clamped-root or installed physical admission.'}
    assert cap_result['oldNominalCapLinerOverlapWidth_mm']>0
    assert min(cap_result[k] for k in ['minimumCapToLinerHardClearance_mm','minimumPanToFrontCavityLiner_mm','minimumShiftedContactToCommonFlange_mm','separationFromCoreY_mm','separationFromCavityTrayY_mm'])>0
    return {'status':c['status'],'sources':s,'headerContinuation':header_result,'wholePanLowerReveal':reveal,
      'frontDownfoldComparison':downfold,'dryStepBendComparison':bend_result,'straightLeafContactChallenge':leaf,
      'joinedCapLinerComparison':cap_result,
      'frontContactLead':c['frontContactLead'],'foilResearch':c['foilResearch'],'admission':c['admission']}

def figure(r):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="950" viewBox="0 0 1200 950"><rect width="1200" height="950" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,t,n=17):out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(t)}</text>')
    def box(x,y,w,h,fill,stroke='#61747a',dash=''):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
    text(30,38,'Join the ordinary header band to the real pan air path',27)
    text(30,69,'WORKING DESIGN. Whole path not closed; no owning geometry, structure, material or physical admission.',17)
    h=r['headerContinuation'];v=r['wholePanLowerReveal'];d=r['frontDownfoldComparison'];b=r['dryStepBendComparison']
    X=lambda y:60+(y-3650)*.9
    Z=lambda z:210-z*.7
    def section(a,b,lo,hi,color,dash=''):box(X(a),Z(hi),X(b)-X(a),Z(lo)-Z(hi),color,dash=dash)
    text(60,125,'A  COURT-S SECTION / north to right',20)
    section(3650,4250,-630,-180,'#bebcb3')
    out.append(f'<path d="M{X(3650)} {Z(-380)}H{X(4250)}" stroke="#61747a" stroke-dasharray="7 5"/>')
    for lo,hi,color in [(-180,-80,'#c8ded0'),(-80,-15,'#e5e0d2'),(-15,0,'#aebcc4')]:section(3650,3810,lo,hi,color)
    for lo,hi,color in [(-180,-170,'#ddd4c3'),(-170,-105,'#bda17d'),(-105,-95,'#ddd4c3'),(-95,-30,'#bda17d')]:section(3810,4025,lo,hi,color)
    section(3810,4025,-30,0,'#d8d9cc','4 3')
    for q in [d['revisedLowCarrier'],{'y':b['control']['highCarrierY_mm'],'gauge_mm':3,'topZ':13.5,'bottomZ':-46.5}]:
        aa,bb=q['y'];t=q['gauge_mm'];top=q['topZ'];bottom=q['bottomZ']
        section(aa,bb,top-t,top,'#7d9da7');section(aa,aa+t,bottom,top-t,'#7d9da7');section(bb-t,bb,bottom,top-t,'#7d9da7')
    pts=[(4030,-30),(4030,-4.5)]
    path=f'M{X(4030)} {Z(-30)}L{X(4030)} {Z(-4.5)}A{4.5*.9} {4.5*.7} 0 0 1 {X(4034.5)} {Z(0)}'
    path+=f'L{X(4057)} {Z(0)}A{3*.9} {3*.7} 0 0 0 {X(4060)} {Z(3)}L{X(4060)} {Z(10.5)}A{4.5*.9} {4.5*.7} 0 0 1 {X(4064.5)} {Z(15)}L{X(4085.5)} {Z(15)}A{4.5*.9} {4.5*.7} 0 0 1 {X(4090)} {Z(10.5)}L{X(4090)} {Z(-45)}L{X(4250)} {Z(-49.4444)}'
    out.append(f'<path d="{path}" fill="none" stroke="#a74734" stroke-width="2"/>')
    out.append(f'<path d="M{X(3820.5)} 155V{Z(-180)} M{X(4025)} {Z(-30)}V{Z(0)}" fill="none" stroke="#bd732c" stroke-dasharray="5 4"/>')
    text(70,180,'Room face 3820.5; header starts 3810.',15)
    text(70,370,'215 mm header / two 65 courses + two 10 beds',16)
    text(70,397,'Proposed cap and fixed air interface remain unassigned.',15)
    text(70,490,'RC200 upper lift / actual common 600 × 450 beam',16)
    text(70,516,'Welded flat carriers are trials, not a bearing/weld pass.',15)
    text(70,548,'Real flat: lower 4034.5..4057; crest 4064.5..4085.5.',15)
    text(70,576,'Lap edge 4054 clashes; 4052 leaves 1 mm to lower bend.',15)
    text(70,604,'Body overlap 18 mm; actual flat overlap only 13.5 mm.',15)
    text(70,632,'Lap normal travel, walking offset and contact unresolved.',15)
    text(70,680,'Header Y3810..4025 / Z−180..−30; room intrusion 10.5 mm.',16)
    text(70,708,f'Local room strip {h["localRoomStripArea_m2"]:.5f} m²; no empty Services route inferred.',16)
    # Lower reveal plan: the rebate applies only to the explicitly authored height.
    PX=lambda x:720+(x-5075)*4
    PY=lambda y:380-(y-4000)*.8
    def plan(a,b,u,w,color):box(PX(a),PY(w),PX(b)-PX(a),PY(u)-PY(w),color)
    text(720,125,'B  LOWER WEST REVEAL / plan',20)
    plan(5075,5100,4000,4147.5,'#e9e5d8');plan(5075,5100,4147.5,4250,'#b9b09e')
    plan(5094,5100,4000,4250,'#e0f0ee');plan(5094,5095.5,4060,4250,'#6a9e98')
    plan(5088,5094,4000,4060,'#e0f0ee');plan(5088,5089.5,4000,4060,'#6a9e98')
    out.append(f'<path d="M{PX(5089.5)} {PY(4060)}H{PX(5095.5)}" stroke="#6a9e98" stroke-dasharray="3 2"/>')
    plan(5110,5150,4110,4250,'#c9b28e');plan(5102,5103.5,4030,4250,'#ae5d48')
    text(720,415,'Lower Z−65..100: pre-formed 6 mm + liner 1.5.',16)
    text(720,444,'Both pan/liner and pan/frame minima 2.5 mm.',16)
    text(720,473,'STR isolated jamb already needs return/restraint.',16)
    text(720,500,'Front cap pocket 12; same challenge gives 0.5 clearance.',15)
    # The new arc and old sharp top share the actual section coordinates.
    U=lambda y:740+(y-4025)*15
    V=lambda z:570-z*8
    text(720,530,'C  FRONT BEND / low-carrier zoom',20)
    out.append(f'<path d="M{U(4030)} {V(-15)}V{V(-4.5)}A67.5 36 0 0 1 {U(4034.5)} {V(0)}H{U(4045)} M{U(4031.5)} {V(-15)}V{V(-4.5)}A45 24 0 0 1 {U(4034.5)} {V(-1.5)}H{U(4045)}" fill="none" stroke="#a74734" stroke-width="2"/>')
    box(U(4032),V(-1.5),3*15,3*8,'#d7a897')
    box(U(4037),V(-1.5),8*15,3*8,'#7d9da7')
    text(720,738,'Inner R3 / outer R4.5; flat starts 4034.5.',16)
    text(720,768,f'Old sharp top clashes {d["oldSharpTopInterference_mm"]:.3f} mm; new edge clearance 0.5.',16)
    text(60,837,'Keep actual captures, walking edge, high-carrier bends and every corner/frame contact in the next joined design.',17)
    text(60,872,'No endcap release is deleted yet. No old 35 mm spring law, DPC performance or metal-foil air rating transfers.',17)
    text(60,907,'Crest, bulk water, capillary, thermal surfaces and site duties remain independent; MAT-ENVELOPE stays open.',17)
    out.append('</g></svg>');return ''.join(out)+'\n'

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--check',action='store_true');args=a.parse_args();r=produce()
    for p,s in {HERE/'court-air-path.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n',HERE/'court-air-path.svg':figure(r)}.items():
        if args.check:assert p.exists() and p.read_text()==s,f'Stale output: {p.name}'
        else:p.write_text(s)
    print('Court air-path constraints reproduce; complete path and all admissions remain open.')
