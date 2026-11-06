#!/usr/bin/env python3
"""Coplanar, end-supported roof node versus stacked collector. Explicit current-source rewind."""
from pathlib import Path
import json,math,hashlib,sys
from html import escape
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes();assert hashlib.sha256(raw).hexdigest()=='dbfff5eb4fa36dbdf6635702e853792e6412d73df1c58f9e1c1ede1bcff205b8'
h=json.loads(raw)['model'];prior=json.loads(Path(__file__).with_name('current-house-roof.json').read_text());fy=200/1.1;E=200000
H=200;B=140;t=12;area=B*H-(B-2*t)*(H-2*t);I=(B*H**3-(B-2*t)*(H-2*t)**3)/12;MR=I/(H/2)*fy/1e6
Rdown=200;Ruplift=65;chord=100;span=1.3;G=area/1e6*78.5
M=Rdown*span/4+1.35*G*span**2/8;V=Rdown/2+1.35*G*span/2
ringUtil=M/MR+chord/(area*fy/1000);VR=2*t*(H-2*t)*(fy/math.sqrt(3))/1000
assert ringUtil<1 and V<VR
ringBottom=6540;ringTop=ringBottom+H
ceiling=h['roofDevelopment']['protectedCeiling']['top'];primaryBottom=ceiling+25
primaryCentre=primaryBottom+125/math.cos(math.radians(25));tieCentre=primaryBottom+75
# End-bearing pairs ofsecondary members remainunchanged. This is NOT a new
# cantilever-jack roof; only theprimary/ring verticalstack is removed.
Htie=prior['network']['ties']['maxTension'];moment=Rdown*.05+Htie*(tieCentre-(ringBottom+H/2))/1000
knife=[250,400,20];plateW=knife[2]*knife[0]**2/6
sigma=moment*1e6/plateW+Htie*1000/(knife[0]*knife[2]);tau=Rdown*1000/(knife[0]*knife[2]);vm=math.sqrt(sigma*sigma+3*tau*tau)
resultant=math.hypot(Rdown,Htie);boltArea=353;bolts=8;boltCapacity=bolts*boltArea*100/1000
bearingStress=resultant*1000/bolts/(24*20)
# Two opposed200long weld groups separated180; fourlines total,10leg7throat.
weldEach=2*200*7*100/1000;weldDemand=resultant/2+moment/.18
assert vm<fy and resultant<boltCapacity and bearingStress<fy and weldDemand<weldEach
pitch=math.radians(h['roofDevelopment']['pitch']);rise=primaryBottom-6702.5859723120175+(250-80)/math.cos(pitch)
eave=h['roofDevelopment']['eavesDatum']+rise;ridge=prior['sourceRewind']['ridgeOld']+rise
assert primaryBottom-ceiling==25
# Boltgrid inactualprimary web plane:4rows55pitch+35edges fitsnormal250depth.
assert 3*55+2*35<=250 and 90+2*35<=250
assert all(6540<=primaryBottom+(xx-80)*math.tan(math.radians(25))+(35+i*55)/math.cos(math.radians(25))<=6940 for xx in [110,200]for i in range(4))
serviceDelta=(200/1.35)*1000*(span*1000)**3/(48*E*I)
ringLength=4*(11667.5-332.5)/1000+4*(8082.5-3917.5)/1000
result={'status':'Preferred coplanar roof connection candidate; whole-house/architectural source adoption remains pending',
 'source':{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},'units':'mm, kN, kNm, MPa unless stated',
 'collector':{'section':[H,B,t],'material':'Project fabricated closed steelbox; declared200/1.1MPa stress, not commercialroundedRHS properties','z':[ringBottom,ringTop],'A':area,'I':I,'MR':MR,'M':M,'chordBudget':chord,'combinedBendingAxial':ringUtil,'V':V,'VR':VR,'serviceDeflection':serviceDelta,'lengthM':ringLength,'selfG':ringLength*G,'piers':'ActualRC/masonrywindowpiers andcornerL-piers; sourcecontinuousring is above allupperwindowheads, bottom25above6515extrados. Endbearing140x300plate fitsactualcore; solidpiers mustcarry assignedreaction, not just openingwidth.'},
 'coplanarConnection':{'knife':knife,'knifeRole':'Vertical20plate inprimarycentreplane,250long alongrafter/400high; closedboxprimary has localfabricatedslot+stiffenedclevis web. This is a conventional project end-bearing/boltednode, not an inferred proprietary rating.','primaryNormalDepth':250,'primarySupportBottom':primaryBottom,'primaryCentreAtSupport':primaryCentre,'knifeZ':[6540,6940],'knifeProjectionFromCore':110,'protectedClosureReference':{'mineralProtection':25,'protectionBottom':6515,'finishedCeilingBottom':6444,'reserve':71},'tieSectionVerticalDepth':150,'tieCentre':tieCentre,'tieBottom':primaryBottom,
 'verticalDown':Rdown,'verticalUplift':Ruplift,'localTieForce':Htie,'localForceRole':'Rafter/tiehorizontalforces selfequilibrate withinthecompleteframe; fulltieforce/80offset retained asadverse localconnectionmoment, not additionalglobalhorizontalwind.','verticalReactionEccentricityBudget':50,'moment':moment,'combinedKnifeStress':vm,'steelStressBudget':fy,'bolts':'8M24 atdeclared100MPa shear stress; two columns90pitch/fourrows55pitch;35edge.220grip/length territory through150widebox plushead/washers/nut.','boltCentreGridXZ':[[xx,primaryBottom+(xx-80)*math.tan(pitch)+(35+i*55)/math.cos(pitch)]for xx in [110,200]for i in range(4)],'boltResultant':resultant,'boltCapacity':boltCapacity,'bearingStress':bearingStress,'weld':'Twoopposedgroups,each2x200long10leg/7throat,180couple; declared100MPa','weldEachGroupCapacity':weldEach,'weldEachGroupDemand':weldDemand,
 'completeHardwareWidthBudget':220,'occupiedSection':'Tieandmainprimarybottom6645are25aboveprotectedceilingtop6620. Knifelowerstem/ringbottom6540occupies80of176ceilingclosuredepth atwallreturn;25mineralprotectionbottom6515stays71abovefinishedceiling6444. Thislocallyreplacesinsulationandrequiresmatchedfire/thermalclosure, notunchanged176recipe. Localroofwallclosure spans220ratherthan140core; steelbridging/protection/airseal is a disclosed localMAT/ROF junction, not hidden insulation.','installation':'Assemblebeforeceiling/roofclosure; positivebolt/head andknifeaccess reserved fromroofside. Locate removablemetalinspectioncollar atjoint without making thewhole attic accessible storage. Actualfire/thermal/weld/fastener andrenewalqualification remain downstream.'},
 'heightComparison':{'historicalEave':7100,'historicalRidge':prior['sourceRewind']['ridgeOld'],'stackedRC400Rise':prior['sourceRewind']['weatherHeightIncrease'],'coplanarSteel200Rise':rise,'selectedCandidateEave':eave,'selectedCandidateRidge':ridge,'heightSavedAgainstStacked':prior['sourceRewind']['weatherHeightIncrease']-rise,'courtPlanOverhangPitchUnchanged':True,'recommendation':'Prefercoplanarsteel200collector/250primary: realendbearing/clevisforcepath eliminatesstackedheight, retainingfinitehip/secondaryroute. RejectstackedRC400onwhole-designheight/mass merit, not an oldheightinvariant. This is a proposedsource rewind, not an alreadychangedHADselection.'},
 'adoptionConditions':['Actualcollector/pierloadallocation andcontinuousuplift/lateralrestraint, glass/cavity/metal/fireclosure and ±10mm infillmovement transition mustbejoined.','RWTroofarea andplan remain144.15m2; actualgutter/downstackverticallevels requireupdatedhead/renewalreference afterheightadoption. Noheightchangeisfree.Georgianeave/ridgeproportion needsrenderedreview.'],'physicalAdmission':False}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
