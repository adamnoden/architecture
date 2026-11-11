"""Conditional root-foot comparison using every frozen4eb frame reaction.

The six-M12 inventory did not specify a qualified bolt/contact layout. This
source authors one explicit layout to test, not an as-built recovered detail.
No prying, contact, weld, diaphragm or complete attachment pass is implied.
Generate the full source frame receipt first; it is deliberately not duplicated
in this repository. The source/receipt hashes bind this historical comparison.
"""
from pathlib import Path
import json, math, hashlib, argparse

D=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("--input",type=Path,default=D/"roof_water_inner_candidate.json")
parser.add_argument("--output",type=Path,default=D/"roof_water_inner_foot_connection.json")
parser.add_argument("--check",action="store_true")
args=parser.parse_args()

source=args.input
d=json.loads(source.read_text())
assert hashlib.sha256(source.read_bytes()).hexdigest()=='794a10be57dd9eed717d17ebe0641dc5c29959c9824527dbc70d62680686da96'
assert hashlib.sha256((D/'roof_water_inner_candidate.py').read_bytes()).hexdigest()==d['candidateSourceSHA256']
assert d['candidateSourceSHA256']=='4eb505e4349b1af1eaa98c96b0aa7174a8b6e3c4210628a969cc10c8252e7eba'
bolts=[(p,q) for p in (-50.,50.) for q in (-40.,0.,40.)]
sp=sum(p*p for p,q in bolts);sq=sum(q*q for p,q in bolts);polar=sp+sq
# Nominal3mm full-penetration end seam on the RHS wall midline. This is
# a different authored joint from a3mm-leg fillet, whose throat is smaller.
wa,wb,wt=57.,117.,3.
wA=2*wt*(wa+wb)
wIp=wt*(wa*wb*wb/2+wb**3/6)
wIq=wt*(wb*wa*wa/2+wa**3/6)
wJ=wIp+wIq
all_rows=[]
for family,f in d['families'].items():
 for assembly in f['cassettes']:
  controls={};ranges=[[math.inf,-math.inf] for _ in range(6)]
  for index,s in enumerate(assembly['scenarios']):
   rr=s['equilibrium']['fixedReactions'];assert len(rr)==1
   point=rr[0]['point'];rp,rq,rz,rmp,rmq,rmz=rr[0]['reaction'];dz=point[2]-6660
   fp,fq,fz=-rp,-rq,-rz
   mp,mq,mz=-rmp-dz*fq,-rmq+dz*fp,-rmz
   action=[fp,fq,fz,mp,mq,mz]
   for j,v in enumerate(action):ranges[j]=[min(ranges[j][0],v),max(ranges[j][1],v)]
   for wp in (-wa/2,wa/2):
    for wq in (-wb/2,wb/2):
     normal=fz/wA+mp*wq/wIp-mq*wp/wIq
     shear_p=fp/wA-mz*wq/wJ
     shear_q=fq/wA+mz*wp/wJ
     # Match the owning heel's vector-magnitude weld comparison; also retain
     # a separate von-Mises material screen. Neither proves weld procedure.
     values={'fullPenetration3WeldEquivalentMPa':math.sqrt(normal**2+shear_p**2+shear_q**2),
       'fullPenetration3VonMisesMPa':math.sqrt(normal**2+3*(shear_p**2+shear_q**2))}
     for key,v in values.items():
      if key not in controls or v>controls[key]['value']:
       controls[key]={'value':v,'case':index,'weldPQ':(wp,wq),'actionNAndNMM':action,
         'water':s['waterDepthByStation'],'wind':s['windSigns'],'gravity':s['gravityFactor']}
   for j,(p,q) in enumerate(bolts):
    # Retain actual simultaneous moments, but omit favourable direct compression.
    tension=max(0.,max(0.,fz)/6+mp*q/sq-mq*p/sp)
    shear=math.hypot(fp/6-mz*q/polar,fq/6+mz*p/polar)
    values={'boltTensionKN':tension/1000,'boltShearKN':shear/1000,
      'boltThreadVonMisesMPa':math.hypot(tension/84.3,math.sqrt(3)*shear/84.3)}
    for t in (8.,12.,16.,20.):
     values[f'foot{t:g}StripStressMPa']=tension*20/(40*t*t/6)
    #25mm collector cap to a central transverse diaphragm, no force-spread credit.
    values['cap25ToCentralWebStripStressMPa']=tension*abs(p)/(40*25**2/6)
    for key,v in values.items():
     if key not in controls or v>controls[key]['value']:
      controls[key]={'value':v,'case':index,'bolt':j,'boltPQ':(p,q),'actionNAndNMM':action,
        'water':s['waterDepthByStation'],'wind':s['windSigns'],'gravity':s['gravityFactor']}
  all_rows.append({'family':family,'rootP':assembly['root'],'cases':len(assembly['scenarios']),
    'ranges':ranges,'controls':controls})
