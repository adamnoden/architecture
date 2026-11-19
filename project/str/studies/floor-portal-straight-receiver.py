"""Compare straight collar reinforcement, retaining the current concrete and its service ports."""
from hashlib import sha256
from html import escape
from json import dumps, loads
from math import hypot, pi
from pathlib import Path
from sys import argv

here = Path(__file__).resolve().parent
root = Path(argv[1])
sources = [
    'project/str/studies/floor-portal-north-collar.json',
    'project/str/studies/current-house-ground-ties.json',
    'project/str/studies/open-loggia-support.json',
    'project/mat/studies/whole-house-service-baseline.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
collar, ground, floor, services, section = map(loads, raw)
soffit, ordinary_top = section['section']['slabZ']
ffl, finish_bottom = collar['cornerCandidate']['FFLAndFinishUndersideZmm']
receiving = collar['interfaceComparisons']['chosen']['inboardFaceFromWallCentreMm']
cover, form_setting, placing = 25, 5, 21
cover_to_bar_end = cover + form_setting + 5
stem_face = -collar['bendShoulderGeometry']['actualStepUAndZmm'][0]
straight_end = stem_face + cover_to_bar_end
available = receiving - straight_end
force = collar['old_new_chord'][1]
pitch_basis = 860
bond = 2.1
friction = .6
normal_per_mm = pi * 16 * bond / 1000
normal_per_bar = force / (friction * 8)
eight_length = normal_per_bar / normal_per_mm
four_length = 2 * eight_length
bar_limit = normal_per_mm * available
cap_per_bar = friction * bar_limit
seat_width = 100
layout = next(v for v in ground.values() if isinstance(v, dict) and 'primaryBarXY' in v)
primary_v = sorted({max(x,y)-70 for x,y in layout['primaryBarXY'] if x in (43,97) or y in (43,97)})
port = services['rewinds']['rearSource27']['retainedFloorPort']
port_u, port_v, port_d = port[0]-332.5, 11667.5-port[1], port[2]

def stack(chord, setting, intentional):
    # The orthogonal H12 pairs in each face have deliberate point contacts.
    # The two H16 directions do not contact one another.
    h12_to_h16 = 6 + 8 + placing + setting
    h16_to_chord = 8 + chord/2 + (0 if intentional else placing + setting)
    increments = (12, h12_to_h16, h16_to_chord, h16_to_chord, h12_to_h16, 12)
    axes = [soffit + 6 + cover + form_setting]
    for increment in increments:
        axes.append(axes[-1]+increment)
    top = axes[-1]+6+cover+form_setting
    return {'minimumDepthMm':top-soffit, 'topZMm':top, 'axesZMm':axes,
            'chordDiameterMm':chord, 'settingMm':setting, 'intentionalChordContacts':intentional,
            'H16InterlayerClearAfterSettingMm':axes[4]-axes[2]-16-setting,
            'reserveBelowFinishMm':finish_bottom-top}

stacks = {
    'retainedH20SeparatedSharedSetting':stack(20,5,False),
    'retainedH20SeparatedIndependentSetting':stack(20,10,False),
    'retainedH20TouchingRejected':stack(20,5,True),
    'trialH28TouchingSharedSetting':stack(28,5,True),
    'trialH32TouchingIndependentSetting':stack(32,10,True),
}

def nw_limit(setting):
    # Shared conservative compare places cov25 to the actual formed port surface.
    port_exclusion_half = port_d/2 + 8 + cover + setting
    minimum_pitch = 16 + placing + setting
    minimum_tributary = port_exclusion_half + minimum_pitch/2
    normal = force/pitch_basis*minimum_tributary/friction
    return {'barCentreExcludedVmm':[port_v-port_exclusion_half,port_v+port_exclusion_half],
            'leastUniformTributaryMm':minimum_tributary, 'normalForcePerBarKN':normal,
            'requiredBondMm':normal/normal_per_mm, 'shortageMm':normal/normal_per_mm-available,
            'receivingUMmIfStemEndRetained':straight_end+normal/normal_per_mm}

def ne_trial():
    stations = [82,167,231,337,443,589,694,830]
    edges = [0]+[(a+b)/2 for a,b in zip(stations, stations[1:])]+[pitch_basis]
    lengths = [b-a for a,b in zip(edges, edges[1:])]
    worst = max(lengths)*force/pitch_basis/friction
    return {'localVmm':stations,
            'sourcePrimaryBarVmm':primary_v,
            'placingToPrimaryAfter10Mm':min(abs(a-b) for a in stations for b in primary_v)-8-10-10,
            'placingToSecondaryComparisonAfter10Mm':min(abs(a-b) for a in stations for b in (280,530))-8-6-10,
            'largestUniformTributaryMm':max(lengths), 'largestUniformNormalForceKN':worst,
            'remainingNormalResistanceKN':bar_limit-worst}

def nw_chord_trial():
    # Rack is axis-centred as the retained chord, with a larger nominal turn.
    turn = 730
    axes = [127.5,193.5,259.5]
    radii = [turn-axis for axis in axes]
    radial_port = hypot(turn-port_u,turn-port_v)
    minimum = min(abs(radial_port-radius) for radius in radii)
    clearance = minimum - port_d/2 - 14 - form_setting
    return {'axesLocalMm':axes,'turnCentreLocalUVmm':[turn,turn],'centrelineRadiiMm':radii,
            'nearestPortCentreToBarCentreMm':minimum,
            'portToBarClearAfter5Mm':clearance,'requiredCoverToFormedPortMm':cover}

def gravity(occurrence):
    item = next(r for r in floor['floor_fields'] if r['id'] == occurrence)
    shear = item['action']['V']*pitch_basis/1000
    return {'field':occurrence, 'oldSimplySupportedMKNmPerM':item['action']['M'],
            'oldSimpleShearKNPerM':item['action']['V'],
            'oldSectionMRKNmPerM':item['section']['MR'], 'wingReactionKN':shear,
            'pressureOnTrial100mmDirectSeatMPa':shear*1000/(pitch_basis*seat_width)}

num = {
    'status':'Reject the straight connection in the current 200 mm body. Retain a thicker and longer receiver only for architectural redesign.',
    'sourceHashes':dict(zip(sources, map(lambda b:sha256(b).hexdigest(), raw))),
    'materialAndLoadBasis':{'assumedConcrete':'C30/37', 'assumedSteel':'S500',
        'poorBondMPa':bond, 'frictionSensitivity':friction, 'concreteShearCreditKN':0,
        'historicalDiaphragmKN':force,
        'limits':'Earlier isolated actions only. Other grades, lubricated or opening joints, cast/placement tolerances, full yield and the coupled 52-head replay are outside this screen.'},
    'existingGeometry':{'slabZMm':[soffit,ordinary_top], 'FFLAndFinishBottomZMm':[ffl,finish_bottom],
        'receivingUMm':receiving, 'straightEndUMm':straight_end, 'effectiveReceivingDepthMm':available,
        'NWrearWCportLocalUVdiameterMm':[port_u,port_v,port_d]},
    'bond':{'eachDevelopedNormalKN':bar_limit, 'fourShearResistanceKN':4*cap_per_bar,
        'eightShearResistanceKN':8*cap_per_bar, 'fourRequiredProjectedEmbedmentMm':four_length,
        'eightEqualShareRequiredProjectedEmbedmentMm':eight_length,
        'minimumRoomwardAffectedUMmAtEqualEight':receiving+eight_length},
    'stacks':stacks,
    'NWwitness':{'setting5':nw_limit(5),'setting10':nw_limit(10),'provisionalH28Chord':nw_chord_trial()},
    'NEwitness':ne_trial(),
    'independentGravityComparator':[gravity('NW-W'), gravity('NE')],
}
assert available==225 and 4*cap_per_bar<force<8*cap_per_bar
assert all(row['minimumDepthMm']>ordinary_top-soffit for row in stacks.values())
assert stacks['retainedH20TouchingRejected']['H16InterlayerClearAfterSettingMm']<placing
assert stacks['trialH28TouchingSharedSetting']['H16InterlayerClearAfterSettingMm']>=placing
assert all(nw_limit(setting)['shortageMm']>0 for setting in (5,10))
assert nw_chord_trial()['portToBarClearAfter5Mm']<0
assert min(num['NEwitness']['placingToPrimaryAfter10Mm'],num['NEwitness']['placingToSecondaryComparisonAfter10Mm'])>=placing

def drawing():
    existing=stacks['retainedH20SeparatedSharedSetting']
    candidate=stacks['trialH28TouchingSharedSetting']
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 680" role="img" aria-labelledby="title desc">',
         '<title id="title">North first-floor straight receiver depth and WC port</title>',
         '<desc id="desc">The current 200 millimetre slab is too shallow. A 220 millimetre stack fits below the existing floor finish but needs a longer local footprint and deflects around the existing WC port.</desc>',
         '<rect width="1120" height="680" fill="#f8f8f4"/>',
         '<g font-family="sans-serif" fill="#182c30" font-size="17">']
    def label(x,y,words,size=17):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}">{escape(words)}</text>')
    def line(x0,y0,x1,y1,color='#829093'):
        out.append(f'<path d="M{x0:.1f},{y0:.1f} L{x1:.1f},{y1:.1f}" stroke="{color}"/>')
    label(36,43,'North floor receiver • conventional straight bar check',26)
    label(36,72,'Unadopted redesign. Dimensions in mm. Existing soffit, finish and wall datum retained.')
    for x,section,name in [(48,existing,'Separated H20 control'),(572,candidate,'Touching H28 trial, one common jig')]:
        sy=lambda z:430-(z-soffit)
        top=section['topZMm']
        label(x,108,name,19)
        out.append(f'<rect x="{x}" y="{sy(top)}" width="180" height="{top-soffit}" fill="#dae6e4" stroke="#698687"/>')
        line(x-10,sy(ordinary_top),x+205,sy(ordinary_top),'#a55236')
        line(x-10,sy(finish_bottom),x+205,sy(finish_bottom))
        label(x+211,sy(ordinary_top)+4,'existing slab top Z3370',14)
        label(x+211,sy(finish_bottom)+4,'finish underside Z3435',14)
        label(x+211,sy(soffit)+4,'soffit Z3170',14)
        for z,d in zip(section['axesZMm'],[12,12,16,section['chordDiameterMm'],16,12,12]):
            color='#a55236' if d>16 else '#346978'
            out.append(f'<circle cx="{x+48}" cy="{sy(z)}" r="{d/2}" fill="{color}"/>')
            label(x+75,sy(z)+4,f'H{d}  Z{z:.0f}',13)
        label(x,464,f'{top-soffit:.0f} minimum depth, {top-ordinary_top:.0f} above ordinary top',15)
    label(48,525,'NW WC port plan • U235 / V490, Ø160',19)
    legend_x=lambda v:48+v*.85
    line(legend_x(0),580,legend_x(860),580)
    a,b=num['NWwitness']['setting5']['barCentreExcludedVmm']
    out.append(f'<rect x="{legend_x(a):.1f}" y="568" width="{(b-a)*.85:.1f}" height="24" fill="#e3bb9f"/>')
    out.append(f'<circle cx="{legend_x(490):.1f}" cy="580" r="4" fill="#a55236"/>')
    label(legend_x(a)-36,616,f'V{a:.0f}',14)
    label(legend_x(b)+5,616,f'V{b:.0f}',14)
    label(48,648,'Minimum 139 tributary at port. Existing projected embedment is 225; at least 243 is required in this sensitivity.',15)
    out.append('</g></svg>')
    return '\n'.join(out)+'\n'

check = '--check' in argv
for suffix, output in (('.json',dumps(num,indent=2,sort_keys=True)+'\n'),('.svg',drawing())):
    target = here / ('floor-portal-straight-receiver'+suffix)
    if check:
        assert target.read_text()==output, target
    else:
        target.write_text(output)
