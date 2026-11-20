import hashlib
import json
import math
from pathlib import Path
from xml.sax.saxutils import escape

import numpy as np
from closed_service_tool_geometry import bolt_access, capture_geometry, half_coordinates, floor_opening_body_clearance

SOURCE_PATHS = ('project/had/studies/water-replan.json', 'project/rwt/studies/open-loggia-event.json',
                'project/rwt/studies/selected-receiving-interface.json', 'project/str/studies/current-house-grid.json',
                'project/mat/studies/upper-access-renewal.json',
                'project/owner-house-charter.md', 'project/had/studies/closed_service_tool_geometry.py', 'project/had/studies/closed-service-gasket-evidence.json', 'project/had/studies/closed_service_floor.py')


def derive_ground_stack(value):
    if set(value)!={'schema','source','levelsMm'} or value['schema']!='service-floor-ground-stack/1':
        raise ValueError('Expected explicit ground-section authority; no default floor stack')
    if set(value['source'])!={'caseId','caseDigest','planDigest'} or not all(isinstance(v,str) and v for v in value['source'].values()):
        raise ValueError('Expected source ground-case and current-plan identity')
    levels=value['levelsMm']
    if set(levels)!={'mineralCourse','dryRC','glass','accessibleDistribution','finish','ffl','authoredExteriorGrade','localSolum'}:
        raise ValueError('Expected exact ground-section level fields')
    for name in ('mineralCourse','dryRC','glass','accessibleDistribution','finish'):
        row=levels[name]
        if not isinstance(row,list) or len(row)!=2 or not all(type(v) in (int,float) and math.isfinite(v) for v in row) or row[0]>=row[1]:
            raise ValueError('Invalid ground-section interval: '+name)
    if not all(type(levels[k]) in (int,float) and math.isfinite(levels[k]) for k in ('ffl','authoredExteriorGrade','localSolum')):
        raise ValueError('Nonfinite ground-section datum')
    if levels['mineralCourse']!=[0,150] or levels['dryRC']!=[150,350] or levels['glass']!=[350,450]:
        raise ValueError('Unsupported ground-section stack: this source service/body/opening/support method requires actual mineral0..150/RC150..350/glass350..450')
    if levels['accessibleDistribution'][0]!=levels['glass'][1] or levels['finish'][0]!=levels['accessibleDistribution'][1] or levels['finish'][1]!=levels['ffl'] or levels['finish'][1]-levels['finish'][0]!=15:
        raise ValueError('Ground-section stack is not contiguous with15 finish')
    return levels


def section(width, depth, wall):
    if min(width, depth) <= 2*wall or wall <= 0:
        raise ValueError('Invalid hollow section')
    area = width*depth-(width-2*wall)*(depth-2*wall)
    inertia = (width*depth**3-(width-2*wall)*(depth-2*wall)**3)/12
    return {'areaMm2': area, 'inertiaMm4': inertia, 'modulusMm3': inertia/(depth/2)}


def beam(nodes, supports, loads, point_loads, inertia, elastic):
    count = 2*len(nodes)
    stiffness = np.zeros((count,count)); force = np.zeros(count); elements = []
    for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
        length = b-a
        if length <= 0:
            raise ValueError('Beam nodes must increase')
        local = elastic*inertia/length**3*np.array([[12,6*length,-12,6*length],[6*length,4*length**2,-6*length,2*length**2],[-12,-6*length,12,-6*length],[6*length,2*length**2,-6*length,4*length**2]])
        q = loads[i]
        consistent = np.array([q*length/2,q*length**2/12,q*length/2,-q*length**2/12])
        dofs = [2*i,2*i+1,2*i+2,2*i+3]
        stiffness[np.ix_(dofs,dofs)] += local
        force[dofs] += consistent
        elements.append((local,consistent,dofs))
    for position,load in point_loads:
        if position not in nodes:
            raise ValueError('Point load must have an explicit beam node')
        force[2*nodes.index(position)] += load
    fixed = [2*nodes.index(y) for y in supports]
    free = [i for i in range(count) if i not in fixed]
    displacement = np.zeros(count)
    displacement[free] = np.linalg.solve(stiffness[np.ix_(free,free)],force[free])
    residual = stiffness@displacement-force
    actions = [[float(v) for v in local@displacement[dofs]-consistent] for local,consistent,dofs in elements]
    samples=[]
    for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
        length=b-a; u0,t0,u1,t1=displacement[2*i:2*i+4]
        c=loads[i]*length**4/(24*elastic*inertia)
        coefficients=[c,2*u0+length*t0-2*u1+length*t1-2*c,-3*u0-2*length*t0+3*u1-length*t1+c,length*t0,u0]
        derivative=[4*coefficients[0],3*coefficients[1],2*coefficients[2],coefficients[3]]
        positions=[0.,1.]+[float(r.real) for r in np.roots(derivative) if abs(r.imag)<1e-8 and 0<r.real<1]
        if loads[i]:
            critical=-actions[i][0]/(loads[i]*length)
            if 0<critical<1:positions.append(critical)
        for fraction in positions:
            x=fraction*length
            deflection=float(np.polyval(coefficients,fraction))
            moment=-actions[i][1]+actions[i][0]*x+loads[i]*x**2/2
            samples.append([a+x,deflection,moment])
    return {'nodesMm':nodes, 'supportReactionsKN':[-float(residual[2*nodes.index(y)])/1000 for y in supports],
            'nodeDownwardMm':[float(v) for v in displacement[::2]],
            'elementEndActionsN_Nmm':actions,
            'maximumEndMomentNmm':max(abs(a[j]) for a in actions for j in (1,3)),
            'interiorRecovery':'Quadratic moment stationary point and all real quartic-deflection derivative roots within each element; no grid-sampling maximum.','maximumMomentNmm':max(abs(v[2]) for v in samples),
            'maximumDeflectionMm':max(abs(v[1]) for v in samples),
            'maximumNodeDeflectionMm':max(abs(float(v)) for v in displacement[::2]),
            'appliedDownwardKN':float(sum(force[::2]))/1000,
            'freeEquilibriumResidualN':max(abs(float(v)) for v in residual[free]),
            'strainEnergyNmm':float(displacement@stiffness@displacement)/2}


def closed_flow(width, height, duty, length, roughness, local_k, upstream_stage, outlet_crown, setting):
    if min(width,height) <= 0:
        return {'comparisonPass':False,'reason':'No remaining closed water area'}
    area = width*height/1e6
    radius = area/(2*(width+height)/1000)
    speed = duty/1000/area
    velocity_head = speed**2/(2*9.81)*1000
    friction = (roughness*speed/radius**(2/3))**2*length
    local = local_k*velocity_head
    available = upstream_stage-outlet_crown-setting-velocity_head
    return {'effectiveWidthMm':width,'effectiveHeightMm':height,'areaM2':area,'closedWettedPerimeterMm':2*(width+height),
            'velocityMps':speed,'frictionHeadMm':friction,'localLossHeadMm':local,'exitVelocityHeadMm':velocity_head,
            'availablePressureHeadMm':available,'reserveMm':available-friction-local,
            'comparisonPass':available >= friction+local,
            'boundary':'Flooded closed-body Manning sensitivity, authored roughness/K/debris. Not a measured two-phase or transition rating.'}


def plate_strip(span, thickness, pressure, elastic):
    inertia=100*thickness**3/12
    moment=pressure/1000*100*span**2/8
    return {'spanMm':span,'minimumThicknessMm':thickness,'pressureKPa':pressure,
            'stressMPa':moment/(100*thickness**2/6),
            'deflectionMm':5*pressure/1000*100*span**4/(384*elastic*inertia)}


