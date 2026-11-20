import hashlib
import json
import math
from pathlib import Path
from xml.sax.saxutils import escape

SOURCE_PATHS = ('project/had/studies/water-replan.json','project/had/studies/water-replan.mjs',
    'project/mat/studies/upper-access-renewal.json','project/str/studies/current-house-grid.json',
    'project/mat/studies/loggia-envelope-section.json','project/rwt/studies/open-loggia-event.json',
    'project/rwt/studies/selected-receiving-interface.json','project/triad-interface-contract.md',
    'project/owner-house-charter.md','project/had/studies/raised_service_floor.py',
    'project/mat/joined-ground-floor-and-court-boundary.md')


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def _exact(value, keys, label):
    if not isinstance(value, dict) or set(value) != set(keys):
        raise ValueError('Expected exact ' + label + ' fields')


def _finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def _approach(old, rise):
    run, maximum = rise * 20, max(old['flights'])
    flights = max(1, math.ceil(run / maximum))
    return {'riseMm': rise, 'slopingRunMm': run, 'flightsMm': [maximum] * (flights-1) + [run-maximum*(flights-1)],
            'landingCount': flights+1, 'landingLengthMm': old['landingLength'],
            'totalReservationMm': run+(flights+1)*old['landingLength']}


def _cover(span, thickness, net_width, panel_length, live, point, stress_limit, elastic, stone=15, open_fraction=0, panel_width=None, extra_mass=0, thickness_loss=0):
    dead = thickness / 1000 * 8000 * 9.81 / 1000 * (1-open_fraction) + stone / 1000 * 2600 * 9.81 / 1000 + extra_mass*9.81/1000
    service_w, ultimate_w = (dead+live)*.1, (1.35*dead+1.5*live)*.1
    effective=thickness-thickness_loss
    if effective<=0:raise ValueError('No remaining cover thickness')
    inertia, modulus = net_width*effective**3/12, net_width*effective**2/6
    moment = ultimate_w*span**2/8 + 1.5*point*1000*span/4
    deflection = 5*service_w*span**4/(384*elastic*inertia) + point*1000*span**3/(48*elastic*inertia)
    return {'spanMm': span, 'steelThicknessMm': thickness, 'authoredThicknessLossMm':thickness_loss,
            'effectiveMinimumSteelThicknessMm':effective,'controllingNetWidthPer100Mm': net_width,
            'deadLoadKPa': dead, 'pointLoadKN': point, 'liveLoadKPa': live,
            'ULSMomentNmm': moment, 'stressMPa': moment/modulus, 'authoredStressScreenMPa': stress_limit,
            'deflectionMm': deflection, 'deflectionScreenL300Mm': span/300,
            'panelLengthMm': panel_length, 'panelWidthMm': panel_width or span,
            'panelMassKgBeforeHardware': panel_length/1000*(panel_width or span)/1000*(thickness/1000*8000*(1-open_fraction)+stone/1000*2600+extra_mass),
            'comparisonPass': moment/modulus <= stress_limit and deflection <= span/300,
            'capacityAdmitted': False,
            'boundary': 'Metal E/stress are authored numerical controls. Exact grade, perforation stress concentration, edge/seat/contact, stone retention and fitted test remain unqualified.'}


def _hydraulic(width, gross_depth, debris, lap, n, length, fall, losses, duty):
    depth = gross_depth-debris-lap
    if min(width, depth) <= 0:
        return {'comparisonPass': False, 'reason': 'No remaining wetted cross-section'}
    b, y = width/1000, depth/1000
    area, perimeter = b*y, b+2*y
    radius, velocity = area/perimeter, duty/1000/area
    friction_slope = (n*velocity/radius**(2/3))**2
    friction, minor = friction_slope*length, losses*velocity**2/(2*9.81)*1000
    return {'remainingClearWidthMm': width, 'grossWaterDepthMm': gross_depth,
            'bedDebrisMm': debris, 'lapIntrusionMm': lap, 'effectiveDepthMm': depth, 'roughness': n,
            'dutyLps': duty, 'velocityMps': velocity, 'frictionHeadMm': friction,
            'minorLossK': losses, 'minorHeadMm': minor, 'availableFallAfterSettingMm': fall,
            'headReserveMm': fall-friction-minor,
            'comparisonPass': friction+minor <= fall,
            'method': 'Rectangular Manning friction plus explicitly authored local K; no fitted inlet/joint/debris or tailwater qualification.'}


def _court_level(y, source, delta):
    levels = source['sections']['waterLevels']
    start=source['court'][1];knee=start+levels['landingRun']
    remaining=source['court'][3]-levels['landingRun']
    further_drop=abs(levels['courtNorth'])-levels['landingDrop']
    return (-(y-start)*levels['landingDrop']/levels['landingRun'] if y <= knee else
            -levels['landingDrop']-(y-knee)*further_drop/remaining) + delta


