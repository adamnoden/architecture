#!/usr/bin/env python3
"""Joined native power/acoustics and complete port/package falsifiers; no selection."""
import hashlib,html,json,math,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
BASE=pathlib.Path(__file__).with_suffix('')
p=BASE.with_name('w9-operating-point-sources.json');raw=p.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='905540efb7c58329e2c3e5709ba81e12ad36d1bfdd6a05901ec5fbe2d4b60aed'
sources=json.loads(raw);cases=sources['cases'];bands=sources['bandsHz']
# Standard octave A corrections applied to sound POWER, not room sound pressure.
A=[-26.2,-16.1,-8.6,-3.2,0,1.2,1,-1.1]
def total(levels):return 10*math.log10(sum(10**((x+a)/10) for x,a in zip(levels,A)))
assert bands==[63,125,250,500,1000,2000,4000,8000]
for c in cases:
 q=c['flowSupplyExtractLps'][0];dp=c['pressureSupplyExtractPa'][0]
 assert c['modelId']==42 and c['model']=='W9 Genius'
 assert c['flowSupplyExtractLps']==[q,q] and c['pressureSupplyExtractPa']==[dp,dp]
 assert c['returnedInputs']['flow_input']==c['returnedInputs']['flow_output']==q
 assert c['returnedInputs']['pressure_input']==c['returnedInputs']['pressure_output']==dp
 assert c['withinAreaLimits'] is True
 assert abs(sum(c['fanPowerW'])/q-c['nativeSFPkWPerM3s'])<=.011
 for d in c['octaveSoundPower'].values():
  assert len(d['unweightedDB'])==8
  # Both octave entries and native total are independently integer-rounded.
  assert abs(total(d['unweightedDB'])-d['nativeLwaDBA'])<=1.01
normal,cooking,high=cases
assert [(c['flowSupplyExtractLps'][0],c['pressureSupplyExtractPa'][0]) for c in cases]==[(96,200),(128,200),(128,300)]
# One native matched package, not an unpriced generic silencer or dBA subtraction.
attenuation=[7,13,20,28,40,45,27,20]
silencer={'part':'Swegon CLA-A200-1000','source':'https://www.swegon.com/globalassets/digizuite/6923-en-cla-a_productsheet_en.pdf',
 'edition':'2025-02-10,pp2..4','nativePDFSHA256':'1a7d1af965e719689093d8814b9226613a84b54acd42afb4774fd5943c2b73da',
 'bodyLWHMM':[1000,321,252],'eachSpigotProjectionMM':45,'completeAxialBoundMM':1090,'massKg':11.2,'warmMainComparisonCount':2,'twoPackageMassKg':22.4,
 'staticIntegralAttenuationDB':attenuation,'testDomain':'ISO7235 static integral attenuation; native uniform inlet/outlet flow. Nearby elbows/dampers increase pressure/flow noise and alter attenuation. No field installation qualification.',
 'uniformFlowChartPressureReadPa':{'96Lps':[1,3],'128Lps':[2,5]},
 'chartRole':'Wide visual reads of native p3 Diagram1,not exact coefficients or installed losses; no extra fitting-generated sound data supplied.',
 'constituents':'Galvanised steel,50mm mineral wool,special polyester fabric and rubber seals retained. No mineral/all-metal or blanket polymer exception claim; supplied BOM and intact replacement remain open.',
 'supportAndRenewal':'Independently supported full1090x321x252 body plus coupling/hanger/tool/person/withdrawal fields. Native fire safety distances are conditional test domains,not a stair boundary penetration assembly.'}
