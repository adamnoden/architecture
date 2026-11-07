"""Price the real guard's offset removable connection, including both load signs."""
from itertools import product
from pathlib import Path
import json
import math
import sys

D=Path(__file__).resolve().parent
receiver=json.loads((D/'current-house-window-receivers.json').read_text())['guard']
arch=json.loads((D/'current-house-arch-detail.json').read_text())
tube_axes=receiver['proposedContact']['tubeCentreXs']
max_stud=max_arm=max_group=max_front_plate=max_moving_plate=0.
max_tube=max_weld=max_torque=0.
cases=[]
for case in receiver['existingTwoSupportReactions']:
    for side in case['members']:
        near=side['side']=='near'; stud_x=([1230,1270] if near else [2330,2370]);xc=sum(stud_x)/2
        bolt=side['supportAxisX'];normal=side['normal'];Mx=side['horizontalAxisMomentKNm'];Mz=normal*(bolt-xc)/1000
        # Separate original 80x100 roots. The high and low pair each returns
        # its own normal force around the actual 125 mm lateral arm.
        top=normal/2+Mx/.1;rows=[normal-top,top]
        separate=[r*factor for r in rows for factor in [(stud_x[1]-bolt)/40,(bolt-stud_x[0])/40]]
        assert abs(sum(separate)-normal)<1e-9
        free_arm=abs(bolt-(1290 if near else 2310))
        arm=max(map(abs,rows))*1000*free_arm/(20**3/6)
        max_arm=max(max_arm,arm);max_stud=max(max_stud,*map(abs,separate))
        # One removable 80x200 plate, same four stud axes. A CLOSED 30x140
        # box between the roots and both collar levels transmits the signed
        # torque between rows. A plate joining two independently flexing bars
        # is not assumed to do this. N normal positive outward.
        group={}
        for x,z in product(stud_x,[5450,5550]):
            group[x,z]=normal/4+Mx*1000*(z-5500)/10000+Mz*1000*(x-xc)/1600
        assert abs(sum(group.values())-normal)<1e-9
        assert abs(sum(f*(x-xc) for (x,z),f in group.items())/1000-Mz)<1e-9
        assert abs(sum(f*(z-5500) for (x,z),f in group.items())/1000-Mx)<1e-9
        peak=max(map(abs,group.values()));max_group=max(max_group,peak)
        G=receiver['body']['guardMassULSKN'];t=4;H=140;B=30
        weak=(H*B**3-(H-2*t)*(B-2*t)**3)/(6*B)
        strong=(B*H**3-(B-2*t)*(H-2*t)**3)/(6*H)
        # Include the entire body gravity at one jamb as an adverse local
        # component load. Existing guard centroid q145, box q-15: 160 eccentric.
        T=abs(Mx)+G*.160;max_torque=max(max_torque,T)
        sigma=(abs(normal)*free_arm*1000/weak+G*free_arm*1000/strong)
        tau=T*1e6/(2*(B-t)*(H-t)*t)+abs(normal)*1000/(2*t*(H-2*t))+G*1000/(2*t*(B-2*t))
        vm=math.hypot(sigma,math.sqrt(3)*tau);max_tube=max(max_tube,vm)
        # Local root weld uses an independently budgeted 3 mm throat and
        # the same closed perimeter. Tube/plate corner and access still matter.
        weld=math.hypot(sigma*t/3,math.sqrt(3)*tau*t/3);max_weld=max(max_weld,weld)
        # Compare free plate strips from each stud to the fixed tube faces.
        # Each stud has a separate 32 mm tributary strip inside the 100 mm row.
        # The moving plate transfers into the vertical edge of the common arm.
        for (x,z),f in group.items():
            to_tube=max(0,abs(x-tube_axes[side['side']])-20)
            max_front_plate=max(max_front_plate,6*abs(f)*1000*to_tube/(32*24**2))
            to_arm=abs(x-(1290 if near else 2310))
            max_moving_plate=max(max_moving_plate,6*abs(f)*1000*to_arm/(32*30**2))
        cases.append({'side':side['side'],'pointX':case['pointX'],'pointSign':case['pointSign'],'windSign':case['windSign'],'individualRowStudForces':separate,'onePlateStudForces':[group[x,z] for z in [5450,5550] for x in stud_x],'commonArmVM':vm})
