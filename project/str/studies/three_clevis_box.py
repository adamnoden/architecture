"""One boxed follow-on to the rejected flat-cheek family; no house solve.
Closed-section action, actual shared-root geometry and a level-faithful
monolithic upstand comparison. Necessary screens never imply complete resistance.
"""
import argparse,copy,hashlib,json,math
from pathlib import Path
import xml.etree.ElementTree as ET
import three_clevis as flat
import separated_floor_bearing as bearing
D=Path(__file__).parent
INPUT=D/'three-clevis-box-inputs.json'

def section(b):
    h,w,ti,to,t=b['heightMm'],b['outwardWidthMm'],b['innerBearingFaceMm'],b['outerFaceMm'],b['topBottomMm']
    if not 0<ti+to<w or not 0<2*t<h:raise ValueError('Real closed section required')
    # Four disjoint welded plates, no double-counted corner material.
    r=[(ti*h,ti/2,0.,h*ti**3/12,ti*h**3/12),
       (to*h,w-to/2,0.,h*to**3/12,to*h**3/12)]
    for z in (-(h-t)/2,(h-t)/2):
        a=(w-ti-to)*t
        r.append((a,ti+(w-ti-to)/2,z,t*(w-ti-to)**3/12,(w-ti-to)*t**3/12))
    a=sum(x[0] for x in r);yc=sum(x[0]*x[1] for x in r)/a;zc=sum(x[0]*x[2] for x in r)/a
    iz=sum(iy+ar*(y-yc)**2 for ar,y,z,iy,ix in r)
    iy=sum(ix+ar*(z-zc)**2 for ar,y,z,iz,ix in r)
    return {'areaMm2':a,'centroidFromInnerFaceMm':yc,'IweakMm4':iz,'IstrongMm4':iy,
        'medianEnclosedAreaMm2':(w-(ti+to)/2)*(h-t),
        'weakExtremeDistanceMm':max(yc,w-yc),'heightMm':h}

def admit(c):
    if c['schema']!='str-three-clevis-box-inputs/1' or c['status']!='ONE UNSOLVED BOXED COMPARISON':raise ValueError('Explicit bounded comparison required')
    if any(x is not False for x in c['evidence'].values()):raise ValueError('No approval or house result injection')
    b=c['box']
    for k,v in b.items():
        if type(v) in (int,float) and not flat.finite_positive(v):raise ValueError('Positive finite box geometry')
    if not b['rootSteelUnionIsOneFabricatedCross'] or b['independentOverlappingPlatesCredited'] or b['bearingTubeOrOuterFaceFalseExtraPinSupportCredited']:
        raise ValueError('A genuine shared cross-root and inner-face-only pin support are required')
    if len(b['anchorAlongOffsetsMm'])!=9 or abs(sum(b['anchorAlongOffsetsMm']))>1e-12:raise ValueError('Actual centred nine-bar group required')

def mat_geometry(b,fc):
    lo,hi=3170.,3370.;cover=fc['mainBarNominalCoverMm'];tol=fc['independentBarToleranceMm']
    dx,dy=b['anchorXEnvelopeMm'],b['anchorYEnvelopeMm']
    xb=lo+cover+dx/2;yb=lo+cover+dx+dy/2;xt=hi-cover-dx/2;yt=hi-cover-dx-dy/2
    positions=[912.5+x for x in b['anchorAlongOffsetsMm']]
    rootlo,roothi=b['rootNearXMm'],b['rootNearXMm']+b['rootThicknessMm']
    rootreserve=min(min(abs(p-rootlo),abs(p-roothi)) if p<rootlo or p>roothi else -1 for p in positions)-max(dx,dy)/2-2*tol
    parallel=min(q-p for p,q in zip(positions,positions[1:]))-max(dx,dy)-2*tol
    clear=yt-yb-dy-2*tol
    return {'XLayerZMm':[xb,xt],'YLayerZMm':[yb,yt],'anchorAlongCoordinatesMm':positions,
        'adverseXLeverMm':xt-xb-2*tol,'adverseYLeverMm':yt-yb-2*tol,
        'adverseIndependentParallelClearMm':parallel,'adverseInterMatParallelClearMm':clear,
        'adverseAnchorToCompanionRootPlateGapMm':rootreserve,
        'nominalTiedCrossingSurfaceGapMm':min(yb-xb-(dx+dy)/2,xt-yt-(dx+dy)/2),
        'tiedCrossingsRequireOneStackFixture':True,'independentCrossingLayerTranslationsAllowed':False,
        'allHookWeldBondAndFloorPerimeterConfinementQualified':False}