def compile_service_floor(case, raw):
    _exact(case, ('schema','sources','settings'), 'raised service-floor case')
    if case['schema'] != 'raised-service-floor/1':
        raise ValueError('Unsupported service-floor schema')
    _exact(case['sources'], SOURCE_PATHS, 'source identities')
    for name, expected in case['sources'].items():
        if name not in raw or digest(raw[name]) != expected:
            raise ValueError('Missing or stale source: '+name)
    settings = case['settings']
    expected = ('accessibleZoneMm','exteriorGradeMm','routeEndXmm','channelWidthMm','medianRailWidthMm','outerRailWidthMm',
                'routeCentreYMm','upstreamInvertMm','slopeRatio','bodyDepthMm','designWaterDepthMm','bedDebrisMm',
                'lapIntrusionMm','remainingWidthFraction','roughness','lapLossK','entryLossK','outletLossK',
                'settingLossMm','splashAndFreeboardReserveMm','coverPlateMm','headerPlateMm','coverPointLoadKN',
                'coverLiveLoadKPa','coverStressScreenMPa','coverElasticModulusMPa','moduleMaximumMm','renewalLiftMm','openRenewalLiftMm',
                'headerFrontYMm','headerBlockedFraction','referenceAirgapMm','coverInsulationMm','coverUndersheetMm',
                'coverCoreDensityKgM3','coverConductivityWmK','scupperRawSpanMm','scupperSpringMm','scupperRiseMm',
                'scupperRingMm','scupperJambGlassMm','scupperFinishMm','coverThicknessLossMm','headerThicknessLossMm')
    _exact(settings, expected, 'service-floor settings')
    if not all(_finite(value) for key,value in settings.items() if key != 'headerFrontYMm'):
        raise ValueError('Service-floor settings must be finite numbers')
    s = settings
    if not isinstance(s['headerFrontYMm'],list) or len(s['headerFrontYMm']) != 2 or not all(map(_finite,s['headerFrontYMm'])) or not s['headerFrontYMm'][0] < s['headerFrontYMm'][1]:
        raise ValueError('Invalid explicit header front')
    if not (65 <= s['accessibleZoneMm'] <= 350 and 0 < s['remainingWidthFraction'] <= 1 and 0 <= s['headerBlockedFraction'] < 1
            and min(s[k] for k in expected if k not in ('headerFrontYMm','exteriorGradeMm')) >= 0
            and min(s[k] for k in ('channelWidthMm','slopeRatio','roughness','moduleMaximumMm','coverElasticModulusMPa','coverPlateMm','headerPlateMm','coverConductivityWmK','scupperRiseMm')) > 0):
        raise ValueError('Unsupported positive geometry/hydraulic domain')
    v = json.loads(raw['project/had/studies/water-replan.json'])
    h, old_renewal = v['model'], v['renewal']
    grid = json.loads(raw['project/str/studies/current-house-grid.json'])
    north_knee=h['court'][1]+h['sections']['waterLevels']['landingRun']
    if s['headerFrontYMm'][0]<north_knee or s['headerFrontYMm'][1]>h['court'][1]+h['court'][3]:
        raise ValueError('Header front must remain on the source north-falling court segment; no extrapolated inlet integral')
    event = json.loads(raw['project/rwt/studies/open-loggia-event.json'])
    receiver = json.loads(raw['project/rwt/studies/selected-receiving-interface.json'])
    ffl = 450+s['accessibleZoneMm']+15
    delta = ffl-h['sections']['groundFFL']
    x0, end = h['court'][0]+h['court'][2], s['routeEndXmm']
    if not 12250 <= end <= 12750:
        raise ValueError('Only the actual east exit and existing receiver lead-in are supported')
    length = end-x0
    centre, median, width = s['routeCentreYMm'], s['medianRailWidthMm'], s['channelWidthMm']
    pans = [[centre-median/2-width-6,centre-median/2], [centre+median/2,centre+median/2+width+6]]
    rails = [[pans[0][0]-s['outerRailWidthMm'],pans[0][0]], [centre-median/2,centre+median/2], [pans[1][1],pans[1][1]+s['outerRailWidthMm']]]
    gross = [rails[0][0], rails[-1][1]]
    fall = length/s['slopeRatio']
    invert_end = s['upstreamInvertMm']-fall
    crest = s['upstreamInvertMm']+s['bodyDepthMm']
    cover_bottom = ffl-15-s['coverPlateMm']
    thermal_skin_bottom=cover_bottom-s['coverInsulationMm']-s['coverUndersheetMm']
    wet_stack = 5
    support_clear = invert_end-wet_stack-450
    obstacles = []
    for name,g in grid['girders'].items():
        if g['axis'] != 'y':
            continue
        lo,hi = g['extent']; left,right = g['datum']-g['width']/2,g['datum']+g['width']/2
        if max(x0,left)<min(end,right) and max(gross[0],lo)<min(gross[1],hi):
            bed = s['upstreamInvertMm']-(min(end,right)-x0)/s['slopeRatio']
            obstacles.append({'id':name,'actualZMm':g['z'],'routeBottomAtFarFaceMm':bed-wet_stack,
                              'clearAboveActualRCMm':bed-wet_stack-g['z'][1], 'RCcut':False})
    gallery=v['bridge']['permanentDryGalleryClearX']
    wall_ranges = [('court-east',x0,gallery[0]),('spine-weather',*v['bridge']['newEastWeatherWallX'])]
    modules = []
    cursor = x0
    for name,lo,hi in wall_ranges:
        if lo > cursor:
            count = math.ceil((lo-cursor)/s['moduleMaximumMm'])
            modules.extend({'id':'field/'+str(len(modules)+i),'xMm':[cursor+(lo-cursor)*i/count,cursor+(lo-cursor)*(i+1)/count],'wall':None} for i in range(count))
        modules.append({'id':name,'xMm':[lo,hi],'wall':name})
        cursor = hi
    count = math.ceil((end-cursor)/s['moduleMaximumMm'])
    modules.extend({'id':'field/'+str(len(modules)+i),'xMm':[cursor+(end-cursor)*i/count,cursor+(end-cursor)*(i+1)/count],'wall':None} for i in range(count))
    for module in modules:
        lo,hi = module['xMm']; l = hi-lo
        bed = s['upstreamInvertMm']-(lo-x0)/s['slopeRatio']
        minimum_bed = s['upstreamInvertMm']-(hi-x0)/s['slopeRatio']
        lift = s['renewalLiftMm'] if module['wall'] else s['openRenewalLiftMm']
        module.update(lengthMm=l,bedZMm=[bed,minimum_bed],maximumWetCrestMm=bed+s['bodyDepthMm'],
                      renewalLiftMm=lift,
                      bareUStockMassKgPerChannel=l/1000*((width+2*s['bodyDepthMm'])/1000)*.0015*8000,
                      fullBodyToFloorAfterLiftAnd10Mm=minimum_bed-wet_stack+lift-ffl-10,
                      handling='N verified/full-duty; E isolated/drained. Remove only own covers, release top-access saddle; retain ordinary dry rails and100glass. Capture and lift the small U; no sliding press joint, long under-house carriage or floor/DPC cut.')
    openings = []
    for name,lo,hi in wall_ranges:
        module = next(row for row in modules if row['wall']==name)
        pull = 450 if name=='court-east' else -550
        park = [lo+pull,hi+pull]
        spring,rise,radial=s['scupperSpringMm'],s['scupperRiseMm'],s['scupperRingMm']
        crown=spring+rise; half_span=s['scupperRawSpanMm']/2
        radius=(half_span**2+rise**2)/(2*rise)
        lining=s['scupperJambGlassMm']+s['scupperFinishMm']
        centre_y=h['courtEastWindow6850']['retainedRoughOpening']['centre'] if name=='court-east' else sum(h['outerServiceArch']['finishedY'])/2
        moving_y = [min(p[0] for p in pans), max(p[1] for p in pans)]
        if radius<=lining or max(abs(y-centre_y) for y in moving_y) >= half_span-lining:
            intrados = -math.inf
        else:
            intrados = min(crown-radius+math.sqrt((radius-lining)**2-(y-centre_y)**2) for y in moving_y)
        top = module['maximumWetCrestMm']+s['renewalLiftMm']
        raw_y=[centre_y-half_span,centre_y+half_span];finished_y=[raw_y[0]+lining,raw_y[1]-lining]
        openings.append({'id':name,'wallXmm':[lo,hi],'newRawYmm':raw_y, 'newFinishedYmm':finished_y,
                         'centreYMm':centre_y,'retainedWindowSillZMm':h['courtEastWindow6850']['retainedRoughOpening']['sill']+delta if name=='court-east' else None,
                         'rawBottomZMm':350,'bottomGlassReturnMm':100,'sideAndSoffitGlassFinishMm':[s['scupperJambGlassMm'],s['scupperFinishMm']],
                         'sourceWeatherGlassControlMm':dict(h['weather']['layersRoomToWeather'])['bareCellularGlass'],
                         'localGlassReductionMm':dict(h['weather']['layersRoomToWeather'])['bareCellularGlass']-s['scupperJambGlassMm'],
                         'aboveFloorScupperHeightMm':max(0,crown-lining-ffl),
                         'fullAboveFloorClosureAndReleaseQualified':False,
                         'sillZMm':450,'springZMm':spring,'crownZMm':crown,'ringOuterCrownZMm':crown+radial,
                         'toRetainedWindowSillMm':750+delta-(crown+radial) if name=='court-east' else None,
                         'ringLoadsQualified':False,'masonryOpeningIsNew':True,
                         'bodyLiftToFiniteIntradosAfter5Mm':intrados-top-5,
                         'fullRouteSideReserveMm':min(gross[0]-finished_y[0],finished_y[1]-gross[1])-5,
                         'parkAfterShortDrawXmm':park,'parkToGalleryAfter10Mm':min(park[0]-gallery[0],gallery[1]-park[1])-10,
                         'shortDrawMm':pull,'verticalLiftMm':s['renewalLiftMm'],
                         'noRCorDPCcut':350>=350 and 350>150,
                         'firstGripAndLoadedHandlerQualified':False,
                         'sequence':'Remove own short covers. Lift within new finite scupper, draw short wall U into the open1023.5gallery bay, then carry to a rated rest. Grip/force/operator state and removable weather/air closure remain explicit unqualified duties.'})
    lap_count = len(modules)-1
    k = s['entryLossK']+s['outletLossK']+lap_count*s['lapLossK']
    duty = event['catchment']['combinedM2']*v['hydraulicProbe']['rainfallMmPerHour']/3600
    scenarios = {}
    for name,count,remaining in [('normal',2,1),('one-half-blocked',1,1),('half-plus20pct-width',1,s['remainingWidthFraction'])]:
        scenarios[name] = _hydraulic(width*remaining,s['designWaterDepthMm'],s['bedDebrisMm'],s['lapIntrusionMm'],s['roughness'],length,fall-s['settingLossMm'],k,duty/count)
    first_y,last_y = s['headerFrontYMm']
    quiet = h['firstWetReference']['permittedQuietStage']+delta
    active_end = first_y+(last_y-first_y)*(1-s['headerBlockedFraction'])
    heads = [(quiet-_court_level(y,h,delta))/1000 for y in (first_y,active_end)]
    north_slope=(abs(h['sections']['waterLevels']['courtNorth'])-h['sections']['waterLevels']['landingDrop'])/(h['court'][3]-h['sections']['waterLevels']['landingRun'])
    inlet_q = 1.84/(north_slope*2.5)*(max(0,heads[1])**2.5-max(0,heads[0])**2.5)*1000
    header_open_fraction = math.pi*9**2/(4*12**2)
    header_area = .45*(last_y-first_y)/1000*header_open_fraction*(1-s['headerBlockedFraction'])
    orifice_head = (duty/1000/(.6*header_area))**2/(2*9.81)*1000
    extra_cover_mass=s['coverInsulationMm']/1000*s['coverCoreDensityKgM3']+s['coverUndersheetMm']/1000*8000
    cover = _cover(max(350,width+31),s['coverPlateMm'],100,250,s['coverLiveLoadKPa'],s['coverPointLoadKN'],s['coverStressScreenMPa'],s['coverElasticModulusMPa'],panel_width=width+6+50,extra_mass=extra_cover_mass,thickness_loss=s['coverThicknessLossMm'])
    header = _cover(last_y-first_y+31,s['headerPlateMm'],75*.25,75,s['coverLiveLoadKPa'],s['coverPointLoadKN'],s['coverStressScreenMPa'],s['coverElasticModulusMPa'],0,header_open_fraction,last_y-first_y+56,thickness_loss=s['headerThicknessLossMm'])
    rail_height = cover_bottom-456
    rail_g = median/1000*rail_height/1000*24 + .16*.006*8000*9.81/1000
    median_line = rail_g+(cover['deadLoadKPa']+s['coverLiveLoadKPa'])*.353
    pressure = (s['coverPointLoadKN']+median_line*.1)*1000/(160*100)
    normal = h['northNormalRoute']['normal']
    north_profile = [[y,z+delta] for y,z in normal['carrierBottom']]
    north_intersections = []
    for name,g in grid['girders'].items():
        if g['axis']=='x' and g['extent'][0] <= normal['centreX'] <= g['extent'][1] and 7000<=g['datum']<=13200:
            bed = min(z for _,z in north_profile)
            north_intersections.append({'id':name,'actualZMm':g['z'],'conservativeTranslatedBareBedReserveMm':bed-3-g['z'][1]})
    for name,g in grid['crossBeams'].items():
        (a,b),(c,d)=g['a'],g['b']
        if b==d and a <= normal['centreX'] <= c and 7000 <= b <= 13200:
            north_intersections.append({'id':name,'actualZMm':g['z'],'conservativeTranslatedBareBedReserveMm':min(z for _,z in north_profile)-3-g['z'][1]})
    header_rect=[7300,first_y,7750,last_y]
    n_plan_overlaps=[]
    for i,(a,b,w,d) in enumerate(normal['inletRegions']):
        x=max(0,min(a+w,header_rect[2])-max(a,header_rect[0]))
        y=max(0,min(b+d,header_rect[3])-max(b,header_rect[1]))
        if x*y:n_plan_overlaps.append({'region':i,'overlapMm2':x*y})
    structural_d = -h['sections']['groundSupport']['lowestNodeTie']+h['sections']['groundSupport']['heaveStress']+h['sections']['groundSupport']['constructionLoss']+h['sections']['groundSupport']['ventilationReserve']
    known_e_d = max(0,-min(350,invert_end-wet_stack)+500)
    blockers = []
    checks = {'panTo100GlassAnd20Support':support_clear-20-s['settingLossMm']/2,
              'closedCoverToWetCrest':thermal_skin_bottom-crest-s['settingLossMm']/2,
              'bodyFreeboardAfterReserve':s['bodyDepthMm']-s['designWaterDepthMm']-s['splashAndFreeboardReserveMm'],
              'routeTo1200Passage':min(gross[0]-6300,7500-gross[1])-10,
              'newInletToDisabledNPlan':7300-7200-10,
              'designWaterToQuietAfterReserve':quiet-s['upstreamInvertMm']-s['designWaterDepthMm']-s['splashAndFreeboardReserveMm'],
              'medianForTwo25Seats':median-50,'outerRailFor25Seat':s['outerRailWidthMm']-25,
              'inletQReserveLps':inlet_q-duty}
    ex,ey,ew,ed=receiver['east']['receiverBounds']
    checks['outletInsideExistingReceiverAfter100Mm']=min(end-ex-100,ex+ew-end-100,
        min(a-ey-100 for a,_ in pans),min(ey+ed-b-100 for _,b in pans))
    if n_plan_overlaps:blockers.append('NEW_E_HEADER_INTERCEPTS_SOURCE_N_COLLECTION')
    for key,value in checks.items():
        if value<0: blockers.append(key)
    if not all(row['comparisonPass'] for row in scenarios.values()): blockers.append('HYDRAULIC_DOMAIN_REJECTED')
    if not cover['comparisonPass']: blockers.append('FLOOR_COVER_COMPARISON_REJECTED')
    if not header['comparisonPass']: blockers.append('HEADER_GRATE_COMPARISON_REJECTED')
    if s['coverInsulationMm']<50:blockers.append('NO_DECLARED_50MM_INSULATED_COVER_COMPARISON')
    for row in openings:
        if min(row['bodyLiftToFiniteIntradosAfter5Mm'],row['fullRouteSideReserveMm'],row['parkToGalleryAfter10Mm'])<0: blockers.append('WALL_MODULE_GEOMETRY:'+row['id'])
    for row in modules:
        if row['fullBodyToFloorAfterLiftAnd10Mm']<0: blockers.append('MODULE_LIFT:'+row['id'])
    source_containment=quiet+h['firstWetReference']['splashBudget']+h['firstWetReference']['toleranceBudget']
    connected_pool_excess=quiet-crest
    if connected_pool_excess>0:
        blockers.append('OPEN_HEADER_CONNECTS_SOURCE_QUIET_STAGE_ABOVE_U_CREST')
    source_n_low = min(z for _,z in north_profile)-3
    result = {'schema':'raised-service-floor-result/1','selected':False,'installedAcceptance':False,
              'caseDigest':digest(json.dumps(case,sort_keys=True,separators=(',',':'),allow_nan=False).encode()),
              'sourceSHA256':case['sources'],'settings':s,'comparisonStatus':'rejected' if blockers else 'bounded-geometry-and-component-comparison',
              'blockers':blockers,'levelsMm':{'mineral':[0,150],'RC':[150,350],'glass':[350,450],
                'accessible':[450,450+s['accessibleZoneMm']],'finish':[ffl-15,ffl],'ffl':ffl,'occupiedTranslation':delta,
                'courtSouth':ffl,'courtNorth':ffl-110,'firstFFL':h['sections']['firstFFL']+delta,
                'eaves':h['exterior']['eaves']+delta,'ridge':h['exterior']['ridge']+delta,
                'firstAboveNominalExterior':h['sections']['firstFFL']+delta-s['exteriorGradeMm'],
                'actualLowestAdjacentGround':None,'groundCoreHeightMm':h['sections']['firstFloorRC']['bottom']+delta-350,
                'groundCoreHeightAdditionVsSourceMm':h['sections']['firstFloorRC']['bottom']+delta-350-(h['sections']['firstFloorRC']['bottom']-h['sections']['groundFloorRC']['top'])},
              'approaches':{'front':_approach(h['approaches']['front'],ffl-s['exteriorGradeMm']),
                           'garden':_approach(h['approaches']['garden'],h['sections']['waterLevels']['loggiaNorth']+delta-s['exteriorGradeMm'])},
              'route':{'xMm':[x0,end],'grossYmm':gross,'panOuterYmm':pans,'dryRailsYmm':rails,'clearChannelCount':2,
                       'clearEachMm':width,'invertEndsZMm':[s['upstreamInvertMm'],invert_end],'crestEndsZMm':[crest,invert_end+s['bodyDepthMm']],
                       'minimumMineralWedgeAbove100GlassMm':support_clear,'minimumSolePlateToPanMm':support_clear-6,
                       'bodyWallAndLapStackMm':wet_stack,'lapCount':lap_count,'modules':modules,
                       'fixedGridCrossings':obstacles,'newWallOpenings':openings,'checks':checks},
              'hydraulics':{'dutyLps':duty,'catchmentM2':event['catchment']['combinedM2'],'rainfallMmHour':v['hydraulicProbe']['rainfallMmPerHour'],
                            'sourceDutyIsSyntheticNotSiteRainfall':True,'scenarios':scenarios,
                            'header':{'planXYMm':[7300,first_y,7750,last_y],'commonToEHalvesNotSharedWithN':True,
                                      'halfBlockedWorstRemainingYmm':[first_y,active_end],'quietStageZMm':quiet,
                                      'courtLipEndsZMm':[_court_level(y,h,delta) for y in (first_y,last_y)],
                                      'idealWeirCapacityLps':inlet_q,'grateOpenFraction':header_open_fraction,'halfBlockedIdealOrificeHeadMm':orifice_head,
                                      'medianSupportInsideHeader':False,
                                      'loadPath':'Full-width removable grates span two independent dry side frames; no median beam obstructs one-half-blocked cross-feed.',
                                      'actualOutdoorSideFrameBearings':None,
                                      'panBareSheetMassKgBeforeFrameAndSaddles':.45*((last_y-first_y+2*s['bodyDepthMm'])/1000)*.0015*8000,
                                      'topRemovalLiftMm':s['openRenewalLiftMm'],
                                      'fittedTurnAndBlockedApproachQualified':False}},
              'headerBackwaterRejection':{'sourceQuietStageMm':quiet,'sourceSplashAndToleranceMm':[h['firstWetReference']['splashBudget'],h['firstWetReference']['toleranceBudget']],
                  'sourceLocatedProtectionCrestMm':source_containment,'ordinaryUcrestMm':crest,'quietStageAboveUcrestMm':connected_pool_excess,
                  'thermalSkinBottomMm':thermal_skin_bottom,'protectionCrestAboveThermalSkinMm':source_containment-thermal_skin_bottom,
                  'allFrontLipsBelowSourceQuiet':quiet>max(_court_level(y,h,delta)for y in(first_y,last_y)),
                  'physicalAirbreakOrBackwaterBarrierPresent':False,
                  'reason':'The low-flow calculation is conditional. The open source-connected front does not geometrically exclude the source quiet pool from the header/body. No open-U containment or full-interface admission follows from a calculated low-flow stage.'},
              'covers':{'ordinary':cover,'header':header,'stoneFixing':'Captive mechanical edge retention; no adhesive or stone-composite resistance credited.',
                        'loadPath':'Stone/plate→dry25mm seats→separate mineral rails→6mm160wide sole→continuous100bare glass→RC. Wet U and its joints carry no walking cover load.',
                        'thermalCassette':{'glassCoreMm':s['coverInsulationMm'],'undersheetMm':s['coverUndersheetMm'],
                            'coreAndSkinZMm':[thermal_skin_bottom,cover_bottom], 'coreFieldWidthMm':width+6,
                            'conductivityComparisonWmK':s['coverConductivityWmK'],'coreOnlyResistanceM2KperW':s['coverInsulationMm']/1000/s['coverConductivityWmK'],
                            'airBoundary':'Static retained metal/replaceable compression flange along dry rails and slot returns; no open exterior air connection to occupied service floor is admitted.',
                            'assembledAirThermalAndCondensationAdmitted':False,'deliveredCoreStockAndConstituentsAdmitted':False},
                        'medianServiceLineKNm':median_line,'conservativePointBearingOnGlassMPa':pressure,
                        'railSolePlateMm':[160,6], 'railStemWidthsMm':{'median':median,'outer':s['outerRailWidthMm']},'railStemHeightMm':rail_height,
                        'sole40mmCantileverServiceStressMPa':pressure*40**2/2/(6**2/6),
                        'addedOrdinaryCoverSteelStockKg':2*length/1000*(width+56)/1000*s['coverPlateMm']/1000*8000,
                        'ordinaryCoverStoneAndPlateStockKg':2*length/1000*(width+56)/1000*(s['coverPlateMm']/1000*8000+.015*2600),
                        'glassCreepAndConfinementQualified':False,'railStabilitySeatAndConnectionQualified':False},
              'north':{'actualSourceRoute':'independent250clear Ntrunk and cross-intake; no new connection to E',
                       'translatedCarrierBottomYZMm':north_profile,'actualFixedGridCrossings':north_intersections,
                       'newHeaderOverlapWithActualNInletRegions':n_plan_overlaps,
                       'sourcePortalCoreBandsYmm':h['northNormalRoute']['portal']['coreBands'],
                       'trunkSideReserveToSourceWrappedWestPierMm':normal['westLoggia'][0]-4800,
                       'translatedFinishedPortalSpringZMm':h['northNormalRoute']['portal']['finishedSpringAtVerticalJamb']+delta,
                       'new715WalkingToTranslatedPortalHeadroomMm':h['northNormalRoute']['portal']['finishedSpringAtVerticalJamb'],
                       'source110PedestalReserveAboveHypotheticalContinuous100GlassAtHouseEdgeMm':next(z for y,z in north_profile if y==12000)-3-450-normal['frame']['pedestalHeight'],
                       'translatedOutletZMm':receiver['north']['outlet'][2]+delta,
                       'translatedReceivingMaximumZMm':receiver['north']['maximumWater']+delta,
                       'oldPedestalHeightMm':normal['frame']['pedestalHeight'],
                       'supportApplicability':'INAPPLICABLE: old110pedestals/RCrecess/cover bearings have not been extended to this715proposal on unchanged fixedgrid. New actual N support/air/door/receiving geometry required before N may back Emaintenance.',
                       'outdoorLoggiaIsNotAssumedToHaveOccupied100Glass':'AtY12000 the translated bareU leaves5.75 above hypotheticalglass450, not110 for oldpedestals. Outdoor loggia insulation/recess/support levels must be explicitly reauthored; no need is waived and no occupied-layer stack is silently copied into it.',
                       'fullDutyAndMaintenanceAdmitted':False},
              'eastReceiver':{'sourceTerritoryXYMm':receiver['east']['receiverBounds'],
                              'twoOutletCentresXYZMm':[[end,(a+b)/2,invert_end] for a,b in pans],
                              'requiredMaximumReceivingWaterZMm':invert_end-s['referenceAirgapMm'],
                              'siteWaterOrSpillLevelsInvented':False,'oldDeepCartridgeAndHeadLimitsSuperseded':True,
                              'passiveSpillSupportAndActualOutfallAdmitted':False},
              'ground':{'oldTrackLowMm':old_renewal['withdrawalTrackEndLowestZ'],'oldCatchLowMm':old_renewal['maintenanceCatchDrain']['lowestReservedSurface'],
                        'oldServiceRequiredDmm':h['sections']['groundSupport']['Drequired'],'unchangedStructuralRequiredDmm':structural_d,
                        'newKnownEEnvelopeRequiredDmm':known_e_d,'translatedBareNEnvelopeRequiredDmm':max(0,-source_n_low+500),
                        'knownEnvelopeRequiredDmm':max(structural_d,known_e_d,max(0,-source_n_low+500)),
                        'completeInterfaceMinimumDmm':None,'trialSolumOrExteriorAdopted':False,
                        'reason':'Retire Etrack and80OD catch mechanism only in this proposal;1250fixedhead/heave control remains. Nsupports and new outdoorheader/terminal foundations have no complete source envelope.'},
              'remainingProof':['new court/spine under-window scupper arches, weather/air returns and actual load transfer; no old wall result inherited',
                'complete Nsupport/receiver/door/floor rewrite on these actual715datums before it can back Emaintenance',
                'actual outdoor header bearings and terminal supports, without inventing a foundation below them',
                'source-qualified U/saddle/copper seal, formed bends, debris/entry/fullone-halfblocked/receiver water proof',
                'loaded wall-module first grip, operator/shortdraw/rest and cover handling; geometric body motion is not complete handling',
                'glass creep/confinement, dry rail/seat/sole stability and fitted cover/perforation resistance',
                '3D thermal/condensation and airtight renewable opening boundary;100glass remains beneath trough',
                'full revised gravity/wind/roof/DPC/head response, owner715appearance/approach and real site/receiving evidence'],
              'retiredOnlyWithinProposal':['deep Eintake well','two-piece under-gallery drawer','2100mm joint tool','horizontal withdrawal rails/hoist/rack','low80OD flange-catch pipe'],
              'completeReplacementAdmitted':False}
    return result