limit=200/1.1
assert max_stud>84.3*600/1.25/1000 and max_arm>limit
assert max(max_tube,max_weld,max_front_plate,max_moving_plate)<limit,(max_tube,max_weld,max_front_plate,max_moving_plate)
# A larger sleeve is a real obstruction in the 140 RC core. Individual
# surface clearances are evaluated in the actual reinforcement elevations.
base=arch['oppositeJambBase'];rect=arch['archBars'];H16={'near':[a['startVertical'][0] for a in rect['legs']], 'opposite':base['verticalX']}
shared=__import__('runpy').run_path(str(D/'arch-link-schedule.py'))
sleeves=[]
for side,x in tube_axes.items():
    normal_gap=min(abs(x-a) for a in H16[side])-13-8
    # 26 mm OD cast sleeve carries M16. H6 closed links in the ordinary jamb
    # above the foot and H10 pier ties get their own phases, both at the same
    # two through-bolt stations. Keep the separate ground splice H8 domain.
    hoop=shared['clear'](side,shared['guard_rows'],26)
    sleeves.append({'side':side,'sleeveOD':26,'H16Clear':normal_gap,'H16ClearAfterTwo5':normal_gap-10,'linkSchedule':'arch-link-schedule.py', 'minimumLinkClear':hoop,'linkClearAfterTwo5':hoop-10})
    assert min(normal_gap,hoop)>10
# The tube/arm weld and permanent front plates sit outside the actual arched
# aperture. The common bracket enters the previously empty zone between levels.
# Model the complete new receiver body and its common 100 mm withdrawal, as a
# subevent after original guard capture and screw disengagement. Demand an
# independently supported entire guard before either complete bracket is moved.
# q positive into house. Native external common plate q[-30,0], with a pair of
# 25-wide tubes reaching to q130. No part of the new box projects further in.
fixed_plates=[[1170,1295],[2305,2435]]
moving_central_boxes=[[1290,1387.5,-30,0,5430,5570],[2212.5,2310,-30,0,5430,5570]]
guard_q=[130,160];guardscrew_length=190
clear_to_guard=min(guard_q)-max(box[3] for box in moving_central_boxes)
# At s=0 the two collar faces touch the guard, as intended. For s>0 every
# point of the newly added cross-box moves OUT away from both guard and frame.
assert clear_to_guard==130 and max(q[3] for q in moving_central_boxes)==0
rear_plate_thickness=14;nut=13;protrusion=3;cover=4;clear=3
pocket_projection=rear_plate_thickness+nut+protrusion+cover+clear-27
# Solid-stock upper weight. The two moving plates already contain their four
# holes, but take no mass credit for drilling. Allocate hardware separately.
scale=8000/1e9
moving_plate=2*80*200*30*scale
box_area=30*140-22*132
common_boxes=2*97.5*box_area*scale
native_collars=4*160*25**2*scale # 25-square solid reference, actual bores reduce mass
front_plates=sum((hi-lo)*200*24*scale for lo,hi in fixed_plates)
rear_plates=2*80*200*14*scale
face_plates=2*100*210*20*scale
throughrods=4*math.pi*16**2/4*445*scale
outer_tubes=receiver['tubesOnlyKgAcrossEight']/8
mass=sum([moving_plate,common_boxes,native_collars,front_plates,rear_plates,face_plates,throughrods,outer_tubes])
# Price a delivered plate and its whole mounting kit. The 24 mm strip was
# nominal. Reduce the sheet by 1 mm, the effective beam strip from 32 to 28,
# move each stud 3 mm outward from the supporting tube edge, and challenge
# normal fastener force by 25% for prying. No hydraulic friction is credited.
plate_trials=[]
for nominal in [24,28,30,32]:
    delivered=nominal-1
    stresses=[]
    for c in cases:
        name=c['side'];xx=[1230,1270] if name=='near' else [2330,2370]
        for i,f in enumerate(c['onePlateStudForces']):
            lever=max(0,abs(xx[i%2]-tube_axes[name])-20)+3
            stresses.append(6*1.25*abs(f)*1000*lever/(28*delivered**2))
    plate_trials.append({'nominal':nominal,'deliveredMinimum':delivered,'maximumMPa':max(stresses),'passes':max(stresses)<limit})
