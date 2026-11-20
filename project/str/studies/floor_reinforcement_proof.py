"""Reproduce the explicitly retained native35 control, not a new house solve."""
import hashlib
import json
from pathlib import Path
import sys

from floor_reinforcement import assess_floor_reinforcement


D=Path(__file__).resolve().parent
ROOT=D.parents[2]


def proof():
    path='project/str/studies/vertical-rc-floor-proof.json'
    evidence=json.loads((ROOT/path).read_text())
    for source,expected in evidence['sourceSHA256'].items():
        if hashlib.sha256((ROOT/source).read_bytes()).hexdigest()!=expected:
            raise ValueError('Retained native35 control is stale: '+source)
    result=assess_floor_reinforcement(evidence['baseline'])
    # The callable current result retains the complete inventory. This retained
    # control stores counts and governing witnesses rather than another 434-row
    # copy; its source and method reproduce every route when needed.
    straight=result['straightDevelopment']
    routes=straight.pop('routeInventory')
    straight['shortestPhysicalFieldWitness']=min(routes,key=lambda r:r['availableStraightCentrelineMm'])
    support=[{'edgeSegmentId':r['id'],**core} for r in routes for core in r['edgeAdjacentSourceCoreComparisons']]
    straight['shortestSupportEndWitness']=min(support,key=lambda r:r['supportInnerFaceToBarEndMm']) if support else None
    bindings={**evidence['sourceSHA256'],**{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in (
        path,'project/str/studies/floor_reinforcement.py','project/str/studies/floor_reinforcement_proof.py',
        'project/str/studies/plate_bending_recovery.py','project/str/studies/continuous_rc_cage.py')}}
    return {'schema':'str-floor-reinforcement-control-proof/1','sourceSHA256':bindings,
        'scope':'Postprocess the explicitly retained native35 W31/G0.9 control. No new solve, final ULS envelope or local-stress convergence is claimed.',
        'result':result}


def drawing(proof):
    r=proof['result'];s=r['straightDevelopment'];u=r['verticalReturn'];q=r['uniformThickeningConsequence']
    return '\n'.join([
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1020 650">',
        '<rect width="1020" height="650" fill="#fffdf7"/>',
        '<style>text{font:16px sans-serif;fill:#253a3a}.small{font-size:13px}.adverse{fill:#9c4938}.bar{fill:none;stroke:#526b69;stroke-width:4}</style>',
        '<text x="35" y="38">RC200: section steel and end anchorage are different questions</text>',
        '<text class="small" x="35" y="66">Retained native35 W31/G0.9 control; no selected reinforcement or final design-action envelope.</text>',
        '<text x="35" y="108">1. Conventional straight development</text>',
        '<rect x="35" y="143" width="440" height="100" fill="#dfd9ca" stroke="#526b69"/>',
        '<path class="bar" d="M70 165 H440 M70 216 H440"/>',
        '<path d="M153 143 V243" stroke="#9c4938" stroke-width="2"/>',
        '<text class="small" x="35" y="275">A long continuous field does not prove anchorage beyond the last support.</text>',
        f'<text class="small" x="35" y="302">Full source design-stress straight length: {s["fullSourceDesignStressDevelopmentMm"]:.1f} mm.</text>',
        f'<text class="small" x="35" y="327">Conservative lap: {s["fullSourceDesignStressLapMm"]:.1f} mm; no hook/confinement reduction.</text>',
        f'<text class="small adverse" x="35" y="352">{s["routesWithoutFullForceDevelopment"]}/{s["fieldRouteCount"]} boundary segments lack even the normal field run.</text>',
        '<text x="540" y="108">2. Retired vertical-return template</text>',
        '<rect x="540" y="143" width="430" height="100" fill="#dfd9ca" stroke="#526b69"/>',
        '<path class="bar" d="M930 125 H700 A90 90 0 0 0 700 305 H930" stroke-dasharray="8 4"/>',
        '<text class="small adverse" x="540" y="338">Dashed return exceeds the actual 200 mm body.</text>',
        f'<text class="small" x="540" y="365">Authored inner-direction requirement: {u["requiredDepthForInnerDirectionMm"]:.1f} mm.</text>',
        f'<text class="small" x="540" y="390">Full source design-stress mandrel: {u["necessaryFullSourceDesignStressMandrelMm"]:.1f} mm vs 160 mm authored.</text>',
        '<path d="M35 430 H970" stroke="#b2b3a9"/>',
        '<text x="35" y="468">Keep RC200 under development; resolve the actual short edge routes.</text>',
        '<text class="small" x="35" y="497">A failed return does not reject every conventional slab anchorage. Section stress is only a necessary screen.</text>',
        f'<text class="small" x="35" y="526">Uniform 320 mm quantity comparison adds {q["additionalPhysicalRCVolumeM3"]:.3f} m³ / {q["additionalPhysicalSelfGKN"]:.2f} kN.</text>',
        '<text class="small adverse" x="35" y="555">No changed stiffness/mass solve, local edge-band geometry, crack/shear check or fabrication approval is supplied.</text>',
        '<text class="small" x="35" y="601">The governing recovered moment lies in a 15 mm source cell; local stress convergence remains unproved.</text>',
        '</svg>'])+'\n'


if __name__=='__main__':
    if sys.argv[1:] not in (['--write'],['--check']):raise SystemExit('Use --write or --check')
    value=proof();outputs={D/'floor-reinforcement-proof.json':json.dumps(value,indent=2,allow_nan=False)+'\n',
                         D/'floor-reinforcement.svg':drawing(value)}
    for path,text in outputs.items():
        if sys.argv[1:] == ['--write']:path.write_text(text)
        elif path.read_text()!=text:raise SystemExit('Stale floor reinforcement control: '+str(path))
    print('Retained native35 floor reinforcement control '+sys.argv[1][2:]+' complete; no adoption')
