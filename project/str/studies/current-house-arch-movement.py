"""Two skewbacks, a permanently tied inner brick arch, a real slide and the lost opening."""
from pathlib import Path
import math,json,sys
from itertools import product
D=Path(__file__).resolve().parent;h=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model'];oas=json.loads((D.parents[1]/'oas/studies/north-export-occurrence.json').read_text())
s=h['openings']['FIRST'][0];assert(s['centre'],s['width'],s['spring'],s['head'])==(1800,1000,2550,2850)
Ri=1000**2/(8*300)+150;Ro=Ri+215;R=(Ri+Ro)/2;cz=2850-Ri;ang=math.asin(500/Ri)
x0=1800-R*math.sin(ang);x1=3600-x0;zs=cz+R*math.cos(ang);zc=cz+R;L=x1-x0;rise=zc-zs
toe=1262.5;normalWidth=140;zt=2510;Hmax=Vmax=emax=bearingmax=0.;results=[]
for floorLine,leftlive,rightlive in product([0,22],[0,7],[0,7]):
    # Finished core density22kN/m³, RC200 floor edge delivered as a uniform
    # gravity envelope. Roof point seats are bypassed by the steel collector.
    # Ring mass allocated by equal angular grains, spandrel by projected width.
    # Loaded interval includes both spring cross sections.
    loads=[]
    for j in range(240):
        th=ang*(2*(j+.5)/240-1);x=1800+R*math.sin(th)
        ds=2*ang/240;dx=R*math.cos(th)*ds
        selfweight=(Ro**2-Ri**2)/2*ds*140*22/1e9
        top=cz+math.sqrt(Ro**2-(x-1800)**2);spand=max(0,3170-top)*dx*140*22/1e9
        loads.append((x,1.35*(selfweight+spand)+(floorLine+(leftlive if x<1800 else rightlive))*dx/1000))
    Rb=sum(p*(x-x0)/L for x,p in loads);Ra=sum(p for _,p in loads)-Rb
    def ms(x):return (Ra*(x-x0)-sum(p*(x-q) for q,p in loads if q<x))/1000
    H=ms(1800)/(rise/1000);Hmax=max(H,Hmax);Vmax=max(Vmax,Ra,Rb);ecc=0.;stress=0
    for j in range(161):
        x=x0+L*j/160;th=math.asin((x-1800)/R);z=cz+R*math.cos(th)
        vz=Ra-sum(p for q,p in loads if q<x)
        N=math.cos(th)*H-math.sin(th)*vz;M=ms(x)-H*(z-zs)/1000
        assert N>0;e=abs(M)*1000/N;ecc=max(ecc,e)
        # Compressed contact portion if the thrust leaves the middle third.
        # Strut centroid must remain inside the ring; no tensile mortar credit.
        if e<215/6:pr=N*1000/(140*215)*(1+6*e/215)
        elif e<215/2:pr=2*N*1000/(140*3*(215/2-e))
        else:pr=1e6
        stress=max(stress,pr)
    V=Ra;res=x0-H*(zs-zt)/V
    emax=max(ecc,emax);bearingmax=max(stress,bearingmax)
    results.append(dict(floorULS=floorLine,liveLeft=leftlive,liveRight=rightlive,H=H,VA=Ra,VB=Rb,maxE=ecc,maxCompression=stress,leftBearingAt=res))
assert emax<215/2
# Physical plate has a longitudinal slot; the moving shoe is attached to the
# arch and slides on the corner, NOT dragged with the RC corner under wind.
# Fixed opposing shoe at the opposite jamb receives the longitudinal datum.
tr=20;setout=5;plate=[1000,1230];slider=[1050,1200];raw=toe-plate[1]
positions=[row['leftBearingAt'] for row in results];seatEdges=[min(positions)-slider[0],slider[1]-max(positions)]
# Frame clear opening lost by a permanent 50mm high metal/mineral transom.
# Do not invent a free sash/guard movement through a permanent tie.
frame=oas['frame'];oldleaf=oas['leaf'];guard=oas['guard'];clearTop=zt-25-10
clear=frame['clearX'][1]-frame['clearX'][0];clearHeight=clearTop-frame['clearBottom']
segA=Ri**2*math.acos((Ri-300)/Ri)-(Ri-300)*math.sqrt(2*Ri*300-300**2)
area=segA/1e6 # geometric curved head only, no invented glass weight.
# A commercially unqualified two-pane option with4+4mm nominal glass:
# lower rectangular unit and upper circular segment. This counts glass, not a complete IGU.
glassKgM2=2500*.008
lowerArea=clear*clearHeight/1e6;upperSegHeight=max(0,frame['arcCentre']+frame['clearRadius']-(zt+25))
rr=frame['clearRadius'];a2=rr**2*math.acos((rr-upperSegHeight)/rr)-(rr-upperSegHeight)*math.sqrt(2*rr*upperSegHeight-upperSegHeight**2)
out={'status':'Comparative tied genuine inner arch; slide fit, window/guard and renewal must all be paid for','geometry':{'skewbacks':[x0,x1],'springCentreZ':zs,'RCtoe':toe,'permanentTieCentreZ':zt,'leftBed':plate,'slidingShoe':slider,'movementEachWay':tr,'placement':setout,'plateToRCTip':raw,'resultantRange':list((min(positions),max(positions))),'resultantToSliderEdges':seatEdges},'loads':results,'worst':{'H':Hmax,'V':Vmax,'ringE':emax,'compression':bearingmax,'slidePost':{'slideReserve':min(slider[0]-plate[0],plate[1]-slider[1])-tr-setout,'frictionHalfV':.5*Vmax,'steelPressIf150x120':Vmax*1000/(150*120),'tieStress40x12':Hmax*1000/(40*12),'eccentricNormal80GuideAt140':Hmax*80/140,'seizedControl':'A seized bearing under the corner displacement interrupts the tied arch mechanism; friction cannot be silently assumed zero.'}},'window':{'comparedOccurrence':'FIRST outer-north north-window-0; hard obstruction would also affect the four outside corner pairs','rawWidth':1000,'existingClearWidth':clear,'oldLeafTop':oldleaf['top'],'oldGuardTop':guard['top'],'newPermanentBand':[zt-25,zt+25],'unobstructedHeightAboveExistingSill':clearHeight,'rectangularOpeningArea':lowerArea,'nominalClearFanlightArea':a2/1e6,'eightMMGlassOnlyFanlightKg':a2/1e6*glassKgM2,'remainingClearArchTip':upperSegHeight,'meaning':'Separate operable lower cassette and bead-removable fixed fanlight on independent frame. Existing tall leaf/guard/jamb release no longer transfers; the fixed transom stays when both panes/sashes are removed. Installed glass make-up, frame/edge rebate, safe staging and weather are additional burdens.'}}