propagation=[]
for c in cases:
 l=c['octaveSoundPower']['supply']['unweightedDB'];residual=[x-a for x,a in zip(l,attenuation)]
 propagation.append({'flowLps':c['flowSupplyExtractLps'][0],'trialPressurePa':c['pressureSupplyExtractPa'][0],
  'nativeSupplyLwaDBA':c['octaveSoundPower']['supply']['nativeLwaDBA'],'reconstructedSupplyLwaDBA':total(l),
  'staticOnlySupplyResidualOctavesDB':residual,'staticOnlyResidualLwaDBA':total(residual),
  'unaffectedCasingLwaDBA':c['octaveSoundPower']['casing']['nativeLwaDBA'],
  'scope':'Only source sound power minus native static octave attenuation,energetically summed after A corrections. No regenerated noise,breakout,branches,terminals,cross-talk,room absorption/directivity or room sound-pressure pass.'})
assert all(x['staticOnlyResidualLwaDBA']<x['nativeSupplyLwaDBA'] for x in propagation)
# Native current W9 layout. R hand maps warm supply/extract to left two ports;
# L mirrors the domains. Pair spacings and collisions are invariant to mirroring.
ports=[{'domain':d,'centreMM':[x,y],'trialFullODMM':200+2*t+4} for d,x,y,t in
 [('supply',159,291,25),('extract',379,162,25),('outdoor',621,162,50),('exhaust',841,291,50)]]
pairs=[]
for i,a in enumerate(ports):
 for b in ports[i+1:]:
  distance=math.dist(a['centreMM'],b['centreMM']);gap=distance-(a['trialFullODMM']+b['trialFullODMM'])/2
  pairs.append({'domains':[a['domain'],b['domain']],'centreDistanceMM':distance,'fullJacketGapMM':gap})
assert next(x for x in pairs if x['domains']==['outdoor','exhaust'])['fullJacketGapMM']< -48
assert next(x for x in pairs if x['domains']==['extract','outdoor'])['fullJacketGapMM']==-37
assert next(x for x in pairs if x['domains']==['supply','extract'])['fullJacketGapMM']>1
h=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']['internalArchControls']
assert h['spine']['rawSpan']==900 and h['actualRadialFinish']==27 and h['spine']['fullPacketPlanY']==[3040,3360]
arch_max=h['spine']['rawSpan']-2*h['actualRadialFinish'];packet_width=h['spine']['fullPacketPlanY'][1]-h['spine']['fullPacketPlanY'][0]
replacement_width=2*silencer['bodyLWHMM'][1]+packet_width
assert replacement_width>arch_max
# The inherited hood screen is an AUTHOR resistance comparator,not a native
# pressure curve. Preserve that role rather than turn residual budget into proof.
b=json.loads(BASE.with_name('balanced-service-architecture.json').read_text())
hood=b['hoodBranchPressureScreen']['commonBoostCookingBranchPressurePa']
budget=[{'nativeTrialPressurePa':dp,'afterAuthoredHoodComparatorPa':dp-hood,
 'afterOneUniformFlowSilencerVisualReadPa':[dp-hood-5,dp-hood-2],
 'scope':'Arithmetic remainder only for actual mains/fittings/terminals and incremental dirty-filter allowance. Filter reference/rating condition must be established and each loss charged once; networks of parallel branches are not summed end-to-end.'} for dp in [200,300]]
