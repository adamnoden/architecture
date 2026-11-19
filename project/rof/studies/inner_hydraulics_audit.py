"""Independent numerical audit of the proposed inner hydraulic comparison.

Newton section inversion and numerical crest quadrature do not reuse the owning
source's hydraulic helpers. Reproduce JSON normally; --check verifies it.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import roof_water_inner_hydraulics as source

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]


def section(q,width):
    width/=1000;depth=.05
    for _ in range(30):
        radius=width*depth/(width+2*depth)
        predicted=1000/.020*math.sqrt(.004)*width*depth*radius**(2/3)
        derivative=predicted*(5/(3*depth)-4/(3*(width+2*depth)))
        updated=max(depth/4,depth-(predicted-q)/derivative)
        if abs(updated-depth)<1e-15:depth=updated;break
        depth=updated
    v=q/1000/(width*depth)
    return depth*1000,4*v*v/(2*9.81)*1000,v/math.sqrt(9.81*depth)


def numerical_spill(crests,q,factor=1):
    lo,hi=0.,100.;coefficient=.75*math.sqrt(9.81)/2**1.5
    for _ in range(55):
        mid=(lo+hi)/2
        # Each segment is1 mm: m conversion cancels the L/m3 conversion.
        flow=coefficient*sum(max(0,(mid-z)/1000)**1.5 for z in crests)*factor
        if flow<q:lo=mid
        else:hi=mid
    return (lo+hi)/2


def transport(q,width,depth,length):
    area=width*depth;radius=area/(width+2*depth);v=q/1000/area
    friction=(.020*v/radius**(2/3))**2*length*1000
    local=4*v*v/(2*9.81)*1000
    return {'flowLps':q,'widthMM':width*1000,'minimumDepthMM':depth*1000,
        'lengthMM':length*1000,'n':.020,'K':4,'frictionMM':friction,'localMM':local,'sumMM':friction+local}


def compare():
    authored=source.compare()
    assert source.rounded(authored)==json.loads((HERE/'roof_water_inner_hydraulics.json').read_text())
    roof=json.loads((ROOT/'project/mat/studies/ring-roof-family.json').read_text())['catchment']
    rain=json.loads((ROOT/'project/rwt/studies/selected-water-event.json').read_text())['duty']['syntheticRainfallMmPerHour']/3600
    q=(roof['outerCourtRidgeSides'][2]**2-2400**2)/1e6*rain
    valley=roof['revisedCourt']['valleyPlanM2']*rain
    roof_q=roof['revisedCourt']['innerRoofPlanM2']*rain
    direct=(roof_q-4*valley)/4;goods=q-roof_q
    adverse=2*valley+goods+2*direct;other=valley+2*direct
    assert abs(adverse+other+valley-q)<1e-12
    rows=[]
    for face in (0,1):
        for j in range(4097):
            x=face*2900+2900*j/4096;flow=valley+goods+direct*x/2900+face*valley
            depth,loss,fr=section(flow,175);bed=6635-29.25*x/5800
            rows.append({'distanceMM':x,'face':face,'flowLps':flow,'bedMM':bed,'depthMM':depth,
                'K4MM':loss,'Froude':fr,'reserveMM':6715-bed-depth-loss-49})
    minimum=min(rows,key=lambda r:r['reserveMM'])
    interval=authored['primary']['minimum']['reserveMM']
    assert interval<=minimum['reserveMM'] and minimum['reserveMM']-interval<.01
    crests=sorted([28.75*(j+.5)/4800 for j in range(4800)]*2)
    spill={'uniformHalf':numerical_spill(crests,q,.5),
        'lowestHalfBlocked':numerical_spill(crests[4800:],q),
        'highestHalfBlocked':numerical_spill(crests[:4800],q)}
    for key,original in [('uniformHalf','lowerUniformHalfComparison'),
        ('lowestHalfBlocked','lowerLowestHalfBlocked'),('highestHalfBlocked','lowerHighestHalfBlockedControl')]:
        assert abs(spill[key]-authored['blockedSpill'][original]['headAboveLowestRimMM'])<.000001
    assert spill['lowestHalfBlocked']>spill['uniformHalf']>spill['highestHalfBlocked']
    weir=2000*((q/(4800*.5*.75))**2/9.81)**(1/3)
    primary=transport(q,.175,(6715+weir-6635)/1000,5.8)
    lower=transport(q,.2125,.125,5.65)
    primary_water=6715-6605.75+weir+24+primary['sumMM']
    # Use the independent quadrature, so its small integration error remains visible.
    lower_water=125+spill['lowestHalfBlocked']+24+lower['sumMM']
    rear=6795-6715-weir-24-25-primary['sumMM']
    maximum_crest=28.75+2000*((q/(4800*.75))**2/9.81)**(1/3)
    assert abs(primary_water-authored['blockedSpill']['primaryMaximumWaterMM'])<1e-8
    assert abs(lower_water-authored['blockedSpill']['lowerMaximumWaterMM'])<1e-6
    assert abs(rear-authored['blockedSpill']['primaryRearReserveMM'])<1e-8
    assert 160-primary_water<0 and rear-5<0
    assert min(170-primary_water,190-lower_water,rear)>0
    result={'status':'INDEPENDENT NUMERICAL AUDIT; NOT A COMPLETE PHYSICAL ASSEMBLY PROOF',
        'startingDevelopmentCommit':'a9f7fddc18103ef36f99a5e0e8fd0d86e09b4986',
        'cornerFlowLps':{'total':q,'valley':valley,'directFace':direct,'newGoods':goods,
            'adverseArm':adverse,'otherArm':other,'SWValleyToHead':valley},
        'independentProfileMinimum':minimum,'sourceConservativeIntervalMinimumMM':interval,
        'independentSpillHeadsMM':spill,'uniformHalfUnderstatementMM':spill['lowestHalfBlocked']-spill['uniformHalf'],
        'transport':{'primary':primary,'lower':lower},
        'current170And6795':{'primaryWaterMM':primary_water,'lowerWaterMM':lower_water,
            'primary170ReserveMM':170-primary_water,'lower190ReserveMM':190-lower_water,'primaryRearReserveMM':rear},
        'former160And6790Controls':{'primary160ReserveMM':160-primary_water,
            'lower160ReserveMM':160-lower_water,'6790RearReserveMM':rear-5,'accepted':False},
        'unknownCrestShapeControl':{'allClearCrestAtMaximumHeadMM':maximum_crest,
            'waterWithSameTransportMM':125+maximum_crest+24+lower['sumMM'],
            '190ReserveMM':190-125-maximum_crest-24-lower['sumMM'],'accepted':False},
        'conditions':['The interval proof bounds normal-depth plusK4, not a solved subcritical backwater profile.',
            'Worst low-half blockage is valid for the authored LINEAR crest and common-level overflow relation; a total-rise cap is insufficient.',
            'Full flow over each full arm at its minimum flooded depth is a deliberately conservative transport bound.',
            'Count10 setting+14 movement once in the water level and once in the separately checked rear inequality; do not add them again with transport. The24 mm allowance must bound adverse bed/crest relative shifts.',
            '25 splash is freeboard, not uniform stored water mass. RetainingK4 with the conservative spill coefficient may duplicate a local allowance conservatively.',
            'Actual geometry,14 mm complete movement, jets, inlets, outlets, native resistance and ordinary renewal remain separate.'],
        'validation':{'owningJSONReproduced':True,'independentNewtonAndCrestQuadratureMatched':True,
            'former1606790AndUnknownCrestControlsFail':True,'physicalAssemblyAccepted':False}}
    paths=['project/rof/studies/roof_water_inner_hydraulics.py','project/rof/studies/roof_water_inner_hydraulics.json',
        'project/mat/studies/ring-roof-family.json','project/rwt/studies/selected-water-event.json',str(Path(__file__).relative_to(ROOT))]
    result['sourceHashes']={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths}
    return result


def rounded(value):
    if isinstance(value,dict):return {k:rounded(v) for k,v in value.items()}
    if isinstance(value,(list,tuple)):return [rounded(v) for v in value]
    return round(value,9) if isinstance(value,float) else value


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true')
    args=parser.parse_args();result=compare();content=json.dumps(rounded(result),indent=2)+'\n'
    target=Path(__file__).with_suffix('.json')
    if args.check:assert target.read_text()==content,'Regenerate the independent inner audit'
    else:target.write_text(content)
    print(json.dumps({'status':result['status'],'validation':result['validation']},indent=2))