def compile_closed(case, raw):
    if set(case) != {'schema','sources','groundStack','settings'} or case['schema'] != 'closed-service-floor/2' or set(case['sources']) != set(SOURCE_PATHS):
        raise ValueError('Expected exact closed service-floor schema and source set')
    for path,digest in case['sources'].items():
        if path not in raw or hashlib.sha256(raw[path]).hexdigest() != digest:
            raise ValueError('Missing or stale source: '+path)
    ground=derive_ground_stack(case['groundStack'])
    s = case['settings']
    reference = default_settings()
    if set(s) != set(reference) or any(type(v) not in (int,float) or not math.isfinite(v) for v in s.values()):
        raise ValueError('Expected exact finite closed comparison settings')
    if any(s[k] != int(s[k]) or not 2<=s[k]<=16 for k in ('boltsOnLongSide','boltsOnShortSide','walkingGridSimultaneousPoints')):
        raise ValueError('Bolt rows must have explicit integer counts of at least2')
    if not 0<=s['bailOffsetFraction']<=1 or not s['metalLossMm']<min(s['bodyMm'],s['lidMm'],s['lidRimMm'],3):
        raise ValueError('Unsupported tool offset or remaining metal thickness')
    if not (60<=s['centralFlangeMm']<s['waterWidthMm']-100 and s['lidButtGapMm']<s['centralFlangeMm']-2*s['boltEdgeOffsetMm']):
        raise ValueError('Unsupported central split pressure-flange geometry')
    if any(v <= 0 for k,v in s.items() if k not in ('exteriorGradeMm','bailOffsetFraction')) or s['widthFraction'] > 1 or s['ventAreaFraction'] > 1 or s['preloadLossFraction'] >= 1:
        raise ValueError('Unsupported positive comparison domain')
    source = json.loads(raw[SOURCE_PATHS[0]])
    h = source['model']; normal=h['northNormalRoute']['normal']; terminal=h['northNormalRoute']['terminal']
    grid=json.loads(raw['project/str/studies/current-house-grid.json'])
    receivers=json.loads(raw['project/rwt/studies/selected-receiving-interface.json'])
    event=json.loads(raw['project/rwt/studies/open-loggia-event.json'])
    gasket_evidence=json.loads(raw['project/had/studies/closed-service-gasket-evidence.json'])
    if s['gasketMinimumStressMPa'] != gasket_evidence['typicalMinimumStressMPa']:
        raise ValueError('Gasket benchmark must match the exact bound evidence')
    ffl=ground['ffl'];delta=ffl-h['sections']['groundFFL']
    grade=ground['authoredExteriorGrade']
    zone=ground['accessibleDistribution'][1]-ground['accessibleDistribution'][0]
    if grade>=h['sections']['waterLevels']['loggiaNorth']+delta:
        raise ValueError('Source downhill approach comparison requires exterior below garden plane')
    x0=h['court'][0]+h['court'][2]; x1=s['endXmm']; length=x1-x0
    if not 12250 <= x1 <= 12750 or not 65 <= zone <= 350:
        raise ValueError('Outside actual E passage/receiver and floor comparison domain')
    invert0=s['invertMm']; invert1=invert0-length/s['slopeRatio']
    quiet=h['firstWetReference']['permittedQuietStage']+delta
    protected=quiet+s['splashMm']+s['waterSettingMm']
    thermal_bottom=ffl-15-12-50-1.5
    outer_width=s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']
    gross_width=outer_width+2*s['frameGapMm']+2*s['railWidthMm']
    gross_y=[s['centreYmm']-gross_width/2,s['centreYmm']+gross_width/2]
    roof_top=invert0+s['waterHeightMm']+s['bodyMm']
    fixed_top=roof_top+s['flangeMm']
    lid_bottom=fixed_top+1.2
    lid_top=lid_bottom+s['lidMm']
    clamp_top=lid_top+s['lidRimMm']
    bolt_top=clamp_top+s['boltProjectionMm']
    body_bottom=invert1-2*s['bodyMm']
    duty=event['catchment']['combinedM2']*source['hydraulicProbe']['rainfallMmPerHour']/3600
    half=(s['waterWidthMm']-s['webMm'])/2
    effective_height=s['waterHeightMm']-s['debrisMm']-s['lapMm']
    flows={name:closed_flow(half*factor,effective_height,duty/count,length,s['roughness'],s['localK'],quiet,invert1+s['waterHeightMm'],s['flowSettingMm']) for name,count,factor in [('normal',2,1),('one-half-blocked',1,1),('one-half-plus-width-loss',1,s['widthFraction'])]}
    vent_area=math.pi*(s['ventDiameterMm']/1000)**2/4*s['ventAreaFraction']
    air_speed=duty/1000/vent_area
    vent_pa=s['ventK']*1.2*air_speed**2/2
    max_pressure=(protected-invert1)/1000*9.81+vent_pa/1000+max(v['exitVelocityHeadMm'] for v in flows.values())/1000*9.81
    lid_clear=(s['waterWidthMm']-s['centralFlangeMm'])/2
    half_lid_outer=(outer_width-s['lidButtGapMm'])/2
    roof=plate_strip(half,s['bodyMm']-s['metalLossMm'],s['pressureProofKPa'],s['elasticMPa'])
    lid=plate_strip(lid_clear,s['lidMm']-s['metalLossMm'],s['pressureProofKPa'],s['elasticMPa'])
    gasket_area=(s['lidClearLengthMm']+2*s['gasketWidthMm'])*(lid_clear+2*s['gasketWidthMm'])-s['lidClearLengthMm']*lid_clear
    long_pitch=(s['lidClearLengthMm']+2*s['boltEdgeOffsetMm'])/(s['boltsOnLongSide']-1)
    short_pitch=(lid_clear+2*s['boltEdgeOffsetMm'])/(s['boltsOnShortSide']-1)
    max_pitch=max(long_pitch,short_pitch)
    bolts=2*(s['boltsOnLongSide']+s['boltsOnShortSide'])-4
    local_gasket=s['boltPreloadKN']*1000*(1-s['preloadLossFraction'])/(max_pitch*s['gasketWidthMm'])
    fixed_flange_stress=s['boltPreloadKN']*1000*(s['boltEdgeOffsetMm']-s['gasketWidthMm']/2)/(max_pitch*(s['flangeMm']-s['metalLossMm'])**2/6)
    removable_flange_stress=s['boltPreloadKN']*1000*(s['boltEdgeOffsetMm']-s['gasketWidthMm']/2)/(max_pitch*(s['lidMm']+s['lidRimMm']-2*s['metalLossMm'])**2/6)
    flange_stress=max(fixed_flange_stress,removable_flange_stress)
    uplift=s['pressureProofKPa']/1000*lid_clear*s['lidClearLengthMm']/1000
    lid_mass=half_lid_outer*(s['lidClearLengthMm']+2*s['flangeWidthMm'])*s['lidMm']*8e-6
    rim_area=half_lid_outer*(s['lidClearLengthMm']+2*s['flangeWidthMm'])-lid_clear*s['lidClearLengthMm']
    half_stock=lid_mass+rim_area*s['lidRimMm']*8e-6
    handling=compile_split_handling(s,h,ffl,lid_bottom,lid_clear,half_lid_outer,half_stock,bolts)
    station_extra=(outer_width*(s['lidClearLengthMm']+2*s['flangeWidthMm'])-2*lid_clear*s['lidClearLengthMm'])*s['flangeMm']*8e-6+2*handling['permanentLidMassKg']-2*lid_clear*s['lidClearLengthMm']*s['bodyMm']*8e-6
    openings=[]; gallery=source['bridge']['permanentDryGalleryClearX']
    ranges=[('court-east',x0,gallery[0],h['courtEastWindow6850']['retainedRoughOpening']['centre'],s['courtDrawMm']),('spine-weather',*source['bridge']['newEastWeatherWallX'],sum(h['outerServiceArch']['finishedY'])/2,-s['spineDrawMm'])]
    for name,a,b,centre,pull in ranges:
        radius=(s['scupperSpanMm']**2/4+s['scupperRiseMm']**2)/(2*s['scupperRiseMm'])
        crown=s['scupperSpringMm']+s['scupperRiseMm'];lining=s['jambGlassMm']+s['liningMm']
        edge=max(abs(y-centre) for y in [s['centreYmm']-outer_width/2,s['centreYmm']+outer_width/2])
        intrados=crown-radius+math.sqrt((radius-lining)**2-edge**2) if edge<radius-lining else -1e9
        raw_y=[centre-s['scupperSpanMm']/2,centre+s['scupperSpanMm']/2]
        module=[a-s['wallTailMm'],b+s['wallTailMm']];park=[v+pull for v in module]
        moving_roof=invert0-(module[0]-x0)/s['slopeRatio']+s['waterHeightMm']+s['bodyMm']+max(0,-pull/s['slopeRatio'])
        openings.append({'id':name,'actualWallXmm':[a,b],'rawYmm':raw_y,'finishedYmm':[raw_y[0]+lining,raw_y[1]-lining],
                         'rawBottomMm':350,'bottomGlassToMm':450,'rawSpringMm':s['scupperSpringMm'],'rawCrownMm':crown,'finishedCrownMm':crown-lining,
                         'ringTopMm':crown+s['ringMm'],'windowSillMm':750+delta if name=='court-east' else None,
                         'aboveFloorOpeningMm':max(0,crown-lining-ffl),'sideReserveAfter5Mm':min(gross_y[0]-raw_y[0]-lining,raw_y[1]-lining-gross_y[1])-5,
                         'movingJointFreeBodyToIntradosAfter5Mm':intrados-moving_roof-5,
                         'jointFreeWallBodyXmm':module,'shortDrawMm':pull,'parkXmm':park,'parkReserveAfter10Mm':min(park[0]-gallery[0],gallery[1]-park[1])-10,
                         'wallBodyStockMassKg':(module[1]-module[0])*(2*s['waterWidthMm']+3*s['waterHeightMm'])*s['bodyMm']*8e-6,
                         'noRCorDPCcut':True,'thermalGlassReductionMm':dict(h['weather']['layersRoomToWeather'])['bareCellularGlass']-s['jambGlassMm']})
    walk_point=s['walkingCoverPointLoadKN'];walk_live=s['walkingLiveLoadKPa'];grid_point=walk_point*s['walkingGridSimultaneousPoints']
    frame_span=outer_width+2*s['frameGapMm']+s['railWidthMm']
    frame_section=section(100,40,4-s['metalLossMm'])
    grid_moment=1.5*grid_point*1000*frame_span/4+(1.35*1.7+1.5*walk_live)*.65*frame_span**2/8
    frame_check={'pointLoadLaw':{'independentWalkingCoverPointKN':walk_point,'simultaneousNeighbouringCoverPoints':s['walkingGridSimultaneousPoints'],'gridPointResultantKN':grid_point,'walkingLiveKPa':walk_live,'NpointLoadKNDoesNotSetThisLaw':True},'spanMm':frame_span,'sectionMm':[100,40,4],'minimumWallMm':4-s['metalLossMm'],'ULSStressMPa':grid_moment/frame_section['modulusMm3'],
                 'SLSPointDeflectionMm':grid_point*1000*frame_span**3/(48*s['elasticMPa']*frame_section['inertiaMm4']),
                 'bayPitchMm':650,'crossbarWidthMm':100,'clearAccessLengthMm':550,'clearAccessWidthMm':outer_width+2*s['frameGapMm'],
                 'lidEnvelopeMmPerHalf':[s['lidClearLengthMm']+2*s['flangeWidthMm'],half_lid_outer],
                 'medianSectionMm':[100,30,4],'medianULSStressMPa':(1.5*grid_point*1000*650/4+(1.35*1.7+1.5*walk_live)*.373*650**2/8)/section(100,30,4-s['metalLossMm'])['modulusMm3'],'medianSLSPointDeflectionMm':grid_point*1000*650**3/(48*s['elasticMPa']*section(100,30,4-s['metalLossMm'])['inertiaMm4']),'solePlateXYmm':[280,60],'authored60x280SoleGlassSLSContactMPa':(grid_point*1000+(1.7+walk_live)*.373*100)/(280*60),'glassCapacityCreepOrUniformContactAdmitted':False,'lidReleaseRequiresOwnMedianSegmentRemoval':True,'loadPath':'Walking plate/stone to40-deep dry grid to60 rails to60×280 soles on retained100glass and RC350; pressure body takes no walking load.'}
    intake=compile_intake(h,delta,duty,flows['one-half-plus-width-loss'],invert1+s['waterHeightMm'],s)
    local_catch=compile_catch(s,h,source,invert0,invert1,outer_width)
    north=compile_north(s,h,grid,ffl)
    east_terminal=compile_east_terminal(s,h,grid,invert1,station_extra)
    joined={}
    for label,ncase in north['loadCases'].items():
        factor=ncase['deadFactor']
        joined[label]={head:{key:value+factor*east_terminal['source52SLSHeadLoadAdditions'][head][key] for key,value in forces.items()} for head,forces in ncase['source52HeadLoadAdditions'].items()}
    support_source=h['sections']['groundSupport']
    lowest_grid=min([g['z'][0] for g in grid['girders'].values()]+[g['z'][0] for g in grid['crossBeams'].values()]+[head['capZ'][0] for head in grid['heads']])
    reserve=support_source['heaveStress']+support_source['constructionLoss']+support_source['ventilationReserve']
    diagnostics=[]
    if ground['localSolum']>-max(-lowest_grid,-north['lowestNewStructuralMm'])-reserve:diagnostics.append('ACTUAL_GROUND_SOLUM_SHALLOWER_THAN_KNOWN_HEAVE_STRUCTURE_ENVELOPE')
    if east_terminal['equilibrium']['maximumAbsoluteResidual']>1e-6:diagnostics.append('E_TERMINAL_GRAVITY_SIX_WRENCH_MISMATCH')
    if handling['captureAdditionalWeldBudgetKg']<.04:diagnostics.append('LID_WELD_MASS_ALLOWANCE_BELOW_NOMINAL_FILLET_AND_CAPTURE_BUDGET')
    if not split_weld(s,max_pitch)['comparisonPass']:diagnostics.append('SPLIT_LID_DOUBLER_WELD_SCREEN_FAILS')
    if handling['bailCrossbarDynamicStressMPa']>s['stressScreenMPa']:diagnostics.append('SPLIT_LID_BAIL_STRESS_SCREEN_FAILS')
    if handling['chargedLiftingMassKg']>15:diagnostics.append('SPLIT_LID_CHARGED_LIFT_EXCEEDS15KG')
    if any(not p['captureGeometry']['liftingTongueRimAttachmentGeometryPass'] for p in handling['operators']):diagnostics.append('SPLIT_LID_CAPTURE_TONGUE_HAS_NO_FIXED_RIM_SEAT')
    if any(p['captureGeometry']['minimumContinuousLiftThroughFloorClearanceAfter5Mm']<0 for p in handling['operators']):diagnostics.append('SPLIT_LID_CAPTURE_CANNOT_PASS_DRY_FLOOR_OPENING')
    if any(p['toolCaptureGeometryFailureBolts'] for p in handling['operators']):diagnostics.append('SPLIT_LID_SOCKET_BAIL_COEXISTENCE_FAILS')
    if any(p['captureInstallation']['minimumContinuousForkInsertionToRetainedBoltClearanceAfter5Mm']<0 or p['captureInstallation']['minimumPinToolCaptureClearanceAfter5Mm']<0 or p['captureInstallation']['maximumPinToolReachMm']>600 for p in handling['operators']):diagnostics.append('SPLIT_LID_CAPTURE_INSTALL_RETURN_GEOMETRY_FAILS')
    if max(handling['forkTongueDynamicStressMPa'],handling['forkLowerPlateDynamicStressMPa'])>s['stressScreenMPa']:diagnostics.append('SPLIT_LID_CAPTURE_PLATE_SCREEN_FAILS')
    if max(p['maximumAllBoltToolReachMm'] for p in handling['operators'])>600:diagnostics.append('SPLIT_LID_ALL_BOLT_TOOL_REACH_EXCEEDS600')
    if min(p['minimumBodyToOpenFloorAfter5Mm'] for p in handling['operators'])<0:diagnostics.append('SPLIT_LID_OPERATOR_BODY_INTERSECTS_OPEN_FLOOR_SETTING')
    if max(p['standingCarryReachMm'] for p in handling['operators'])>600:diagnostics.append('SPLIT_LID_STANDING_CARRY_REACH_EXCEEDS600')
    if 12200+(s['lidClearLengthMm']+2*s['flangeWidthMm'])/2>x1:diagnostics.append('PRESSURE_CLEANOUT_EXTENDS_BEYOND_BODY_ROUTE')
    if not intake['comparisonPass']:diagnostics.append('CLOSED_E_INLET_OR_FREE_OVERFALL_SCREEN_FAILS')
    if s['boltPreloadKN']>s['boltProofMPa']*s['boltTensileAreaMm2']/1000:diagnostics.append('BOLT_PRELOAD_EXCEEDS_AUTHORED_PROOF_LOAD')
    if not all(v['comparisonPass'] for v in flows.values()):diagnostics.append('CLOSED_E_HEAD_LOSS_EXCEEDS_SOURCE_QUIET_HEAD')
    if min(gross_y[0]-h['outerServiceArch']['finishedY'][0],h['outerServiceArch']['finishedY'][1]-gross_y[1])-5<0:diagnostics.append('RETAINED_E_OUTER_ARCH_PLAN_CLASH')
    if max_pressure>s['pressureProofKPa']:diagnostics.append('BODY_PRESSURE_SCREEN_TOO_LOW')
    if ffl-15-12-30-bolt_top-5<0:diagnostics.append('CENTRAL_BOLT_COLLIDES_DRY_MEDIAN_MEMBER')
    if thermal_bottom+20-bolt_top-5<0:diagnostics.append('PRESSURE_LID_BOLT_COLLIDES_THERMAL_COVER')
    if invert0-(12000-x0)/s['slopeRatio']-6-450-s['supportHeightMm']-5<0:diagnostics.append('WET_SUPPORT_CANNOT_RETAIN100GLASS')
    if min(o['sideReserveAfter5Mm'] for o in openings)<0 or min(o['movingJointFreeBodyToIntradosAfter5Mm'] for o in openings)<0:diagnostics.append('SCUPPER_WHOLE_BODY_ROUTE_FAILS')
    if min(o['parkReserveAfter10Mm'] for o in openings)<0:diagnostics.append('SHORT_WALL_BODY_CANNOT_PARK')
    if local_gasket<s['gasketMinimumStressMPa']:diagnostics.append('GASKET_LOCAL_PRELOAD_BELOW_SOURCE_BENCHMARK')
    if max(roof['stressMPa'],lid['stressMPa'],flange_stress,frame_check['ULSStressMPa'])>s['stressScreenMPa']:diagnostics.append('METAL_COMPONENT_NUMERICAL_SCREEN_FAILS')
    if frame_check['medianULSStressMPa']>s['stressScreenMPa']:diagnostics.append('MEDIAN_GRID_MEMBER_NUMERICAL_SCREEN_FAILS')
    if frame_check['SLSPointDeflectionMm']>frame_span/300:diagnostics.append('WALKING_GRID_DEFLECTION_SCREEN_FAILS')
    if not local_catch['trialWithinComputedEnvelope']:diagnostics.append('AUTHORED_LOCAL_LEAK_EXCEEDS_SHALLOW_CATCH_ENVELOPE')
    diagnostics.extend(north['diagnostics'])
    return {'schema':'closed-service-floor-result/2','sourceIdentities':case['sources'],'groundAuthority':case['groundStack']['source'],'groundStack':ground,'settings':s,
            'status':'bounded-numerical-comparison' if not diagnostics else 'rejected-numerical-comparison','diagnostics':diagnostics,
            'selectedHouseAdmitted':False,'physicalInstallationAdmitted':False,'sourceApprovalTransferred':False,
            'levelsMm':{'ffl':ffl,'firstFFL':h['sections']['firstFFL']+delta,'courtLow':h['sections']['waterLevels']['courtNorth']+delta,
                        'quiet':quiet,'protectiveWaterStage':protected,'actualLowestGround':None,'nominalGrade':grade},
            'floorLayersZMm':{'mineral':ground['mineralCourse'],'RC':ground['dryRC'],'bareGlass':ground['glass'],'accessible':ground['accessibleDistribution'],'finish':ground['finish']},
            'east':{'routeXmm':[x0,x1],'grossYmm':gross_y,'bodyOuterWidthMm':outer_width,'grossWidthMm':gross_width,'invertEndsMm':[invert0,invert1],
                    'headerPlanXYMm':[7300,6500,7750,7375],'intakeCoupling':intake,'headerWaterReturnsToMm':protected,'ventAndWeatherHoodTopMm':protected+50,
                    'visibleIntakeBoxHeightAboveLowFrontMm':protected-(delta-95),'dutyLps':duty,'closedFlows':flows,
                    'vent':{'clearDiameterMm':s['ventDiameterMm'],'remainingAreaFraction':s['ventAreaFraction'],'velocityMps':air_speed,'lossPa':vent_pa,'fullyBlockedVentAdmitted':False},
                    'pressure':{'lidCentralMm':s['lidMm'],'lidPerimeterDoublerMm':s['lidRimMm'],'fixedFlangeMm':s['flangeMm'],'lidDoublerContinuousFilletLegMm':4,'lidDoublerCompositeActionAdmitted':False,'pressureLidsPerStation':2,'halfClearOpeningMm':[lid_clear,s['lidClearLengthMm']],'halfOuterLidMm':[half_lid_outer,s['lidClearLengthMm']+2*s['flangeWidthMm']],'centralFixedFlangeWidthMm':s['centralFlangeMm'],'centralButtGapMm':s['lidButtGapMm'],'fixedFrameBottomAboveClearWaterRoofMm':s['bodyMm'],'centralFlangeBelowClearWaterRoofMm':0,'centralRoofWebInterfaceCapacityAdmitted':False,'gasketNominalMm':2,'authoredAssembledGasketMm':1.2,'assembledGasketAboveFixedFrameMm':1.2,'exactCompressedContactQualified':False,'maximumCalculatedKPa':max_pressure,'authoredProofKPa':s['pressureProofKPa'],'roof':roof,'lid':lid,'flangeStressMPa':flange_stress,
                                'boltCount':bolts,'boltTargetPreloadKN':s['boltPreloadKN'],'boltProofLoadKN':s['boltProofMPa']*s['boltTensileAreaMm2']/1000,
                                'gasketAreaMm2':gasket_area,'maximumBoltPitchMm':max_pitch,'minimumLocalTributaryGasketStressMPa':local_gasket,
                                'sourceMinimumBenchmarkMPa':s['gasketMinimumStressMPa'],'upliftWholeLidKN':uplift,'wholeLidPlateMassKg':lid_mass,'halfLidAndDoublerMassKgBeforeBolts':half_stock,'solid14LidAlternativeMassKg':(s['waterWidthMm']+2*s['flangeWidthMm']+2*s['bodyMm'])*(s['lidClearLengthMm']+2*s['flangeWidthMm'])*14*8e-6,'handling':handling,'lidDoublerWeldScreen':split_weld(s,max_pitch),'rejectedSingleLidComparison':{'checkpoint':'15e40a2e','stockMassKg':23.44096,'targetChargedLiftingKg':15,'chosenMaintenanceComparison':False,'reason':'Single600clear lid exceeds15kg before captive handling; two conventional lids replace it.'},'extraPermanentStockKgPerStationBeyondRoof':station_extra,
                                'uniformContactOrWatertightnessProved':False,'pressureLidTakesWalkingLoad':False},
                    'section':{'fixedFlangeBottomMm':roof_top,'fixedFlangeTopMm':fixed_top,'pressureLidUndersideMm':lid_bottom,'roofTopMm':roof_top,'pressureLidTopMm':lid_top,'clampingRimTopMm':clamp_top,'boltPocketUnderskinMm':thermal_bottom+20,'localBoltPocketCoreMm':30,'pressureLidFieldCoreMm':40,'pressureLidFieldUnderskinMm':thermal_bottom+10,'ordinaryCassetteCoreMm':50,'boltTopMm':bolt_top,'thermalUnderskinMm':thermal_bottom,
                               'boltToThermalAfter5Mm':thermal_bottom+20-bolt_top-5,'centralBoltToMedianAfter5Mm':ffl-15-12-30-bolt_top-5,'lowestBodyBackingMm':body_bottom,'bodyBackingAtInteriorEndMm':invert0-(12000-x0)/s['slopeRatio']-6,
                               'supportTo100GlassAfter5Mm':invert0-(12000-x0)/s['slopeRatio']-6-450-s['supportHeightMm']-5},
                    'retainedOuterArch':{'finishedYmm':h['outerServiceArch']['finishedY'],'grossRouteSideReserveAfter5Mm':min(gross_y[0]-h['outerServiceArch']['finishedY'][0],h['outerServiceArch']['finishedY'][1]-gross_y[1])-5,'springMm':h['outerServiceArch']['spring']+delta,'crownMm':h['outerServiceArch']['crown']+delta,'ringTopMm':h['outerServiceArch']['ringTop']+delta,'overheadRCUndersideMm':h['outerServiceArch']['overheadRCUnderside']+delta,'sourceCapacityTransferred':False},
                    'dryFloorGrid':frame_check,'walkingCassettes':{'clearOneWaySpanMm':(outer_width+2*s['frameGapMm']-100)/2,'panelMaximumLengthMm':240,'plateMm':12,'stoneMm':15,'bareGlassMm':50,'underskinMm':1.5,'numericalScreen':plate_walking({**s,'pointLoadKN':walk_point,'liveKPa':walk_live},(outer_width+2*s['frameGapMm']-100)/2),'airGasEdgeJointAdmitted':False,'medianRHSsectionMm':[100,30,4],'medianAtGridBaySpanMm':650,'walkingPanelMaximumXYmm':[240,(outer_width+2*s['frameGapMm']-100)/2+50],'removal':'240max short pairs release before own550clear median segment/pressurelid; no general room-floor opening.'},'scuppers':openings,'exteriorTerminalSupport':east_terminal,
                    'pressureCleanouts':{'centresXmm':[8650,10050,12200],'clearPlanMmPerHalf':[lid_clear,450],'halvesAtYmm':[[s['centreYmm']-s['waterWidthMm']/2,s['centreYmm']-s['centralFlangeMm']/2],[s['centreYmm']+s['centralFlangeMm']/2,s['centreYmm']+s['waterWidthMm']/2]],'removeTopRoofForWholeBodyRenewal':True,'weldedRoofNotHiddenPermanentFabric':True},
                    'crewFloorLoadPorts':crew_floor_ports(handling,s),
                    'gasketEvidence':gasket_evidence,'localLeakCatch':local_catch,
                    'renewal':'N assembled and proved full-duty plus temporary roof/segregated pipe in ordinary source rain states. Isolate/drain E; remove own dry cassettes, median segment and pressure lid. Cut accessible field welds outside walls; remove field bay first. Draw joint-free wall body at installed slope into gallery, capture and lift. Renew body by top-access cold cut/qualified reweld, then low-head leak test before restoring. No live fault opening and no embedded service/fabric joint.',
                    'receiver':{'planXYWHmm':receivers['east']['receiverBounds'],'outletInvertMm':invert1,'requiredMaximumWaterMm':invert1-200,
                                'requiredAirgapMm':200,'actualWaterOrTerrainMm':None,'sourceOldTerminalApplicable':False,
                                'backwaterFailure':'If water rises above the admitted tailwater/head boundary, E is unavailable; close maintenance and transfer assigned full source to independently verified N. No check-valve credit.'}},
            'approaches':{'front':approach(h['approaches']['front'],ffl-grade),'garden':approach(h['approaches']['garden'],h['sections']['waterLevels']['loggiaNorth']+delta-grade)},
            'sourceConsequences':{'firstAboveNominalGradeMm':h['sections']['firstFFL']+delta-grade,'actualLowestAdjacentGroundMm':None,'groundStoreyIntervalMm':h['sections']['firstFFL']-h['sections']['groundFFL'],'groundCoreStemIncreaseVs530Mm':ffl-530,'allGroundAndUpperSourceApplicabilityReopened':True,'addedRCComparedWith530ProposalRemovedM3':0,'monetarySaving':None},
            'north':north,'joinedGravityEquilibrium':{label:gravity_audit(ncase['gravityComponentLedger']+[{**row,'downwardKN':row['downwardKN']*ncase['deadFactor']} for row in east_terminal['componentGravityLedger']],joined[label],grid) for label,ncase in north['loadCases'].items()},'joined52HeadLoadAdditions':joined,'joinedLoadBoundary':'N outdoor deck/frame/water and E exterior water terminal ONLY. New occupied floor, walls, scupper arches, wind/seismic, header, source upper loads and original gravity remain separate source52 demand; these cards are additions, not replacement or whole-house capacity.',
            'ground':{'lowestNewStructuralMm':north['lowestNewStructuralMm'],'retainedGridLowestMm':lowest_grid,
                      'heaveMm':support_source['heaveStress'],'constructionMm':support_source['constructionLoss'],'ventilationMm':support_source['ventilationReserve'],'knownEnvelopeMinimumDmm':max(-lowest_grid,-north['lowestNewStructuralMm'])+reserve,
                      'authoredLocalSolumMm':ground['localSolum'],'authoredExtraDepthBeyondKnownMinimumMm':-ground['localSolum']-(max(-lowest_grid,-north['lowestNewStructuralMm'])+reserve),'completeSiteSolumMinimumDmm':None,'oldDeepServiceEnvelopeNoLongerRequiredWithinThisMethod':not diagnostics,'authoredGroundActuallyReducedFrom1800':ground['localSolum']>-1800,
                      'remainingGroundDuty':'Actual soil/heave/support, gas/moisture/air boundary, ground levels and receiving terrain remain explicit; no basement/daylight or surveyed-grade claim.'},
            'failureStates':{'EblockedOrBackwater':'E intake contained to protective730 atbaseline, returns through actual front court opening. N must carry the complete assigned source; no old hydraulic signoff applies.',
                             'Nmaintenance':'E must be proved full-duty and intact; preserve source staged court catch then separate loggia roof/pipe rain controls. No two-live claim while either body is open.',
                             'Nblocked':'Folded N returns translate withfloor; water returns onto court to E. New support frame cannot make the water body or gallery void a spill path.',
                             'bothUnavailable':'No protected occupation or maintenance claim; source quiet/first-harm and actual fallback routing require joined RWT proof.'},
            'holds':[{'id':'E-pressure-seal','objects':['E-split-pressure-lids','E-fixed-central-flange'],'missing':'Actual rectangular water-seal contact/leak event; helium13MPa is only a comparison benchmark, not required water preload.'},{'id':'E-captured-handling','objects':['E-pressure-lids','E-700-bail','E-all-bolt-tool'],'missing':f'Actual grip/capture/return/torque and{handling["operators"][0]["verticalLiftForceN"]:.1f}N lift/up to{max(p["staticShoulderOffsetMomentNm"] for p in handling["operators"]):.1f}Nm shoulder-offset event; mass/geometry does not certify a person or tool.'},{'id':'E-local-leak-first-harm','objects':['E-local-catch','E-separate-catch-receiver'],'missing':f'Accepted physical leak area/head/duty and first harmful fabric/air wetting;{local_catch["computedMaximumLocalLeakLps"]:.5f}Lps is computed envelope, not an accepted leak event.'},{'id':'N-structural-frame','objects':['N-crossbearers','N-EW-beams','E-terminal-frame','E-crew-floor-ports','source52-added-head-wrenches'],'missing':'Compatible N/E frame/actual RC grid settlement, anchors/rebar/lateral bracing/tied-seat tension and original combined demand; one-way fixed-primary trial has no whole-frame admission.'},{'id':'MAT-thermal-weather-material','objects':['E-scupper-arches','E-30-40-50-upperglass','N-350-sole-730-return'],'missing':'Exact constituents/residues/contact corrosion; continuous thermal/air/gas/weather faces, local glass creep, new masonry openings and taller shoe joins.'},{'id':'RWT-independent-receivers','objects':['N-receiver','E-main-receiver','E-local-catch-receiver'],'missing':'Actual separate outfall/terrain/backwater/splash/disposal and staged maintenance full-duty source; no original signoff transfers.'}],
            'remainingPhysicalDuties':['Exact low-head rectangular gasket/flange contact and cyclic water leak test; source13MPa helium benchmark is not water certification.',
                                      'Exact uncoated graphite/steel/copper/mineral constituents, chloride/contact corrosion, weld filler/cleaning and retained-residue acceptance.',
                                      'SourceNwater body/saddles/long-liner operation retained geometrically; old physical or hydraulic admission does not transfer.',
                                      'Anchors/brackets/member seats/bolts/lateral bracing and source52-grid redistribution, including actual RC reinforcement and combined original demand.',
                                      'Thermal100below+50cassette continuity,70rails/60×280soles glass creep, steel bridges, scupper110vs200glass cost, air/gas and removable weather collars.',
                                      'New masonry scupper thrust/ring/pier/window loads and closed wet-joint field welding/handling access.',
                                      'Visible intake hood/730returns, higher715rooms/185stem,20.9m front reservation and owner no-cantilever/material/appearance choices.',
                                      'Actual site N/E separate downhill receiver capacity/backwater/splash/erosion/disposal and accessible approaches.']}