result={'status':'W9 whole-system development comparison; no selected apparatus/route/handling/material admission',
 'decision':'Keep W9direct96/128 leading but reserve attenuation before the constrained crossing and develop complete diverging/thermally qualified port connections. Native area=true does not select pressure or resolve renewal. Do not install two independent full jackets at native port centres or substitute two321wide silencers for the214wide flanking crossings.',
 'sourceExtractSHA256':hashlib.sha256(raw).hexdigest(),'nativeCases':cases,'excludedSourceDomains':sources['excluded'],
 'pressurePrice':{'additionalPressureEachStreamPa':100,'at128LpsAdditionalFanW':sum(high['fanPowerW'])-sum(cooking['fanPowerW']),
 'additionalSupplyNativeLwaDB':high['octaveSoundPower']['supply']['nativeLwaDBA']-cooking['octaveSoundPower']['supply']['nativeLwaDBA'],
 'additionalCasingNativeLwaDB':high['octaveSoundPower']['casing']['nativeLwaDBA']-cooking['octaveSoundPower']['casing']['nativeLwaDBA'],
 'role':'Pressure sensitivity points,not measured clean/dirty states or a new pressure target; nameplate960W remains connected fan capacity,not these operating watts.'},
 'silencer':silencer,'staticSupplyPropagation':propagation,'pressureBudgetComparators':budget,
 'nativePortTrial':{'source':'W9 Genius2026-09-17cataloguep11 / IOMp26','catalogueSHA256':'92d83185c75ab0d87d0a482c71f4df75b140d591474a95eaf3608def285d3bcd',
 'nativePlanMM':[1000,597],'hand':'R; L mirrored','ports':ports,'pairs':pairs,
 'allowanceRole':'Authored25warm/50cold mineral layer plus4total steel-jacket allowance follows prior full-envelope comparison. Not native minimum thickness,thermal/acoustic qualification or installed solution. Bare300cold/250warm already collide; full jackets worsen the false fit.',
 'next':'Develop offset/diverging fittings or explicit contiguous insulation/jacket construction with condensation/acoustic calculation,independent support,real couplings and fully reversible unit withdrawal. Do not omit cold vapour tightness or supply acoustic insulation; native IOMp12 requires both. A geometric overlap is not resolved by pretending insulation is optional.'},
 'constrainedCrossing':{'maximumFinishedSpanMM':arch_max,'retainedWarmPacketWidthMM':packet_width,'twoSilencersPlusPacketMM':replacement_width,'necessaryWidthDeficitMM':replacement_width-arch_max,
 'scope':'Negative control for substituting both packages into the existing same-band flanking arrangement; not proof that every alternative arch position fails. Keep actual head/curve/firestop/renewal duties.'},
 'nextDecisiveSystemWork':['Bind actual full supply/extract path losses and native filter reference/dirty increment against these sourced operating points; then preserve both modes/noise/pressure control.',
 'Locate whole independently supported attenuation/duct/coil/port packages and actual withdrawal fields; no inaccessible concealed mineral/package claim.',
 'Earn actual supported bottom-lift/base-to-deck loading,component masses and release; native mechanical instruction is not the completed method.',
 'Complete native winter/defrost/emitter/source and exact installed/replacement constituent decision. Existing S01..S10 and limited SUPPLY BOOST response unchanged.']}
assert result['pressurePrice']['at128LpsAdditionalFanW']==77
out=BASE.with_suffix('.json');data=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1080" viewBox="0 0 1200 1080">','<rect width="1200" height="1080" fill="#fbfaf5"/>','<style>text{font-family:Arial,sans-serif;font-size:16px;fill:#202a31}.h{font-size:24px;font-weight:700}.b{font-weight:700}.s{font-size:13px}</style>']
def text(x,y,v,cls=''):svg.append(f'<text x="{x}" y="{y}" class="{cls}">{html.escape(str(v))}</text>')
text(32,40,'W9 joined operating-point / attenuation / port comparison','h');text(32,69,'UNSELECTED · native model42 / 6 Nov2026 captures · no actual network, room sound, winter or renewal acceptance','s')
text(32,112,'Exact native pressure sensitivity','h')
for x,v in [(32,'Supply / extract'),(280,'Pressure each'),(465,'Fans total'),(645,'SFP'),(810,'Supply LwA'),(1000,'Casing LwA')]:text(x,148,v,'b')
for y,c in zip([182,214,246],cases):
 q=c['flowSupplyExtractLps'][0];pa=c['pressureSupplyExtractPa'][0]
 for x,v in [(32,f'{q} / {q} L/s'),(280,f'{pa} Pa'),(465,f'{sum(c["fanPowerW"])} W'),(645,c['nativeSFPkWPerM3s']),(810,f'{c["octaveSoundPower"]["supply"]["nativeLwaDBA"]} dB(A)'),(1000,f'{c["octaveSoundPower"]["casing"]["nativeLwaDBA"]} dB(A)')]:text(x,y,v)