assert not plate_trials[0]['passes'] and plate_trials[-1]['passes']
# The 32 mm plate stays behind the weather face. A 33 mm maximum delivered
# thickness gives a conditional stock takeoff. Ties are captive at the exterior core face,
# with the hardware reached from the inside pocket, so an outer bolt head
# need not occupy the moving plate's face. Receiver replacement still needs
# specific masonry/closure access behind the first leaf.
front_max=sum((hi-lo)*200*33*scale for lo,hi in fixed_plates)
loose={
    'M16roomNutsAndEightWashers':4*26**2*15*scale+8*math.pi*34**2/4*4*scale,
    'eightM12StudsNutsAndWashers':8*(math.pi*12**2/4*60+20**2*12+math.pi*34**2/4*3)*scale,
    'fourRemovableGuardScrews':4*(math.pi*12**2/4*200+20**2*10)*scale,
    'boxEndsAndWeatherCollars':(4*30*140*4+4*2*(50*50+4*50*25))*scale,
    'twoRoomAccessCovers':2*105*225*4*scale,
    'weldMetalAllowance':4000*18*scale,
    # Four permanently cast 17x60 barrier sockets, two lateral pins per jamb,
    # and four flush 30x6 caps. Draw no mass credit for the internal thread.
    'independentIndoorBarrierSocketsPinsCaps':4*scale*math.pi/4*(17**2*60+10**2*50+30**2*6),
}
complete=mass-front_plates+front_max+sum(loose.values())
delivered_mass=front_max+1.05*(complete-front_max)+1.5
assert delivered_mass<55
# Positive outer and inner force groups. Minimum bearing area and welded
# transition remain dependencies, not hidden credit for the weather brick.
new_G=1.35*(50+(moving_plate+common_boxes+native_collars)/2 +loose['fourRemovableGuardScrews']/2)*.00981
arm_selfweight_increase=new_G-receiver['body']['guardMassULSKN']
# The two fixing rods lie on one X line. Include the real normal-force
# couple that closes vertical-axis torque, in addition to the signed row
# forces. Each of the two steel-tube rows gets a 25x80 RC bearing strip
# situated 30 mm from its rod, within the 100-wide exterior-core face plate.
# Where torque reverses use the opposite strip. Use an adverse 27 mm lever,
# 10% installed mass allowance on the entire moving guard/bracket weight and
# the same 25% axial-prying challenge. Complete anchorage remains conditional.
rod_max=concrete_max=wet_plate_max=rear_plate_max=0.
fixed_tube_max=arm_adverse=0.
for st in receiver['existingTwoSupportReactions']:
    for side in st['members']:
        normal=side['normal'];Mz=abs(side['localRootTorque']);added=Mz/.027/2
        axial=max(map(abs,side['topBottom']))+added
        rod=1.25*axial;rod_max=max(rod_max,rod)
        concrete_max=max(concrete_max,rod*1000/(25*80))
        wet_plate_max=max(wet_plate_max,6*rod*1000*33/(76*19**2))
        # Washer/load can bear just outside the formed 26 sleeve; challenge
        # 15 unsupported to local sound concrete on the inner face plate.
        rear_plate_max=max(rear_plate_max,6*rod*1000*15/(76*13**2))
        b,t=39.5,2.8;area=b*b-(b-2*t)**2;mod=(b**4-(b-2*t)**4)/(6*b)
        fixed_tube_max=max(fixed_tube_max,Mz/2*1e6/mod+1.10*new_G*.2625/2*1e6/mod+rod*1000/area)
        B,H,t=29.5,139.5,3.7;weak=(H*B**3-(H-2*t)*(B-2*t)**3)/(6*B);strong=(B*H**3-(B-2*t)*(H-2*t)**3)/(6*H)
        T=abs(side['horizontalAxisMomentKNm'])+1.10*new_G*.160
        stress=(abs(normal)*88*1000/weak+1.10*new_G*88*1000/strong)
        shear=T*1e6/(2*(B-t)*(H-t)*t)+abs(normal)*1000/(2*t*(H-2*t))+1.10*new_G*1000/(2*t*(B-2*t))
        arm_adverse=max(arm_adverse,math.hypot(stress,math.sqrt(3)*shear))
