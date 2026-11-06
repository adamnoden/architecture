#!/usr/bin/env python3
"""Source-bound local comparison. Geometry/arithmetic checks are not assembly admission."""
from pathlib import Path
import argparse, hashlib, json, math, subprocess
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent

def immutable(source):
    data=subprocess.check_output(['git','show',source['commit']+':'+source['path']],cwd=ROOT)
    blob=subprocess.check_output(['git','hash-object','--stdin'],input=data,cwd=ROOT,text=False).decode().strip()
    assert blob==source['blob'],f"Source blob mismatch: {source['path']}"
    return json.loads(data)

def area(poly):
    return abs(sum(x*y2-x2*y for (x,y),(x2,y2) in zip(poly,poly[1:]+poly[:1])))/2

def produce():
    c=json.loads((HERE/'current-ground-pier-boundary.json').read_text())
    s=immutable(c['sources']['STR']);h=immutable(c['sources']['HAD'])
    floor=h['model']['northNormalRoute']['floorJoin']
    assert floor['layers']==c['selectedFloorGuard']['layers'] and floor['z']==c['selectedFloorGuard']['z']
    sp=s['capillarySplice'];p=c['plate'];assert sp['plateZ']==p['z'] and sp['plateThickness']==p['thickness']
    assert sp['governingCard']=={'M':300,'Ncompression':500,'Nuplift':100,'V':75}
    polys=[x['polygon'] for x in s['RClegs']['piers']]
    areas=[area(x)/1e6 for x in polys];assert all(abs(a-.2604)<1e-9 for a in areas)
    assert s['RClegs']['actualLpolygonLegPhysicalLength']==1000
    sw=polys[0];end=max(x for x,y in sw);raw_window=1300
    reserve=raw_window-end-p['edgeFlange']['projectionAtLegEnds']
    assert reserve>=25
    r=c['perimeterAirReturn'];assert r['embeddedFoot']['depthBelowRCTop']<r['floorSteelTopCoverGuard']
    assert r['retainedPlasterTotal']-r['sheet']-r['keyStandOff']>0
    assert not c['preferredConditionalRoute']['floorRewind']
    pan=c['fullPanChallenger'];assert not pan['selected'] and pan['remainingDistribution']+pan['sheet']==floor['layers'][1]
    t=c['thermalScreen'];a=sum(areas)
    rc_depth=(t['height']-t['metalDepth'])/1000
    resistance=rc_depth/t['lambdaRC']+t['metalDepth']/1000/t['lambdaMetal']
    direct_g=a/resistance
    glass_g=a/(floor['layers'][2]/1000/t['lambdaGlass'])
    result={
      'status':c['status'],
      'sourceControlSHA256':hashlib.sha256((HERE/'current-ground-pier-boundary.json').read_bytes()).hexdigest(),
      'sources':c['sources'],'LfootprintEach_m2':areas,'solidPlateMassEach_kg':[x*.020*t['metalDensity'] for x in areas],
      'solidPlateTotal_kg':a*.020*t['metalDensity'],'massExcludes':'Opposed anchors, edge returns, welds, whole-floor air system and fabrication waste',
      'windowReserveAfterEndFlange_mm':reserve,
      'floorTopSteelSeparationScreen_mm':r['floorSteelTopCoverGuard']-r['embeddedFoot']['depthBelowRCTop'],
      'mineralPlasterRemainingAfterSheetAndKey_mm':r['retainedPlasterTotal']-r['sheet']-r['keyStandOff'],
      'actualSTRLegActions':{'V_kN':s['wind']['perLegV'],'M_kNm':s['wind']['perLegM']},'spliceDomain':sp['governingCard'],
      'thermalSensitivity':{'allFourDirectRoutes_W_per_K':direct_g,'sameArea100GlassThoughtComparator_W_per_K':glass_g,
        'difference_W_per_K':direct_g-glass_g,'scenario20KDifference_W':(direct_g-glass_g)*t['scenarioDeltaT'],
        'scenario2500KdaysDifference_kWh':(direct_g-glass_g)*t['scenarioDegreeDays']*24/1000,
        'boundary':t['method'],'actualSurfaceTemperature_C':None,'wholeHouseEnergyResult':None},
      'falsifiedCapillaryPath':c['preferredConditionalRoute']['falsifiedPath'],
      'activeInternalHolds':['Upper-plate-only floor route withdrawn; resolve every ground-support capillary source or a real separate field boundary','STR opposed anchor/plate force path and local weld/cover schedule','Actual mineral-DPC/plate edge and keyed plaster/metal air termination with movement allowance','Concrete floor construction-joint/crack and repair design plus explicit whole-house leakage budget','Source-bound 3D thermal surface/condensation and actual whole-floor energy model','Full-pan support/seam/expansion/penetration design only if its conditional need is established'],
      'admission':c['admission']}
    # Finite source-derived plan and section; no hand-edited result graphics.
    pts=' '.join(f'{70+(x-200)*.25:.2f},{420-(y-200)*.25:.2f}' for x,y in sw)
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><style>text{{font:16px sans-serif;fill:#20323b}} .small{{font-size:13px}} .rc{{fill:#c4ccd0;stroke:#475b65}} .metal{{fill:#b66a39;stroke:#85451c}} .line{{fill:none;stroke:#b66a39;stroke-width:4}}</style><rect width="1200" height="720" fill="#faf9f4"/><text x="35" y="35" font-size="24">Proposed direct RC pier / solid capillary splice — local comparison</text><text x="35" y="62" class="small">Immutable STR {c['sources']['STR']['commit'][:8]}; geometry/arithmetic only. No selected rewind or air/gas/thermal/material admission.</text><text x="45" y="105">SW pier plan — exact source L</text><polygon points="{pts}" class="rc"/><text x="55" y="425">1000 mm physical legs × 140 mm core</text><text x="55" y="450">20 mm solid plate follows full L</text><text x="55" y="475">{reserve:.1f} mm to raw window after 10 mm end return</text><text x="55" y="500">Four plates: {result['solidPlateTotal_kg']:.2f} kg before anchors/returns</text>
<text x="550" y="105">Local floor / pier section — not to scale</text><rect x="570" y="130" width="145" height="288" class="rc"/><rect x="570" y="418" width="145" height="12" class="metal"/><rect x="570" y="430" width="145" height="78" class="rc"/><rect x="570" y="508" width="550" height="120" class="rc"/><rect x="715" y="400" width="27" height="108" fill="#d5dcbd"/><rect x="715" y="130" width="27" height="270" fill="#e4dfd5"/><rect x="742" y="448" width="378" height="60" fill="#d5dcbd" stroke="#708348"/><rect x="742" y="409" width="378" height="39" fill="#e2d9c7" stroke="#9e876a"/><rect x="742" y="400" width="378" height="9" fill="#c6b69e"/><path d="M715 430 V517 H815 M715 418 V310" class="line"/><text x="840" y="160">RC upper pier</text><text x="840" y="190">Opposed anchors attach to plate faces</text><text x="840" y="220">No continuous through-bar hole</text><text x="840" y="250">Dry-side mineral plaster lap to +150</text><text x="760" y="395">Plate −50..−30 mm</text><text x="760" y="375">FFL 0; finish 15 / distribution 65</text><text x="760" y="485">Glass 100; RC top −180</text><text x="760" y="550">Cast-in folded return at −195</text><text x="760" y="580">RC 200 remains −180..−380</text><path d="M600 664 V615 H1090" fill="none" stroke="#b32e28" stroke-width="4"/><path d="M1080 608 L1090 615 L1080 622" fill="none" stroke="#b32e28" stroke-width="3"/><text x="50" y="650" class="small" fill="#b32e28">WITHDRAWN as a complete floor boundary: ground → pile → lower grid → RC field remains below upper cut.</text><text x="35" y="690" class="small">Strip/RC bond, plaster air closure, cracking, movement, weld/corrosion and inspection are explicit holds. Diagram line is not a qualified seal.</text></svg>'''
    return {'current-ground-pier-boundary.results.json':json.dumps(result,indent=2)+'\n','current-ground-pier-boundary.svg':svg+'\n'}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    for name,text in produce().items():
      p=HERE/name
      if args.check:assert p.exists() and p.read_text()==text,f'Stale output: {name}'
      else:p.write_text(text)
    print('MAT ground/pier local source, geometry and sensitivity checks PASS; assembly admissions remain false.')
if __name__=='__main__':main()
