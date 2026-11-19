"""Four-head layout comparisons for the straight garden hold-down."""
from hashlib import sha256
from itertools import combinations
from math import cos, pi, radians, sin
from pathlib import Path
from sys import argv
import json

from court_tie_starter_paths import angles, gauge, path, starter


root = Path(argv[1])
sources = [
    'project/str/studies/current-house-grid.json',
    'project/str/studies/open-loggia-support.json',
    'project/str/studies/floor-portal-twin-garden-tie.json',
]
raw = [(root / name).read_bytes() for name in sources]
grid, original, twin = map(json.loads, raw)
reference = next(p for p in original['cap']['named_starter_profiles']
                 if p['id']=='loggia-NW-lowreceiver')
head_ids = ('P24','P25','P26','P27')
heads = {n['id']:n for n in grid['heads'] if n['id'] in head_ids}
xc, yc = heads['P25']['xy']
y0 = heads['P26']['xy'][1]
assert yc==y0==heads['P24']['xy'][1]==heads['P27']['xy'][1]
legacy_x, legacy_y = reference['xy']
min_clear = 21.
offset = y0-legacy_y
radius = 291.


def historical_shape(node, mirrored=False):
    x,y = heads[node]['xy']
    sign = -1 if mirrored else 1
    return [
        path(node+' '+s['id'],s['dia'],
             [(x+sign*(a-legacy_x),y+b-legacy_y,c) for a,b,c in s['points']],radius)
        for s in reference['starters']
    ]


def as_report(check):
    return {
        'clearAfterTwo5MmSettingsMm':check['afterTwo5mmSetoutsLowerMm'],
        'items':check['items'],
    }


def nearest(a,b):
    return as_report(min((gauge(x,y) for x in a for y in b),
                         key=lambda v:v['afterTwo5mmSetoutsLowerMm']))


def mats():
    ew = [
        path('old centre H20',20,[(2850,y0,-238),(4745,y0,-238)])
    ]
    ew_split = [
        path(f'W/E top H{d} {q:+}',d,[(2850,y0+q,z),(4745,y0+q,z)])
        for q,d,z in ((-150,20,-236),(-90,16,-238),(90,16,-238),(150,20,-236))
    ]
    ns_top = [
        path(f'N/S top H20 {q:+}',20,[(xc+q,9950,-256),(xc+q,y0+245,-256)])
        for q in (-16,50,116)
    ]
    ew_bottom = [
        path(f'W/E bottom H20 {q:+}',20,[(2850,y0+q,-572),(4745,y0+q,-572)])
        for q in (-245,-194,0,194,245)
    ]
    ns_bottom = [
        path(f'N/S bottom H20 {q:+}',20,[(xc+q,9950,-552),(xc+q,y0+245,-552)])
        for q in (-245,-194,194,245)
    ]
    sleeve = [path('straight sleeve',32,[(4340,y0,-180),(4340,y0,-300)])]
    return ew,ew_split,ns_top,ew_bottom,ns_bottom,sleeve


def outer_running_rails(near,far,inward):
    begin = heads[near]['xy'][0] + inward*220
    inner = heads[near]['xy'][0] - inward*245
    end = heads[far]['xy'][0]+inward*55
    bend_radius, turn = 220.,radians(10)
    rails = []
    for q,d,z,drift in ((-150,20,-236,30),(-90,16,-238,20),
                        (90,16,-238,20),(150,20,-236,30)):
        ysign = 1 if q>0 else -1
        offset = bend_radius*(1-cos(turn))
        along = bend_radius*sin(turn)
        tangent = (drift-2*offset)/sin(turn)
        points = [(inner,y0+q,z)]
        points.extend((begin+inward*bend_radius*sin(a),
                       y0+q+ysign*bend_radius*(1-cos(a)),z) for a in angles(turn))
        points.extend((begin+inward*(along+tangent*cos(turn)+
                                     bend_radius*(sin(turn)-sin(turn-a))),
                       y0+q+ysign*(offset+tangent*sin(turn)+
                                   bend_radius*(cos(turn-a)-cos(turn))),z)
                      for a in angles(turn))
        assert (end-points[-1][0])*inward>0
        points.append((end,y0+q+ysign*drift,z))
        rails.append(path(f'{near} running H{d} {q:+}',d,points,bend_radius))
    return rails