def compile_north(s,h,grid,ffl):
    normal=h['northNormalRoute']['normal'];terminal=h['northNormalRoute']['terminal'];delta=ffl-h['sections']['groundFFL']
    gx=grid['girders']['loggia-W'];east=grid['girders']['loggia-E']
    supports=[v['u'] for v in gx['heads']]
    if supports != [v['u'] for v in east['heads']] or gx['z'] != east['z']:
        raise ValueError('Asymmetric source loggia support requires a new topology')
    start=h['loggia']['clear'][1];end=h['loggia']['clear'][1]+h['loggia']['clear'][3]
    north_end=terminal['endY'];operator_y=normal['renewal']['endWorkBodyCentres'][-1][1];platform_end=operator_y+300
    nodes=sorted(set([start,end,operator_y,platform_end,north_end,(supports[0]+supports[1])/2,*supports]))
    walk=lambda y:h['sections']['waterLevels']['courtNorth']+delta-(y-start)*normal['flowSlope']
    ns=section(100,180,6-s['metalLossMm']);floor=section(50,100,5-s['metalLossMm']);ew=section(100,200,6-s['metalLossMm'])
    edge_frames=[normal['frame']['insideFrameX'][0]-10,normal['frame']['insideFrameX'][1]+10]
    rail_x=[4960,5275]
    width=h['loggia']['clear'][2]-(normal['centreX']+normal['channelGross']/2-h['loggia']['clear'][0])
    strip_count=math.ceil(width/300);strip_width=width/strip_count
    field_x=[normal['centreX']+normal['channelGross']/2+(i+.5)*strip_width for i in range(strip_count)]
    column_x=[gx['datum']+gx['width']/2+100,east['datum']-east['width']/2-100]
    cross_nodes=sorted(set([column_x[0]-50,*column_x,column_x[1]+50,*rail_x,*field_x]))
    all_cases={};diagnostics=[]
    case_specs=[(*row,None,None) for row in [('SLS-gravity',1,1,0,0),('SLS-terminal2kN',1,1,s['pointLoadKN'],0),('ULS-terminal2kN',1.35,1.5,1.5*s['pointLoadKN'],0),('SLS-field2kN',1,1,0,s['pointLoadKN']),('ULS-field2kN',1.35,1.5,0,1.5*s['pointLoadKN']),('SLS-platform-west2kN',1,1,s['pointLoadKN'],0),('ULS-platform-west2kN',1.35,1.5,1.5*s['pointLoadKN'],0),('SLS-Ncover-west2kN',1,1,s['pointLoadKN'],0),('ULS-Ncover-west2kN',1.35,1.5,1.5*s['pointLoadKN'],0),('SLS-platform-west2kN-no-field-live',1,1,s['pointLoadKN'],0),('ULS-platform-west2kN-no-field-live',1.35,1.5,1.5*s['pointLoadKN'],0)]]
    case_specs.extend([('SLS-endoperator2kN',1,1,s['pointLoadKN'],0,None,None),('ULS-endoperator2kN',1.35,1.5,1.5*s['pointLoadKN'],0,None,None),('STABILITY-dry-min-stock-platform-west2kN-no-field-live',.9,1.5,1.5*s['pointLoadKN'],0,None,None)])
    field_ys=[start,(supports[0]+supports[1])/2,(supports[1]+supports[2])/2,end]
    for prefix,df,lf,pf in [('SLS',1,1,1),('ULS',1.35,1.5,1.5)]:
        for index in range(len(field_x)):
            for iy,yy in enumerate(field_ys):
                case_specs.append((prefix+'-field-family/x'+str(index)+'/y'+str(iy),df,lf,0,pf*s['pointLoadKN'],index,yy))
    for label,dead_factor,live_factor,point,field_point,field_index,field_y_override in case_specs:
        rails=[];floor_lines=[];ledger=[]
        minimum_dead=label.startswith('STABILITY')
        point_y=platform_end if 'platform-west' in label else (supports[0]+supports[1])/2 if 'Ncover-west' in label else operator_y if 'endoperator' in label else north_end
        point_x=normal['centreX']-450 if 'platform-west' in label else edge_frames[0] if 'Ncover-west' in label else normal['centreX']
        for x in rail_x:
            fraction=(rail_x[1]-normal['centreX'])/(rail_x[1]-rail_x[0]) if x==rail_x[0] else (normal['centreX']-rail_x[0])/(rail_x[1]-rail_x[0])
            dead_water=normal['channelClear']/1000*normal['renewal']['wallHeight']/1000*9.81*fraction
            dead_cover=(normal['channelGross']/1000*.012*80+(.25+2*.075+.05)*.0015*89.6+2*(.02*.05-.014*.044)*80+.025*.012*80)*fraction
            dead_pedestal=(2*.05*.058*24+section(50,50,4)['areaMm2']*1e-6*80*.49/.5)*fraction
            dead_steel=(ns if minimum_dead else section(100,180,6))['areaMm2']*1e-6*80
            if minimum_dead:dead_water=0;dead_cover=0;dead_pedestal=0
            loads=[]
            for a,b in zip(nodes,nodes[1:]):
                mid=(a+b)/2
                platform_dead=.9*(.02*26+.012*80+.35)*fraction if end<=mid<platform_end else 0
                platform_live=.9*s['liveKPa']*fraction if end<=mid<platform_end else 0
                if minimum_dead:platform_dead=0;platform_live=0
                q=dead_factor*(dead_water+dead_cover+dead_pedestal+dead_steel+platform_dead)+live_factor*platform_live
                loads.append(q)
                ledger.append({'id':'NS-rail-equivalent/'+str(x)+'/'+str(a),'xyMm':[x,(a+b)/2],'downwardKN':q*(b-a)/1000})
            point_fraction=(rail_x[1]-point_x)/(rail_x[1]-rail_x[0]) if x==rail_x[0] else (point_x-rail_x[0])/(rail_x[1]-rail_x[0])
            ledger.append({'id':'NS-equivalent-point/'+str(x),'xyMm':[x,point_y],'downwardKN':point*point_fraction})
            result=beam(nodes,supports,loads,[(point_y,point*point_fraction*1000)],ns['inertiaMm4'],s['elasticMPa'])
            result['xMm']=x;result['stressMPa']=result['maximumMomentNmm']/ns['modulusMm3']
            rails.append(result)
        field_point_y=field_y_override if field_y_override is not None else (supports[0]+supports[1])/2
        floor_nodes=sorted(set([start,end,field_point_y,*supports]))
        for i,x in enumerate(field_x):
            effective=strip_width/1000
            dead=(0 if minimum_dead else effective*(.02*26+.012*80))+(floor if minimum_dead else section(50,100,5))['areaMm2']*1e-6*80
            q=dead_factor*dead+(0 if 'no-field-live' in label else live_factor*effective*s['liveKPa'])
            active_index=field_index if field_index is not None else len(field_x)-1
            ledger.append({'id':'field-stringer/'+str(i),'xyMm':[x,(start+end)/2],'downwardKN':q*(end-start)/1000})
            if i==active_index:ledger.append({'id':'field-person-point','xyMm':[x,field_point_y],'downwardKN':field_point})
            result=beam(floor_nodes,supports,[q]*(len(floor_nodes)-1),[(field_point_y,field_point*1000)] if i==active_index else [],floor['inertiaMm4'],s['elasticMPa'])
            result['xMm']=x;result['stressMPa']=result['maximumMomentNmm']/floor['modulusMm3'];floor_lines.append(result)
        cross=[];head_loads={head['id']:{'FxKN':0,'FyKN':0,'FzKN':0,'MxKNm':0,'MyKNm':0,'MzKNm':0} for head in grid['heads']}
        for j,y in enumerate(supports):
            forces=[(r['xMm'],r['supportReactionsKN'][j]*1000+(dead_factor*.12*.1*.218*24*1000 if r in floor_lines and not minimum_dead else 0)) for r in rails+floor_lines]
            crossload=dead_factor*(ew if minimum_dead else section(100,200,6))['areaMm2']*1e-6*80
            ledger.append({'id':'EW-crossbeam/'+str(y),'xyMm':[(cross_nodes[0]+cross_nodes[-1])/2,y],'downwardKN':crossload*(cross_nodes[-1]-cross_nodes[0])/1000})
            if not minimum_dead:
                for x in field_x:ledger.append({'id':'field-pedestal/'+str(y)+'/'+str(x),'xyMm':[x,y],'downwardKN':dead_factor*.12*.1*.218*24})
            result=beam(cross_nodes,column_x,[crossload]*(len(cross_nodes)-1),forces,ew['inertiaMm4'],s['elasticMPa'])
            result.update(yMm=y,topMm=walk(y)-350,bottomMm=walk(y)-550,stressMPa=result['maximumMomentNmm']/ew['modulusMm3'])
            cross.append(result)
            for side,source_girder in enumerate([gx,east]):
                head_id=source_girder['heads'][j]['id'];reaction=result['supportReactionsKN'][side]
                eccentric=column_x[side]-source_girder['datum']
                stool_height=walk(y)-550-source_girder['z'][1]
                column_stock=section(100,100,6-s['metalLossMm'] if minimum_dead else 6)['areaMm2']*stool_height*8e-8
                bracket=0 if minimum_dead else s['bracketMassKg']*9.81/1000
                face=source_girder['datum']+(source_girder['width']/2 if side==0 else -source_girder['width']/2)
                bracket_x=(face+column_x[side])/2
                ledger.extend([{'id':'column/'+head_id,'xyMm':[column_x[side],y],'downwardKN':dead_factor*column_stock},{'id':'bracket-allowance/'+head_id,'xyMm':[bracket_x,y],'downwardKN':dead_factor*bracket}])
                downward=reaction+dead_factor*(column_stock+bracket)
                head_loads[head_id]['FzKN']=-downward
                head_loads[head_id]['MyKNm']=(reaction+dead_factor*column_stock)*eccentric/1000+dead_factor*bracket*(bracket_x-source_girder['datum'])/1000
        stress=max(r['stressMPa'] for r in rails+floor_lines+cross)
        total=sum(-v['FzKN'] for v in head_loads.values())
        equilibrium=gravity_audit(ledger,head_loads,grid)
        if equilibrium['maximumAbsoluteResidual']>1e-6:diagnostics.append('N_GRAVITY_SIX_WRENCH_MISMATCH/'+label)
        all_cases[label]={'deadFactor':dead_factor,'minimumDeadCase':minimum_dead,'phase':'Ndrained/Eavailable; no favourable nonstructural mass' if minimum_dead else 'authored gravity and point trial','gravityComponentLedger':ledger,'equilibrium':equilibrium,'pointPlacement':{'railPointXYmm':[point_x,point_y] if point else None,'fieldPointXYmm':[field_x[field_index if field_index is not None else len(field_x)-1],field_point_y] if field_point else None},'railResults':rails,'fieldStringerResults':floor_lines,'crossbeamResults':cross,'source52HeadLoadAdditions':head_loads,
                          'totalAddedDownwardKN':total,'maximumMemberStressMPa':stress,
                          'maximumRailDeflectionMm':max(r['maximumDeflectionMm'] for r in rails),
                          'memberScreenPass':bool(stress<=s['stressScreenMPa'])}
        if stress>s['stressScreenMPa']:diagnostics.append('N_MEMBER_STRESS_SCREEN_FAILS/'+label)
        if max(r['maximumDeflectionMm'] for r in rails)>(north_end-supports[-1])/s['cantileverDeflectionRatio']:diagnostics.append('N_TERMINAL_DEFLECTION_SCREEN_FAILS/'+label)
    field_family=[{'id':key,'pointXYmm':value['pointPlacement']['fieldPointXYmm'],'maximumMemberStressMPa':value['maximumMemberStressMPa'],'maximumRailDeflectionMm':value['maximumRailDeflectionMm']} for key,value in all_cases.items() if 'field-family' in key]
    for key,value in all_cases.items():
        if 'field-family' in key:
            for detail in ['railResults','fieldStringerResults','crossbeamResults']:value.pop(detail)
    source_heads={head['id']:head for head in grid['heads']}
    seats=[]
    for j,y in enumerate(supports):
        for side,g in enumerate([gx,east]):
            head_id=g['heads'][j]['id'];head=source_heads[head_id]
            if head['xy'] != [g['datum'],y]:raise ValueError('Actual named head/axis mismatch')
            face=g['datum']+(g['width']/2 if side==0 else -g['width']/2)
            force=all_cases['ULS-terminal2kN']['source52HeadLoadAdditions'][head_id]
            vertical=-force['FzKN'];bracket_projection=abs(column_x[side]-face)
            if not all(g['z'][0]<=z<=g['z'][1] for z in [-300,-500]):diagnostics.append('N_BRACKET_ANCHOR_OUTSIDE_ACTUAL_COLD_RC/'+head_id)
            seats.append({'head':head_id,'sourceHeadXYmm':head['xy'],'actualGirderZMm':g['z'],'inwardFaceXmm':face,
                          'columnAxisXYmm':[column_x[side],y],'columnSectionMm':[100,100,6],
                          'columnBottomMm':g['z'][1],'columnTopMm':walk(y)-550,
                          'wallWeatherFaceMm':4800 if side==0 else 7200,
                          'columnBeyondFinishedWallMm':50,'bracketBottomMm':-550,
                          'authoredAnchorsZMm':[-300,-500],'verticalULSForceKN':vertical,
                          'bracketFaceMomentKNm':force['MyKNm']-vertical*(face-g['datum'])/1000,
                          'anchorRowCoupleKN':abs(force['MyKNm']-vertical*(face-g['datum'])/1000)*1000/200,
                          'headEccentricMomentKNm':force['MyKNm'],
                          'columnAxialULSStressMPa':vertical*1000/section(100,100,6-s['metalLossMm'])['areaMm2'],'columnPinnedEulerKN':math.pi**2*s['elasticMPa']*section(100,100,6-s['metalLossMm'])['inertiaMm4']/max(1,walk(y)-550-g['z'][1])**2/1000,'authoredBracketMassKg':s['bracketMassKg'],'jointCapacityAdmitted':False,'anchorToActualRebarProof':None})
    top=normal['carrierBottom'][1][1]+delta
    lifted=top+normal['renewal']['wallHeight']+normal['renewal']['lift']+normal['renewal']['riggingHeightAboveBody']
    portal=h['northNormalRoute']['portal']['finishedSpringAtVerticalJamb']+delta
    return {'analysisBoundary':'Linear prismatic NS beams on vertically fixed EW crossing points, followed by elastic EW response and actual-column reactions. This one-way transfer is a rigid-primary-support trial, not a compatible grillage or original cold-grid settlement solution. Recovered EW deflections and signed forces are exported for the joined model; no source52 capacity adoption.',
            'fieldPointFamily':{'stringerAxesXmm':field_x,'positionsYmm':field_ys,'scope':'Every actual field stringer at both span midpoints and both deck overhang ends; finite28position family, not a continuous moving-load proof.','cases':field_family},'gravityMassRule':'Nominal full stock for adverse downward cases; separate dry minimum-corroded-stock stability case excludes uncertain nonstructural stabilizing mass and bracket allowance.',
            'status':'dimensioned-load-addition-comparison','diagnostics':diagnostics,
            'actualSupportHeads':[g['id'] for pair in zip(gx['heads'],east['heads']) for g in pair],
            'headCount':len(grid['heads']),'supportYsMm':supports,'railAxesXmm':rail_x,'retainedEdgeFrameAxesXmm':edge_frames,'fieldStringerAxesXmm':field_x,'fieldStringerWidthMm':50,'columnAxesXmm':column_x,
            'walkingZMm':[[y,walk(y)] for y in nodes],'waterBedZMm':[[y,z+delta] for y,z in normal['carrierBottom']],
            'primaryCrossbeamExtentXmm':[4850,7150],'primaryCrossbeamSectionMm':[100,200,6],'primaryTopBelowWalkMm':350,'railSectionMm':[100,180,6],'railTopBelowWalkMm':170,
            'stackMm':{'Ncover':12,'NedgeFrame':50,'NmineralPedestal':58,'NtransverseCrossbearer':50,'NSrailDepth':180,'EWbeamDepth':200},
            'crossbearers':{'sectionMm':[50,50,4],'pitchMm':500,'topBelowWalkMm':120,'supportAxesXmm':rail_x,'edgeFrameAxesXmm':edge_frames,'leftOverhangMm':rail_x[0]-edge_frames[0],'sourceNcoverOneWayPlate12Screen':plate_walking(s,360),'leftEdgePointULSStressMPa':1.5*s['pointLoadKN']*1000*(rail_x[0]-edge_frames[0])/section(50,50,4-s['metalLossMm'])['modulusMm3'],'minimumToSourceBodyAfter5Mm':6.25,'sourcePedestal110ReplacedByMm':[58,50],'newCoverMm':12,'newCoverMassKgBeforeHardware':.4*.498*.012*8000,'ordinaryWholeShoeApronUncut':True,'capacityOrConnectionAdmitted':False},
            'floorField':{'NstripXmm':[4825,5225],'newWallTrimXmm':[4800,4825],'platePointNumericalScreen':plate_walking(s),'planXYWHmm':h['loggia']['clear'],'stoneMm':20,'walkingSteelMm':12,'stringerSectionMm':[50,100,5],
                          'maximumStringerPitchMm':300,'actualStringerPitchMm':strip_width,'separateMineralPedestalMm':218,'noOccupiedFloorGlassSubstitution':True,
                          'deckPlatePointOrStoneFixingAccepted':False,'woodOrPolymerFloorComponentsAssumed':False},
            'platformTransverseBearers':{'sectionMm':[80,100,5],'pitchMm':500,'deckMm':[20,12],'mineralPackMm':38,'westOverhangMm':rail_x[0]-(normal['centreX']-450),'eastOverhangMm':normal['centreX']+450-rail_x[1],'ULSWestEdgePointStressMPa':1.5*s['pointLoadKN']*1000*(rail_x[0]-normal['centreX']+450)/section(80,100,5-s['metalLossMm'])['modulusMm3'],'negativeRightRailReactionAdmittedAsBearing':False,'tiedSeatTensionProof':None},
            'endOperatorPlatformXYWHmm':[normal['centreX']-450,end,900,platform_end-end],
            'actualEndOperatorCentreXYmm':normal['renewal']['endWorkBodyCentres'][-1],
            'terminalRailCantileverMm':north_end-supports[-1],'peoplePlatformCantileverMm':platform_end-supports[-1],
            'cantileverSelectionAdmitted':False,'ownerCost':'A new1.8825m water-rail and0.9825m operator-platform projection; not the owners preferred grounded/repeated support. A new terminal footing would need actual site/ground proof and is not invented here.',
            'supportSeats':seats,'loadCases':all_cases,'originalHouseDemandIncluded':False,'combined52HeadCapacityAdmitted':False,
            'renewal':{'sourceLongLinerMassKg':normal['renewal']['screenMassKg'],'liftedBodyAndRiggingTopMm':lifted,'finishedPortalSpringMm':portal,
                       'liftReserveToSpringMm':portal-lifted,'bodyPlanWidthMm':normal['renewal']['bodyOutsideWidth'],
                       'sourceOperatorAndStagePlansRetained':True,'bodyRouteAndNewFrameDetailedForceTestAccepted':False},
            'protectiveBoundary':{'sourceSideShoeSoleMm':350,'sourceSideShoeApronXmm':[[4800,4900],[7100,7200]],'sourceShoeHeightIncreaseVs530Mm':ffl-530,'lowerShoeSourceRCtopOwnedNotFFLTranslated':True,
                                  'sourceShoeCrestMm':h['northProtectiveReturn']['crest']+delta,
                                  'sourceEndDamMm':h['northProtectiveReturn']['endDamTop']+delta,
                                  'bracketsAnchorColdRCBelowBoundary':True,'allNSrailsBeyondWeatherApronMm':10,'minimumNbodyToCrossbearerAfter5Mm':6.25,'newDryAirOrDPCpenetrations':0,
                                  'wholeWeatherClosureAccepted':False},
            'receiver':{'outletMm':terminal['currentVerticalExit']['outletZ']+delta,'maximumWaterMm':terminal['receiver']['nominalWaterPlane']+delta,
                        'airgapMm':200,'planXYWHmm':terminal['receiver']['bounds'],'siteTerrainAndSpillAdmitted':False},
            'lowestNewStructuralMm':min(row['bracketBottomMm'] for row in seats)}


