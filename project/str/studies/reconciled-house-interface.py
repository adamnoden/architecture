"""Build SAP-C1 from the actual HAD, IAS, OAS, STR and roof source identities."""
from pathlib import Path
import hashlib
import json
import math
import sys

D=Path(__file__).resolve().parent
root=D.parents[2]
paths=[
 'project/had/studies/water-replan.json','project/str/studies/house-corner-rewind.json',
 'project/mat/studies/raised-roof-edge.json','project/oas/studies/north-export-occurrence.json',
 'project/ias/studies/bedroom4-wet-section.json','project/ias/studies/wc-service-stations.py',
 'project/str/studies/current-house-guard-bracket.json','project/str/studies/current-house-window-renewal.json',
 'project/str/studies/reconciled-corner-portals.json','project/str/studies/current-house-grid.json',
 'project/str/studies/p32-court-hold.json','project/mat/studies/study-coupled-window.json',
 'project/str/studies/current-house-roof-route.json','project/str/studies/current-house-floor-closure.json']
def git_blob(path):
    b=(root/path).read_bytes()
    return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def read(i):return json.loads((root/paths[i]).read_text())
h=read(0)['model'];rw=read(1);roof=read(2);job=read(8)
axes=job['jambAxes']
assert axes==[1497.5,2702.5] and len(rw['changes'])==16
# Four continuous H12 leave distinct lanes for the four returning H16 head
# bars. The socket crosspin is vertical, with adjacent hoops above and below.
bar_x=32.; bar_r=6.; sleeve_r=13.
q_bars=[260.5,364.5]
cast_clear=bar_x-bar_r-8.5
sleeve_clear=bar_x-bar_r-sleeve_r
link_levels=[z+d for z in [950,1270,1980,2120] for d in [-45,45]]
hoop_clear=min(abs(z-h)-3-(30 if z<1500 else sleeve_r)
               for z in [950,1270,1980,2120] for h in link_levels)
assert min(cast_clear,sleeve_clear,hoop_clear)>10
radius=1000**2/(8*300)+150
sin_th=500/radius
cos_th=math.sqrt(1-sin_th**2)
legs=[]
for face_r in (radius+49,radius+215-49):
    spring_x=2100-face_r*sin_th
    leg_x=spring_x-80*(1-sin_th)
    leg_z=2850-radius+face_r*cos_th-80*cos_th
    legs.append({'springX':spring_x,'verticalX':leg_x,'verticalTopZLocal':leg_z,
                 'straightTailBottomZLocal':leg_z-600})
# During the approach to the spring the arc can pass the continuous jamb bars
# at the same x. The independent normal lanes alone give the minimum spacing.
q_arch=[293.5,331.5]
clear=min(abs(a-b) for a in q_bars for b in q_arch)-6-8
assert clear>=19 and min(q_arch[1]-q_arch[0]-16,clear)>=19
assert min(v['verticalX']-1395-8 for v in legs)>40
warm_core=402.5
# Distinct axial withdrawal for temporary sockets inside. Upper guard shaft
# access through backing plate is outside the jamb-to-partition T return.
far_receiver_edge=axes[1]+40
tee_clear=2805.5-far_receiver_edge
bay=rw['windowBarrier']
assert tee_clear==63 and bay['westCabinetGap']==297.5
box=h['upperFurniture']['rear-west-low-box']
assert box==[429.5,9937.5,150,862.5]
vents=roof['fieldVentRoutes'];length=vents['diagonalComparisons']['eaveToCutSlopingLengthMm']
diagonal_area=vents['cornerHeaderTrial']['oneOuterFaceCornerDemandMm2']
# Allow closure plates and supports to consume 20% of length in addition to
# the MAT 50% mesh. Each independent uphill/downhill path owns its own opening.
net=40*.5*.8*length
assert net>diagonal_area
# Continuous above-breather cap section on all ridges. Two guarded cap-side
# inlets/notched vertical louvres feed both independent cap halves below the
# covering; twin higher outlets discharge under a separate weather hood.
hood_lip=roof['hoodLipAboveField']
jamb=job['results']
floor_force=max(abs(n) for r in jamb for n in r['bounds']['floorTieKN'])
roof_force=max(abs(n) for r in jamb for n in r['bounds']['roofTieKN'])
gap_change=max(abs(n) for r in jamb for n in r['bounds']['roughOpeningTangentialChangeMM'])
normal_change=max(abs(n) for r in jamb for n in r['bounds']['facePlaneDepartureMM'])
assert floor_force<8 and roof_force<3 and gap_change<1.5 and normal_change<1.5
data={'candidate':'SAP-C1','acceptedHouse':'RH-LAYOUT-REVISION-02',
      'inputMain':'d59be85e5aa06bfd3ec8abd26439ec1280025acf',
      'sourceGitBlobs':{p:git_blob(p) for p in paths},
      'architecturalBranch':'HAD-WATER-REPLAN, opening and pitched-roof rewind as listed',
      'adopted':False,'openingEdits':[{k:r[k] for k in ['level','side','id','old','new','sill','head']} for r in rw['changes']],
      'principalBed':rw['principal'],'kitchen':rw['kitchen'],
      'jambAndTies':{'widthNormalAlong':[180,205],'axes':axes,'bearingZ':job['supportZ'],
                      'ordinaryWallCoreQ':[262.5,402.5],'portalCoreQ':[222.5,402.5],
                      'glassAndVentilatedCavity':[70,50],'continuousJambH12X':[-bar_x,bar_x],'continuousJambH12Q':q_bars,
                      'archH16Q':q_arch,'tangentBendCentrelineRadius':80,'archReturningLegs':legs,
                      'archToJambLongitudinalClearLowerMm':clear,
                      'nominalSocketODToJambBarClear':cast_clear,'nominalSleeveToJambBarClear':sleeve_clear,
                      'formedHoopToSleeveOrSocketAfterTwo5':hoop_clear-10,
                      'wetTeeBackingPlateEdgeClear':tee_clear,'westBox':box,'westBoxHeightLimit':170,
                      'panelBottomToBoxTop':730-170,'lowSocketCentreToBoxTop':950-170,
                      'symmetricTieQualificationKN':[8,3],'minimumTieStiffnessNPerMm':2000,
                      'elasticTieSlipAtPeak':[floor_force/2,roof_force/2],
                      'jambRoughClosureOrOpeningMM':gap_change,'facePlaneDepartureMM':normal_change},
      'roof':{'structurallyPricedFirstPrototype':'Severe Capital slate over combined Sarket',
              'slateEnvelopeAndGravityReceipt':job['slateRoof'],
              'slateCourtOverhangMM':275,'slateDryIntakeMM':160,'slateTransferBandMM':1250,
              'leadRunoffAccepted':False,'courtIntakeOrP32SiteAdopted':False,
              'earlierMetalControlFieldZ':roof['trialWallLineAndFieldRidgeZ'],'earlierMetalCoverApexAndEdge':roof['trialRidgeCapApexAndEdgeZ'],
              'hipOutletAndValleyInletGrossPerFlankMM':40,'netPerFlankAfterMeshAndPostsMM2':net,
              'minimumPerFlankMM2':diagonal_area,'diagonalRunMm':length,'hoodLipAboveField':hood_lip},
      'houseExit':'Conditional candidate for joint design; no statutory, house-source, foundation-capacity or procurement authority.'}
out=json.dumps(data,indent=2)+'\n'
p=Path(__file__).with_suffix('.json')
if '--check' in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print('SAP-C1 binds sixteen openings, eight aligned portals and the raised roof to fourteen source blobs.')
