"""Independent Newton/quadrature audit of the high-back inner comparison.

Reads owning JSON and geometric inputs; never imports the hydraulic solver.
Normal depth is Newton-solved and graded spill is integrated numerically.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--repo',type=Path,default=HERE.parents[2])
parser.add_argument('--check',action='store_true')
args=parser.parse_args();ROOT=args.repo.resolve()
roof=json.loads((ROOT/'project/mat/studies/ring-roof-family.json').read_text())['catchment']
rain=json.loads((ROOT/'project/rwt/studies/selected-water-event.json').read_text())['duty']['syntheticRainfallMmPerHour']/3600
source_path=ROOT/'project/rof/studies/roof_water_inner_highback_hydraulics.json'
own=json.loads(source_path.read_text())
old=json.loads((ROOT/'project/rof/studies/roof_water_inner_hydraulics.json').read_text())
ridge=roof['outerCourtRidgeSides'][2]
q=ridge**2/1e6*rain
old_q=(ridge**2-2400**2)/1e6*rain
roof_q=roof['revisedCourt']['normalInnerRoofLps']
valley=roof['revisedCourt']['valleyLps']
direct=(roof_q-4*valley)/4


def normal_depth(flow,width_mm):
    width=width_mm/1000;d=.04
    for _ in range(80):
        area=width*d;radius=area/(width+2*d)
        discharge=1000*area*radius**(2/3)*math.sqrt(.004)/.020
        derivative=discharge*(5/(3*d)-4/(3*(width+2*d)))
        change=(discharge-flow)/derivative
        new=d-change
        if new<=0:new=d/2
        if abs(new-d)<1e-15:d=new;break
        d=new
    else:raise AssertionError('Newton normal-depth inversion did not converge')
    speed=flow/1000/(width*d)
    return {'normalDepthMM':1000*d,'K4HeadMM':4*speed**2/(2*9.81)*1000,
        'velocityMPS':speed,'Froude':speed/math.sqrt(9.81*d)}


def profile(flow,front,movement,length=5800.,shift=0.):
    crown=6635+shift;head=6605.75+shift;face_length=length/2
    crown_dose=valley+flow-roof_q
    minimum={'reserveMM':math.inf};boundaries=[]
    for face in [0,1]:
        start=face*face_length;count=math.ceil(face_length)
        for i in range(count):
            a=start+face_length*i/count;b=start+face_length*(i+1)/count
            flow_b=crown_dose+direct*b/face_length+face*valley
            values=normal_depth(flow_b,175)
            bed=crown-(crown-head)*a/length
            reserve=front-bed-values['normalDepthMM']-values['K4HeadMM']-10-25-movement
            if reserve<minimum['reserveMM']:
                minimum={'reserveMM':reserve,'intervalMM':[a,b],'flowLps':flow_b,'bedMM':bed,**values}
        for x in [start,start+face_length]:
            flow_x=crown_dose+direct*x/face_length+face*valley
            values=normal_depth(flow_x,175);bed=crown-(crown-head)*x/length
            boundaries.append({'face':face,'distanceMM':x,'flowLps':flow_x,'bedMM':bed,
                'reserveMM':front-bed-values['normalDepthMM']-values['K4HeadMM']-10-25-movement,**values})
    return {'minimum':minimum,'boundaryChecks':boundaries,'pathLengthMM':length,
        'authoredFall':(crown-head)/length,'hydraulicFall':.004}


def numerical_crest_head(flow,start,end,factor=1.,strips=9600):
    # Midpoint integration, independent of the owning analytic antiderivative.
    dx=(end-start)/strips/1000
    z=[.02875/4.8*(start/1000+(i+.5)*dx) for i in range(strips)]
    c=.75*math.sqrt(9.81)/2**1.5
    def discharge(head_mm):
        head=head_mm/1000
        return 2000*c*factor*dx*sum(max(0.,head-v)**1.5 for v in z)
    a,b=0.,100.
    for _ in range(52):
        m=(a+b)/2
        if discharge(m)>=flow:b=m
        else:a=m
    head=(a+b)/2
    return {'headMM':head,'reproducedFlowLps':discharge(head),'strips':strips,
        'clearOnEachPathMM':[start,end],'factor':factor}


def level_head(flow,length):
    c=.75*math.sqrt(9.81)/2**1.5
    return (flow/1000/(c*length/1000))**(2/3)*1000


def transport(flow,width,depth,length):
    area=width*depth/1e6;radius=(width*depth/(width+2*depth))/1000
    speed=flow/1000/area
    sf=.020**2*(flow/1000)**2/(area**2*radius**(4/3))
    friction=sf*length;local=4*speed**2/(2*9.81)*1000
    return {'flowLps':flow,'clearWidthMM':width,'minimumFloodedDepthMM':depth,'lengthMM':length,
        'frictionHeadMM':friction,'K4HeadMM':local,'totalHeadMM':friction+local}


def storage(flow,front,rear,lower_front,lower_rear,movement,pbound,lbound,plength,llength):
    pspill=level_head(flow,2400)
    lspill=numerical_crest_head(flow,2400,4800)
    pt=transport(flow,175,front+pspill-6635,plength)
    lt=transport(flow,212.5,lower_front,llength)
    pw=front-6605.75+pspill+10+movement+pt['totalHeadMM']
    lw=lower_front+lspill['headMM']+10+movement+lt['totalHeadMM']
    unknown_head=28.75+level_head(flow,4800)
    unknown=lower_front+unknown_head+10+movement+lt['totalHeadMM']
    return {'primarySpillHeadMM':pspill,'lowerNumericalSpill':lspill,
        'primaryTransport':pt,'lowerTransport':lt,'primaryStoredMM':pw,'lowerStoredMM':lw,
        'primaryRearAfterSplashMM':rear-6605.75-pw-25,'lowerRearAfterSplashMM':lower_rear-lw-25,
        'primaryWaterReserveMM':pbound-pw,'lowerWaterReserveMM':lbound-lw,
        'maximumCrestOnlyControl':{'headAboveLowestCrestMM':unknown_head,'storedWaterMM':unknown,
            'waterReserveMM':lbound-unknown,'rearAfterSplashMM':lower_rear-unknown-25,
            'scope':'All remaining4.8 m spill length at the maximum+28.75 crest. Valid without linearity only if the actual maximum and continuous clear length are bounded.'}}


normal=profile(q,6735,25)
normal_long=profile(q,6735,25,6500)
lower=normal_depth(q,212.5)
long=storage(q,6735,6830,140,245,25,200,220,6500,6500)
centre=storage(q,6735,6830,140,245,25,200,220,5800,5650)
historical=storage(old_q,6715,6795,125,125,14,170,190,5800,5650)
old_profile=profile(old_q,6715,14)
old_uniform=numerical_crest_head(old_q,0,4800,.5)
new_uniform=numerical_crest_head(q,0,4800,.5)
new_high_blocked=numerical_crest_head(q,0,2400)
controls=[]
for row in own['failedControls']:
    front=6715;rear=6795 if 'old walls' in row['label'] else 6830
    lrear=125 if 'old walls' in row['label'] else 245
    pbound,lbound=row['nativeWaterBoundsMM']
    result=storage(q,front,rear,125,lrear,25,pbound,lbound,
        row['primaryTransport']['fullArmLengthMM'],row['lowerTransport']['fullArmLengthMM'])
    result['label']=row['label'];result['primaryNormalReserveMM']=profile(q,front,25)['minimum']['reserveMM']
    result['lowerNormalReserveMM']=125-lower['normalDepthMM']-lower['K4HeadMM']-60
    controls.append(result)

comparisons=[]
for row in own['proposed']:
    length_p=row['primaryTransport']['fullArmLengthMM'];length_l=row['lowerTransport']['fullArmLengthMM']
    ours=storage(q,6735,6830,140,245,25,200,220,length_p,length_l)
    shift=row['geometry']['primaryVerticalShiftMM']
    shifted=profile(q,6735+shift,25,shift=shift)
    check={'shiftMM':shift,
        'normalReserveDifferenceMM':shifted['minimum']['reserveMM']-row['marginsMM']['primaryNormalMM'],
        'primaryStorageDifferenceMM':ours['primaryStoredMM']-row['maximumStoredPrimaryMM'],
        'lowerStorageDifferenceMM':ours['lowerStoredMM']-row['maximumStoredLowerMM'],
        'lowerCrestHeadDifferenceMM':ours['lowerNumericalSpill']['headMM']-row['lowerGradedSpill']['headAboveLowestRimMM']}
    assert max(abs(v) for k,v in check.items() if k!='shiftMM')<3e-7,check
    comparisons.append(check)
assert abs(historical['primaryStoredMM']-old['blockedSpill']['primaryMaximumWaterMM'])<3e-7
assert abs(historical['lowerStoredMM']-old['blockedSpill']['lowerMaximumWaterMM'])<3e-7
assert abs(old_uniform['headMM']-20.304054410)<3e-7
assert historical['maximumCrestOnlyControl']['waterReserveMM']<0
assert long['maximumCrestOnlyControl']['waterReserveMM']>0

crown=valley+q-roof_q
flows={'fullInwardQ':q,'weatherRoofOnlyQ':roof_q,'eachValleyQ':valley,'directEachFaceQ':direct,
    'allOtherFootprintRainAtCrownQ':q-roof_q,'adverseCrownQ':crown,
    'adverseIntermediateBeforeValleyQ':crown+direct,'adverseIntermediateAfterValleyQ':crown+direct+valley,
    'adverseArmAtHeadQ':crown+2*direct+valley,'otherArmAtHeadQ':2*direct+valley,'directSWHeadValleyQ':valley}
assert abs(flows['adverseArmAtHeadQ']+flows['otherArmAtHeadQ']+valley-q)<1e-12
source_files=['project/rof/studies/roof_water_inner_highback_hydraulics.py',
    'project/rof/studies/roof_water_inner_highback_hydraulics.json',
    'project/rof/studies/roof_water_inner_hydraulics.py','project/rof/studies/roof_water_inner_hydraulics.json',
    'project/mat/studies/ring-roof-family.json','project/rwt/studies/selected-water-event.json']
result={'status':'INDEPENDENT ARITHMETIC/DOMAIN AUDIT; PHYSICAL ASSEMBLY AND ORDINARY RENEWAL REMAIN UNSELECTED',
    'flowConservation':flows,'normal5800Reference':normal,'normal6500PhysicalBackEdgeGrid':normal_long,
    'normalParameterization':{'referenceLengthMM':5800,'longestBackEdgeLengthMM':6500,
        'maximumRealIntervalForOneReferenceMM':6500/5800,
        'primaryBackEdgeGeometricFall':29.25/6500,'lowerBackEdgeGeometricFall':28.75/6500,
        'hydraulicFallUsed':.004,
        'proof':'At equal fractions of a face the bed and cumulative inflow are identical. A change of path length reparameterizes those same states. '
            'Earlier-bed/later-flow intervals still continuously cover all points; the reference1 mm interval maps to at most1.120690 mm on the longest path. '
            'Both geometric grades remain above the0.004 Manning comparison.'},
    'lowerFullDoseNormal':{**lower,'frontReserveAfter10Setting25Splash25MovementMM':140-lower['normalDepthMM']-lower['K4HeadMM']-60},
    'new6500TransportComparison':long,'earlierCentrelineTransportControl':centre,
    'newSpillQuadratureControls':{'uniformHalf':new_uniform,'lowestHalfBlocked':long['lowerNumericalSpill'],'highestHalfBlocked':new_high_blocked},
    'historicalControls':{'normal':old_profile,'spillUniformHalf':old_uniform,'storage':historical,
        'former160PrimaryReserveMM':160-historical['primaryStoredMM'],
        'former6790RearReserveAfterSplashMM':6790-6605.75-historical['primaryStoredMM']-25},
    'newDomainFailedWallControls':controls,'owningReceiptComparisons':comparisons,
    'domainConclusions':[
        'The full3.60375 dose and corrected four-valley conservation reproduce. Putting all added footprint rain at the adverse crown bounds its cumulative presence on that arm.',
        'The declared1D normal-depth plus K4 arithmetic is correct. Froude numbers below1 mean that it remains sensitive to downstream control; it is not a solved subcritical backwater profile.',
        'Use6500 mm for blocked transport unless an actual shorter continuous residual-water path is authored. The roofward half next toq4375 is longer than the centreline path.',
        'The lower220/rear245 proposal also passes the maximum-crest-only control by about2.30 mm with6500 transport. The earlier190 mm geometry still fails its unchanged control.',
        'The source front/rear/water margins count10 setting+25 movement once in stage, and25 splash separately. They do not require a second35 mm deduction from the same bound.',
        'The declared35 mm stage allowance must actually bound adverse bed-to-crest relative shifts so the minimum transport depths remain available.',
        'All transport comparisons presume a continuous residual flow lane. Arbitrary alternating obstructions, actual head entry/outlet loss, corner jets and additional local losses are not qualified by half-clear width or by K4.',
        'The constant vertical shifts120/150/180/200 leave hydraulic differences unchanged. They do not establish structural/solid clearances, retained pressure, or the new200/220 force-and-moment domain.'
    ],
    'sourceHashes':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in source_files},
    'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return round(x,9) if isinstance(x,float) else x

target=HERE/'roof_water_inner_highback_audit.json';content=json.dumps(rounded(result),indent=2)+'\n'
if args.check:assert target.read_text()==content,'Rebuild independent high-back audit'
else:target.write_text(content)
print(json.dumps({'status':result['status'],'normalReserveMM':normal['minimum']['reserveMM'],
    'normal6500ReserveMM':normal_long['minimum']['reserveMM'],
    'primaryStored6500MM':long['primaryStoredMM'],'lowerStored6500MM':long['lowerStoredMM'],
    'lowerMaximumCrestStored6500MM':long['maximumCrestOnlyControl']['storedWaterMM'],
    'sourceComparisons':comparisons},indent=2))
