"""Recover the actual cut first-floor membrane after condensed 3D solution."""
from pathlib import Path
import runpy,math,json,sys
D=Path(__file__).resolve().parent;p=runpy.run_path(str(D/'current-house-roof-bracing.py'));m=p['membrane'];rows=[];G=200000*(2*math.pi*12**2/4*1000/150)/200000
for i,(c,u,_,spr,_) in enumerate(p['space']):
    ub=u[-8:];dis,req,crit,chord,weakM=m['recover'](ub,p['floorLoadCases'][id(u)])
    v=math.hypot(ub[0]-ub[6],ub[1]-ub[7]);rxb=max(ub[::2])-min(ub[::2]);ryb=max(ub[1::2])-min(ub[1::2])
    # Residual force at EACH real RC L pier: recovered finite membrane plus
    # external wind load and mixed floor/roof spring reaction must balance.
    f=[0.]*m['n']
    for (loc,j),val in p['floorLoadCases'][id(u)].items():
        for k,t in m['basis'](loc,j):f[k]+=val*t
    errs=[]
    for j,ix in enumerate(m['fixed']):
        axes=[2*m['ids'][q]+j%2 for q in m['patches'][m['corner'][j//2]]]
        actual=sum(sum(a*b for a,b in zip(m['K'][k],dis))-f[k] for k in axes)
        target=-spr[m['corner'][j//2]][j%2];errs.append(abs(actual-target))
    assert max(errs)<.05,(max(errs),i)
    rows.append({'wind':i,'chain_NxPlusAbsNxy_NyPlusAbsNxy_absNxy':req,'cornerRangeDisplacementXY':[rxb,ryb],'criticalElementPoints':crit,'maximumWeakAxisBeamMomentKNm':weakM,'maximumDedicatedEdgeChordKN':chord,'recoveredErrN':max(errs),'sumFloorEdgeLoadKN':[sum(v for (loc,ax),v in p['floorLoadCases'][id(u)].items() if ax==j)/1000 for j in (0,1)]})
mx=[max(r['chain_NxPlusAbsNxy_NyPlusAbsNxy_absNxy'][i] for r in rows) for i in range(3)]
As=2*math.pi*12**2/4*1000/150;AsOld=math.pi*12**2/4*1000/150;R=As*500/1.15/1000
area=sum(t[-1] for t in m['els'])/1e6
# Historic one-way bending sections credit 754 mm²/m. Additional orthogonal
# and top mesh is a real price: never turn that previous number into two
# faces in two directions without recording mass / interference / openings.
nom=4*AsOld*7850/1e6*area;one=AsOld*7850/1e6*area
out={'role':'Candidate first-floor RC200 diaphragm with actual voids. Arithmetic N/mm = kN/m; no site/cage selection.','geometry':{'outerAxes':[m['A'],m['A'],m['B'],m['B']],'holesXY':m['holes'],'areaM2':area,'triangles':len(m['els']),'floorCornerPoints':m['corner']},'stiffness':{'normalMPa':1200,'Poisson':.15,'shearMPa':440,'nominalSteelOnlyModulus':G,'source':'E_s=200 GPa and two H12/150 layers per direction gives a 1508 MPa axial stiffness comparator. 1200/440 MPa is an authored cracked membrane, not a tested shear law. Actual continuity and concrete diagonal compression must exist. No stiffness from glazing, floor finish, roof deck or disappearing wall.'},'maximumMembraneDemands_kN_per_m':mx,'newMesh':'H12/150 top and bottom each direction. Compare at most HALF the net steel resistance in each direction for membrane tension, leaving the original one-face 754 mm²/m available for the one-way bending reference. Recheck combined local bending/edge transfer at each hole, stair and bearing.','reservedTensionResistanceHalfKNperM':R/2,'grossFullMeshKg':nom,'additionalOverOneContinuousDirectionalLayerKg':nom-one,'meshExtent':'Radius corners/overlaps and 400-square wet well included; exact local trimmer steel, laps, fire/screed/ports and cage sequencing not included. Complete floor frame and local L-node forces remain separate.','cases':rows,'limits':'The finite model spreads each pier reaction over BOTH actual L legs and leaves local yaw unrestrained. The earlier one-point corner is a mesh singularity, not a building detail. Actual 1m L arms and 140mm edge beam must develop the forces, with sufficient bars developed into both arms and actual shear transfer across masonry/RC and any construction joint. Mesh density and crack response are development assumptions, not a guaranteed post-damage stiffness.','admitted':False}
chordR=m['chordA']*500/1.15/1000;maxChord=max(r['maximumDedicatedEdgeChordKN'] for r in rows)
maxWeak=max(r['maximumWeakAxisBeamMomentKNm'] for r in rows)
# Near the neutral plane of the overall vertical edge, reserve a separate
# 250 mm high concrete strip and four new H12 on each side. The main
# strong-axis compression block must not enter this band. Charge all the
# adverse chord force against the one tensile face and its moment reserve.
T=m['chordA']/2*500/1.15/1000;comp=T-maxChord;x=comp*1000/(.8*250*17)
d=140-40-8-6;weakR=comp*(d-.4*x)/1000-maxChord*abs(d-70)/1000
assert weakR>maxWeak and max(mx[:2])<R/2,(weakR,maxWeak,mx)
out.update(maximumWeakAxisMoment=maxWeak,weakAxisMRAfterChord=weakR,midheightIndependentlyReservedCompressionBandMM=250,dedicatedEightH12EdgeChordResistanceKN=chordR,dedicatedEdgeChordDemandKN=maxChord,fullFieldHalfSteelPass=max(mx[:2])<R/2,additional62mMidheightBarsKg=m['chordA']/1e6*62*7850)
assert maxChord<chordR,(maxChord,chordR)
if max(mx[:2])>=R/2:print('Residual edge/corner stress peaks',[(d,r['criticalElementPoints'][k]) for k in [0,1] for d in [mx[k]] for r in rows if r['chain_NxPlusAbsNxy_NyPlusAbsNxy_absNxy'][k]==d][:2])
dest=Path(__file__).with_suffix('.json');s=json.dumps(out,sort_keys=True,indent=2)+'\n'
if '--check' in sys.argv:assert dest.read_text()==s
else:dest.write_text(s)
print('First floor membrane kN/m and half-steel vs geometry m2',mx,R/2,area)