out={'status':'UNSELECTED FOOTPLATE STRIP/BOLT-GROUP COMPARISON; attachment and actual contact remain unproved',
 'sourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 'fullFrameSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'nativeCollectorSource':{'path':'project/str/studies/current-house-welded-heel.py',
   'sha256':hashlib.sha256((D.parents[1]/'str/studies/current-house-welded-heel.py').read_bytes()).hexdigest(),
   'collectorStressBudgetMPa':200/1.1,'effectiveWeldThroatStressBudgetMPa':100},
 'frameSourceSHA256':d['candidateSourceSHA256'],'boltsPQMM':bolts,
 'geometry':{'platePQMM':[140,130],'stubSectionPQMM':[60,120],'boltHoleMM':14,
   'minimumPlateEdgeToHoleCentreMM':20,'stubToBoltCentreMM':20,'assumedNonOverlappingStripWidthMM':40,
   'footStripCantileverMM':20,'collectorBottomOfFootZ':6660},
 'rows':all_rows,
 'massComparisonKG':{'old160x120x8Foot':.16*.12*.008*8000,'new140x130x20Foot':.14*.13*.020*8000,
   'new230x70x10InternalDiaphragm':.23*.07*.010*7850,
   'new230x70x16InternalDiaphragm':.23*.07*.016*7850,
   'twoSided6ThroatWeldAround230x70':2*2*(.23+.07)*.000036*7850},
 'directWeldedStubAlternative':{
   'status':'TOPOLOGY OPTION ONLY; no substitute attachment pass',
   'ordinaryScope':'Wet body and carrier release atq4335; root stems, rails, hangers and socket stubs remain. A permanently welded root is compatible with this removal scope.',
   'distinctStubSectionPQMM':[60,120], 'nominalInterStubRadialGapMM':15,
   'conditionalFullPenetrationSeam':{'effectiveThicknessMM':wt,'wallMidlinePQMM':[wa,wb],
     'lineAreaMM2':wA,'IpMM4':wIp,'IqMM4':wIq,
     'equivalentStressComparisonMPa':100,'parentMaterialVonMisesComparisonMPa':150,
     'scope':'The nominal3mm full-penetration end seam is a new joint requirement, not a3mm-leg fillet or a qualified welding procedure. These frozen loads include the old foot/bolt stock and do not regenerate the longer stem or new web/weld stock.'},
   'requiredJoins':['Both weld toes and setting allowances must fit the15mm gap.',
     'Collector-cap local bending, matching internal webs and complete closed-box force introduction.',
     'Real receiver material and welding procedure; the collector uses200/1.1, not the M24 shaft355/1.1.',
     'New stem length if the8mm foot is removed, plus actual weld/web mass and wind.',
     'Rail/apron replacement above the permanent stub and eventual roof-root replacement remain separate duties.'],
   'materialEvidence':{
     'url':'https://bssa.org.uk/bssa_articles/welding-stainless-steels-to-other-steels/',
     'scope':'Conditional evidence only: the collector project stress budget does not identify its actual alloy. If a carbon-steel collector is later specified, primary industry guidance establishes that stainless-to-carbon fusion welding is practicable with an appropriate over-alloyed consumable, and identifies dilution, thermal-cycle and corrosion duties. It does not qualify this joint or approve a polymer coating.'}},
 'unproved':['New plate and diaphragm are physical candidate geometry, not existing fabrication.',
   'The140x130foot gives5mm nominal gap between primary/lower root footprints; weld-edge, settings and actual wrench clearance remain unproved.',
   'A central diaphragm does not automatically provide the assumed40mm plate strips or full bearing; cap, weld, sidewall and closed-section force introduction require a compatible model.',
   'Elastic bolt-group load splitting and compression contact are comparisons; plate prying, joint slip, fatigue, thread/nut/washers and hot-state material remain unqualified.',
   'The frozen4eb reactions omit the later apron-rib/standoff return and newly found roof-lap/baffle rows.',
   'Raising the foot thickness changes stem height/stack and bolt length. New mass must fit each cassette cap and centroid; it is not free roof counterweight.']}
text=json.dumps(out,indent=2)+'\n'
if args.check:
 assert args.output.read_text()==text, 'Receipt differs from source reproduction'
else:
 args.output.write_text(text)
print(json.dumps({'maxima':{k:max(r['controls'][k]['value'] for r in all_rows) for k in all_rows[0]['controls']},'mass':out['massComparisonKG']},indent=2))