def monolithic(c,base,h):
    m=c['monolithicComparison'];bottom=m['beamBottomZMm'];top=bottom+m['perimeterTotalDepthMm']
    if bottom!=base['slabZMm'][0] or base['firstFFLMm']!=3450:raise ValueError('Actual level chain changed')
    outside=base['corners'][0]['rcRectanglesXYMm'][0][0]
    ringtops=[(x['id'],x['head']+x.get('radialRingTrial',0)) for x in h['archOpeningRegister']['GROUND'] if x['wall'].startswith('outer-')]
    down=base['slabZMm'][1]-m['groundDownstandComparisonDepthMm']
    return {'perimeterSectionWidthDepthMm':[m['perimeterWidthMm'],m['perimeterTotalDepthMm']],
        'perimeterOrdinaryBeamZMm':[bottom,top],'unchangedFloorZMm':base['slabZMm'],'unchangedFIRSTMm':base['firstFFLMm'],
        'upstandAboveFinishedFloorMm':top-base['firstFFLMm'],
        'newBeamOutsideFaceSWMm':outside,'newBeamRoomFaceSWMm':outside+m['perimeterWidthMm'],
        'roomwardPlinthProjectionBeyondActual140WallMm':m['perimeterWidthMm']-140,
        'upstandDoesNotLowerOrdinaryGroundSoffit':True,'existing110GlassOutsideFaceUnchangedForOrdinaryBeam':True,
        'existingCourt650Garden750UpstandsRetained':True,
        'upperOuterMasonryStartMustMoveToOrdinaryBeamTopMm':top,
        'groundOuterArchRingTopWitnessesMm':ringtops,
        'sameDepthDownstandBottomMm':down,'maximumActualRingCollisionMm':max(z-down for _,z in ringtops),
        'credibleCornerCoreWidthMm':m['coreWidthMm'],'cornerCoreOutsideFaceSWMm':outside,
        'cornerCoreRoomFaceSWMm':outside+m['coreWidthMm'],'cornerCoreAdditionalRoomProjectionMm':m['coreWidthMm']-200,
        'ordinaryGirderFullSectionCoreAndBeamCageQualified':False,
        'otherThreeCornerJointsClosed':False,
        'implementation':['Retain actual52 head/grid geometry, roof loads, G/Q/pressure origins and complete house openings',
          'Replace ordinary140x200 edge-band physical section with200x350 upstand, actual concrete/upper-wall replacement unions and new selfG; retain existing650/750 north upstands',
          'Develop all-four300 inward RC corners and ordinary continuous column/beam/slab cage; no substitute portal cage or guessed tail capacity',
          'Keep monolithic floor/core coupling and actual lower masonry compression supports; no new pin, vertical tie release or imaginary extra restraint',
          'Explicit60mm×70mm first-floor wall plinth,100mm extra inward corner footprint, furniture/radiator/services, finishes and maintenance joins',
          'New local350-deep joint proof plus fresh52-head coupled W0/W31, source-wrench/mass/work controls, then signed programme only after viable ordinary placing'],
        'nativeHouseResponseStrengthAndOwnerSelectionCalculated':False}