near_west = historical_shape('P25')
near_east = historical_shape('P26',mirrored=True)
old_ew, ew, ns, bot_ew, bot_ns, sleeve = mats()
old_failed = nearest(old_ew,sleeve)
assert old_failed['clearAfterTwo5MmSettingsMm']==-36
top_fit = nearest(ew+ns,near_west)
bottom_fit = nearest(bot_ew+bot_ns,near_west)
sleeve_fit = nearest(ew+ns,sleeve)
old_bot = [path('old centred N/S bottom H20',20,[(4500,9950,-552),(4500,y0+245,-552)])]
old_bottom_failed = nearest(old_bot,near_west)
assert min(q['clearAfterTwo5MmSettingsMm'] for q in (top_fit,bottom_fit,sleeve_fit))>=min_clear
assert old_bottom_failed['clearAfterTwo5MmSettingsMm']<min_clear
upper_contact_check = [gauge(a,b)['nominalIntervalMm'][0] for a in ew for b in ns]
lower_contact_check = [gauge(a,b)['nominalIntervalMm'][0] for a in bot_ew for b in bot_ns]
assert all(abs(v)<1e-9 for v in upper_contact_check+lower_contact_check)
bottom_parallel_min = min(
    gauge(a,b)['afterTwo5mmSetoutsLowerMm']
    for layer in [bot_ew,bot_ns] for a,b in combinations(layer,2)
)
assert bottom_parallel_min>=min_clear

# Use four lanes on either side of the long North arm. Replace overlapping
# ends on identical paths by paired ends on a continuous mechanical line.
def near_arm_lines(node,bars):
    inward = 1 if node=='P26' else -1
    return [b for b in bars if (b[2][-1][1][0]-b[2][-1][0][0])*inward>1000]


def physical_far_roots(node, arm_side, line_levels):
    x,y = heads[node]['xy']
    roots = [(x+a['points'][0][0]-legacy_x,y+a['points'][0][1]-legacy_y)
             for a in reference['starters']]
    bars = []
    for i,(a,b) in enumerate(roots):
        sx = 1 if a>x else -1
        local_y = round(b-y,6)
        toward_near = sx==arm_side
        choose_south_arm = node=='P24' and sx!=arm_side and b<y
        heading = (0,-1) if choose_south_arm else (sx,0)
        z = line_levels[local_y] if toward_near else -392
        p = starter(i,roots,z,heading)
        bars.append((node+' H22 '+str(i+1),p[1],p[2],p[3]))
    return bars


