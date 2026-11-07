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
    return {'status':c['status'],'sources':s,'headerContinuation':header_result,'wholePanLowerReveal':reveal,
      'frontDownfoldComparison':downfold,'frontContactLead':c['frontContactLead'],'foilResearch':c['foilResearch'],'admission':c['admission']}

def figure(r):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="950" viewBox="0 0 1200 950"><rect width="1200" height="950" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,t,n=17):out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(t)}</text>')
    def box(x,y,w,h,fill,stroke='#61747a',dash=''):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
    text(30,38,'Join the ordinary header band to the real pan air path',27)
    text(30,69,'WORKING DESIGN. Whole path not closed; no owning geometry, structure, material or physical admission.',17)
    h=r['headerContinuation'];v=r['wholePanLowerReveal'];d=r['frontDownfoldComparison']
    X=lambda y:60+(y-3650)*.9
    Z=lambda z:210-z*.7
    def section(a,b,lo,hi,color,dash=''):box(X(a),Z(hi),X(b)-X(a),Z(lo)-Z(hi),color,dash=dash)
    text(60,125,'A  COURT-S SECTION / north to right',20)
    section(3650,4250,-630,-180,'#bebcb3')
    out.append(f'<path d="M{X(3650)} {Z(-380)}H{X(4250)}" stroke="#61747a" stroke-dasharray="7 5"/>')
    for lo,hi,color in [(-180,-80,'#c8ded0'),(-80,-15,'#e5e0d2'),(-15,0,'#aebcc4')]:section(3650,3810,lo,hi,color)
    for lo,hi,color in [(-180,-170,'#ddd4c3'),(-170,-105,'#bda17d'),(-105,-95,'#ddd4c3'),(-95,-30,'#bda17d')]:section(3810,4025,lo,hi,color)
    section(3810,4025,-30,0,'#d8d9cc','4 3')
    for q in [d['revisedLowCarrier']]:
        aa,bb=q['y'];t=q['gauge_mm'];top=q['topZ'];bottom=q['bottomZ']
        section(aa,bb,top-t,top,'#7d9da7');section(aa,aa+t,bottom,top-t,'#7d9da7');section(bb-t,bb,bottom,top-t,'#7d9da7')
    section(4062,4088,-46.5,13.5,'none','4 3')
    pts=[(4030,-30),(4030,-4.5)]
    path=f'M{X(4030)} {Z(-30)}L{X(4030)} {Z(-4.5)}A{4.5*.9} {4.5*.7} 0 0 1 {X(4034.5)} {Z(0)}'
    path+=''.join(f'L{X(y)} {Z(z)}' for y,z in [(4060,0),(4060,15),(4090,15),(4090,-45),(4250,-49.4444)])
    out.append(f'<path d="{path}" fill="none" stroke="#a74734" stroke-width="2"/>')
    out.append(f'<path d="M{X(3820.5)} 155V{Z(-180)} M{X(4025)} {Z(-30)}V{Z(0)}" fill="none" stroke="#bd732c" stroke-dasharray="5 4"/>')
    text(70,180,'Room face 3820.5; header starts 3810.',15)
    text(70,370,'215 mm header / two 65 courses + two 10 beds',16)
    text(70,397,'Proposed cap and fixed air interface remain unassigned.',15)
    text(70,490,'RC200 upper lift / actual common 600 × 450 beam',16)
    text(70,516,'Dashed high-carrier box is NOT a resolved fabrication.',15)
    text(70,680,'Header Y3810..4025 / Z−180..−30; room intrusion 10.5 mm.',16)
    text(70,708,f'Local room strip {h["localRoomStripArea_m2"]:.5f} m²; no empty Services route inferred.',16)
    # Lower reveal plan: the rebate applies only to the explicitly authored height.
    PX=lambda x:720+(x-5075)*4
    PY=lambda y:380-(y-4000)*.8
    def plan(a,b,u,w,color):box(PX(a),PY(w),PX(b)-PX(a),PY(u)-PY(w),color)
    text(720,125,'B  LOWER WEST REVEAL / plan',20)
    plan(5075,5100,4000,4147.5,'#e9e5d8');plan(5075,5100,4147.5,4250,'#b9b09e')
    plan(5094,5100,4000,4250,'#e0f0ee');plan(5094,5095.5,4000,4250,'#6a9e98')
    plan(5110,5150,4110,4250,'#c9b28e');plan(5102,5103.5,4030,4250,'#ae5d48')
    text(720,415,'Lower Z−65..100: pre-formed 6 mm + liner 1.5.',16)
    text(720,444,'Both pan/liner and pan/frame minima 2.5 mm.',16)
    text(720,473,'STR isolated jamb already needs return/restraint.',16)
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