def assess(c,a,base,h,cage,fc):
    admit(c);b=c['box'];g=copy.deepcopy(a['geometry']);mat=mat_geometry(b,fc);sec=section(b)
    g.update({'cheekThicknessMm':b['innerBearingFaceMm'],'cheekInsideGapMm':b['innerGapMm'],'pinLengthMm':b['pinLengthMm']})
    n=max(base['maximumAbsoluteThreeConstraintForceKN'])*1000*a['demand']['developmentReserve']
    pinx=622.5;arm=b['rootNearXMm']-pinx;floorarm=b['rootNearXMm']+b['rootThicknessMm']-pinx
    e=abs(b['innerBearingFaceMm']/2-sec['centroidFromInnerFaceMm'])
    rows=[]
    for mu in a['material']['frictionScenarioCoefficients']:
        for k in range(24) if mu else [0]:
            angle=k*math.pi/12;v=mu*n*math.cos(angle);along=mu*n*math.sin(angle)
            # Full simultaneous vector into ONE box is conservative, no equal-share strength credit.
            mz=abs(along)*(arm+g['pinDiameterMm']/2)+n*e;my=abs(v)*(arm+g['pinDiameterMm']/2)
            sigma=n/sec['areaMm2']+mz*sec['weakExtremeDistanceMm']/sec['IweakMm4']+my*(b['heightMm']/2)/sec['IstrongMm4']
            torque=abs(v)*e
            shear=math.hypot(v,along)/(2*b['outerFaceMm']*(b['heightMm']-2*b['topBottomMm']))
            shear+=torque/(2*sec['medianEnclosedAreaMm2']*min(b['outerFaceMm'],b['topBottomMm']))
            vm=math.sqrt(sigma*sigma+3*shear*shear)
            pin=flat.pin_screen(g,a['material'],n,v,along)
            plate=abs(along)*(b['heightMm']-2*b['topBottomMm'])/4/(a['geometry']['pinDiameterMm']*b['innerBearingFaceMm']**2/6)
            # The bar checks are one-interface necessary screens. Full shared SW6-wrench
            # transfer, concrete dowel/bursting and simultaneous two-key action remain open.
            bars={}
            for axis,d,lever in (('X',b['anchorXNominalMm'],mat['adverseXLeverMm']),('Y',b['anchorYNominalMm'],mat['adverseYLeverMm'])):
                asface=9*flat.area(d)
                # Surface friction contributes a real pin-radius couple. Use larger arm.
                stress=n/(2*asface)+abs(v)*(floorarm+g['pinDiameterMm']/2)/(lever*asface)
                bars[axis]={'necessaryLongitudinalStressMPa':stress,'straightDevelopmentMm':d*stress/(4*fc['bondMPa'])}
            washer_span=(g['pinDiameterMm']+2)/2-13.
            washer_z=2*math.pi*13*b['retainerThicknessMm']**2/6
            rows.append({'mu':mu,'slipDirectionRad':angle,'localAppliedWrenchAtPinN_Nmm':[n,along,v,0.,-g['pinDiameterMm']/2*v,g['pinDiameterMm']/2*along],
                'boxedRootSectionVMMPa':vm,'innerFaceLocalPlateBendingMPa':plate,'pin':pin,
                'keeperM24AxialMPa':abs(along)/a['geometry']['pinRetainerStressAreaMm2'],
                'keeperAnnularRadialStripMPa':abs(along)*washer_span/washer_z,
                'oneInterfaceAnchorNecessaryChecks':bars})
    sums=[]
    for mu in a['material']['frictionScenarioCoefficients']:
        rr=[x for x in rows if x['mu']==mu]
        sums.append({'mu':mu,'boxVMMaxMPa':max(x['boxedRootSectionVMMPa'] for x in rr),
            'innerFaceBendingMaxMPa':max(x['innerFaceLocalPlateBendingMPa'] for x in rr),
            'pinVMIncludingSurfaceFrictionMaxMPa':max(x['pin']['vonMisesMPa'] for x in rr),
            'retainerAxialMaxMPa':max(x['keeperM24AxialMPa'] for x in rr),
            'retainerWasherStripMaxMPa':max(x['keeperAnnularRadialStripMPa'] for x in rr),
            'XAnchorNecessaryStressMaxMPa':max(x['oneInterfaceAnchorNecessaryChecks']['X']['necessaryLongitudinalStressMPa'] for x in rr),
            'YAnchorNecessaryStressMaxMPa':max(x['oneInterfaceAnchorNecessaryChecks']['Y']['necessaryLongitudinalStressMPa'] for x in rr)})
    # The two orthogonal box limbs are now separated physically at SW.
    other_box_min=912.5-b['innerGapMm']/2-b['outwardWidthMm']
    boxgap=other_box_min-b['rootNearXMm']-2*a['movement']['wallFloorIndependentSettingEachMm']
    access_left=pinx-b['outerAccessHoleMm']/2
    front_inside=b['frontXMm']+b['frontClosureMm']
    root_volume=(2*b['rootDistributionPlateWidthMm']*b['rootThicknessMm']-b['rootThicknessMm']**2)*b['heightMm']
    box_volume=sec['areaMm2']*(b['rootNearXMm']-b['frontXMm'])
    return {'schema':'str-three-clevis-box-screen/1','status':'ONE BOXED COMPARISON;NO COMPLETE CONNECTOR PASS',
        'pressureOnlyMinimumKN':n/1000/a['demand']['developmentReserve'],'componentScreenKN':n/1000,
        'boxSection':sec,'matGeometry':mat,'frictionScenarioSummary':sums,'simultaneousComponentScenarios':rows,
        'placing':{'SWOrthogonalBoxCylinderEnvelopeAdverseGapMm':boxgap,
            'accessPortToInsideFrontClosureNominalGapMm':access_left-front_inside,
            'pinKeeperToCheekNominalGapMm':(b['pinLengthMm']-b['innerGapMm']-2*b['innerBearingFaceMm'])/2,
            'completePinExtractionBeyondBoxReserveMm':b['pinExtractionMm']-(b['pinLengthMm']/2+b['innerGapMm']/2+b['outwardWidthMm']),
            'commonRootIsOneDisjointSteelUnionNotTwoOverlappingSolids':True,
            'sharedRootSteelEnvelopeVolumeMm3':root_volume,
            'oneBoxGrossEnvelopeMassKgBeforeAccessHoleDeduction':box_volume*1e-9*a['material']['densityKgPerM3'],
            'closedBoxSourceSectionAtRootOmitsFrontAccessHoleButLocalAccessPanelQualified':False,
            'SWPinRenewalMustPointNorthAndEastToAvoidContinuousPerpendicularCore':True,
            'SWNorthExtractionAndToolMaxYmm':912.5+b['pinExtractionMm']+b['pinLengthMm']/2+a['movement']['toolAxialMm'],
            'SWPinSouthExtractionWouldHitPerpendicular300Core':True,
            'NWPinSouthExtractionAndToolMinYmm':11087.5-b['pinExtractionMm']-b['pinLengthMm']/2-a['movement']['toolAxialMm']},
        'monolithicAlternative':monolithic(c,base,h),
        'decision':{'flatCheekRejectionPreserved':True,
            'closedBoxCarriesSideFrictionInSectionAction':max(x['boxVMMaxMPa'] for x in sums if x['mu']==.6)<300,
            'sameD60PinFailsDevelopmentMu06WhenRealSurfaceFrictionCoupleIncluded':max(x['pinVMIncludingSurfaceFrictionMaxMPa'] for x in sums if x['mu']==.6)>300,
            'boxedFamilyEarnsNewHouseSolve':False,
            'preferredNextComparison':'Monolithic200x350 perimeter upstand and inward300 corner cores, subject to actual placing and first-floor plinth/room joins',
            'why':'Boxed cheeks remove the weak plate failure, but retain custom pin access, friction/lockup, through-plate300-core confinement,9+9 two-level shared anchorage and large seat/floor pockets. A new full-house solve is premature.'},
        'unclosed':['Actual material certificates/welds/wear pair and finite pin/slot/backlash/rotation/friction law',
          'Full six-component simultaneous shared SW anchorage and3D concrete dowel/bearing/splitting/confinement',
          'Root/box access-hole local shell and prying, thread/keeper actual manufacture, fixture/tool lifting and replacement',
          'No six-wrench complete separated house demand exists;94.581 is only the source pressure minimum screen',
          'All-four monolithic joint cages, existing RC base splice and site/foundation capacities remain unqualified'],
        'evidence':copy.deepcopy(c['evidence'])}