def shared_approach(near,far,inward,bars):
    upper = near_arm_lines(near,bars)
    ends = {round(b[2][-1][0][1]-y0,6):b[2][-1][0][2] for b in upper}
    far_paths = physical_far_roots(far,-inward,ends)
    rejected = nearest(upper,far_paths)
    cutoff_trial = []
    near_edited = []
    far_edited = list(far_paths)
    for i,a in enumerate(sorted(upper,key=lambda x:x[2][-1][0][1])):
        y = a[2][-1][0][1]
        ax,_,z = a[2][-1][0]
        f = next(d for d in far_paths if abs(d[2][-1][0][1]-y)<1e-5
                 and abs(d[2][-1][1][0]-d[2][-1][0][0])>1000
                 and (d[2][-1][1][0]-d[2][-1][0][0])*inward<0)
        bx = f[2][-1][0][0]
        cursor = (ax+bx)/2 + (-65 if i%2 else 65)
        p = (cursor,y,z)
        reach = min(abs(cursor-ax),abs(cursor-bx))
        assert (bx-ax)*inward>0 and reach>225
        def cut(item):
            return (item[0],item[1],item[2][:-1]+[(item[2][-1][0],p)],item[3])
        near_edited.append(cut(a))
        far_edited[far_edited.index(f)] = cut(f)
        cutoff_trial.append({
            'yMm':y,'zMm':z,'nearAndFarBarTangentXMm':[ax,bx],
            'connectorCentreXMm':cursor,'shorterStraightToBendMm':reach,
            'sameAxisBarIDs':[a[0],f[0]],
        })
    retained_near = [b for b in bars if b not in upper]
    whole = retained_near+near_edited+far_edited
    mount = outer_running_rails(near,far,inward)

    def connector_fit(diameter, length):
        connectors = []
        for row in cutoff_trial:
            centre = row['connectorCentreXMm']
            y, z = row['yMm'], row['zMm']
            connectors.append(path('connector envelope '+row['sameAxisBarIDs'][0], diameter,
                                   [(centre-length/2,y,z),(centre+length/2,y,z)]))
        # The two parent bar ends intentionally occupy their own connector.
        checks = [gauge(connector, bar) for connector, row in zip(connectors, cutoff_trial)
                  for bar in whole if bar[0] not in row['sameAxisBarIDs']]
        checks.extend(gauge(a,b) for a,b in combinations(connectors,2))
        return as_report(min(checks,key=lambda v:v['afterTwo5mmSetoutsLowerMm'])), nearest(connectors,mount)

    clearance, coupler_to_rails = connector_fit(48, 100)
    catalogue = {}
    for article, diameter, length in [('Leviat TTP22', 42, 245), ('nVent EL22P13LN', 40, 273)]:
        structure, rails = connector_fit(diameter, length)
        remaining = 58-diameter/2-4-10
        assert min(structure['clearAfterTwo5MmSettingsMm'], rails['clearAfterTwo5MmSettingsMm'], remaining)>=min_clear
        catalogue[article] = {
            'circumscribingDiameterAndMaximumOpenLengthMm': [diameter, length],
            'minimumToOtherStarterOrConnector': structure,
            'minimumToTopRails': rails,
            'minimumToCoincidentLegacyH8TopLegMm': remaining,
        }
    starters_to_rails = nearest(whole,mount)
    rail_parallel = as_report(min((gauge(a,b) for a,b in combinations(mount,2)),
                                  key=lambda v:v['afterTwo5mmSetoutsLowerMm']))
    assert min(q['clearAfterTwo5MmSettingsMm'] for q in
               (clearance,coupler_to_rails,starters_to_rails,rail_parallel))>=min_clear
    own_ids = [row['sameAxisBarIDs'] for row in cutoff_trial]
    candidate = []
    for a,b in combinations(whole,2):
        if any({a[0],b[0]}==set(pair) for pair in own_ids):
            continue
        candidate.append(gauge(a,b))
    all_reinforcement = as_report(min(candidate,key=lambda v:v['afterTwo5mmSetoutsLowerMm']))
    assert rejected['clearAfterTwo5MmSettingsMm']<0
    assert all_reinforcement['clearAfterTwo5MmSettingsMm']>=min_clear
    return {
        'sameAxialBarTailsUntrimmedReject':rejected,
        'replacementCommonAxialLines':cutoff_trial,
        'genericConnectorReservationDiameterLengthMm':[48,100],
        'nearestConnectorToOtherRepresentedBarOrConnector':clearance,
        'nearestStarterToStarterOutsidePairedAbutments':all_reinforcement,
        'catalogueSilhouetteComparisons':catalogue,
        'runningTopRailsInboardOffsetsMm':[-150,-90,90,150],
        'runningTopRailsAtConnectorOffsetsMm':[-180,-110,110,180],
        'topRailsCurveBeginXMm':heads[near]['xy'][0]+inward*220,
        'runningRailClearances':{
            'connector':coupler_to_rails,'starters':starters_to_rails,
            'betweenParallelRails':rail_parallel,
        },
        'upperConnectorAtLegacyClosedH8TopLeg':{
            'coincidentXLegacyH8AxisZmm':-224,
            'clearanceWith48MmConnectorAfterSettingsMm':58-24-4-10,
            'maximumDiameterAt21MmClearMm':2*(58-4-10-21),
            'remedyFor48mmEnvelope':'Set both nearest hoops at least 62 mm from the connector centre in X and verify the resulting 124 mm local bay, or select a positively assessed narrower product.',
        },
        'limitation':'Generic swept positions. The linked H22 product/assembly, end cover, force redistribution and full new mats in both far caps remain unqualified.',
    }


west = shared_approach('P25','P24',-1,near_west)
east = shared_approach('P26','P27',1,near_east)
old_force = twin['directSleeve']['oldSignedActionKN']
branch_force = twin['sameAxisCap']['sameYCapHeadPaths']
force = []
for pair in branch_force:
    near,far = pair['sameYHeads']
    values = pair['signedReactions'][0]['reactionsKN']
    lever = 272.
    horz = values[near]*abs(pair['nearCapEccentricityXmm'])/lever
    force.append({
        'heads':[near,far],'inheritedVerticalActionsKN':[values[near],values[far]],
        'upperPlateToBottomEWMatLeverMm':lever,'resultingIdealHorizontalChordKN':horz,
        'bondIfOnlyTheTwoH16EquallyCarryTheWitnessMm':horz/2*1000/(pi*16*2.1),
    })