# Whole-section comparison anddimensionedlocalnode, not a fabricatedphoto.
W=1500;svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="1050" viewBox="0 0 {W} 1050"><rect width="1500" height="1050" fill="#fbfaf5"/><g font-family="sans-serif" fill="#242a2c">'
txt=lambda x,y,s,n=16:f'<text x="{x}" y="{y}" font-size="{n}">{escape(s)}</text>'
svg+=txt(35,40,'CURRENT HOUSE · COPLANAR ROOF / STACKED CONTROL',25)
x=lambda a:70+a*.075;z=lambda a:790-a*.075
# Actualhouse width andcentralcourt; roofweatherprofile mirrorring.
for xx in [262.5,11597.5]:svg+=f'<rect x="{x(xx)}" y="{z(6540)}" width="{140*.075}" height="{(6540+180)*.075}" fill="#a6a59e"/>'
for xx in [3847.5,8012.5]:svg+=f'<rect x="{x(xx)}" y="{z(6540)}" width="{140*.075}" height="{(6540+180)*.075}" fill="#b8b7af"/>'
# Actual proposed roof section includes the retained nonprimary layers,
# not a floating weatherline. The 250normal primary is coplanar with the ring.
normalTotal=h['roofDevelopment']['totalNormal']-80+250
for a,b in [(-200,4450),(7550,12200)]:
 mid=(a+b)/2;lo=eave-h['roofDevelopment']['overhang']*math.tan(pitch);hi=ridge
 bottom=normalTotal/math.cos(pitch)
 points=[(a,lo),(mid,hi),(b,lo),(b,lo-bottom),(mid,hi-bottom),(a,lo-bottom)]
 svg+='<polygon points="'+' '.join(f'{x(xx)},{z(zz)}'for xx,zz in points)+'" fill="#b7cbd0" opacity=".55"/>'