def svg(c,value):
    s=bearing.Svg(1500,1020,'Boxed clevis versus conventional monolithic upstand')
    s.text(40,42,'One boxed clevis comparison — then stop and compare the house','title')
    s.text(40,73,'Same source pressure minimum94.581kN; development141.8715kN. No complete resistance, product, physical or house acceptance.','note red')
    s.text(40,115,'Closed cheek section:190high×100outward','sub')
    x,y,k=100,190,2.
    s.rect(x,y,100*k,190*k,'#626b74')
    s.rect(x+40*k,y+10*k,50*k,170*k,'white')
    s.line(x+20*k,y+95*k,x+100*k,y+95*k,'#315c86','stroke-dasharray="4 3"')
    s.text(330,220,'40mm inner face /10mm other plates','note')
    s.text(330,249,'Genuine closed-section bending +torsion','note blue')
    s.text(330,278,'Inner bearing faces support D60 pin at130mm centres','note')
    s.text(330,307,'Pin surface axial friction adds an eccentric bending couple','note red')
    s.text(330,336,'Outer access port90mm;220mm pin;270mm withdrawal','note')
    s.text(330,365,'Slot gap stays90mm: no box flange crosses the moving blade','note')
    s.text(330,394,'SW one fabricated cross-root;X16/Y14bars at separate levels','note')
    s.text(330,423,'No duplicated plates;9centred anchors each face, coordinated gaps','note')
    s.text(330,452,'Closed boxes still require a300core and through-plate concrete proof','small red')
    for i,row in enumerate(value['frictionScenarioSummary']):
        s.text(40,620+27*i,f'μ={row["mu"]:g}: boxVM{row["boxVMMaxMPa"]:.1f}; pinVM{row["pinVMIncludingSurfaceFrictionMaxMPa"]:.1f};Ybar{row["YAnchorNecessaryStressMaxMPa"]:.1f}MPa','note')
    s.text(40,765,'No pin-only pass: boxed cheeks solve one failure; the connector remains unqualified.','note red')
    s.text(930,115,'Ordinary monolithic comparison','sub')
    ox,oy,scale=1000,740,.7
    def q(x,z):return ox+(x-250)*scale,oy-(z-2950)*scale
    def r(x,z,w,h,color):
        X,Y=q(x,z+h);s.rect(X,Y,w*scale,h*scale,color)
    r(262.5,2950,300,650,'#c8d9e7')
    r(562.5,3170,220,200,'#eee8d9')
    r(262.5,3170,200,350,'#94afc5')
    r(262.5,3520,140,80,'#ded1b5')
    for z,label in ((3520,'upstand3520'),(3450,'FIRST3450'),(3370,'slab3370'),(3170,'soffit3170'),(3065,'arch ring3065'),(3020,'downstand3020')):
        X,Y=q(250,z);s.line(X,Y,1410,Y,'#9aa6af','stroke-dasharray="3 4"');s.text(1420,Y-5,label,'small')
    s.text(930,800,'200×350 upstand; floor and FIRST unchanged','note blue')
    s.text(930,826,'70mm high×60mm roomward first-floor plinth','note')
    s.text(930,852,'300cores grow100mm inward; no outward glass move','small')
    s.text(930,878,'Same350 downstand would overlap actual arch rings45mm','small red')
    s.text(40,940,'PREFERRED NEXT: develop a normal beam/column/slab cage and join the real plinth/rooms before any new full signed programme.','sub')
    s.text(40,978,'No additional native physics edits or new house solves. Existing650/750 northern upstands and all52 supports/roof origins must be retained.','note red')
    return s.finish()

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);p=ap.parse_args()
    c=json.loads(INPUT.read_bytes());a,base,h,grid,furniture,cage,fc=flat.load();r=assess(c,a,base,h,cage,fc)
    r['sourceSHA256']={name:flat.digest((D/name).read_bytes()) for name in ('three_clevis_box.py','three-clevis-box-inputs.json','three_clevis_box_test.py','three_clevis.py','three-clevis-inputs.json')}
    p.out.mkdir(parents=True,exist_ok=True);drawing=svg(c,r);ET.fromstring(drawing)
    (p.out/'three-clevis-box-v-monolithic.svg').write_text(drawing)
    r['svgSHA256']=flat.digest(drawing.encode());data=json.dumps(r,indent=2,allow_nan=False)+'\n'
    (p.out/'three-clevis-box-comparison.json').write_text(data)
    print('THREE_CLEVIS_BOX_SUMMARY '+json.dumps({k:v for k,v in r.items() if k!='simultaneousComponentScenarios'},allow_nan=False))
    print('BOX_COMPARISON_SHA256 '+flat.digest(data.encode()))
    print('SVG_SOURCE three-clevis-box-v-monolithic.svg '+drawing.encode().hex())
if __name__=='__main__':main()
