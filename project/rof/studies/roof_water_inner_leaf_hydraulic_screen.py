"""Conditional two-lane screen for the unfrozen inner hinged primary leaf.

No inlet/cross-transfer or installed rib geometry is inferred. The normal
comparison continuously bounds both along position and residual-width split.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--repo',type=Path,default=HERE.parents[2])
parser.add_argument('--check',action='store_true');args=parser.parse_args();ROOT=args.repo.resolve()
own_path=ROOT/'project/rof/studies/roof_water_inner_highback_hydraulics.json'
own=json.loads(own_path.read_text())
flow=own['catchment']['entireInwardDoseLps'];n=.020;fall=.004;g=9.81;K=4.
front=6735.;rear=6830.;crown=6635.;head_bed=6605.75
direct=.4248;valley=.3456;crown_dose=.86775
spill=2000*((flow/(4800*.5*.75))**2/g)**(1/3)
minimum_depth=front+spill-crown


def normal_depth(q,widths):
    widths=[w/1000 for w in widths if w>0]
    d=.04
    for _ in range(60):
        f=[1000*w*d*(w*d/(w+2*d))**(2/3)*math.sqrt(fall)/n for w in widths]
        derivative=sum(a*(5/(3*d)-4/(3*(w+2*d))) for a,w in zip(f,widths))
        change=(sum(f)-q)/derivative;new=max(1e-9,d-change)
        if abs(new-d)<1e-14:d=new;break
        d=new
    else:raise AssertionError('parallel-channel Newton inversion failed')
    velocities=[(w*d/(w+2*d))**(2/3)*math.sqrt(fall)/n for w in widths]
    return d*1000,max(4*v*v/(2*g)*1000 for v in velocities)


def continuous_normal(clear_width,along_step=10.,width_step=.25):
    # Width-conveyance f(w)=w^(5/3)/(w+2d)^(2/3) is convex.
    # Consequently depth increases as the narrower width approaches B/2.
    # For every width interval use its larger depth and larger possible wide
    # lane to bound R, velocity and K4 simultaneously, without asserting that
    # those maxima occur in the same exact split.
    count=math.ceil(clear_width/2/width_step)
    splits=[(clear_width/2*i/count,clear_width/2*(i+1)/count) for i in range(count)]
    length=6500.;face_length=length/2;worst={'reserveMM':math.inf}
    xcount=math.ceil(face_length/along_step)
    for face in [0,1]:
        for i in range(xcount):
            a=face*face_length+face_length*i/xcount;b=a+face_length/xcount
            q=crown_dose+direct*b/face_length+face*valley
            bed=crown-(crown-head_bed)*a/length
            for lo,hi in splits:
                depth,_=normal_depth(q,[hi,clear_width-hi])
                wide=(clear_width-lo)/1000;d=depth/1000
                radius=wide*d/(wide+2*d)
                vmax=radius**(2/3)*math.sqrt(fall)/n
                loss=K*vmax*vmax/(2*g)*1000
                reserve=front-bed-depth-loss-10-25-25
                if reserve<worst['reserveMM']:
                    worst={'reserveMM':reserve,'alongIntervalMM':[a,b],
                        'narrowWidthIntervalMM':[lo,hi],'lateFlowLps':q,'earlyBedMM':bed,
                        'upperNormalDepthMM':depth,'upperMaxLaneK4MM':loss,
                        'upperDepthPlusLocalMM':depth+loss}
    return {'netClearWidthMM':clear_width,'alongStepAtMostMM':along_step,'widthStepAtMostMM':width_step,
        'continuousIntervalBound':worst,
        'proof':'Earlier bed and later flow bound every path interval. For narrower width b in[lo,hi], '
            'normal depth is bounded by b=hi because the sum of the two convex Manning width-conveyances decreases toward equal widths. '
            'The widest lane is at most B-lo. Hydraulic radius and K4 velocity increase with both width and depth. '
            'These separate upper bounds cover every width split continuously.'}


def blocked_parallel(clear_width):
    width=clear_width/2/1000;depth=minimum_depth/1000
    area=width*depth;radius=area/(width+2*depth)
    speed=flow/2000/area
    friction=n*n*speed*speed/radius**(4/3)*6.5*1000
    local=K*speed*speed/(2*g)*1000
    widest=clear_width/1000
    widest_radius=widest*depth/(widest+2*depth)
    ratio=(K/(2*g))*widest_radius**(4/3)/(n*n*6.5)
    assert ratio<5
    stored=front-head_bed+spill+10+25+friction+local
    return {'netClearWidthMM':clear_width,'twoEqualLaneWidthsMM':[clear_width/2]*2,
        'minimumDepthMM':minimum_depth,'lengthMM':6500,'frictionHeadMM':friction,'K4HeadMM':local,
        'commonLongitudinalHeadMM':friction+local,'storedPrimaryMM':stored,
        'native200ReserveMM':200-stored,'rearAfter25SplashMM':rear-head_bed-stored-25,
        'maximumLocalToFrictionCoefficientRatio':ratio,
        'proof':'For a common end-to-end head, lane discharge is A*sqrt(head/(n^2*L/R^(4/3)+K/(2g))). '
            'Its conductance is convex in lane width when the local/friction coefficient ratio is below5. '
            'The maximum ratio over widths0..B is reported and is below5, so equal widths minimise total conductance. '
            'This proves the conditional common-level longitudinal bound, not entry or cross-transfer.'}


cases=[]
for width,meaning in [(175.,'Original residual width, conditional on175 NET clear after leaf/ribs.'),
                      (174.3,'Deduct0.7 full-depth sheet from the old175 width as a pessimistic strip.'),
                      (164.65,'Half of the350 width after subtracting20 mm rib+0.7 sheet, as full-depth strips.'),
                      (154.3,'Old175 unavailable width PLUS20 mm rib+0.7 sheet, as full-depth strips.')]:
    cases.append({'meaning':meaning,'normal':continuous_normal(width),'blocked':blocked_parallel(width)})

critical_q=crown_dose+direct+valley
equal_depth,equal_loss=normal_depth(critical_q,[87.5,87.5])
single_depth,single_loss=normal_depth(critical_q,[107.])
sample=[]
for i in range(8751):
    b=i/100;d,l=normal_depth(critical_q,[b,175-b]);sample.append((d+l,b,d,l))
largest=max(sample)
normal_budget=cases[0]['normal']['continuousIntervalBound']['reserveMM']
blocked_budget=cases[0]['blocked']['rearAfter25SplashMM']
minimum_gap=75-25-10
normal_submerged_height=min(minimum_gap,normal_depth(critical_q,[175])[0])


def transfer(q,gap,length,cd=.6,count=1):
    area=gap*length/1e6
    head=(q/1000/(cd*area))**2/(2*g)*1000
    return {'flowLps':q,'clearHeightMM':gap,'clearLengthMM':length,'assumedCd':cd,
        'serialFullFlowCrossings':count,'singleHeadMM':head,'totalHeadMM':count*head}


crossing=[]
for label,q,gap,budget in [('critical normal',critical_q,normal_submerged_height,normal_budget),
                           ('full blocked',flow,minimum_gap,blocked_budget)]:
    for count in [1,2]:
        required=q/1000/(.6*(gap/1000)*math.sqrt(2*g*(budget/count)/1000))*1000 if budget>0 else math.inf
        options=[]
        for length in [250.,500.,750.,1000.]:
            row=transfer(q,gap,length,count=count);row['remainingBudgetMM']=budget-row['totalHeadMM'];options.append(row)
        crossing.append({'duty':label,'availableAdditionalHeadBudgetMM':budget,
            'serialFullFlowCrossings':count,'minimumClearLengthMM':required,'examples':options,
            'qualification':'Illustrative fully submerged rectangular slot model with assumedCd0.6, not an installed rating. '
                'Normal uses only the common water depth below the opening and discards the upper free-flow portion. '
                'The required clear length, actual ribs/ends, transferred fraction and entry/exit water levels are not authored.'})

result={'status':'CONDITIONAL TWO-LANE COMPARISON; NO JOINED LEAF HYDRAULIC PASS',
    'leafInput':{'source':'Owner-confirmed next geometry; no frozen leaf source yet.',
        'fixedWetPlaneQMM':4615,'leafPlaneQMM':4618,'hingeZMM':7200,'fixedToeZMM':7080,
        'nominalNormalToeAboveBedMM':75,'thicknessMM':.7,'courtwardRibProjectionMM':20,
        'physicalLaneWidthsMM':[243,107],'hypothesisedMinimumToeGapAfter25And10MM':minimum_gap,
        'relativeToeMotionEarned':False,'exactLongitudinalRibAndJointPositionsKnown':False},
    'cases':cases,
    'normalEqualSplitIsNotWorstLocalLoss':{'criticalFlowLps':critical_q,
        'equal87_5DepthPlusK4MM':equal_depth+equal_loss,
        'sampledUnequalMaximum':{'depthPlusK4MM':largest[0],'widthsMM':[largest[1],175-largest[1]],
            'depthMM':largest[2],'K4MM':largest[3],
            'scope':'Diagnostic sample only; the independent continuous interval bound above governs.'}},
    'singleFrontLaneControl':{'widthMM':107,'flowLps':critical_q,'depthMM':single_depth,'K4MM':single_loss,
        'reserveAtIntermediateCornerAfter10Setting25Splash25MovementMM':6735-6620.375-single_depth-single_loss-60,
        'meaning':'If only the front lane is actually reached, the normal duty fails; favourable sharing cannot be presumed.'},
    'underLeafTransferScreens':crossing,
    'unproved':['Net residual area and wetted perimeter at actual0.7 mm leaf,20 mm ribs, hems, guides and ends.',
        'Actual toe-to-bed motion, currently only an unearned nominal75 mm clearance.',
        'Continuous lower connection and the clear lengths at concentrated valley entries and head exits.',
        'How inflow reaches both lanes and returns to the front spill/outlet without exceeding the remaining head.',
        'Shared longitudinal inlet/outlet levels and common pressure relief; equal-lane transport is conditional on those levels.',
        'True nonuniform subcritical profile and corner/transverse-flow losses. Neither this normal-depth model nor the earlier rectangle establishes it.',
        'The pessimistic full-depth rib-strip failures are controls, not proof that the actual partially submerged rib geometry fails.',
        'Raising or moving the toe would require new weather capture, wind, physical motion and structural checks.'],
    'sourceHashes':{str(own_path.relative_to(ROOT)):hashlib.sha256(own_path.read_bytes()).hexdigest(),
        'project/rof/studies/roof_water_inner_highback_hydraulics.py':hashlib.sha256((ROOT/'project/rof/studies/roof_water_inner_highback_hydraulics.py').read_bytes()).hexdigest()},
    'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return round(x,9) if isinstance(x,float) else x

target=HERE/'roof_water_inner_leaf_hydraulic_screen.json';content=json.dumps(rounded(result),indent=2)+'\n'
if args.check:assert target.read_text()==content,'Rebuild conditional leaf screen'
else:target.write_text(content)
print(json.dumps({'status':result['status'],'cases':[{'netWidthMM':c['blocked']['netClearWidthMM'],
    'normalBoundMM':c['normal']['continuousIntervalBound']['reserveMM'],
    'blockedStoredMM':c['blocked']['storedPrimaryMM'],'blockedRearReserveMM':c['blocked']['rearAfter25SplashMM']} for c in cases],
    'crossingRequiredClearLengthsMM':[{'duty':c['duty'],'count':c['serialFullFlowCrossings'],'length':c['minimumClearLengthMM']} for c in crossing]},indent=2))