assert rod_max<157*600/1.25/1000 and concrete_max<17
assert max(fixed_tube_max,arm_adverse,wet_plate_max,rear_plate_max)<limit,(rod_max,wet_plate_max,rear_plate_max)
result={'role':'Proposed replacement interface for a rejected OAS guard control. The upper and lower collar are carried on a single common bracket per jamb. Positive support and an independent temporary barrier must precede disconnection.',
        'original':{'individual20SquareArmStressMPa':max_arm,'worstSingleStudKN':max_stud,'M12ProofComparisonKN':84.3*600/1.25/1000,'reference':'The old 95 mm/twin-leaf/AXA hardware and corresponding guard are rejected as a complete OAS system. Their locations define a test of this new proposal.'},
        'new':{'movingPlate':[80,200,30],'armNormalHeightWall':[30,140,4],'fixedFrontPlateX':fixed_plates,'fixedFrontPlateThickness':32,'comparedNominal24':max_front_plate,'deliveredPlateTrials':plate_trials,'adversePlateComparison':{'netStripWidth':28,'actualLocalHoleOrWeldLossAllowance':4,'maxLeverIncrease':3,'pryingForceFactor':1.25,'minProofMPa':200,'remaining':'Check actual prying/bolt preload, nonlinear plate contact, edge bearing and corrosion allowance.'},'maximumStudKN':max_group,'maximumArmTorsionKNm':max_torque,'maxArmVMMpa':max_tube,'max3ThroatWeldVMMpa':max_weld,'frontPlateStripStressMPa':max_front_plate,'movingPlateStripStressMPa':max_moving_plate,'comparisonLimitMPa':limit,'historicalRowOnlyThroughboltPeakKN':receiver['maximumOneThroughboltAxialKN'],'positiveCoreReceiver':{'outerFacePlate':[100,210,20],'innerBackingPlate':[80,200,14],'bearingFootprintPerRow':[25,80],'minimumOpposingLever':27,'pryingFactor':1.25,'peakM16TensionKN':rod_max,'maxRCBearingMPa':concrete_max,'maxWetPlateMPa':wet_plate_max,'maxRearPlateMPa':rear_plate_max,'maxDelivered40TubeMPa':fixed_tube_max,'maxDeliveredCommonArmVM':arm_adverse,'limits':'Check the full C30 stress field, edge breakout, concrete splitting, weld type, fatigue, radial clearances and casting. No weather-leaf anchorage or resting friction.'},'formedSleeves':sleeves},
        'access':{'commonBoxesXMinMaxQMinMaxZMinMax':moving_central_boxes,'newBoxMinimumDistanceToGuardDuringStraight100':clear_to_guard,'fixedStudProtrusion40ClearAfter100':60,'newFourHoles':20,'M12NominalRadialPositionAllowance':4,'after1p5EachForManufactureAndGuidedDraw':1,'washersOutsideDiameter':34,'washerBearingPressureMPa':max_group*1000/(math.pi*(34**2-20**2)/4),'washerToPlateEdgeAfter1p5':1.5,'rearPlatePocketProjection':pocket_projection,'control':'Both guard screws and four front nuts on one side need release. Capture/hoist and the independent barrier must stay in place. The new box clears the guard by 130 throughout its own outward draw; the two original collar contacts are separate. The new front/rear covers and droplet collars, socket/hand/crew access, insertion tolerance and the complete 1640 mm frame removal still require a matched renewal event.'},
        'massPerWindowKg':{'movingPlates':moving_plate,'newClosedArms':common_boxes,'nativeCollarsSolidUpper':native_collars,'rejected24FixedFrontPlates':front_plates,'insideRearPlates':rear_plates,'exteriorCoreBearingPlates':face_plates,'fourThroughM16':throughrods,'four40Tubes':outer_tubes,'earlierBareSubtotalWith24Plate':mass,'old24PlateSubtotalRemainingIn40':40-mass,'max33FixedPlate':front_max,'completeFittings':loose,'assembledStockAndNamedFittings':complete,'authoredMassComparisonWithFivePercentOnOtherStockAnd1p5kgExecution':delivered_mass,'sourceMatchedMeasuredDeliveryUpperBoundEstablished':False,'maximumProcurementMassRequirement':55,'remainingAgainst55':55-delivered_mass,'oneJambGravityIncludingMovingBracket':new_G,'additionalLocalGravityToCarry':arm_selfweight_increase},'cases':cases,'admitted':False}
output=Path(__file__).with_suffix('.json');content=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert output.read_text()==content
else:output.write_text(content)
print('Old/new guard, tube/weld/stud reserve',max_stud,max_group,max_tube,max_weld,max_front_plate,mass)