def render_service_floor(r):
    level, route, s = r['levelsMm'],r['route'],r['settings']
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" viewBox="0 0 1600 1120" data-case-digest="{r["caseDigest"]}">',
         '<rect width="1600" height="1120" fill="#faf8f1"/>','<g font-family="sans-serif" fill="#24383e">',
         '<text x="35" y="38" font-size="27">Raised service floor · shallow independent E route</text>',
         f'<text x="35" y="67" font-size="17">{r["comparisonStatus"].upper()} · source-connected header can overtop open U · no house or installed acceptance</text>']
    Y=lambda y:70+(y-route['grossYmm'][0])*.73
    Z=lambda z:510-(z-0)*.5
    def box(x,y,w,h,fill,label=''):
        out.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}" fill="{fill}" stroke="#596c70"/>')
        if label:out.append(f'<text x="{x+8:.3f}" y="{y+h/2+5:.3f}" font-size="13">{escape(label)}</text>')
    width=(route['grossYmm'][1]-route['grossYmm'][0])*.73
    for z0,z1,colour,label in [(0,150,'#ae8c69','mineral0..150'),(150,350,'#c1cac5','RC150..350'),(350,450,'#d7c58f','100 bare glass350..450')]:
        box(70,Z(z1),width,(z1-z0)*.5,colour,label)
    for a,b in route['dryRailsYmm']:
        box(Y(a)-40*.73,Z(456),(b-a+80)*.73,3,'#758b90')
        box(Y(a),Z(level['ffl']-15-s['coverPlateMm']),(b-a)*.73,(level['ffl']-15-s['coverPlateMm']-456)*.5,'#b4b1a3')
    for a,b in route['panOuterYmm']:
        base=s['upstreamInvertMm'];top=base+s['bodyDepthMm']
        box(Y(a),Z(base-5),(b-a)*.73,(base-5-450)*.5,'#c8bda0')
        pts=[(a,top),(a,base),(b,base),(b,top)]
        out.append('<polyline points="'+' '.join(f'{Y(y):.3f},{Z(z):.3f}' for y,z in pts)+'" fill="none" stroke="#257b92" stroke-width="3"/>')
        box(Y(a)-25*.73,Z(level['ffl']-15),(b-a+50)*.73,s['coverPlateMm']*.5,'#8a9b9c')
        box(Y(a)-25*.73,Z(level['ffl']),(b-a+50)*.73,7.5,'#a08e77')
        thermal=r['covers']['thermalCassette']
        box(Y(a),Z(thermal['coreAndSkinZMm'][1]),(b-a)*.73,s['coverInsulationMm']*.5,'#e5ce8d')
        box(Y(a),Z(thermal['coreAndSkinZMm'][0]+s['coverUndersheetMm']),(b-a)*.73,s['coverUndersheetMm']*.5,'#6a8b92')
    opening=route['newWallOpenings'][0]
    opening_centre=opening['centreYMm'];window_sill=opening['retainedWindowSillZMm']
    EY=lambda y:930+(y-6200)*.42
    EZ=lambda z:515-(z-350)*.30
    box(EY(6200),EZ(window_sill),1300*.42,(window_sill-350)*.30,'#cec8b9')
    span=s['scupperRawSpanMm'];rise=s['scupperRiseMm'];radius=(span**2/4+rise**2)/(2*rise)
    cz=opening['crownZMm']-radius;theta=math.asin(span/2/radius)
    arc=[(opening_centre+radius*math.sin(t),cz+radius*math.cos(t)) for t in [theta-2*theta*i/60 for i in range(61)]]
    outline=[(opening_centre-span/2,350),(opening_centre+span/2,350)]+arc+[(opening_centre-span/2,350)]
    out.append('<polygon points="'+' '.join(f'{EY(y):.2f},{EZ(z):.2f}'for y,z in outline)+'" fill="#faf8f1" stroke="#756854"/>')
    box(EY(opening_centre-span/2),EZ(450),span*.42,100*.30,'#d7c58f')
    for rad,colour in [(radius+s['scupperRingMm'],'#7a6657'),(radius-s['scupperJambGlassMm']-s['scupperFinishMm'],'#ab8b3b')]:
        pts=[(opening_centre+rad*math.sin(t),cz+rad*math.cos(t))for t in [theta-2*theta*i/60 for i in range(61)]]
        out.append('<polyline points="'+' '.join(f'{EY(y):.2f},{EZ(z):.2f}'for y,z in pts)+'" fill="none" stroke="'+colour+'" stroke-width="3"/>')
    for a,b in route['panOuterYmm']:
        for dy,dash in [(0,''),(s['renewalLiftMm'],'stroke-dasharray="6 4"')]:
            out.append(f'<rect x="{EY(a):.2f}" y="{EZ(s["upstreamInvertMm"]+s["bodyDepthMm"]+dy):.2f}" width="{(b-a)*.42:.2f}" height="{s["bodyDepthMm"]*.3:.2f}" fill="none" stroke="#23788d" stroke-width="2" {dash}/>')
    for z,label,colour in [(level['ffl'],f'FFL{level["ffl"]:g}','#6e756f'),(window_sill,f'retained window sill{window_sill:g}','#9a6247')]:
        out.append(f'<path d="M{EY(6200):.2f},{EZ(z):.2f} H{EY(7500):.2f}" stroke="{colour}" stroke-dasharray="4 4"/>')
        out.append(f'<text x="{EY(6200):.2f}" y="{EZ(z)-8:.2f}" font-size="14">{label}</text>')
    out.extend([f'<text x="930" y="132" font-size="18">New under-window scupper · raw{span:g}mm</text>',
                f'<text x="930" y="551" font-size="15">110 glass +27 finish; ring top{opening["ringOuterCrownZMm"]:g}; window gap{opening["toRetainedWindowSillMm"]:g}.</text>',
                '<text x="930" y="575" font-size="15">Dashed whole-body lift250; masonry/air/thermal capacity unqualified.</text>'])
    out.extend([f'<text x="70" y="546" font-size="17">Transverse upstream section:2×{s["channelWidthMm"]:g} clear; dry median{s["medianRailWidthMm"]:g}; FFL{level["ffl"]:g}mm</text>',
                f'<text x="70" y="572" font-size="16">Bed{s["upstreamInvertMm"]:g} →{route["invertEndsZMm"][1]:.2f};1:{s["slopeRatio"]:g};100below +50cover glass; span350.</text>'])
    X=lambda x:75+(x-7300)*.15
    P=lambda y:780-(y-6300)*.14
    for name,a,b in [('court wall',7750,8179.5),('spine weather wall',9203,9722.5),('outer arch',11570.5,12000)]:
        box(X(a),P(7500),(b-a)*.15,1200*.14,'#b4b0a4')
        out.append(f'<text x="{X(a):.1f}" y="{P(7500)-12:.1f}" font-size="13">{escape(name)}</text>')
    for a,b in route['panOuterYmm']:
        box(X(7750),P(b),(s['routeEndXmm']-7750)*.15,(b-a)*.14,'#9fc9d1')
    h=r['hydraulics']['header']['planXYMm']
    box(X(h[0]),P(h[3]),(h[2]-h[0])*.15,(h[3]-h[1])*.14,'#76adbb')
    for mod in route['modules']:
        x=mod['xMm'][0];out.append(f'<path d="M{X(x):.1f},{P(route["grossYmm"][0]):.1f} V{P(route["grossYmm"][1]):.1f}" stroke="#3c6976" fill="none"/>')
    out.extend([f'<text x="75" y="815" font-size="17">Plan: E1200 passage6300..7500; gross route{route["grossYmm"][0]:g}..{route["grossYmm"][1]:g}; all wall cuts ABOVE RC350/DPC150.</text>',
                f'<text x="75" y="845" font-size="16">New masonry scuppers: raw{s["scupperRawSpanMm"]:g}, spring{s["scupperSpringMm"]:g}/crown{opening["crownZMm"]:g}/ring{opening["ringOuterCrownZMm"]:g}; lift250, draw450/550.</text>'])
    a=r['hydraulics']['scenarios']['half-plus20pct-width']
    notes=[f'Assigned synthetic duty {r["hydraulics"]["dutyLps"]:.5f}L/s. One Ehalf blocked +20%width +10bed +3lap: head reserve{a.get("headReserveMm",0):.2f}mm.',
           f'Front approach{r["approaches"]["front"]["totalReservationMm"]/1000:g}m. FirstFFL{level["firstFFL"]:g}; nominal-grade comparison{level["firstAboveNominalExterior"]:g}; actual lowest ground unknown.',
           f'Known fixed-grid minimum D{r["ground"]["knownEnvelopeRequiredDmm"]:g}; complete minimum UNKNOWN. No D1800, daylight, dry excavation or receiver approval inherited.',
           'N translated, not silently retained: actual fixed-grid clearances exported; old110pedestal/support and receiving applicability explicitly unproved.',
           'Body-clear geometry and numerical component screens do not prove loaded handling, arches, wet seams, glass creep, thermal/air continuity or real outfall.']
    for i,line in enumerate(notes):out.append(f'<text x="75" y="{895+i*37}" font-size="16">{escape(line)}</text>')
    out.extend(['</g></svg>'])
    return '\n'.join(out)+'\n'


def main():
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--read',action='store_true');parser.add_argument('--check',action='store_true');parser.add_argument('--write',action='store_true')
    args=parser.parse_args();folder=Path(__file__).resolve().parent;root=folder.parents[2]
    reference=json.loads((folder/'raised-service-floor.json').read_text())
    if args.read:
        print(json.dumps(reference,allow_nan=False));return
    import sys
    case=reference if args.check or args.write else json.load(sys.stdin)
    raw={name:(root/name).read_bytes() for name in case['sources']}
    result=compile_service_floor(case,raw);drawing=render_service_floor(result)
    outputs={'raised-service-floor.results.json':json.dumps(result,indent=2,allow_nan=False)+'\n','raised-service-floor.svg':drawing}
    for name,data in outputs.items():
        if args.check and (folder/name).read_text()!=data:raise ValueError('Stale output: '+name)
        if args.write:(folder/name).write_text(data)
    if args.check or args.write:print(json.dumps({'comparisonStatus':result['comparisonStatus'],'blockers':result['blockers']}))
    else:print(json.dumps({'schema':'raised-service-floor-replay/1','result':result,'sectionPlanSvg':drawing},allow_nan=False))


if __name__=='__main__':main()