for xx in [262.5,3847.5,8012.5,11597.5]:
 svg+=f'<rect x="{x(xx)}" y="{z(6740)}" width="{140*.075}" height="{200*.075}" fill="#276b80"/>'
for zz in [-180,3170,3370]:svg+=f'<line x1="{x(262.5)}" y1="{z(zz)}" x2="{x(11737.5)}" y2="{z(zz)}" stroke="#6c777d" stroke-width="3"/>'
for zz,label,col in [(7100,'HAD historical7100','#858b8d'),(eave,'COPLANAR eave','#276b80'),(7546.9882739116065,'STACKED eave','#b26a43')]:
 ridgeZ=zz+(prior['sourceRewind']['ridgeOld']-7100); physicalEave=zz-h['roofDevelopment']['overhang']*math.tan(pitch)
 for a,b in [(-200,4450),(7550,12200)]:
  mid=(a+b)/2;svg+=f'<polyline points="{x(a)},{z(physicalEave)} {x(mid)},{z(ridgeZ)} {x(b)},{z(physicalEave)}" fill="none" stroke="{col}" stroke-width="4"/>'
 legendY={'HAD historical7100':145,'COPLANAR eave':120,'STACKED eave':95}[label]
 svg+=txt(1010,legendY,f'{label}: {zz:.1f} mm')
svg+=txt(70,845,'Same court, hips and 25° pitch; +130.0 mm replaces +447.0 mm. Roof layers shown; protected ceiling retained.',17)
svg+=txt(70,875,'Plan area 144.15 m² remains the RWT catchment. Steel, thermal closure and vertical downstack costs remain explicit.')
# Enlargednode at right, allrealZscaledindependent; nofakefullwallsolidthroughwindow.
px=lambda v:1090+v*.7;pz=lambda v:620-(v-6500)*.7
svg+=f'<rect x="{px(0)}" y="{pz(6740)}" width="{140*.7}" height="{200*.7}" fill="#75828b"/>'
svg+=f'<rect x="{px(0)}" y="{pz(6940)}" width="{250*.7}" height="{400*.7}" fill="#b16f49"/>'
pts=[(80,primaryBottom),(400,primaryBottom+320*math.tan(pitch)),(400,primaryBottom+320*math.tan(pitch)+250/math.cos(pitch)),(80,primaryBottom+250/math.cos(pitch))]
svg+='<polygon points="'+' '.join(f'{px(a)},{pz(b)}'for a,b in pts)+'" fill="#477e91" opacity=".7"/>'
for xx in [110,200]:
 for zz in [primaryBottom+(xx-80)*math.tan(pitch)+(35+i*55)/math.cos(pitch) for i in range(4)]:svg+=f'<circle cx="{px(xx)}" cy="{pz(zz)}" r="4" fill="#20272b"/>'
svg+=f'<line x1="{px(-40)}" y1="{pz(6620)}" x2="{px(350)}" y2="{pz(6620)}" stroke="#733b46" stroke-width="3"/>'
svg+=txt(1010,680,'Steel ring 6540–6740; knife shares primary depth.',14)
svg+=txt(1010,705,'Lowest tie/primary 6645; ceiling top 6620: 25 mm.',14)
svg+=txt(70,945,'PROJECT PROPOSAL: section/member/connection screens. No hydraulic, material, fire, physical orsite admission.',18)
svg+=txt(70,980,'Diagram is schematic in plan; localnode view is not a shop-weld/collar fabrication drawing. Actualfigures are source-derived.')+'</g></svg>\n'
outputs={out:text,Path(__file__).with_suffix('.svg'):svg}
for p,v in outputs.items():
 if '--check'in sys.argv:assert p.read_text()==v,p
 else:p.write_text(v)
print(json.dumps(result['heightComparison'],indent=2))