text(32,280,'+100 Pa at128/128 adds77 W, +5 dB supply / +3 dB casing. Area=true is an operating-envelope check, not a house result.','s')
text(32,324,'One real attenuation package; keep its physical and material price','h')
text(32,358,'CLA-A200-1000: 1090 complete axial bound ×321 wide ×252 high;11.2 kg each (22.4 kg pair), plus supports and couplings.')
for y,c,r in zip([390,420,450],cases,propagation):text(32,y,f'{c["flowSupplyExtractLps"][0]} L/s / {c["pressureSupplyExtractPa"][0]} Pa: native supply {r["nativeSupplyLwaDBA"]} → static-only residual {r["staticOnlyResidualLwaDBA"]:.1f} dB(A) Lw; casing {r["unaffectedCasingLwaDBA"]} unchanged.')
text(32,480,'Steel + mineral wool + polyester + rubber retained. Octave subtraction then energetic A sum; no flow noise or room-pressure pass.','s')
text(32,506,'Native uniform-flow pressure chart ≈1–3 Pa at96 /2–5 Pa at128; close elbows/dampers invalidate a blind uniform-flow allowance.','s')
text(32,553,'Actual four-port trial: full jackets collide','h')
scale=.53;ox,oy=40,605
svg.append(f'<rect x="{ox}" y="{oy}" width="{1000*scale}" height="{597*scale}" fill="#fff" stroke="#52616b"/>')
for port in ports:
 x,y=port['centreMM'];d=port['trialFullODMM'];color='#bedbe7' if port['domain'] in ['outdoor','exhaust'] else '#dce6c9'
 svg.append(f'<circle cx="{ox+x*scale}" cy="{oy+y*scale}" r="{d*scale/2}" fill="{color}" fill-opacity=".65" stroke="#52616b"/><circle cx="{ox+x*scale}" cy="{oy+y*scale}" r="{100*scale}" fill="none" stroke="#52616b"/>')
 text(ox+x*scale-29,oy+y*scale+5,port['domain'],'s')
text(635,605,'R-hand native ports; L mirrors the same spacings.','b')
text(635,638,'Full warm254 / cold304 mm authored envelopes.')
text(635,672,'Cold pair: 255.03 mm centres →48.97 mm overlap.')
text(635,706,'Inner warm/cold:242 mm centres →37 mm overlap.')
text(635,740,'50 mm cold is a trial, not an OEM minimum.')
text(635,774,'Offset / common insulation detail needs real thermal,')
text(635,804,'vapour, acoustic, support and withdrawal proof.')
text(635,846,'Same-band arch substitution also fails:','b')
text(635,877,f'2×321 +320 =962 >846 mm finished span.')
text(32,954,'Decision: develop W9 full network/attenuation and diverging port assembly; retain direct96/128, cooking recovery and visible-loss contract.','s')
text(32,982,'Keep attenuation outside that constrained flanking arrangement. Price clean/dirty losses once; no selected pressure, quiet-room or cart pass.','s')
text(32,1010,'Real source inputs + hashes retained. Default site climate/annual energy and a -4 dB surroundings comparison are not house assumptions.','s')
text(32,1040,'Next: actual supported bottom lift/base↔deck, exact components/ports, winter/emitter duties and intact installed/replacement constituents.','s')
svg.append('</svg>');sheet='\n'.join(svg)+'\n'
if '--check' in sys.argv:
 assert out.read_text()==data,'Stale w9-network-development.json'
 assert BASE.with_suffix('.svg').read_text()==sheet,'Stale w9-network-development.svg'
else:out.write_text(data);BASE.with_suffix('.svg').write_text(sheet)
print('PASS: source-bound model/inputs,fan-SFP,octave-energy and full-port/crossing negative controls; no network/room/renewal admission')