def split_weld(s,pitch):
    plate=s['lidMm']-s['metalLossMm'];rim=s['lidRimMm']-s['metalLossMm'];total=plate+rim
    first=plate*(total/2-plate/2);inertia=total**3/12
    shear=s['boltPreloadKN']*1000*first/(inertia*pitch)
    lever=s['boltEdgeOffsetMm']-s['gasketWidthMm']/2
    transfer=shear*lever*pitch
    effective_leg=4-s['metalLossMm'];area=2*.707*effective_leg*pitch
    return {'nominalContinuousInnerOuterFilletLegMm':4,'effectiveLegMm':effective_leg,'localInterfaceTransferKN':transfer/1000,
            'twoFilletShearStressMPa':transfer/area,'authoredShearScreenMPa':s['stressScreenMPa']/math.sqrt(3),
            'comparisonPass':transfer/area<=s['stressScreenMPa']/math.sqrt(3),'actualWeldCompositeActionOrSealAdmitted':False,
            'centralFrame':'14fixed flange rests above the remaining3roof strip/3web; clamp preload self-equilibrates inside each frame and is not an external foundation force. Exact sheet weld/diaphragm/contact still unqualified.'}



def compile_split_handling(s,h,ffl,lid_bottom,clear_width,outer_width,stock,bolts):
    shank=math.pi*10**2/4*45*8e-6
    hex_area=math.sqrt(3)/2*17**2
    head=hex_area*6.4*8e-6;nut=(hex_area-math.pi*10**2/4)*8*8e-6
    washer=math.pi*(20**2-10.5**2)/4*2*8e-6
    fasteners=bolts*(shank+head+nut+washer)
    tube_area=math.pi*(16**2-14**2)/4;tube_i=math.pi*(16**4-14**4)/64
    sample_capture=capture_geometry(s,8650,'south',0)
    tube_length=sample_capture['tubeStockLengthMm']
    bar_span=sample_capture['crossbarSpanMm']
    tube_mass=tube_area*tube_length*8e-6
    eyes=2*80*s['bailFootWidthMm']*s['bailFootPlateMm']*8e-6
    seats=2*15*s['bailFootWidthMm']*s['bailTaperSeatMm']*8e-6
    clevis=(4*60*s['bailFootWidthMm']*3+2*60*3*(s['bailFootPlateMm']+8))*8e-6
    pin=2*(math.pi*10**2/4*(s['bailFootPlateMm']+6)+math.pi*8**2/4*3+math.pi*18**2/4*7)*8e-6
    capture=.015
    bail=tube_mass+eyes+seats+clevis+pin+capture
    weld_length=2*(clear_width+s['lidClearLengthMm'])+2*(outer_width+s['lidClearLengthMm']+2*s['flangeWidthMm'])
    field_weld_mass=weld_length*4**2/2*8e-6
    charged=stock+fasteners+bail+s['gasketMassAllowanceKg']+s['retainedWaterAllowanceKg']+s['weldMassAllowanceKg']
    permanent=stock+fasteners+eyes+seats+s['gasketMassAllowanceKg']+s['weldMassAllowanceKg']
    operators=[]
    for x in [8650,10050,12200]:
        for half in ['south','north']:
            cy=s['centreYmm']+(-1 if half=='south' else 1)*((s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']+s['lidButtGapMm'])/4)
            open_y=(s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']+2*s['frameGapMm'])/2
            opening=[[x-275,s['centreYmm']-open_y],[x+275,s['centreYmm']+open_y]]
            if x==8650:
                offset=max(675,open_y+300+10)
                operator=[x,s['centreYmm']+(-offset if half=='south' else offset)]
                horizontal=abs(operator[1]-cy)
                edge=abs(operator[1]-(s['centreYmm']-s['waterWidthMm']/2-s['flangeWidthMm']-s['bodyMm'] if half=='south' else s['centreYmm']+s['waterWidthMm']/2+s['flangeWidthMm']+s['bodyMm']))
                stage=[x,5600 if half=='south' else 7750]
            else:
                operator=[x+(585 if x==10050 else -585),cy];horizontal=585;edge=585-(s['lidClearLengthMm']+2*s['flangeWidthMm'])/2
                stage=[10950 if x==10050 else 11300,cy]
            actual_lid=lid_bottom-(x-7750)/s['slopeRatio']+s['lidMm']
            bolt=actual_lid+s['lidRimMm']+s['boltProjectionMm']
            shoulder_crouched=ffl+640;hand=bolt+300
            carry_handle=actual_lid+s['lidCarryLiftMm']+s['capturedBailHeightMm']
            access=bolt_access(s,x,half,operator,ffl,bolt,actual_lid,[8179.5,9203])
            stage_body=[operator[0]+stage[0]-x,operator[1]+stage[1]-cy]
            path_clearances=[floor_opening_body_clearance(operator,stage_body,opening)]+[floor_opening_body_clearance(b['operatorBodyCentreXYmm'],b['operatorBodyCentreXYmm'],opening) for b in access['allBoltControls']]
            operators.append({'floorOpeningPlanBoundsMm':opening,'bodyStageCentreXYmm':stage_body,'minimumBodyToOpenFloorAfter5Mm':min(path_clearances),'bodyCarryPathMm':[operator,stage_body],'stationXmm':x,'half':half,'bodyCentreXYmm':operator,'bodyRadiusMm':300,'nearestBoltHorizontalMm':edge,
                              'directNearestBolt300ExtensionReachMm':math.hypot(edge,shoulder_crouched-hand),**access,
                              'stageCentreXYmm':stage,'lidCarryLiftMm':s['lidCarryLiftMm'],'bailGripWorldZMm':carry_handle,
                              'standingCarryReachMm':math.hypot(horizontal,ffl+1450-carry_handle),
                              'verticalLiftForceN':charged*9.81,'staticShoulderOffsetMomentNm':charged*9.81*horizontal/1000,
                              'outsideHouseFootingRequired':False,'physicalForceOrHandlingAccepted':False})
    load=charged*9.81
    return {'targetChargedLiftingKg':15,'stockPlateAndRimKg':stock,'captiveBoltNutWasherMassKg':fasteners,
            'capturedBailTubeODIDmm':[16,14],'bailHeightMm':s['capturedBailHeightMm'],'bailCrossbarMm':bar_span,'bailStockLengthMm':tube_length,
            'bailAndEyesClevisPinsCaptureKg':bail,'bailInventoryKg':{'tube':tube_mass,'weldedLiftingTongues':eyes,'weldedTaperSeats':seats,'forkPlatesAndBacks':clevis,'captiveShoulderPins':pin,'retainers':capture},'gasketAllowanceKg':s['gasketMassAllowanceKg'],'retainedWaterAllowanceKg':s['retainedWaterAllowanceKg'],'weldAllowanceKg':s['weldMassAllowanceKg'],'doublerFilletNominalDepositKg':field_weld_mass,'captureAdditionalWeldBudgetKg':s['weldMassAllowanceKg']-field_weld_mass,
            'chargedLiftingMassKg':charged,'massReserveTo15Kg':15-charged,'permanentLidMassKg':permanent,
            'dynamicFactor':s['handleDynamicFactor'],'bailCrossbarDynamicStressMPa':s['handleDynamicFactor']*load*bar_span/4/(tube_i/8),
            'bailCrossbarSLSDeflectionMm':load*bar_span**3/(48*s['elasticMPa']*tube_i),
            'operators':operators,'repeatOneCleanoutAtATime':True,'noGantryOrDrawer':True,'forkTongueDynamicStressMPa':s['handleDynamicFactor']*load/2*25/(s['bailFootWidthMm']*(s['bailFootPlateMm']-s['metalLossMm'])**2/6),'forkLowerPlateDynamicStressMPa':s['handleDynamicFactor']*load/2*(s['bailPinHalfSpanMm']-s['bailLegHalfSpanMm'])/(s['bailFootWidthMm']*(3-s['metalLossMm'])**2/6),
            'method':'E isolated/drained, N full-duty and source rain controls admitted. Open only the actual550-long walking bay and median segment, stand with the reported body-to-opening setting reserve; release all bolts using350 vertical socket extension and600 ratchet above walking plane; attach700 positively captive bail with guided lifting hooks before complete release before releasing bolts. Lift800 to standing carry height, move away from hole into stated empty field, lower under capture. Reclose own walking covers before walking back. Whole-body cuts remain≤500 in field; short wall modules draw into gallery before300 lift. Exact force/capture/return/load event remains unqualified.',
            'physicalHandlingAccepted':False}


def compile_catch(s,h,source,invert0,invert1,outer_width):
    x0=h['court'][0]+h['court'][2];end=12000;length=end-x0
    catch_width=outer_width+2*s['frameGapMm']-3
    body_outer=s['waterWidthMm']+2*s['bodyMm']
    side_width=(catch_width-body_outer)/2*s['widthFraction']
    gross_height=s['waterHeightMm']+s['bodyMm']+9
    effective_depth=gross_height-10-3-5
    bed0=invert0-9;bed1=bed0-length/s['slopeRatio']
    area=side_width*effective_depth/1e6;radius=area/((side_width+2*effective_depth)/1000)
    coefficient=(s['roughness']/radius**(2/3))**2*length+s['localK']/(2*9.81)*1000
    fall=length/s['slopeRatio']-s['flowSettingMm']
    catch_limit=area*math.sqrt(fall/coefficient)*1000
    maximum=catch_limit
    trial=s['localLeakTrialLps'];velocity=trial/1000/area
    diameter=74*.8/1000
    pipe_area=math.pi*diameter**2/8;pipe_radius=diameter/4
    pipe_coefficient=(s['roughness']/pipe_radius**(2/3))**2*1500+(s['localK']+1)/(2*9.81)*1000
    pipe_limit=pipe_area*math.sqrt((bed1-345-diameter*500-5)/pipe_coefficient)*1000
    maximum=min(catch_limit,pipe_limit)
    pipe_v=maximum/1000/pipe_area
    pipe_friction=(s['roughness']*pipe_v/pipe_radius**(2/3))**2*1500
    pipe_velocity=pipe_v**2/(2*9.81)*1000
    pipe_local=s['localK']*pipe_velocity
    pipe_available=bed1-(345+diameter*500)-pipe_velocity-5
    pressure_head=s['pressureProofKPa']/9.81
    hole_area=maximum/1000/(.6*math.sqrt(2*9.81*pressure_head))*1e6
    return {'owningScope':'SourceMAT capture is local flange leak only, explicitly not second full E receiver. No authored accepted leak event exists.',
            'acceptedPhysicalLeakDutyLps':None,'comparisonTrialLps':trial,
            'catchPlanXmm':[x0,end],'catchClearWidthMm':catch_width,'oneAdverseSideClearWidthMm':side_width,
            'grossSideHeightBelowFlangeMm':gross_height,'netFlowDepthAfter10Debris3Intrusion5SettingMm':effective_depth,
            'catchWetBedEndsMm':[bed0,bed1],'catchSheetMm':1.5,'innerUnperforatedBodySupportMm':3,
            'externalCatchMineralSeatMm':15,'lowestCatchUndersideMm':bed1-1.5,
            'lowestCatchToRetainedGlassAfter15Seat5SettingMm':bed1-1.5-450-15-5,
            'catchSideHeightMm':80,'removableLongSideSprayFolds':{'nominalFoldSheetMm':1.5,'foldBottomAtUpstreamMm':bed0+60,'overlapBelow80SideCrestMm':20,'rawGapEachSideOfFoldMm':(catch_width-outer_width)/4-.75,'remainingGapAfter5Mm':(catch_width-outer_width)/4-.75-5,'crossCassetteRoofLapMm':50,'medianRoofStepMm':10,'eachPanelMustLiftMm':150,'sprayOrFirstHarmAdmitted':False},'geometricFirstOvertopZMm':bed1+80,'qualifiedFirstHarmZMm':None,
            'catchSprayClosure':'Floor-cassette metal underside and folded edge returns direct local spray into catch; no unproved air gasket is a water-pressure seal. Exact spray/first-harm event unearned.',
            'availableFallMm':fall,'trialHeadLossMm':coefficient*velocity**2,'computedSideCatchLimitLps':catch_limit,'computedSeparatePipeLimitLps':pipe_limit,'computedMaximumLocalLeakLps':maximum,
            'trialWithinComputedEnvelope':trial<=maximum,'assignedFullRainDutyAdmitted':False,
            'leakPressureControlKPa':s['pressureProofKPa'],'equivalentMaximumLeakAreaAtAuthoredPressureAndCd0_6Mm2':hole_area,
            'leakAreaBoundary':'Ideal orifice sensitivity at worst authored3kPa only; real gasket crack/jet/distribution is unknown, not certified by this number.',
            'separateDrain':{'startXmm':12000,'endXmm':13500,'centreYmm':6900,'ODMm':80,'wallMm':3,
                             'invertEndsMm':[390,345],'supportBelowMm':10,'lowestPipeSupportMm':332,
                             'requiredSeparateReceiverMaximumWaterMm':145,'requiredAirgapMm':200,'actualReceiverLevelMm':None,
                             'firstExteriorTransitionDropMm':bed1-390,'pipeODTopAtStartMm':467,'firstPrimaryUndersideMm':invert0-length/s['slopeRatio']-6,'pipeClearBelowPrimaryAfter5Mm':invert0-length/s['slopeRatio']-6-467-5,
                             'endDropBox':{'xMm':[12000,12100],'clearYmm':[s['centreYmm']-catch_width/2,s['centreYmm']+catch_width/2],'floorMm':390,'topBelowMainBodyMm':invert0-length/s['slopeRatio']-6,'exteriorRailStartXmm':12150,'clearBeforeRailMm':50},
                             'pipeTrialHeadReserveMm':bed1-345-diameter*500-5-pipe_coefficient*(trial/1000/pipe_area)**2,'pipeAdverseEnergyAtCatchThreshold':{'effectiveDiameterMm':diameter*1000,'remainingFlowSection':'half-full semicircle after20percent diameter loss','dutyLps':maximum,'frictionMm':pipe_friction,'localLossMm':pipe_local,'exitVelocityHeadMm':pipe_velocity,'availableHeadAfter5Mm':pipe_available,'reserveMm':pipe_available-pipe_friction-pipe_local,'comparisonPass':pipe_available>=pipe_friction+pipe_local},'notInsideRetained100GlassDomain':True,
                             'support':'Accessible metal pipe carried by the new outer-E terminal frame, not receiver soil.1282.5mm external projection beyond12217.5; its own dead/full-water forces included in terminal additions.',
                             'oldNegative1300Or1400ReceiverBoundsTransferred':False},
            'waterproofPhysicalEventAdmitted':False}


def approach(source,rise):
    run=20*rise;maximum=max(source['flights']);flights=math.ceil(run/maximum)
    return {'riseMm':rise,'slope':20,'slopingRunMm':run,'flightCount':flights,'landingCount':flights+1,
            'landingLengthMm':source['landingLength'],'totalReservationMm':run+(flights+1)*source['landingLength'],'actualSiteOrRegulatoryAcceptance':False}


def compile_intake(h,delta,duty,flow,outlet_crown,s):
    start,end=6500,7375
    knee=h['court'][1]+h['sections']['waterLevels']['landingRun'];north=h['court'][1]+h['court'][3]
    if not knee<=start<end<=north:
        raise ValueError('Actual header front must remain within the source northern court fall')
    slope=(abs(h['sections']['waterLevels']['courtNorth'])-h['sections']['waterLevels']['landingDrop'])/(north-knee)
    level=lambda y:delta-h['sections']['waterLevels']['landingDrop']-(y-knee)*slope
    active_end=(start+end)/2
    quiet=h['firstWetReference']['permittedQuietStage']+delta
    capacity=lambda stage:1.84/(slope*2.5)*(max(0,(stage-level(active_end))/1000)**2.5-max(0,(stage-level(start))/1000)**2.5)*1000
    lo,hi=level(active_end),quiet+500
    for _ in range(60):
        mid=(lo+hi)/2
        if capacity(mid)<duty:lo=mid
        else:hi=mid
    required_stage=(lo+hi)/2
    internal=outlet_crown+s['flowSettingMm']+flow['exitVelocityHeadMm']+flow['frictionHeadMm']+flow['localLossHeadMm']
    gap=level(active_end)-internal
    return {'frontYMm':[start,end],'worst50PercentRemainingYMm':[start,active_end],'frontCourtLipZMm':[level(start),level(end)],
            'sourceQuietStageMm':quiet,'freeWeirCapacityAtQuietLps':capacity(quiet),'requiredCourtStageForFullDutyMm':required_stage,
            'quietStageReserveMm':quiet-required_stage,'requiredInternalHeaderStageMm':internal,
            'survivingInletLipToHeaderWaterMm':gap,'comparisonPass':capacity(quiet)>=duty and gap>0,
            'method':'1.84 free-overfall integral on actual1:25 north court segment; retain SOUTH/high half as adverse50%block. Header internal energy stage computed from closed-body losses. If internal stage reaches surviving lip, this free-inlet proof is invalid and rejects; no submerged-weir credit.',
            'physicalRatingOrSplashQualification':False}


def crew_floor_ports(handling,s):
    positions={}
    for row in handling['operators']:
        base=row['bodyCentreXYmm'];_,_,outer=half_coordinates(s,row['half'])
        controls=[(base,'lidcapture-and-lift')]+[(b['operatorBodyCentreXYmm'],'full-bolt-tool') for b in row['allBoltControls']]
        controls.append((row['bodyStageCentreXYmm'],'stage-return'))
        for point,phase in controls:
            key=tuple(point);positions.setdefault(key,set()).add(phase)
    return [{'id':'E-floor-control/'+str(i),'xyMm':list(point),'phases':sorted(phases),'downwardKN':s['walkingCoverPointLoadKN'],
             'globalWrench':global_gravity_wrench([{'xyMm':point,'downwardKN':s['walkingCoverPointLoadKN']}]),
             'receivingStructure':'Occupied/proposed groundslab, not Eexterior frame',
             'source52Transfer':'Unconsumed by this water-frame trial; actual verticalgroundslab consumer required before combined-house demand is adopted.'}
            for i,(point,phases) in enumerate(sorted(positions.items()))]


def empty_head_actions(grid):
    return {head['id']:{'FxKN':0.,'FyKN':0.,'FzKN':0.,'MxKNm':0.,'MyKNm':0.,'MzKNm':0.} for head in grid['heads']}


def global_gravity_wrench(ledger):
    return [0.,0.,-sum(row['downwardKN'] for row in ledger),
            -sum(row['downwardKN']*row['xyMm'][1]/1000 for row in ledger),
            sum(row['downwardKN']*row['xyMm'][0]/1000 for row in ledger),0.]


def head_global_wrench(actions,grid):
    result=[0.]*6
    for head in grid['heads']:
        v=actions[head['id']];x,y=head['xy'];z=head['capZ'][1]
        f=[v[k] for k in ['FxKN','FyKN','FzKN']]
        moment=[v['MxKNm']+(y*f[2]-z*f[1])/1000,
                v['MyKNm']+(z*f[0]-x*f[2])/1000,
                v['MzKNm']+(x*f[1]-y*f[0])/1000]
        result=[a+b for a,b in zip(result,f+moment)]
    return result


def gravity_audit(ledger,actions,grid):
    applied=global_gravity_wrench(ledger);transferred=head_global_wrench(actions,grid)
    difference=[a-b for a,b in zip(transferred,applied)]
    return {'order':['FxKN','FyKN','FzKN','MxKNm','MyKNm','MzKNm'],'appliedGlobalWrench':applied,
            'source52GlobalWrench':transferred,'residual':difference,'maximumAbsoluteResidual':max(map(abs,difference)),
            'units':'kN andkNm; global origin0/0/0, vertical gravity projection preserves all six resultants'}


def transfer_e_gravity(ledger,grid,girder,column_x,column_ys):
    face=girder['datum']+girder['width']/2
    seats=[{'xyMm':[column_x,y],'downwardKN':0.,'rootMyKNm':0.,'faceMyKNm':0.} for y in column_ys]
    for row in ledger:
        x,y=row['xyMm'];w=row['downwardKN']
        fractions=[(column_ys[1]-y)/(column_ys[1]-column_ys[0]),(y-column_ys[0])/(column_ys[1]-column_ys[0])]
        for seat,fraction in zip(seats,fractions):
            force=w*fraction
            seat['downwardKN']+=force
            seat['rootMyKNm']+=force*(x-column_x)/1000
            seat['faceMyKNm']+=force*(x-face)/1000
    source_y=[row['u'] for row in girder['heads']]
    low=max(y for y in source_y if y<min(column_ys));high=min(y for y in source_y if y>max(column_ys))
    ids={row['u']:row['id'] for row in girder['heads']};actions=empty_head_actions(grid)
    for seat in seats:
        y=seat['xyMm'][1];w=seat['downwardKN']
        seat['anchorRowCoupleKN']=abs(seat['faceMyKNm']*1000/200)
        seat['columnRootMomentKNm']=seat['rootMyKNm']
        for axis,fraction in [(low,(high-y)/(high-low)),(high,(y-low)/(high-low))]:
            node=actions[ids[axis]]
            node['FzKN']-=w*fraction
            node['MyKNm']+=(seat['rootMyKNm']+w*(column_x-girder['datum'])/1000)*fraction
    return {'seatActions':seats,'source52SLSHeadLoadAdditions':actions,'actualReceivingSourceHeads':[ids[low],ids[high]],
            'equilibrium':gravity_audit(ledger,actions,grid),
            'torsionDistributionBoundary':'Statically admissible linear split to the two actual source heads, not compatible RC torsion/contact capacity.'}


def compile_east_terminal(s,h,grid,invert1,station_extra):
    g=grid['girders']['outer-E'];face=g['datum']+g['width']/2;column=face+100
    y=s['centreYmm'];seats_y=[y-300,y+300];rail_start=12150
    members=section(80,100,6-s['metalLossMm']);nominal=section(80,100,6)
    end=s['endXmm'];length=end-12000
    if not rail_start<column<end or not 0<length<=750:
        raise ValueError('Unsupported exterior E terminal/cold-face support geometry')
    body_dead=(2*s['waterWidthMm']+3*s['waterHeightMm'])*s['bodyMm']*8e-5
    water_dead=s['waterWidthMm']*s['waterHeightMm']*9.81e-6
    pipe_line=(math.pi*(80**2-74**2)/4*8e-5+math.pi*74**2/4*9.81e-6)
    rail_top=invert1-2*s['bodyMm']-s['supportHeightMm'];column_height=rail_top-100-g['z'][1]
    column_weight=section(100,100,6)['areaMm2']*column_height*8e-8
    clear_width=(s['waterWidthMm']-s['centralFlangeMm'])/2
    full_removed_roof_kg=2*clear_width*s['lidClearLengthMm']*s['bodyMm']*8e-6
    new_station_kg=station_extra+full_removed_roof_kg
    roof_low=max(12000,12200-s['lidClearLengthMm']/2);roof_high=min(end,12200+s['lidClearLengthMm']/2)
    removed_roof_kg=2*clear_width*max(0,roof_high-roof_low)*s['bodyMm']*8e-6
    ledger=[{'id':'external-body-stock','downwardKN':body_dead*length/1000,'xyMm':[(12000+end)/2,y],'domainXmm':[12000,end]},
            {'id':'external-contained-water','downwardKN':water_dead*length/1000,'xyMm':[(12000+end)/2,y],'domainXmm':[12000,end]},
            {'id':'separate-local-pipe-stock-and-full-water','downwardKN':pipe_line*1.5,'xyMm':[12750,6900],'domainXmm':[12000,13500]},
            {'id':'terminal-cleanout-new-stock','downwardKN':new_station_kg*9.81/1000,'xyMm':[12200,y],
             'scope':'Entire positive station stock assigned to terminal trial; actual12200 centroid retained, not collapsed tocolumn.'},
            {'id':'removed-outside-roof-under-cleanout','downwardKN':-removed_roof_kg*9.81/1000,'xyMm':[(roof_low+roof_high)/2,y],'domainXmm':[roof_low,roof_high],
             'scope':'Subtract only old roof actually inside exterior cut; the inboard25mm was never in exterior body stock.'}]
    for i,sy in enumerate(seats_y):
        ledger.extend([{'id':'outdoor-rail-'+str(i),'downwardKN':nominal['areaMm2']*8e-5*(end-rail_start)/1000,'xyMm':[(rail_start+end)/2,sy],'domainXmm':[rail_start,end]},
                       {'id':'column-'+str(i),'downwardKN':column_weight,'xyMm':[column,sy]},
                       {'id':'bracket-mass-allowance-'+str(i),'downwardKN':s['bracketMassKg']*9.81/1000,'xyMm':[(face+column)/2,sy],
                        'scope':'Authored25kg allowance at the middle of the100mm bracket projection; exact fabrication replaces this allowance.'}])
    transfer=transfer_e_gravity(ledger,grid,g,column,seats_y)
    projection=end-column
    q_right=(body_dead+water_dead)/2+nominal['areaMm2']*8e-5
    station_new_kn=new_station_kg*9.81/1000
    right_m=q_right*projection**2/2+station_new_kn/2*max(0,12200+(s['lidClearLengthMm']+2*s['flangeWidthMm'])/2-column)*1000
    left_m=(body_dead+water_dead)/2*(column-12000)**2/2+nominal['areaMm2']*8e-5*(column-rail_start)**2/2+station_new_kn/2*max(0,column-(12200-(s['lidClearLengthMm']+2*s['flangeWidthMm'])/2))*1000
    return {'actualColdGirder':'outer-E','actualGirderZMm':g['z'],'outerFaceXmm':face,'columnXmm':column,'columnsYmm':seats_y,
            'componentGravityLedger':ledger,'gravityMassBasis':'Nominal full stock for downward case; corroded sections only for stiffness/resistance.',**transfer,
            'bodyBeyondOccupiedFloorXmm':[12000,end],'retained100GlassClaimOutsideHouse':False,
            'columnSectionMm':[100,100,6],'columnZMm':[g['z'][1],rail_top-100],
            'twoOutdoorRailSectionMm':[80,100,6],'actualRailProjectionMm':projection,'railStartXmm':rail_start,
            'backwardRailOverhangMm':column-rail_start,'bareBodyClearSpanToRailMm':150,
            'bareBody150SpanSelfWeightMomentNmm':(body_dead+water_dead)*150**2/8,
            'waterAndBodyStockLineLoadKNperM':body_dead+water_dead,'nominalRailStockLineLoadKNperMEach':nominal['areaMm2']*8e-5,
            'localCatchPipeFullWaterAndStockKNperM':pipe_line,'localCatchPipeTotalGravityKN':pipe_line*1.5,
            'terminalCleanoutExtraPermanentStockKgBeyondRoof':new_station_kg-removed_roof_kg,'terminalCleanoutNewPositiveStockKg':new_station_kg,'removedExteriorRoofKg':removed_roof_kg,
            'railInternalMomentBoundsNmm':{'rightOfColumn':right_m,'leftOfColumn':left_m,'method':'For railresistance put all positive stationstock at furthest respective edge; credit no removedroof as favourable load. Headreaction ledger separately retains true centroids.'},
            'ULSMaximumRailStressMPa':1.35*max(abs(right_m),abs(left_m))/members['modulusMm3'],
            'cantileverOnlySLSDeflectionMm':q_right*projection**4/(8*s['elasticMPa']*members['inertiaMm4']),
            'anchorRowsZMm':[-300,-500],'totalSLSDownwardKN':sum(row['downwardKN'] for row in ledger),
            'floorWalkingLoadOutsideHouse':False,'jointCapacityAdmitted':False,
            'coldGirderCombinedOriginalLoadAndLocalAnchorsAdmitted':False,
            'renewal':'External body and80×100 rails are accessible. All outboard gravity centroids/root couples transfer to cold face/source52; no receiver footing or invented soil support.'}


def plate_walking(s,span=300):
    thickness=12-s['metalLossMm']
    inertia=100*thickness**3/12;modulus=100*thickness**2/6
    dead=.012*80+.02*26
    moment=1.5*s['pointLoadKN']*1000*span/4+(1.35*dead+1.5*s['liveKPa'])*.1*span**2/8
    return {'spanMm':span,'minimumThicknessMm':thickness,'pointKN':s['pointLoadKN'],'ULSStressMPa':moment/modulus,
            'SLSPointDeflectionMm':s['pointLoadKN']*1000*span**3/(48*s['elasticMPa']*inertia),'capacityAdmitted':False}


def default_settings():
    return {'endXmm':12750,'centreYmm':6875,'invertMm':538.5,'slopeRatio':85,
            'waterWidthMm':600,'waterHeightMm':65,'bodyMm':3,'webMm':3,'lidMm':4,'lidRimMm':10,'centralFlangeMm':84,'lidButtGapMm':2,'flangeWidthMm':40,'flangeMm':14,
            'frameGapMm':20,'railWidthMm':60,'boltProjectionMm':9,'metalLossMm':.5,'debrisMm':10,'lapMm':3,'widthFraction':.8,
            'roughness':.025,'localK':4.8,'flowSettingMm':10,'splashMm':25,'waterSettingMm':25,'supportHeightMm':20,
            'ventDiameterMm':40,'ventAreaFraction':.5,'ventK':5,'pressureProofKPa':3,'elasticMPa':190000,'stressScreenMPa':150,
            'lidClearLengthMm':450,'gasketWidthMm':10,'boltEdgeOffsetMm':25,'boltsOnLongSide':7,'boltsOnShortSide':5,
            'boltPreloadKN':16,'preloadLossFraction':.2,'boltProofMPa':600,'boltTensileAreaMm2':58,'gasketMinimumStressMPa':13,
            'scupperSpanMm':1200,'scupperSpringMm':700,'scupperRiseMm':150,'jambGlassMm':110,'liningMm':27,'ringMm':215,
            'wallTailMm':100,'courtDrawMm':550,'spineDrawMm':750,'pointLoadKN':2,'liveKPa':2,'walkingCoverPointLoadKN':2,'walkingGridSimultaneousPoints':2,'walkingLiveLoadKPa':2,'cantileverDeflectionRatio':150,'bracketMassKg':25,'localLeakTrialLps':.1,'lidCarryLiftMm':800,'capturedBailHeightMm':700,'handleDynamicFactor':1.5,'gasketMassAllowanceKg':.1,'bailLegHalfSpanMm':170,'bailPinHalfSpanMm':200,'bailOffsetFraction':.5,'bailFootWidthMm':30,'bailFootPlateMm':6,'bailTaperSeatMm':2,'retainedWaterAllowanceKg':.25,'weldMassAllowanceKg':.3}


def render_closed(r):
    s=r['settings'];e=r['east'];n=r['north'];ffl=r['levelsMm']['ffl'];sec=e['section'];catch=e['localLeakCatch']
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="2240" viewBox="0 0 1800 2240">',
         '<rect width="1800" height="2240" fill="#faf8f1"/><g font-family="sans-serif" fill="#263b42">']
    def box(x,y,w,h,fill,stroke='#52666b'):
        out.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def text(x,y,label,size=16):out.append(f'<text x="{x}" y="{y}" font-size="{size}">{escape(label)}</text>')
    def line(points,colour='#52666b',dash=False,width=2):
        pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        dashed='stroke-dasharray="7 5"' if dash else ''
        out.append(f'<polyline points="{pts}" fill="none" stroke="{colour}" stroke-width="{width}" {dashed}/>')
    text(45,42,f'Enclosed E gravity body + actual-grid N support · FFL{ffl:g} comparison',26)
    text(45,72,'All dimensions mm. Author inputs and numerical comparisons; no selected-house, installed seal, grid capacity or site acceptance.',17)
    text(45,118,'A · E transverse at upstream pressure cleanout',20)
    X=lambda y:80+(y-e['grossYmm'][0])*.8
    Z=lambda z:585-(z-350)
    box(65,Z(450),710,100,'#dfc990');box(65,Z(350),710,45,'#b5bfba')
    text(85,570,'100 bare cellular glass350..450',16);text(85,615,'RC150..350 continues below; mineral0..150',16)
    a=s['centreYmm']-e['bodyOuterWidthMm']/2;b=s['centreYmm']+e['bodyOuterWidthMm']/2
    y0=catch['catchWetBedEndsMm'][0];w=catch['catchClearWidthMm']
    ca=s['centreYmm']-w/2;cb=s['centreYmm']+w/2
    line([(X(ca),Z(y0+80)),(X(ca),Z(y0)),(X(cb),Z(y0)),(X(cb),Z(y0+80))],'#b45b3c',False,3)
    body_left=s['centreYmm']-s['waterWidthMm']/2-s['bodyMm']
    box(X(body_left),Z(s['invertMm']+s['waterHeightMm']+s['bodyMm']),(s['waterWidthMm']+2*s['bodyMm'])*.8,(s['waterHeightMm']+2*s['bodyMm']),'#9cc9d2')
    box(X(s['centreYmm']-s['webMm']/2),Z(s['invertMm']+s['waterHeightMm']),s['webMm']*.8,s['waterHeightMm'],'#536e77')
    centre=s['centreYmm'];gap=s['lidButtGapMm'];half=e['pressure']['halfOuterLidMm'][0]
    ranges=[(a,centre-gap/2),(centre+gap/2,b)]
    for c,d in [(a,a+s['flangeWidthMm']),(centre-s['centralFlangeMm']/2,centre+s['centralFlangeMm']/2),(b-s['flangeWidthMm'],b)]:
        box(X(c),Z(sec['fixedFlangeTopMm']),(d-c)*.8,s['flangeMm'],'#405e69')
    for left,right in ranges:
        box(X(left),Z(sec['pressureLidTopMm']),(right-left)*.8,s['lidMm'],'#607d86')
        for c,d in [(left,left+40),(right-40,right)]:
            box(X(c),Z(sec['clampingRimTopMm']),(d-c)*.8,s['lidRimMm'],'#607d86')
            box(X((c+d)/2)-4,Z(sec['boltTopMm']),8,s['boltProjectionMm'],'#42565f')
    box(65,Z(ffl),710,15,'#a08e76');box(65,Z(ffl-15),710,12,'#71868a')
    box(65,Z(ffl-27),710,40,'#ead698')
    for left,right in ranges:
        for c,d in [(left,left+40),(right-40,right)]:
            box(X(c),Z(sec['boltPocketUnderskinMm']),max(2,(d-c)*.8),10,'#faf8f1','#faf8f1')
    for c,d,depth in [(e['grossYmm'][0],e['grossYmm'][0]+s['railWidthMm'],40),(centre-50,centre+50,30),(e['grossYmm'][1]-s['railWidthMm'],e['grossYmm'][1],40)]:
        box(X(c),Z(ffl-27),(d-c)*.8,depth,'#9aa5a4')
    for c in [e['grossYmm'][0]+s['railWidthMm']/2,e['grossYmm'][1]-s['railWidthMm']/2]:
        box(X(c-s['railWidthMm']/2),Z(ffl-67),s['railWidthMm']*.8,ffl-67-456,'#b4b1a1')
        box(X(c-s['railWidthMm']/2),Z(456),s['railWidthMm']*.8,6,'#7b9194')
    for z,label in [(ffl,f'FFL{ffl:g}'),(sec['pressureLidFieldUnderskinMm'],'40-core'+str(sec['pressureLidFieldUnderskinMm'])),(sec['boltTopMm'],'bolt'+str(sec['boltTopMm'])),(s['invertMm'],'water invert'+str(s['invertMm']))]:
        line([(780,Z(z)),(820,Z(z))]);text(825,Z(z)+(-12 if z==sec['pressureLidFieldUnderskinMm'] else 12 if z==sec['boltTopMm'] else 5),label,14)
    text(45,660,f'{s["waterWidthMm"]:g} water clear /{e["bodyOuterWidthMm"]:g} frame /{e["grossWidthMm"]:g} gross. Two lids {e["pressure"]["halfOuterLidMm"][0]:g}×{e["pressure"]["halfOuterLidMm"][1]:g};4field+10rim;30bolt/40cleanout/50ordinary glass.',16)
    text(45,687,f'Catch{catch['catchClearWidthMm']:g}clear below body; side crest80, normal local leak trial0.1L/s, computed adverse limit{catch["computedMaximumLocalLeakLps"]:.3f}L/s.',16)
    text(45,714,'Walking plates → separate40deep grid/60rails/60×280soles →100glass →RC. Water body carries no walking load.',16)
    text(1030,118,'B · E passage and accessible joints',20)
    PX=lambda x:1040+(x-7300)*.11
    PY=lambda y:365-(y-6300)*.15
    for o in e['scuppers']:
        a,b=o['actualWallXmm'];box(PX(a),PY(7500),(b-a)*.11,180,'#bab4a6')
        c,d=o['finishedYmm'];box(PX(a),PY(d),(b-a)*.11,(d-c)*.15,'#faf8f1')
    box(PX(11570.5),PY(7500),429.5*.11,180,'#bab4a6')
    a,b=e['routeXmm'];box(PX(a),PY(e['grossYmm'][1]),(b-a)*.11,e['grossWidthMm']*.15,'#a2c6ce')
    hx,hy,he,hn=e['headerPlanXYMm'];box(PX(hx),PY(hn),(he-hx)*.11,(hn-hy)*.15,'#7aadb9')
    for x in e['pressureCleanouts']['centresXmm']:
        box(PX(x-e['pressure']['halfOuterLidMm'][1]/2),PY(s['centreYmm']-s['lidButtGapMm']/2),e['pressure']['halfOuterLidMm'][1]*.11,e['pressure']['halfOuterLidMm'][0]*.15,'#708c95')
        box(PX(x-e['pressure']['halfOuterLidMm'][1]/2),PY(s['centreYmm']+e['bodyOuterWidthMm']/2),e['pressure']['halfOuterLidMm'][1]*.11,e['pressure']['halfOuterLidMm'][0]*.15,'#8eaab3')
    for o in e['scuppers']:
        a,b=o['jointFreeWallBodyXmm'];line([(PX(a),PY(e['grossYmm'][0])-5),(PX(a),PY(e['grossYmm'][1])+5)],'#c2563e')
        line([(PX(b),PY(e['grossYmm'][0])-5),(PX(b),PY(e['grossYmm'][1])+5)],'#c2563e')
    line([(PX(12000),PY(6900)),(PX(13500),PY(6900))],'#b45b3c',True,3)
    for i,label in enumerate([f'E1200 passage6300..7500; gross{e["grossYmm"][0]:g}..{e["grossYmm"][1]:g}; actual RCtop{r["groundStack"]["dryRC"][1]:g}.',
        f'New scuppers: raw{s["scupperSpanMm"]:g}; bottom350; spring{s["scupperSpringMm"]:g}/crown{e["scuppers"][0]["rawCrownMm"]:g}/ring{e["scuppers"][0]["ringTopMm"]:g}.',
        f'Finished crown{e["scuppers"][0]["finishedCrownMm"]:g} below FFL{ffl:g}; window sill{e["scuppers"][0]["windowSillMm"]:g}.',
        f'Joint-free wall bodies draw{e["scuppers"][0]["shortDrawMm"]:g}/{abs(e["scuppers"][1]["shortDrawMm"]):g} into real8179.5..9203 gallery.',
        f'Main bed{e["invertEndsMm"][0]:g}→{e["invertEndsMm"][1]:.3f};1:{s["slopeRatio"]:g}; quiet{r["levelsMm"]["quiet"]:g} / return{e["headerWaterReturnsToMm"]:g}.',
        f'Intake front6500..7375, returns{e["headerWaterReturnsToMm"]:g}, hood{e["ventAndWeatherHoodTopMm"]:g}: visible, not walking.',
        'Local catch ends12000; separate80OD pipe390→345 to13500/6900.',
        'Pressure lids lifted only after N full-duty verification, E isolation/drain.',
        f'New masonry/{e["scuppers"][0]["thermalGlassReductionMm"]:g}mm local glass reduction, welds, air collars remain unqualified.']):text(1030,430+28*i,label,15)
    text(45,790,'C · N plan: actual heads, new support and operator domain',20)
    NX=lambda x:75+(x-4250)*.085
    NY=lambda y:1405-(y-7750)*.085
    a,b,w,l=n['floorField']['planXYWHmm'];box(NX(a),NY(b+l),w*.085,l*.085,'#ebe5d5')
    a,b,w,l=n['endOperatorPlatformXYWHmm'];box(NX(a),NY(b+l),w*.085,l*.085,'#e2c9a0')
    for row in n['supportSeats']:
        x,y=row['sourceHeadXYmm'];box(NX(x-300),NY(y+300),51,51,'#bebcaf')
        text(NX(x)-15,NY(y)+5,row['head'],13)
        cx=row['columnAxisXYmm'][0];box(NX(cx-50),NY(y+50),8.5,8.5,'#526d74')
    for y in n['supportYsMm']:box(NX(n['primaryCrossbeamExtentXmm'][0]),NY(y+50),(n['primaryCrossbeamExtentXmm'][1]-n['primaryCrossbeamExtentXmm'][0])*.085,8.5,'#657f87')
    for x in n['railAxesXmm']:box(NX(x)-3,NY(13550),6,(13550-7750)*.085,'#42849a')
    for i,label in enumerate(['6actual heads:4500/7500×8050/9875/11667.5.',
        'Columns4900/7100 sit beyond wrapped jambs.',
        'Brackets anchored to actual inward girder faces4800/7200.',
        'No cap-centred stool passes through portal pier or wrap.',
        'NSrails4960/5275; transverse bearers support edgeframes4835/5215.',
        'Operator platform4575..5475/Y12000..12650.',
        'Actual endoperator5025/12350 fits900wide platform.',
        'Water-only terminal continues13550 into existing N receiver.',
        'Local cantilever is a selection cost, no new foundation invented.']):text(435,860+30*i,label,15)
    text(980,790,'D · N section along the rail; cold structure unchanged',20)
    SX=lambda y:990+(y-7750)*.115
    SZ=lambda z:1400-(z+750)*.32
    walks=n['walkingZMm'];line([(SX(y),SZ(z))for y,z in walks],'#8d6d45',False,3)
    line([(SX(y),SZ(z-170))for y,z in walks],'#3e8093',False,4)
    line([(SX(y),SZ(z-350))for y,z in walks],'#3e8093',False,2)
    water=n['waterBedZMm'];line([(SX(y),SZ(z))for y,z in water if y>=7750],'#58a6b8',False,3)
    for y in n['supportYsMm']:
        walk=next(z for yy,z in walks if yy==y)
        box(SX(y)-6,SZ(walk-350),12,200*.32,'#65818a')
        box(SX(y)-5,SZ(walk-550),10,(walk-550+180)*.32,'#879998')
        box(SX(y)-20,SZ(-180),40,570*.32,'#adb7b0')
    for o in [0,1]:
        y0,y1=n['supportYsMm'][o:o+2];box(SX(y0),SZ(-180),(y1-y0)*.115,450*.32,'#b8c0b9')
    end=13550;receiver=n['receiver'];bed=water[-1][1]
    line([(SX(13200),SZ(bed)),(SX(end),SZ(bed-3.5)),(SX(end),SZ(receiver['outletMm']))],'#58a6b8',False,3)
    line([(SX(13450),SZ(receiver['maximumWaterMm'])),(SX(13750),SZ(receiver['maximumWaterMm']))],'#448c9e',True,2)
    text(1000,842,'12cover +50frame +58mineral +50crossbearer +180rail +200crossbeam; no coplanar overlap.',15)
    text(1000,870,'EW top=walk−350; bottom=walk−550. Stools end above−180 coldRC top.',15)
    text(1000,898,f'Cold anchors−300/−500; bracket−550; lowest retained{r["ground"]["retainedGridLowestMm"]:g} gives minimumD{r["ground"]["knownEnvelopeMinimumDmm"]:g}.',15)
    text(1000,926,f'N shoe sole350 staysRC-owned; crest{n["protectiveBoundary"]["sourceShoeCrestMm"]:g}; taller return, no apron cut.',15)
    text(1000,1450,f'Rail projection{n["terminalRailCantileverMm"]:g}; people{n["peoplePlatformCantileverMm"]:g}. SLS loaded maximum{max(v["maximumRailDeflectionMm"] for k,v in n["loadCases"].items() if k.startswith("SLS")):.2f}mm.',15)
    text(45,1478,'No actual site grade/outfall capacity, qualified first harm or installed seal claim. '+r['status']+'.',16)
    handling=e['pressure']['handling'];access=next(p for p in handling['operators'] if p['stationXmm']==10050 and p['half']=='south')
    capture=access['captureGeometry'];control=access['allBoltControls'][0];pose=control['staffSweep'][1]
    scale=.65;station=access['stationXmm'];centre=s['centreYmm']
    CX=lambda x:330+(x-station)*scale
    CY=lambda y:1815-(y-centre)*scale
    text(45,1530,'E · Actual capture and 550-long floor opening: plan projection',20)
    low,high=access['floorOpeningPlanBoundsMm']
    box(CX(low[0]),CY(high[1]),(high[0]-low[0])*scale,(high[1]-low[1])*scale,'#e9e3d0')
    low,high=capture['lidAndCapturePlanBoundsMm']
    lid_y=half_coordinates(s,access['half'])[2];lid_w,lid_l=e['pressure']['halfOuterLidMm']
    box(CX(station-lid_l/2),CY(lid_y+lid_w/2),lid_l*scale,lid_w*scale,'#bac8c9')
    for target in capture['boxes']:
        lo,hi=target['lowMm'],target['highMm']
        box(CX(lo[0]),CY(hi[1]),(hi[0]-lo[0])*scale,(hi[1]-lo[1])*scale,'#b78b56' if target['id'].startswith('lifting-tongue') else '#869b9e')
    for cap in capture['capsules']:
        a,b=cap['aMm'],cap['bMm'];line([(CX(a[0]),CY(a[1])),(CX(b[0]),CY(b[1]))],'#344f59',False,max(2,2*cap['radiusMm']*scale))
    for bolt in access['allBoltControls']:
        x,y,_=bolt['boltXYZmm'];out.append(f'<circle cx="{CX(x)}" cy="{CY(y)}" r="4" fill="#263b42"/>')
    for part in pose['toolParts']:
        a,b=part['aMm'],part['bMm'];line([(CX(a[0]),CY(a[1])),(CX(b[0]),CY(b[1]))],'#c2563e',False,max(2,2*part['radiusMm']*scale))
    body=control['operatorBodyCentreXYmm']
    out.append(f'<circle cx="{CX(body[0])}" cy="{CY(body[1])}" r="{300*scale}" fill="none" stroke="#4f7357" stroke-width="2"/>')
    text(45,2180,'Plan shows actual lid, tongues, fork/pins, bail and one tool witness; continuous sweep is numerical proof.',15)
    text(45,2208,'Circle: 300 body radius. Opening550; stance offset585 gives10 nominal /5 after setting.',15)
    text(1000,1530,'F · Capture elevation projection and current controls',20)
    EZ=lambda z:2075-(z-capture['capsules'][0]['aMm'][2])*.45
    EX=lambda x:1280+(x-station)*.45
    for target in capture['boxes']:
        lo,hi=target['lowMm'],target['highMm'];box(EX(lo[0]),EZ(hi[2]),(hi[0]-lo[0])*.45,max(2,(hi[2]-lo[2])*.45),'#b78b56' if target['id'].startswith('lifting-tongue') else '#869b9e')
    for cap in capture['capsules']:
        a,b=cap['aMm'],cap['bMm'];line([(EX(a[0]),EZ(a[2])),(EX(b[0]),EZ(b[2]))],'#344f59',False,max(2,2*cap['radiusMm']*scale))
    for i,label in enumerate([f'700 bail; leg X±{s["bailLegHalfSpanMm"]:g}, tongues/pins X±{s["bailPinHalfSpanMm"]:g}.',
        'Fork60×30×3; tongue80×30×6; shoulder10 /threadM8.',
        f'Charged lid{handling["chargedLiftingMassKg"]:.3f}kg; grip/force event unqualified.',
        f'Full tool reach{max(p["maximumAllBoltToolReachMm"] for p in handling["operators"]):.3f} of600; carry{max(p["standingCarryReachMm"] for p in handling["operators"]):.3f}.',
        f'All stance/tool/stage paths: body gap≥{min(p["minimumBodyToOpenFloorAfter5Mm"] for p in handling["operators"]):g} after5.',
        f'Crew floor ports{len(e["crewFloorLoadPorts"])} regenerate; actual ground transfer unconsumed.']):text(1000,1558+28*i,label,15)
    out.append('</g></svg>')
    return '\n'.join(out)+'\n'


def main():
    import argparse
    import sys
    parser=argparse.ArgumentParser();parser.add_argument('--read',action='store_true');parser.add_argument('--write',action='store_true');parser.add_argument('--check',action='store_true')
    args=parser.parse_args();folder=Path(__file__).resolve().parent;root=folder.parents[2]
    case=json.loads((folder/'closed-service-floor.json').read_text()) if args.read or args.write or args.check else json.load(sys.stdin)
    if args.read:print(json.dumps(case));return
    result=compile_closed(case,{path:(root/path).read_bytes() for path in case['sources']})
    outputs={'closed-service-floor.results.json':json.dumps(result,indent=2,allow_nan=False)+'\n','closed-service-floor.svg':render_closed(result)}
    for name,value in outputs.items():
        if args.write:(folder/name).write_text(value)
        if args.check and (folder/name).read_text()!=value:raise ValueError('Stale output: '+name)
    if args.write or args.check:print(json.dumps({'status':result['status'],'diagnostics':result['diagnostics']}))
    else:print(json.dumps({'schema':'closed-service-floor-replay/2','result':result,'sectionPlanSvg':outputs['closed-service-floor.svg']},allow_nan=False))


if __name__=='__main__':main()
