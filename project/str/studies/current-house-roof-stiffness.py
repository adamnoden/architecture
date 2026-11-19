"""Challenge actual roof plan/vertical support and joint stiffness.
Uses finite steel/RC ranges rather than a perfect diaphragm or absolute
claim for shafts/walls. Not an independently selected geometry/source.
"""
from pathlib import Path
import json,math,runpy,sys
D=Path(__file__).resolve().parent;rr=runpy.run_path(str(D/'current-house-roof-route.py'),run_name='stiffness-consumer');p=rr['p']
meta={'nominal':(40000,40000,1.,1.),'allUpperRodsAndFloorCompliant':(10000,10000,.65,.6),'allCompressionBearings':(250000,250000,1.,1.),'outerRodCourtBearing':(10000,250000,.65,.6),'outerBearingCourtRod':(250000,10000,.65,.6),'oppositeHalfLifted':(10000,250000,.65,.6)}
rows=[]
for label,(lo,hi,rEI,ridgeK) in meta.items():
    ss={q:lo if (q[0]<6000 if label=='oppositeHalfLifted' else min(q)==p['A'] or max(q)==p['B']) else hi for q in p['upperSupports']}
    cases=p['space'] if label=='nominal' else p['state'](False,False,True,ss,rEI,ridgeK)+p['state'](False,True,True,ss,rEI,ridgeK)
    peak=rr['maxRidge'](cases);hc=[max(abs(w[1][p['vDO'](q,0)]*k/1000) for w in cases) for q,k in ss.items()]
    wd=max(math.hypot(u[p['dof'](q,0)],u[p['dof'](q,1)]) for _,u,*_ in cases for q in p['nodes'])
    # Difference in upper plane horizontal distance is the deforming part,
    # distinct from global building translation/rotation.
    dh=max(math.dist([u[p['dof'](q,j)] for j in range(2)],[u[p['dof'](r,j)] for j in range(2)]) for _,u,*_ in cases for q,r in p['radials'])
    rows.append({'variant':label,'springNPerMM':[lo,hi],'planRingEIRatio':rEI,'ridgeEndKRatio':ridgeK,'regionalRidge':peak,'baseRoofDriftMM':wd,'relativeInnerOuterAtRafters':dh,'maximumUpperSupportWindIncrementKN':max(hc),'radialRange':rr['signed'](cases,'radial'),'legRange':rr['signed'](cases,'leg')})
# Rare removed roof leaves these precise rings and the ridge row incomplete:
# the rigid corners/positive rods may not yet be relied on. No zero-brace
# construction or dismantling state has been inferred from a retained shell.
out={'status':'Sensitivity of high-roof wind delivery; not a full nonlinear soil/contact model or a temporary-works pass.','source':'E=200 GPa. Three metre M20 A4-80 threaded rod: 245 mm² at3.23 m gives15.17 kN/mm; M24 353 gives21.86; adding floor/joint flexibility can lower both. Solid bonded 140x140 C30 patch Ec=33 GPa over3.23m gives200.25 kN/mm before cracking. Actual measured/qualified support stiffness is not fixed at40.','ranges':'10 and 250 kN/mm bracket common rod/occupied floor versus largely compressed RC reference; vary mixed outer/court and half-plan activation, base-ring equivalent stiffness65% and finite ridge connection60%. Endpoint samples do not prove every mixed or cyclic contact. No favourable friction is used.','samples':rows,'temporary':'Do not remove the ridge purlin, twin rails, wall-head return, RC floor ring or its two rod anchors while crediting its diaphragm. Develop erection/stripping shores or temporary ties for that isolated element before unlocking it. No unpropped construction stage or roof-cover-only diaphragm admitted.','limits':'The first-floor membrane is finite on its actual three voids and optional 400-square well; crack/shear stiffness, reinforcement laps, local corner force transfer and floor penetrations are explicit qualifications. Crown saddles, top covers/roof build-up, actual wind map, floor-arm shear, continuous corner anchorage, base stiffness and soil remain separate. The nominal full-head ledger is one calibrated case, not the full envelope of all stiffness programmes.','admitted':False}
dest=Path(__file__).with_suffix('.json');s=json.dumps(out,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert dest.read_text()==s
else:dest.write_text(s)
print([(r['variant'],round(r['maximumUpperSupportWindIncrementKN'],2),round(r['baseRoofDriftMM'],2),round(r['regionalRidge']['normal'][0],1)) for r in rows])