# Floor-fed building and coupling sensitivity on the actual revised roof.
# Fixed full plane coupled lower comparator, then adverse freely responding L;
# mesh flexibility is NOT inferred from four equally stiff free cantilevers.
la=json.loads((D/'current-house-lateral.json').read_text());he=json.loads((D/'current-house-welded-heel.json').read_text())
hf=3370+180;hr=6660+180;top=he['height']['ridge']+180;w=1.5*12.4/4
P1=w*hr/2000;P2=w*((hr-hf)/2000+(top-hr)/1000);Mtop=w*((top-hr)/1000)**2/2
Ec=22000*3.8**.3;EI=Ec*.25*la['RClegs']['grossLInertia']
def drift(z):
 return (sum(p*1000*min(z,k)**2*(3*max(z,k)-min(z,k))/6 for p,k in [(P1,hf),(P2,hr)])+Mtop*1e6*z*z/2)/EI
dF=drift(hf);dR=drift(hr)-dF;free=dR/(1-.583968477**2)
out['movement']={'wholeFirst':dF,'upperStorey':dR,'freeLCouplingSensitivity':free,'slot':[-20,20],'positionAllowance':5,'remainingAtFreeL':20-5-free,'caveat':'Actual roof diaphragm and real foundation stiffness still control; no credit for bonded plaster, glass or a stuck shoe. The budget is not a guarantee of workmanship, temperature, settlement or seismic travel.'}
assert free+5<20 and min(seatEdges)>40 and raw>=25 and out['worst']['slidePost']['slideReserve']>=5
# Matched sliding and datum features, not a pair of unexplained horizontal gaps.
out['shoes']={'leftDatum':'Sliding at the near RC toe; centre of the 230 long fixed bed is1115. Sleeve length66 around a16 pin and25 either-side allowance. Opposed guides capture transverse load; do not add longitudinal restraint at this end.','oppositeDatum':'Right spring shoe/bed mirrors the left about1800 but fixes horizontal position in the opposite jamb; horizontal component closes through permanent40x12 tie at2510. Vertical reaction at both cheeks bears on mineral/steel pads, never on glazing.','guideDemand':Hmax*80/140+2.25*2.1/2,'one16PinShearReference':math.pi*16**2/4*.1,'permanentShoringCost':'To renew a buried shoe/slider, both arch reactions must be taken by temporary works before tie or bearing disturbance. No such completed installation/withdrawal scheme is claimed. Lower glass and bead-removed fanlight may be independent but replacing the entire existing arched cassette/outer guard across the permanent structural band is not a retained event.'}
out['decision']='Reject importing the fixed-band tied arch as the unchanged whole-house opening family. Local arch and movement arithmetic is plausible but it loses the full-height window/guard/rare passage and hides a shoring-dependent wearing interface. Compare a real load-bearing integral curved RC inner ring with genuine outer masonry and an independently replaceable window; that RC option still needs its coupled pier and both-jamb stiffness/forces, not a boxed lintel.'
def norm(v):
 if isinstance(v,dict):return {k:norm(z) for k,z in v.items()}
 if isinstance(v,(list,tuple)):return [norm(z) for z in v]
 return round(v,6) if isinstance(v,float) else v
p=D/'current-house-arch-movement.json';txt=json.dumps(norm(out),indent=2)+'\n'
if '--check' in sys.argv:assert p.read_text()==txt
else:p.write_text(txt)
print('Two real skewbacks; tied arch H %.2f, clear opening %.0f x %.0f. No inherited full-height renewal.'%(Hmax,clear,clearHeight))