receipt = {
    'sourceHashes':{k:sha256(b).hexdigest() for k,b in zip(sources,raw)},
    'grid':heads,
    'translatedHistoricalP25Ymm':offset,
    'representation':'Current grid, older west flare shape as a translated comparator, geometric mirror at the actual P26, independently posed actual far end candidates, no selected current foundation.',
    'capLayerComparison':{
        'oldContinuousTopH20ToNewSleeveReject':old_failed,
        'EWTopCentreReplacement2H16OffsetsMm':[-90,90],
        'EWTopCentreAndTwoSideBarZmm':[-238,-236],
        'EWTopSideH20YOffsetsMm':[-150,150],
        'NSTop3H20XOffsetsAtWestMm':[-16,50,116],
        'NSTopZmm':-256,
        'upperIntentionalTiedContacts':len(upper_contact_check),
        'upperSteelNearOldFlareMinimum':top_fit,
        'upperSteelNearSleeveMinimum':sleeve_fit,
        'minVerticalOnlyShallowPlateToEWTopSteelAfter10SettingMm':44,
        'bottomEWH20OffsetsMm':[-245,-194,0,194,245],
        'bottomNSH20OffsetsMm':[-245,-194,194,245],
        'bottomZByDirectionMm':[-572,-552],
        'bottomIntentionalTiedContacts':len(lower_contact_check),
        'oldCentreNSToStarterNegativeControl':old_bottom_failed,
        'bottomNearOldFlareMinimum':bottom_fit,
        'bottomParallelClearAfterTwo5MmSettingsMm':bottom_parallel_min,
        'fourH20TransverseSteelOnlyKN':4*pi*10**2*(500/1.15)/1000,
        'olderSeparateBottomTieDemandKN':original['cap']['tie_demand_kN_each_direction'],
    },
    'WestP25P24':west,'EastP26P27':east,
    'signedVerticalOnlyWitness':{'oldForceKN':old_force,'twoSignsSameMagnitude':force,
        'fullYieldPoorBondH16Mm':16/4*(500/1.15)/2.1,
        'scope':'Ideal couple compares only existing stripped vertical uplift/reversal. It does not combine shear, torsion, lateral pressures, all-house forces, cap stress or pile resistance.'},
}
def svg():
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="656" viewBox="0 0 1200 656" role="img" aria-label="North cap upper reinforcement and surveyed head connector lanes">',
           '<rect width="1200" height="656" fill="#fffdf8"/>',
           '<g font-family="DejaVu Sans, Arial, sans-serif" fill="#22323a">']

    def txt(x,y,s,size=17,fill='#22323a'):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}">{s}</text>')

    def line(x1,y1,x2,y2,color,weight=2):
        out.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" fill="none" stroke="{color}" stroke-width="{weight}"/>')

    navy, red, green = '#216082','#935343','#4d7657'
    txt(38,48,'NORTH HOLD-DOWN / CAP TOP MAT AND LINKED HEADS',24)
    txt(38,76,'Current cap axes shown • modelled steel paths • no new stiffness or foundation capacity credited',16)
    line(38,98,1162,98,'#8a9294')
    txt(38,129,'A / WEST NEAR CAP PLAN')
    txt(650,129,'B / FOUR COLLINEAR CONTINUITY LINES PER NORTH ARM')
    sx = lambda x: 351+.65*(x-xc)
    sy = lambda y: 315-.58*(y-y0)
    out.append(f'<rect x="{sx(xc-300):.2f}" y="{sy(y0+300):.2f}" width="390" height="348" fill="#f0e7d8" stroke="#8d7661"/>')
    for p in ew+ns:
        a,b = p[2][0]
        a = max(xc-300,a[0]),max(y0-300,a[1])
        b = b[0], b[1]
        line(sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1]),navy if p in ew else green,2.5)
    out.append(f'<circle cx="{sx(4340):.2f}" cy="{sy(y0):.2f}" r="10" fill="{red}"/>')
    out.append(f'<rect x="{sx(4280):.2f}" y="{sy(y0+25):.2f}" width="78" height="29" fill="none" stroke="{red}" stroke-width="2"/>')
    txt(65,519,'P25 sleeve X4340 and split E/W top rails in blue',15)
    txt(65,544,'Three deliberately tied N/S rails at Z−256 in green',15)
    txt(65,569,'Plate outline is below the upper mat at Z−316…−300',15,red)
    for index,(n,f,section) in enumerate((('P24','P25',west),('P26','P27',east))):
        left,right = heads[n]['xy'][0], heads[f]['xy'][0]
        dx = lambda x: 692+423*(x-left)/(right-left)
        yy = 209+168*index
        txt(670,yy-19,f'{n} – {f}',16)
        line(692,yy,692,yy+104,navy,2)
        line(1115,yy,1115,yy+104,navy,2)
        for k,row in enumerate(section['replacementCommonAxialLines']):
            yyrow = yy+15+24*k
            a,b = sorted(row['nearAndFarBarTangentXMm'])
            line(dx(a),yyrow,dx(b),yyrow,navy,2)
            c = row['connectorCentreXMm']
            line(dx(c-50),yyrow,dx(c+50),yyrow,red,7)
    txt(650,543,'Red: staggered 48 × 100 mm splice reservations.',15,red)
    txt(650,569,'Allow room above the upper connector or choose a smaller assessed head.',14)
    line(38,604,1162,604,'#8a9294')
    txt(38,631,'Legacy independent tails intersect. The paired collinear lines are a product and erection hold.',15)
    out.append('</g></svg>')
    return '\n'.join(out)


print(svg() if '--svg' in argv else json.dumps(receipt,indent=2))
